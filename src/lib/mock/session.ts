"use client";

/**
 * Stand-in for Supabase Auth while the backend isn't wired up yet. Stores
 * which seeded demo profile the current browser is "logged in" as. Swap for
 * real session reads once auth is live.
 */
const SESSION_KEY = "opd_mock_session_v1";

export function getSession(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(SESSION_KEY);
}

export function setSession(profileId: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(SESSION_KEY, profileId);
}

export function clearSession() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(SESSION_KEY);
}
