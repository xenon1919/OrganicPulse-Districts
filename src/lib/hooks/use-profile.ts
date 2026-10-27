"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { getAuthClient } from "@/lib/firebase/client";
import { getUserProfile } from "@/lib/data/auth";
import type { UserProfile, ProfileRole } from "@/types/database";

/**
 * Subscribes to Firebase Auth state, loads the matching Firestore profile,
 * and redirects to /login if there's no session or the role doesn't match.
 */
export function useRequiredProfile(role: ProfileRole) {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(getAuthClient(), async (user) => {
      if (!user) {
        router.replace("/login");
        return;
      }
      const p = await getUserProfile(user.uid);
      if (!p || p.role !== role) {
        router.replace("/login");
        return;
      }
      setProfile(p);
      setLoading(false);
    });
    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role]);

  return { profile, loading };
}
