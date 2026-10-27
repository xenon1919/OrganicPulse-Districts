"use client";

import { collection, doc, getDoc, getDocs, query, where, orderBy } from "firebase/firestore";
import { getDb } from "@/lib/firebase/client";
import type { CaddyDeclaration, Collection, UserProfile } from "@/types/database";

export async function findHouseholdByQr(qrPayload: string): Promise<UserProfile | null> {
  // QR payload is just the household's Firebase uid.
  const snap = await getDoc(doc(getDb(), "users", qrPayload));
  if (!snap.exists()) return null;
  const data = snap.data() as Omit<UserProfile, "id">;
  if (data.role !== "household") return null;
  return { id: snap.id, ...data };
}

export async function listCollectionsAtHub(hubId: string): Promise<Collection[]> {
  const q = query(collection(getDb(), "collections"), where("hubId", "==", hubId), orderBy("collectedAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Collection);
}

export async function getPendingCaddyFor(householdId: string): Promise<CaddyDeclaration | null> {
  const snap = await getDoc(doc(getDb(), "caddyDeclarations", householdId));
  return snap.exists() ? (snap.data() as CaddyDeclaration) : null;
}

export interface RecordCollectionInput {
  partnerId: string;
  householdId: string;
  hubId: string;
  weights: { A: number; B: number; C: number };
}

export interface RecordCollectionResult {
  collection: Collection;
  pointsAwarded: number;
}

/**
 * Recording a collection awards points, tops up hub inventory, and runs the
 * matching agent - all writes that cross user boundaries, so this goes
 * through the privileged API route (Admin SDK) rather than direct client
 * writes. See src/app/api/collections/route.ts.
 */
export async function recordCollection(input: RecordCollectionInput): Promise<RecordCollectionResult> {
  const res = await fetch("/api/collections", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? "Failed to record the collection.");
  }
  return res.json();
}
