"use client";

import {
  addDoc,
  collection,
  doc,
  getDoc,
  onSnapshot,
  query,
  where,
  writeBatch,
  type QueryDocumentSnapshot,
  type Unsubscribe,
} from "firebase/firestore";
import { getDb } from "@/lib/firebase/client";
import type { Category, InventoryBatch, Match, MatchStatus } from "@/types/database";

/**
 * Lets a receiver proactively request a category/amount instead of only
 * claiming whatever's already in the marketplace - the matching agent picks
 * it up on the next collection event just like any other active demand.
 */
export async function createDemandRequest(
  receiverId: string,
  receiverName: string,
  category: Category,
  desiredKg: number
): Promise<void> {
  await addDoc(collection(getDb(), "demandRequests"), {
    receiverId,
    receiverName,
    category,
    desiredKg,
    status: "active",
  });
}

export interface InventoryListing {
  batchId: string;
  hubId: string;
  hubName: string;
  neighborhood: string;
  category: Category;
  availableKg: number;
}

function toListing(d: QueryDocumentSnapshot): InventoryListing {
  const b = d.data() as InventoryBatch;
  return {
    batchId: d.id,
    hubId: b.hubId,
    hubName: b.hubName,
    neighborhood: b.neighborhood,
    category: b.category,
    availableKg: b.availableKg,
  };
}

/** Live inventory feed - open batches with stock, newest-heaviest first. */
export function subscribeToInventory(onChange: (listings: InventoryListing[]) => void): Unsubscribe {
  const q = query(collection(getDb(), "inventoryBatches"), where("status", "==", "open"));
  return onSnapshot(q, (snap) => {
    const listings = snap.docs
      .map(toListing)
      .filter((l) => l.availableKg > 0)
      .sort((a, b) => b.availableKg - a.availableKg);
    onChange(listings);
  });
}

export interface MatchNotification {
  matchId: string;
  category: Category;
  availableKg: number;
  hubName: string;
  rationale: string | null;
  status: MatchStatus;
  matchedAt: string;
}

function toNotification(d: QueryDocumentSnapshot): MatchNotification {
  const m = d.data() as Match;
  return {
    matchId: d.id,
    category: m.category,
    availableKg: m.availableKg,
    hubName: m.hubName,
    rationale: m.agentRationale,
    status: m.status,
    matchedAt: m.matchedAt,
  };
}

/** Live match feed for one receiver, newest first. */
export function subscribeToMatchesForReceiver(
  receiverId: string,
  onChange: (matches: MatchNotification[]) => void
): Unsubscribe {
  const q = query(collection(getDb(), "matches"), where("receiverId", "==", receiverId));
  return onSnapshot(q, (snap) => {
    const matches = snap.docs
      .map(toNotification)
      .sort((a, b) => +new Date(b.matchedAt) - +new Date(a.matchedAt));
    onChange(matches);
  });
}

/**
 * Returns true if the claim actually happened. Can legitimately no-op (e.g.
 * someone else claimed the same match/batch a moment earlier) - callers
 * should only show a success toast when this returns true.
 *
 * The match and its inventory batch are updated in one atomic batched write
 * - two separate updateDoc() calls previously meant the match could flip to
 * "claimed" while the batch update silently failed (a security-rule
 * mismatch reproduced exactly this during testing), leaving the two
 * documents permanently out of sync with no error surfaced anywhere.
 */
export async function claimMatch(matchId: string): Promise<boolean> {
  const db = getDb();
  const matchSnap = await getDoc(doc(db, "matches", matchId));
  if (!matchSnap.exists()) return false;
  const match = matchSnap.data() as Match;
  if (match.status !== "proposed") return false;

  const batch = writeBatch(db);
  batch.update(doc(db, "matches", matchId), { status: "claimed" });
  batch.update(doc(db, "inventoryBatches", match.inventoryBatchId), { status: "claimed" });
  await batch.commit();
  return true;
}

/** Same success-signaling contract and atomicity rationale as claimMatch(). */
export async function claimBatchDirectly(batchId: string, receiverId: string, receiverName: string): Promise<boolean> {
  const db = getDb();
  const batchSnap = await getDoc(doc(db, "inventoryBatches", batchId));
  if (!batchSnap.exists()) return false;
  const inventoryBatch = batchSnap.data() as InventoryBatch;
  if (inventoryBatch.status !== "open") return false;

  // Always create a fresh demand request for this claim rather than reusing
  // an existing one for the same receiver+category - an old demand doc may
  // already be tied to a previous (possibly still "claimed") match, and
  // reusing its id would attach a second match to it and permanently hide
  // it from the agent's future matching passes.
  const demandRef = doc(collection(db, "demandRequests"));
  const matchRef = doc(collection(db, "matches"));

  const writeBatchOp = writeBatch(db);
  writeBatchOp.set(demandRef, {
    receiverId,
    receiverName,
    category: inventoryBatch.category,
    desiredKg: inventoryBatch.availableKg,
    status: "active",
  });
  writeBatchOp.update(doc(db, "inventoryBatches", batchId), { status: "claimed" });
  writeBatchOp.set(matchRef, {
    inventoryBatchId: batchId,
    demandRequestId: demandRef.id,
    category: inventoryBatch.category,
    availableKg: inventoryBatch.availableKg,
    hubName: inventoryBatch.hubName,
    receiverId,
    agentRationale: "Claimed directly from the marketplace feed.",
    status: "claimed",
    matchedAt: new Date().toISOString(),
  });
  await writeBatchOp.commit();
  return true;
}
