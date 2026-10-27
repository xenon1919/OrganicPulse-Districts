export type ProfileRole = "household" | "receiver" | "partner";
export type ReceiverType = "manufacturer" | "gardener" | "both";
export type Category = "A" | "B" | "C"; // A = Calcium (eggshells), B = Nitrogen (tea/coffee), C = Carbon (cardboard)
export type BatchStatus = "open" | "claimed" | "fulfilled";
export type DemandStatus = "active" | "paused";
export type MatchStatus = "proposed" | "claimed" | "fulfilled";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          role: ProfileRole;
          name: string;
          hub_id: string | null;
          receiver_type: ReceiverType | null;
          green_points: number;
          tier: string;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["profiles"]["Row"]> & {
          id: string;
          role: ProfileRole;
          name: string;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Row"]>;
      };
      hubs: {
        Row: {
          id: string;
          name: string;
          neighborhood: string;
          lat: number;
          lng: number;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["hubs"]["Row"]> & {
          name: string;
          neighborhood: string;
          lat: number;
          lng: number;
        };
        Update: Partial<Database["public"]["Tables"]["hubs"]["Row"]>;
      };
      collections: {
        Row: {
          id: string;
          household_id: string;
          hub_id: string;
          category_a_kg: number;
          category_b_kg: number;
          category_c_kg: number;
          photo_url: string | null;
          sam_verification: Record<string, unknown> | null;
          collected_at: string;
          verified_by: string | null;
        };
        Insert: Partial<Database["public"]["Tables"]["collections"]["Row"]> & {
          household_id: string;
          hub_id: string;
        };
        Update: Partial<Database["public"]["Tables"]["collections"]["Row"]>;
      };
      inventory_batches: {
        Row: {
          id: string;
          hub_id: string;
          category: Category;
          available_kg: number;
          status: BatchStatus;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["inventory_batches"]["Row"]> & {
          hub_id: string;
          category: Category;
          available_kg: number;
        };
        Update: Partial<Database["public"]["Tables"]["inventory_batches"]["Row"]>;
      };
      demand_requests: {
        Row: {
          id: string;
          receiver_id: string;
          category: Category;
          desired_kg: number;
          status: DemandStatus;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["demand_requests"]["Row"]> & {
          receiver_id: string;
          category: Category;
          desired_kg: number;
        };
        Update: Partial<Database["public"]["Tables"]["demand_requests"]["Row"]>;
      };
      matches: {
        Row: {
          id: string;
          inventory_batch_id: string;
          demand_request_id: string;
          agent_rationale: string | null;
          status: MatchStatus;
          matched_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["matches"]["Row"]> & {
          inventory_batch_id: string;
          demand_request_id: string;
        };
        Update: Partial<Database["public"]["Tables"]["matches"]["Row"]>;
      };
      green_points_ledger: {
        Row: {
          id: string;
          household_id: string;
          points: number;
          reason: string;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["green_points_ledger"]["Row"]> & {
          household_id: string;
          points: number;
          reason: string;
        };
        Update: Partial<Database["public"]["Tables"]["green_points_ledger"]["Row"]>;
      };
    };
  };
}

export const CATEGORY_LABEL: Record<Category, string> = {
  A: "Calcium (Eggshells)",
  B: "Nitrogen (Tea/Coffee)",
  C: "Carbon (Cardboard)",
};
