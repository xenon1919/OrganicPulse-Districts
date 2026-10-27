import type { Category } from "@/types/database";

export interface SamVerification {
  estimated: Record<Category, number>;
  confidence: number;
  mismatch: boolean;
  note: string;
}

export interface MatchRationale {
  rationale: string;
  notificationCopy: string;
}

/**
 * TODO: replace with a real call to `sam-3.1` via the Meta Model API
 * (src/lib/meta/client.ts) once MODEL_API_KEY is set. Should run server-side
 * from an API route - send the caddy photo, get back segmentation masks per
 * category, and compute an estimated kg composition + confidence here
 * instead of returning a canned mock.
 */
export async function verifyCaddyPhoto(
  declared: { A: number; B: number; C: number }
): Promise<SamVerification> {
  await new Promise((r) => setTimeout(r, 900));

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
      ? "Photo composition estimate differs notably from the logged weights - flagged for a quick recheck."
      : "Photo composition estimate matches the logged weights within tolerance.",
  };
}

/**
 * TODO: replace with a real call to `muse-spark-1.3` once MODEL_API_KEY is
 * set. Should run server-side from an API route - pass it the open inventory
 * batch, the matching demand request, and hub distance, and let it reason
 * about the allocation and draft the copy instead of templating it here.
 */
export async function runMatchingAgent(input: {
  category: Category;
  availableKg: number;
  receiverName: string;
  desiredKg: number;
  hubName: string;
}): Promise<MatchRationale> {
  await new Promise((r) => setTimeout(r, 700));

  const categoryLabel = { A: "Calcium (eggshells)", B: "Nitrogen (tea/coffee)", C: "Carbon (cardboard)" }[
    input.category
  ];

  return {
    rationale: `Matched ${input.availableKg}kg of ${categoryLabel} from ${input.hubName} to ${input.receiverName} - closest active demand for this category (wants ${input.desiredKg}kg), and the batch has been sitting the longest, so routing it now keeps hub turnover healthy.`,
    notificationCopy: `Resource match available: ${input.availableKg}kg of ${categoryLabel} ready at ${input.hubName}. Tap to claim.`,
  };
}
