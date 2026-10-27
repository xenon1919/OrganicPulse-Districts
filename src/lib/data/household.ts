"use client";

import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  where,
  orderBy,
} from "firebase/firestore";
import { ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";
import { getDb, getStorageClient } from "@/lib/firebase/client";
import type { CaddyDeclaration, Category, Collection, Hub } from "@/types/database";

const TIERS = [
  { name: "Sprout", min: 0 },
  { name: "Sapling", min: 100 },
  { name: "Grove", min: 300 },
  { name: "Forest", min: 700 },
] as const;

export function tierForPoints(points: number): { name: string; next: { name: string; pointsAway: number } | null } {
  let current: (typeof TIERS)[number] = TIERS[0];
  for (const t of TIERS) {
    if (points >= t.min) current = t;
  }
  const idx = TIERS.indexOf(current);
  const next = TIERS[idx + 1] ?? null;
  return {
    name: current.name,
    next: next ? { name: next.name, pointsAway: next.min - points } : null,
  };
}

// Rough estimate used for the "carbon saved" impact stat - dry organics
// diverted from landfill avoid roughly this much CO2e per kg (methane
// avoidance + offset synthetic-input production). Illustrative, not audited.
const CARBON_SAVED_PER_KG = 0.42;

const DEFAULT_HUBS: Omit<Hub, "id">[] = [
  { name: "Malkajgiri Hub", neighborhood: "Malkajgiri", lat: 17.4556, lng: 78.5199 },
  { name: "Kompally Hub", neighborhood: "Kompally", lat: 17.5406, lng: 78.4898 },
];

export async function getHubs(): Promise<Hub[]> {
  const db = getDb();
  const snap = await getDocs(collection(db, "hubs"));
  if (!snap.empty) {
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Hub);
  }

  // Hubs are normally seeded once via the Admin SDK (scripts/seed-hubs.mjs) -
  // firestore.rules intentionally blocks client writes to this collection.
  // This is a last-resort in-memory fallback so the hub picker never renders
  // empty if that seeding step was skipped; it does not persist anything.
  console.warn("No hubs found in Firestore - falling back to an in-memory default list. Run scripts/seed-hubs.mjs.");
  return DEFAULT_HUBS.map((hub, i) => ({ id: `local-fallback-${i}`, ...hub }));
}

export async function getHub(hubId: string | null): Promise<Hub | null> {
  if (!hubId) return null;
  const snap = await getDoc(doc(getDb(), "hubs", hubId));
  return snap.exists() ? ({ id: snap.id, ...snap.data() } as Hub) : null;
}

export async function getCollectionHistory(householdId: string): Promise<Collection[]> {
  const q = query(
    collection(getDb(), "collections"),
    where("householdId", "==", householdId),
    orderBy("collectedAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Collection);
}

export async function getImpactStats(householdId: string) {
  const [profileSnap, collections] = await Promise.all([
    getDoc(doc(getDb(), "users", householdId)),
    getCollectionHistory(householdId),
  ]);

  const points = profileSnap.exists() ? (profileSnap.data().greenPoints ?? 0) : 0;
  const monthAgo = Date.now() - 1000 * 60 * 60 * 24 * 30;
  const recentKg = collections
    .filter((c) => +new Date(c.collectedAt) >= monthAgo)
    .reduce((sum, c) => sum + c.categoryAKg + c.categoryBKg + c.categoryCKg, 0);

  const tier = tierForPoints(points);

  return {
    points,
    tier: tier.name,
    nextTier: tier.next,
    collectionsCount: collections.length,
    carbonSavedKgThisMonth: +(recentKg * CARBON_SAVED_PER_KG).toFixed(2),
  };
}

function emptyDeclaration(householdId: string): CaddyDeclaration {
  return {
    householdId,
    categoryAKg: 0,
    categoryBKg: 0,
    categoryCKg: 0,
    photoUrl: null,
    updatedAt: new Date().toISOString(),
  };
}

export async function getCaddyDeclaration(householdId: string): Promise<CaddyDeclaration> {
  const snap = await getDoc(doc(getDb(), "caddyDeclarations", householdId));
  return snap.exists() ? (snap.data() as CaddyDeclaration) : emptyDeclaration(householdId);
}

const TAP_INCREMENT_KG = 0.1;
const CATEGORY_FIELD = { A: "categoryAKg", B: "categoryBKg", C: "categoryCKg" } as const;

export async function tapCategory(householdId: string, category: Category): Promise<CaddyDeclaration> {
  const ref = doc(getDb(), "caddyDeclarations", householdId);
  const snap = await getDoc(ref);
  const current = snap.exists() ? (snap.data() as CaddyDeclaration) : emptyDeclaration(householdId);

  const key = CATEGORY_FIELD[category];
  const updated: CaddyDeclaration = {
    ...current,
    householdId,
    [key]: +(current[key] + TAP_INCREMENT_KG).toFixed(2),
    updatedAt: new Date().toISOString(),
  };

  await setDoc(ref, updated);
  return updated;
}

export async function attachCaddyPhoto(householdId: string, file: File): Promise<CaddyDeclaration> {
  const photoRef = storageRef(getStorageClient(), `caddy-photos/${householdId}/${Date.now()}-${file.name}`);
  await uploadBytes(photoRef, file);
  const photoUrl = await getDownloadURL(photoRef);

  const docRef = doc(getDb(), "caddyDeclarations", householdId);
  const snap = await getDoc(docRef);
  const current = snap.exists() ? (snap.data() as CaddyDeclaration) : emptyDeclaration(householdId);
  const updated: CaddyDeclaration = { ...current, householdId, photoUrl, updatedAt: new Date().toISOString() };

  await setDoc(docRef, updated);
  return updated;
}
