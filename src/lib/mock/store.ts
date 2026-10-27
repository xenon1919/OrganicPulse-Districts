/**
 * Local, browser-persisted mock of the Supabase schema (see supabase/schema.sql).
 * Every table here has the same shape as its Postgres counterpart on purpose:
 * once Supabase is wired up, src/lib/data/*.ts swaps its implementation to
 * query Supabase instead, with the same function signatures, and this file
 * goes away. Nothing above the data layer should import this directly.
 */
import type {
  BatchStatus,
  Category,
  MatchStatus,
  ProfileRole,
  ReceiverType,
} from "@/types/database";

export interface MockProfile {
  id: string;
  role: ProfileRole;
  name: string;
  hub_id: string | null;
  receiver_type: ReceiverType | null;
  green_points: number;
  tier: string;
  created_at: string;
}

export interface MockHub {
  id: string;
  name: string;
  neighborhood: string;
  lat: number;
  lng: number;
}

export interface MockCaddyDeclaration {
  household_id: string;
  category_a_kg: number;
  category_b_kg: number;
  category_c_kg: number;
  photo_url: string | null;
  updated_at: string;
}

export interface MockCollection {
  id: string;
  household_id: string;
  hub_id: string;
  category_a_kg: number;
  category_b_kg: number;
  category_c_kg: number;
  photo_url: string | null;
  sam_verification: {
    estimated: Record<Category, number>;
    confidence: number;
    mismatch: boolean;
    note: string;
  } | null;
  collected_at: string;
  verified_by: string | null;
}

export interface MockInventoryBatch {
  id: string;
  hub_id: string;
  category: Category;
  available_kg: number;
  status: BatchStatus;
  created_at: string;
}

export interface MockDemandRequest {
  id: string;
  receiver_id: string;
  category: Category;
  desired_kg: number;
  status: "active" | "paused";
}

export interface MockMatch {
  id: string;
  inventory_batch_id: string;
  demand_request_id: string;
  agent_rationale: string | null;
  status: MatchStatus;
  matched_at: string;
}

export interface MockLedgerEntry {
  id: string;
  household_id: string;
  points: number;
  reason: string;
  created_at: string;
}

interface MockDb {
  profiles: MockProfile[];
  hubs: MockHub[];
  caddy_declarations: MockCaddyDeclaration[];
  collections: MockCollection[];
  inventory_batches: MockInventoryBatch[];
  demand_requests: MockDemandRequest[];
  matches: MockMatch[];
  green_points_ledger: MockLedgerEntry[];
}

const STORAGE_KEY = "opd_mock_db_v1";

function uid(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

function seedDb(): MockDb {
  const now = new Date().toISOString();
  const hubs: MockHub[] = [
    { id: "hub-malkajgiri", name: "Malkajgiri Hub", neighborhood: "Malkajgiri", lat: 17.4556, lng: 78.5199 },
    { id: "hub-kompally", name: "Kompally Hub", neighborhood: "Kompally", lat: 17.5406, lng: 78.4898 },
  ];

  const profiles: MockProfile[] = [
    {
      id: "demo-household",
      role: "household",
      name: "You",
      hub_id: "hub-malkajgiri",
      receiver_type: null,
      green_points: 240,
      tier: "Sapling",
      created_at: now,
    },
    {
      id: "demo-partner",
      role: "partner",
      name: "Malkajgiri Collection Partner",
      hub_id: "hub-malkajgiri",
      receiver_type: null,
      green_points: 0,
      tier: "Sprout",
      created_at: now,
    },
    {
      id: "receiver-manure-co",
      role: "receiver",
      name: "Deccan Organic Manure Co.",
      hub_id: "hub-malkajgiri",
      receiver_type: "manufacturer",
      green_points: 0,
      tier: "Sprout",
      created_at: now,
    },
    {
      id: "receiver-terrace-gardener",
      role: "receiver",
      name: "Priya’s Terrace Garden",
      hub_id: "hub-malkajgiri",
      receiver_type: "gardener",
      green_points: 0,
      tier: "Sprout",
      created_at: now,
    },
  ];

  const collections: MockCollection[] = [
    {
      id: uid("col"),
      household_id: "demo-household",
      hub_id: "hub-malkajgiri",
      category_a_kg: 0.6,
      category_b_kg: 1.2,
      category_c_kg: 0.9,
      photo_url: null,
      sam_verification: {
        estimated: { A: 0.55, B: 1.3, C: 0.85 },
        confidence: 0.91,
        mismatch: false,
        note: "Composition estimate matches logged weights within tolerance.",
      },
      collected_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6).toISOString(),
      verified_by: "demo-partner",
    },
  ];

  const inventory_batches: MockInventoryBatch[] = [
    { id: "batch-1", hub_id: "hub-malkajgiri", category: "A", available_kg: 4.2, status: "open", created_at: now },
    { id: "batch-2", hub_id: "hub-malkajgiri", category: "B", available_kg: 7.8, status: "open", created_at: now },
    { id: "batch-3", hub_id: "hub-malkajgiri", category: "C", available_kg: 15.5, status: "open", created_at: now },
  ];

  const demand_requests: MockDemandRequest[] = [
    { id: "demand-1", receiver_id: "receiver-manure-co", category: "C", desired_kg: 20, status: "active" },
    { id: "demand-2", receiver_id: "receiver-terrace-gardener", category: "A", desired_kg: 3, status: "active" },
  ];

  const matches: MockMatch[] = [];
  const green_points_ledger: MockLedgerEntry[] = [
    { id: uid("gpl"), household_id: "demo-household", points: 240, reason: "Starter bonus", created_at: now },
  ];
  const caddy_declarations: MockCaddyDeclaration[] = [];

  return {
    profiles,
    hubs,
    caddy_declarations,
    collections,
    inventory_batches,
    demand_requests,
    matches,
    green_points_ledger,
  };
}

function load(): MockDb {
  if (typeof window === "undefined") return seedDb();
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    const fresh = seedDb();
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh));
    return fresh;
  }
  try {
    const parsed = JSON.parse(raw) as Partial<MockDb>;
    return { ...seedDb(), ...parsed, caddy_declarations: parsed.caddy_declarations ?? [] };
  } catch {
    const fresh = seedDb();
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh));
    return fresh;
  }
}

function save(db: MockDb) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
}

export function withDb<T>(fn: (db: MockDb) => T): T {
  const db = load();
  const result = fn(db);
  save(db);
  return result;
}

export function resetMockDb() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
}

export { uid };
