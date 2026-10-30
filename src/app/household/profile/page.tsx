"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Sparkles, TreeDeciduous } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { LoadingState } from "@/components/app/loading-state";
import { ProfileView } from "@/components/app/profile-view";
import { useRequiredProfile } from "@/lib/hooks/use-profile";
import { getImpactStats } from "@/lib/data/household";

export default function HouseholdProfilePage() {
  const { profile, loading } = useRequiredProfile("household");
  const [stats, setStats] = useState<Awaited<ReturnType<typeof getImpactStats>> | null>(null);

  useEffect(() => {
    if (!profile) return;
    getImpactStats(profile.id)
      .then(setStats)
      .catch(() => toast.error("Couldn't load your stats—check your connection and reload."));
  }, [profile]);

  if (loading || !profile || !stats) {
    return (
      <LoadingState>
        <div className="flex flex-col gap-4">
          <Skeleton className="h-32 w-full rounded-2xl" />
          <Skeleton className="h-24 w-full rounded-2xl" />
        </div>
      </LoadingState>
    );
  }

  return (
    <ProfileView profile={profile}>
      <div className="grid grid-cols-2 gap-3">
        <Card className="flex flex-col gap-1.5 p-4">
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="tabular-stat font-display text-2xl font-black">{stats.points}</span>
          <span className="text-xs leading-snug text-muted-foreground">Green Points · {stats.tier}</span>
        </Card>
        <Card className="flex flex-col gap-1.5 p-4">
          <TreeDeciduous className="h-4 w-4 text-primary" />
          <span className="tabular-stat font-display text-2xl font-black">{stats.totalContributions}</span>
          <span className="text-xs leading-snug text-muted-foreground">total contributions, all-time</span>
        </Card>
      </div>
    </ProfileView>
  );
}
