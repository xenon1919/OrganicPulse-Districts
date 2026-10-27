"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCurrentProfile } from "@/lib/data/auth";
import type { MockProfile } from "@/lib/mock/store";
import type { ProfileRole } from "@/types/database";

/**
 * Loads the current mock session's profile and redirects to /login if it's
 * missing or the wrong role. TODO: once Supabase Auth is wired up, this
 * becomes a thin wrapper over `supabase.auth.getUser()` + a profiles select.
 */
export function useRequiredProfile(role: ProfileRole) {
  const router = useRouter();
  const [profile, setProfile] = useState<MockProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    getCurrentProfile().then((p) => {
      if (!active) return;
      if (!p || p.role !== role) {
        router.replace("/login");
        return;
      }
      setProfile(p);
      setLoading(false);
    });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role]);

  return { profile, loading };
}
