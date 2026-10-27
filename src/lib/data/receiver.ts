"use client";

import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  updateDoc,
  where,
  type QueryDocumentSnapshot,
  type Unsubscribe,
} from "firebase/firestore";
import { getDb } from "@/lib/firebase/client";
import type { Category, InventoryBatch, Match, MatchStatus } from "@/types/database";

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

export async function claimMatch(matchId: string): Promise<void> {
  const db = getDb();
  const matchSnap = await getDoc(doc(db, "matches", matchId));
  if (!matchSnap.exists()) return;
  const match = matchSnap.data() as Match;

  await updateDoc(doc(db, "matches", matchId), { status: "claimed" });
  await updateDoc(doc(db, "inventoryBatches", match.inventoryBatchId), { status: "claimed" });
}

export async function claimBatchDirectly(batchId: string, receiverId: string, receiverName: string): Promise<void> {
  const db = getDb();
  const batchSnap = await getDoc(doc(db, "inventoryBatches", batchId));
  if (!batchSnap.exists()) return;
  const batch = batchSnap.data() as InventoryBatch;
  if (batch.status !== "open") return;

  const existingDemand = await getDocs(
    query(
      collection(db, "demandRequests"),
      where("receiverId", "==", receiverId),
      where("category", "==", batch.category)
    )
  );

  let demandId: string;
  if (!existingDemand.empty) {
    demandId = existingDemand.docs[0].id;
  } else {
    const demandRef = await addDoc(collection(db, "demandRequests"), {
      receiverId,
      receiverName,
      category: batch.category,
      desiredKg: batch.availableKg,
      status: "active",
    });
    demandId = demandRef.id;
  }

  await updateDoc(doc(db, "inventoryBatches", batchId), { status: "claimed" });
  await addDoc(collection(db, "matches"), {
    inventoryBatchId: batchId,
    demandRequestId: demandId,
    category: batch.category,
    availableKg: batch.availableKg,
    hubName: batch.hubName,
    receiverId,
    agentRationale: "Claimed directly from the marketplace feed.",
    status: "claimed",
    matchedAt: new Date().toISOString(),
  });
}
