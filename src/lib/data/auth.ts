"use client";

import { getSession, setSession, clearSession } from "@/lib/mock/session";
import { withDb, uid } from "@/lib/mock/store";
import type { MockProfile } from "@/lib/mock/store";
import type { ProfileRole, ReceiverType } from "@/types/database";

/**
 * TODO: swap for Supabase Auth (src/lib/supabase/client.ts) + a `profiles`
 * insert once the project is wired up. Signatures are kept close to what
 * that will look like so call sites barely change.
 */
export async function getCurrentProfile(): Promise<MockProfile | null> {
  const id = getSession();
  if (!id) return null;
  return withDb((db) => db.profiles.find((p) => p.id === id) ?? null);
}

export async function signUp(input: {
  role: ProfileRole;
  name: string;
  hubId: string;
  receiverType?: ReceiverType;
}): Promise<MockProfile> {
  const profile = withDb((db) => {
    const created: MockProfile = {
      id: uid("user"),
      role: input.role,
      name: input.name,
      hub_id: input.hubId,
      receiver_type: input.receiverType ?? null,
      green_points: 0,
      tier: "Sprout",
      created_at: new Date().toISOString(),
    };
    db.profiles.push(created);
    return created;
  });
  setSession(profile.id);
  return profile;
}

export async function logIn(profileId: string): Promise<MockProfile | null> {
  const profile = withDb((db) => db.profiles.find((p) => p.id === profileId) ?? null);
  if (profile) setSession(profile.id);
  return profile;
}

export async function logOut() {
  clearSession();
}

export async function listDemoProfiles(): Promise<MockProfile[]> {
  return withDb((db) => db.profiles);
}
