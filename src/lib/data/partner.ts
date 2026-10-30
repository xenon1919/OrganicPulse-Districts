"use client";

import { collection, doc, getDoc, getDocs, query, where, orderBy } from "firebase/firestore";
import { ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";
import { getDb, getStorageClient } from "@/lib/firebase/client";
import type { Category, Collection, UserProfile } from "@/types/database";

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

/** Partner takes the verification photo in person at pickup, not the household in advance. */
export async function uploadCollectionPhoto(partnerId: string, file: File): Promise<string> {
  const photoRef = storageRef(getStorageClient(), `collection-photos/${partnerId}/${Date.now()}-${file.name}`);
  await uploadBytes(photoRef, file);
  return getDownloadURL(photoRef);
}

export interface RecordCollectionInput {
  partnerId: string;
  householdId: string;
  hubId: string;
  categories: Category[];
  photoUrl: string | null;
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
