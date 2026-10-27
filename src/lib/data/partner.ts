import { withDb, uid } from "@/lib/mock/store";
import type { MockCollection, MockProfile } from "@/lib/mock/store";
import type { Category } from "@/types/database";
import { verifyCaddyPhoto, runMatchingAgent } from "@/lib/data/ai";

export async function findHouseholdByQr(qrPayload: string): Promise<MockProfile | null> {
  // QR payload is just the household's profile id for now.
  return withDb((db) => db.profiles.find((p) => p.id === qrPayload && p.role === "household") ?? null);
}

export async function listCollectionsAtHub(hubId: string): Promise<(MockCollection & { householdName: string })[]> {
  return withDb((db) =>
    db.collections
      .filter((c) => c.hub_id === hubId)
      .sort((a, b) => +new Date(b.collected_at) - +new Date(a.collected_at))
      .map((c) => ({
        ...c,
        householdName: db.profiles.find((p) => p.id === c.household_id)?.name ?? "Unknown household",
      }))
  );
}

export async function getPendingCaddyFor(householdId: string) {
  return withDb((db) => db.caddy_declarations.find((c) => c.household_id === householdId) ?? null);
}

const POINTS_PER_KG = 15;

export async function recordCollection(input: {
  partnerId: string;
  householdId: string;
  hubId: string;
  weights: { A: number; B: number; C: number };
}): Promise<{ collection: MockCollection; pointsAwarded: number }> {
  const declared = withDb((db) => {
    const decl = db.caddy_declarations.find((c) => c.household_id === input.householdId);
    return {
      A: decl?.category_a_kg ?? input.weights.A,
      B: decl?.category_b_kg ?? input.weights.B,
      C: decl?.category_c_kg ?? input.weights.C,
    };
  });

  const samVerification = await verifyCaddyPhoto(declared);

  const totalKg = input.weights.A + input.weights.B + input.weights.C;
  const pointsAwarded = Math.round(totalKg * POINTS_PER_KG);

  const collection = withDb((db) => {
    const record: MockCollection = {
      id: uid("col"),
      household_id: input.householdId,
      hub_id: input.hubId,
      category_a_kg: input.weights.A,
      category_b_kg: input.weights.B,
      category_c_kg: input.weights.C,
      photo_url: db.caddy_declarations.find((c) => c.household_id === input.householdId)?.photo_url ?? null,
      sam_verification: samVerification,
      collected_at: new Date().toISOString(),
      verified_by: input.partnerId,
    };
    db.collections.push(record);

    // Clear the household's pending caddy declaration - it's been collected.
    db.caddy_declarations = db.caddy_declarations.filter((c) => c.household_id !== input.householdId);

    // Credit green points.
    const household = db.profiles.find((p) => p.id === input.householdId);
    if (household) household.green_points += pointsAwarded;
    db.green_points_ledger.push({
      id: uid("gpl"),
      household_id: input.householdId,
      points: pointsAwarded,
      reason: `Collection drop-off (${totalKg.toFixed(2)}kg)`,
      created_at: new Date().toISOString(),
    });

    // Top up hub inventory per category.
    (["A", "B", "C"] as Category[]).forEach((cat) => {
      const kg = input.weights[cat];
      if (kg <= 0) return;
      let batch = db.inventory_batches.find(
        (b) => b.hub_id === input.hubId && b.category === cat && b.status === "open"
      );
      if (!batch) {
        batch = {
          id: uid("batch"),
          hub_id: input.hubId,
          category: cat,
          available_kg: 0,
          status: "open",
          created_at: new Date().toISOString(),
        };
        db.inventory_batches.push(batch);
      }
      batch.available_kg = +(batch.available_kg + kg).toFixed(2);
    });

    return record;
  });

  await maybeRunMatchingAgent(input.hubId);

  return { collection, pointsAwarded };
}

/**
 * Agentic matching pass: for each open batch at the hub with enough volume,
 * find the oldest active demand request in the same category without an
 * existing proposed/claimed match, and ask the agent to reason about routing
 * it. See src/lib/data/ai.ts for where this swaps to a real Muse Spark call.
 */
async function maybeRunMatchingAgent(hubId: string) {
  const candidates = withDb((db) => {
    const hub = db.hubs.find((h) => h.id === hubId);
    const openBatches = db.inventory_batches.filter((b) => b.hub_id === hubId && b.status === "open" && b.available_kg > 0);
    return openBatches.map((batch) => {
      const demand = db.demand_requests.find(
        (d) =>
          d.category === batch.category &&
          d.status === "active" &&
          !db.matches.some((m) => m.demand_request_id === d.id && m.status !== "fulfilled")
      );
      const receiver = demand ? db.profiles.find((p) => p.id === demand.receiver_id) : null;
      return { batch, demand, receiver, hubName: hub?.name ?? "the hub" };
    });
  });

  for (const { batch, demand, receiver, hubName } of candidates) {
    if (!demand || !receiver) continue;

    const { rationale } = await runMatchingAgent({
      category: batch.category,
      availableKg: batch.available_kg,
      receiverName: receiver.name,
      desiredKg: demand.desired_kg,
      hubName,
    });

    withDb((db) => {
      const stillOpen = db.inventory_batches.find((b) => b.id === batch.id);
      if (!stillOpen || stillOpen.status !== "open") return;
      db.matches.push({
        id: uid("match"),
        inventory_batch_id: batch.id,
        demand_request_id: demand.id,
        agent_rationale: rationale,
        status: "proposed",
        matched_at: new Date().toISOString(),
      });
    });
  }
}
