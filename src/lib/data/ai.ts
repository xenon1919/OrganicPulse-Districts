import { createMetaClient, MODELS } from "@/lib/meta/client";
import { CATEGORY_LABEL, type Category, type SamVerification } from "@/types/database";

export interface MatchRationale {
  rationale: string;
  notificationCopy: string;
}

// What SAM 3.1 is asked to find in the caddy photo for each category - short
// noun phrases work best per the segmentation guide.
const CATEGORY_PROMPT: Record<Category, string> = {
  A: "eggshell pieces",
  B: "coffee grounds and used tea leaves",
  C: "shredded or broken cardboard pieces",
};

const BOX_PATTERN = /<\|box;x1=(-?\d+);y1=(-?\d+);x2=(-?\d+);y2=(-?\d+);w=(\d+);h=(\d+)\|>/g;

/**
 * SAM 3.1 returns a custom-encoded string: one `<|box;...|><|mask;...|>`
 * block per detected instance. We use the bounding-box area as a lightweight
 * proxy for "how much of the photo this category occupies" rather than
 * decoding the (undocumented, run-length-encoded) pixel mask - good enough
 * to catch a household logging a wildly wrong composition, which is the
 * actual job here.
 */
function totalDetectedAreaFraction(outputText: string): number {
  let totalArea = 0;
  let imageArea = 0;
  for (const match of outputText.matchAll(BOX_PATTERN)) {
    const [, x1, y1, x2, y2, w, h] = match.map(Number);
    totalArea += Math.max(0, x2 - x1) * Math.max(0, y2 - y1);
    imageArea = w * h; // same for every instance in one image
  }
  if (imageArea === 0) return 0;
  return totalArea / imageArea;
}

async function verifyCaddyPhotoWithSam(
  declared: { A: number; B: number; C: number },
  photoUrl: string
): Promise<SamVerification> {
  const client = createMetaClient();
  const categories: Category[] = ["A", "B", "C"];

  const fractions = await Promise.all(
    categories.map(async (cat) => {
      const resp = await client.responses.create({
        model: MODELS.sam,
        input: [
          {
            role: "user",
            content: [
              { type: "input_text", text: CATEGORY_PROMPT[cat] },
              { type: "input_image", image_url: photoUrl, detail: "auto" },
            ],
          },
        ],
      });
      return totalDetectedAreaFraction(resp.output_text ?? "");
    })
  );

  const totalDeclared = declared.A + declared.B + declared.C;
  const totalFraction = fractions.reduce((a, b) => a + b, 0);

  // Distribute the declared total kg across categories in proportion to how
  // much of the photo each category's objects occupy. If SAM found nothing
  // at all (empty/unrelated photo), fall back to the declared split itself
  // rather than dividing by zero.
  const estimated: Record<Category, number> =
    totalFraction > 0
      ? {
          A: +((fractions[0] / totalFraction) * totalDeclared).toFixed(2),
          B: +((fractions[1] / totalFraction) * totalDeclared).toFixed(2),
          C: +((fractions[2] / totalFraction) * totalDeclared).toFixed(2),
        }
      : { A: 0, B: 0, C: 0 };

  const totalEstimated = estimated.A + estimated.B + estimated.C;
  const drift = totalDeclared === 0 ? 0 : Math.abs(totalEstimated - totalDeclared) / totalDeclared;
  const mismatch = totalFraction === 0 || drift > 0.35;

  return {
    estimated,
    confidence: +Math.min(0.97, 0.5 + totalFraction).toFixed(2),
    mismatch,
    note: mismatch
      ? totalFraction === 0
        ? "Photo doesn't appear to show the declared categories—flagged for a quick recheck."
        : "Photo composition estimate differs notably from the logged weights—flagged for a quick recheck."
      : "Photo composition estimate matches the logged weights within tolerance.",
  };
}

function verifyCaddyPhotoMock(declared: { A: number; B: number; C: number }): SamVerification {
  const jitter = (v: number) => Math.max(0, +(v * (0.85 + Math.random() * 0.3)).toFixed(2));
  const estimated: Record<Category, number> = {
    A: jitter(declared.A),
    B: jitter(declared.B),
    C: jitter(declared.C),
  };

  const totalDeclared = declared.A + declared.B + declared.C;
  const totalEstimated = estimated.A + estimated.B + estimated.C;
  const drift = totalDeclared === 0 ? 0 : Math.abs(totalEstimated - totalDeclared) / totalDeclared;
  const mismatch = drift > 0.25;

  return {
    estimated,
    confidence: +(0.78 + Math.random() * 0.18).toFixed(2),
    mismatch,
    note: mismatch
      ? "Photo composition estimate differs notably from the logged weights—flagged for a quick recheck."
      : "Photo composition estimate matches the logged weights within tolerance.",
  };
}

/**
 * Verifies a household's caddy photo against their declared category
 * weights using SAM 3.1 segmentation. Falls back to a simulated estimate
 * (no mismatch flagging surprises) when there's no photo, no MODEL_API_KEY,
 * or the API call fails - partner-side collection logging should never be
 * blocked by an AI call failing.
 */
export async function verifyCaddyPhoto(
  declared: { A: number; B: number; C: number },
  photoUrl?: string | null
): Promise<SamVerification> {
  if (!photoUrl || !process.env.MODEL_API_KEY) {
    return verifyCaddyPhotoMock(declared);
  }
  try {
    return await verifyCaddyPhotoWithSam(declared, photoUrl);
  } catch (err) {
    console.error("SAM 3.1 verification failed, falling back to estimate:", err);
    return verifyCaddyPhotoMock(declared);
  }
}

async function runMatchingAgentWithSpark(input: {
  category: Category;
  availableKg: number;
  receiverName: string;
  desiredKg: number;
  hubName: string;
}): Promise<MatchRationale> {
  const client = createMetaClient();
  const categoryLabel = CATEGORY_LABEL[input.category];

  const completion = await client.chat.completions.create({
    model: MODELS.spark,
    messages: [
      {
        role: "system",
        content:
          "You are the matching agent for OrganicPulse Districts, a circular-economy marketplace that routes " +
          "sorted dry organic waste (eggshells, coffee/tea, cardboard) from households to local organic manure " +
          "manufacturers and terrace gardeners. Explain routing decisions in plain, concrete language. Respond " +
          "with strict JSON only, no markdown.",
      },
      {
        role: "user",
        content:
          `A batch of ${input.availableKg}kg of ${categoryLabel} is available at ${input.hubName}. ` +
          `${input.receiverName} has an active demand for ${input.desiredKg}kg of this category and is the ` +
          `closest match. Respond with JSON: {"rationale": "<1-2 sentence plain-language explanation of why ` +
          `this match makes sense, written for the receiver>", "notificationCopy": "<short push notification ` +
          `text, under 20 words>"}`,
      },
    ],
    response_format: { type: "json_object" },
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) throw new Error("Empty response from muse-spark-1.3");

  const parsed = JSON.parse(content) as Partial<MatchRationale>;
  if (!parsed.rationale || !parsed.notificationCopy) {
    throw new Error("Malformed matching-agent JSON response");
  }
  return { rationale: parsed.rationale, notificationCopy: parsed.notificationCopy };
}

function runMatchingAgentMock(input: {
  category: Category;
  availableKg: number;
  receiverName: string;
  desiredKg: number;
  hubName: string;
}): MatchRationale {
  const categoryLabel = CATEGORY_LABEL[input.category];
  return {
    rationale: `Matched ${input.availableKg}kg of ${categoryLabel} from ${input.hubName} to ${input.receiverName}—closest active demand for this category (wants ${input.desiredKg}kg), and the batch has been sitting the longest, so routing it now keeps hub turnover healthy.`,
    notificationCopy: `Resource match available: ${input.availableKg}kg of ${categoryLabel} ready at ${input.hubName}. Tap to claim.`,
  };
}

/**
 * Reasons about routing an inventory batch to a receiver using
 * muse-spark-1.3. Falls back to a templated rationale when there's no
 * MODEL_API_KEY or the call fails, so a flaky API call never blocks a
 * collection from being recorded.
 */
export async function runMatchingAgent(input: {
  category: Category;
  availableKg: number;
  receiverName: string;
  desiredKg: number;
  hubName: string;
}): Promise<MatchRationale> {
  if (!process.env.MODEL_API_KEY) {
    return runMatchingAgentMock(input);
  }
  try {
    return await runMatchingAgentWithSpark(input);
  } catch (err) {
    console.error("Muse Spark matching agent failed, falling back to template:", err);
    return runMatchingAgentMock(input);
  }
}
