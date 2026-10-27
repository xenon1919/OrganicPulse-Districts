export type ProfileRole = "household" | "receiver" | "partner";
export type ReceiverType = "manufacturer" | "gardener" | "both";
export type Category = "A" | "B" | "C"; // A = Calcium (eggshells), B = Nitrogen (tea/coffee), C = Carbon (cardboard)
export type BatchStatus = "open" | "claimed" | "fulfilled";
export type DemandStatus = "active" | "paused";
export type MatchStatus = "proposed" | "claimed" | "fulfilled";

// Firestore document shapes. Collection paths: users/{uid}, hubs/{id},
// caddyDeclarations/{uid}, collections/{id}, inventoryBatches/{id},
// demandRequests/{id}, matches/{id}, greenPointsLedger/{id}.
// Display fields (hubName, receiverName, etc.) are denormalized at write
// time since Firestore has no joins - see firestore.rules for the security
// model.

export interface UserProfile {
  id: string; // Firebase Auth uid
  role: ProfileRole;
  name: string;
  phone: string;
  address: string;
  pincode: string;
  hubId: string | null;
  hubName: string | null;
  receiverType: ReceiverType | null;
  greenPoints: number;
  tier: string;
  createdAt: string;
}

export interface Hub {
  id: string;
  name: string;
  neighborhood: string;
  lat: number;
  lng: number;
}

export interface CaddyDeclaration {
  householdId: string;
  categoryAKg: number;
  categoryBKg: number;
  categoryCKg: number;
  photoUrl: string | null;
  updatedAt: string;
}

export interface SamVerification {
  estimated: Record<Category, number>;
  confidence: number;
  mismatch: boolean;
  note: string;
}

export interface Collection {
  id: string;
  householdId: string;
  householdName: string;
  hubId: string;
  hubName: string;
  categoryAKg: number;
  categoryBKg: number;
  categoryCKg: number;
  photoUrl: string | null;
  samVerification: SamVerification | null;
  collectedAt: string;
  verifiedBy: string;
}

export interface InventoryBatch {
  id: string;
  hubId: string;
  hubName: string;
  neighborhood: string;
  category: Category;
  availableKg: number;
  status: BatchStatus;
  createdAt: string;
}

export interface DemandRequest {
  id: string;
  receiverId: string;
  receiverName: string;
  category: Category;
  desiredKg: number;
  status: DemandStatus;
}

export interface Match {
  id: string;
  inventoryBatchId: string;
  demandRequestId: string;
  category: Category;
  availableKg: number;
  hubName: string;
  receiverId: string;
  agentRationale: string | null;
  status: MatchStatus;
  matchedAt: string;
}

export interface GreenPointsLedgerEntry {
  id: string;
  householdId: string;
  points: number;
  reason: string;
  createdAt: string;
}

export const CATEGORY_LABEL: Record<Category, string> = {
  A: "Calcium (Eggshells)",
  B: "Nitrogen (Tea/Coffee)",
  C: "Carbon (Cardboard)",
};
