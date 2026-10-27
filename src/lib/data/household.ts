import { withDb } from "@/lib/mock/store";
import type { MockCaddyDeclaration, MockCollection, MockHub } from "@/lib/mock/store";
import type { Category } from "@/types/database";

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

export async function getHubs(): Promise<MockHub[]> {
  return withDb((db) => db.hubs);
}

export async function getHub(hubId: string | null): Promise<MockHub | null> {
  if (!hubId) return null;
  return withDb((db) => db.hubs.find((h) => h.id === hubId) ?? null);
}

export async function getCollectionHistory(householdId: string): Promise<MockCollection[]> {
  return withDb((db) =>
    db.collections
      .filter((c) => c.household_id === householdId)
      .sort((a, b) => +new Date(b.collected_at) - +new Date(a.collected_at))
  );
}

export async function getImpactStats(householdId: string) {
  return withDb((db) => {
    const profile = db.profiles.find((p) => p.id === householdId);
    const collections = db.collections.filter((c) => c.household_id === householdId);
    const monthAgo = Date.now() - 1000 * 60 * 60 * 24 * 30;
    const recentKg = collections
      .filter((c) => +new Date(c.collected_at) >= monthAgo)
      .reduce((sum, c) => sum + c.category_a_kg + c.category_b_kg + c.category_c_kg, 0);

    const tier = tierForPoints(profile?.green_points ?? 0);

    return {
      points: profile?.green_points ?? 0,
      tier: tier.name,
      nextTier: tier.next,
      collectionsCount: collections.length,
      carbonSavedKgThisMonth: +(recentKg * CARBON_SAVED_PER_KG).toFixed(2),
    };
  });
}

export async function getCaddyDeclaration(householdId: string): Promise<MockCaddyDeclaration> {
  return withDb((db) => {
    const existing = db.caddy_declarations.find((c) => c.household_id === householdId);
    if (existing) return existing;
    const fresh: MockCaddyDeclaration = {
      household_id: householdId,
      category_a_kg: 0,
      category_b_kg: 0,
      category_c_kg: 0,
      photo_url: null,
      updated_at: new Date().toISOString(),
    };
    db.caddy_declarations.push(fresh);
    return fresh;
  });
}

const TAP_INCREMENT_KG = 0.1;

export async function tapCategory(householdId: string, category: Category): Promise<MockCaddyDeclaration> {
  return withDb((db) => {
    let decl = db.caddy_declarations.find((c) => c.household_id === householdId);
    if (!decl) {
      decl = {
        household_id: householdId,
        category_a_kg: 0,
        category_b_kg: 0,
        category_c_kg: 0,
        photo_url: null,
        updated_at: new Date().toISOString(),
      };
      db.caddy_declarations.push(decl);
    }
    const key = (
      { A: "category_a_kg", B: "category_b_kg", C: "category_c_kg" } as const
    )[category];
    decl[key] = +(decl[key] + TAP_INCREMENT_KG).toFixed(2);
    decl.updated_at = new Date().toISOString();
    return decl;
  });
}

export async function attachCaddyPhoto(householdId: string, photoDataUrl: string): Promise<MockCaddyDeclaration> {
  return withDb((db) => {
    const decl = db.caddy_declarations.find((c) => c.household_id === householdId);
    if (!decl) throw new Error("No caddy declaration to attach a photo to yet.");
    decl.photo_url = photoDataUrl;
    decl.updated_at = new Date().toISOString();
    return decl;
  });
}
