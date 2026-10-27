import { withDb, uid } from "@/lib/mock/store";
import type { Category } from "@/types/database";

export interface InventoryListing {
  batchId: string;
  hubId: string;
  hubName: string;
  neighborhood: string;
  category: Category;
  availableKg: number;
}

export async function listInventory(): Promise<InventoryListing[]> {
  return withDb((db) =>
    db.inventory_batches
      .filter((b) => b.status === "open" && b.available_kg > 0)
      .map((b) => {
        const hub = db.hubs.find((h) => h.id === b.hub_id);
        return {
          batchId: b.id,
          hubId: b.hub_id,
          hubName: hub?.name ?? "Unknown hub",
          neighborhood: hub?.neighborhood ?? "",
          category: b.category,
          availableKg: b.available_kg,
        };
      })
      .sort((a, b) => b.availableKg - a.availableKg)
  );
}

export interface MatchNotification {
  matchId: string;
  category: Category;
  availableKg: number;
  hubName: string;
  rationale: string | null;
  status: "proposed" | "claimed" | "fulfilled";
  matchedAt: string;
}

export async function listMatchesForReceiver(receiverId: string): Promise<MatchNotification[]> {
  return withDb((db) => {
    const myDemandIds = new Set(db.demand_requests.filter((d) => d.receiver_id === receiverId).map((d) => d.id));
    return db.matches
      .filter((m) => myDemandIds.has(m.demand_request_id))
      .map((m) => {
        const batch = db.inventory_batches.find((b) => b.id === m.inventory_batch_id);
        const hub = batch ? db.hubs.find((h) => h.id === batch.hub_id) : null;
        return {
          matchId: m.id,
          category: batch?.category ?? "A",
          availableKg: batch?.available_kg ?? 0,
          hubName: hub?.name ?? "Unknown hub",
          rationale: m.agent_rationale,
          status: m.status,
          matchedAt: m.matched_at,
        };
      })
      .sort((a, b) => +new Date(b.matchedAt) - +new Date(a.matchedAt));
  });
}

export async function claimMatch(matchId: string): Promise<void> {
  withDb((db) => {
    const match = db.matches.find((m) => m.id === matchId);
    if (!match) return;
    match.status = "claimed";
    const batch = db.inventory_batches.find((b) => b.id === match.inventory_batch_id);
    if (batch) batch.status = "claimed";
  });
}

export async function claimBatchDirectly(batchId: string, receiverId: string): Promise<void> {
  withDb((db) => {
    const batch = db.inventory_batches.find((b) => b.id === batchId);
    if (!batch || batch.status !== "open") return;

    let demand = db.demand_requests.find((d) => d.receiver_id === receiverId && d.category === batch.category);
    if (!demand) {
      demand = {
        id: uid("demand"),
        receiver_id: receiverId,
        category: batch.category,
        desired_kg: batch.available_kg,
        status: "active",
      };
      db.demand_requests.push(demand);
    }

    batch.status = "claimed";
    db.matches.push({
      id: uid("match"),
      inventory_batch_id: batch.id,
      demand_request_id: demand.id,
      agent_rationale: "Claimed directly from the marketplace feed.",
      status: "claimed",
      matched_at: new Date().toISOString(),
    });
  });
}
