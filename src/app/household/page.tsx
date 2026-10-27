"use client";

import { useEffect, useState } from "react";
import { Leaf, Sparkles, TreeDeciduous } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { LoadingState } from "@/components/app/loading-state";
import { useRequiredProfile } from "@/lib/hooks/use-profile";
import { getImpactStats, getHub } from "@/lib/data/household";

export default function HouseholdHomePage() {
  const { profile, loading } = useRequiredProfile("household");
  const [stats, setStats] = useState<Awaited<ReturnType<typeof getImpactStats>> | null>(null);
  const [hubName, setHubName] = useState<string | null>(null);

  useEffect(() => {
    if (!profile) return;
    getImpactStats(profile.id).then(setStats);
    getHub(profile.hub_id).then((h) => setHubName(h?.name ?? null));
  }, [profile]);

  if (loading || !profile || !stats) {
    return (
      <LoadingState>
        <div className="flex flex-col gap-4">
          <Skeleton className="h-28 w-full rounded-2xl" />
          <Skeleton className="h-20 w-full rounded-2xl" />
          <Skeleton className="h-20 w-full rounded-2xl" />
        </div>
      </LoadingState>
    );
  }

  const progressPct = stats.nextTier
    ? Math.max(4, 100 - (stats.nextTier.pointsAway / (stats.nextTier.pointsAway + stats.points)) * 100)
    : 100;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-1">
        <p className="text-sm text-muted-foreground">Welcome back,</p>
        <h1 className="text-xl font-semibold">{profile.name}</h1>
        {hubName && <p className="text-xs text-muted-foreground">{hubName}</p>}
      </div>

      <Card className="flex flex-col gap-3 bg-primary/10 p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">Green Points</span>
          </div>
          <span className="rounded-full bg-primary/20 px-2.5 py-0.5 text-xs font-medium text-primary">
            {stats.tier}
          </span>
        </div>
        <span className="text-3xl font-semibold tabular-nums">{stats.points}</span>
        <div className="flex flex-col gap-1.5">
          <Progress value={progressPct} className="h-1.5" />
          <p className="text-xs text-muted-foreground">
            {stats.nextTier ? `${stats.nextTier.pointsAway} points to ${stats.nextTier.name}` : "Highest tier reached"}
          </p>
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-3">
        <Card className="flex flex-col gap-1.5 p-4">
          <TreeDeciduous className="h-4 w-4 text-accent" />
          <span className="text-2xl font-semibold tabular-nums">{stats.carbonSavedKgThisMonth}</span>
          <span className="text-xs leading-snug text-muted-foreground">kg CO2e saved this month</span>
        </Card>
        <Card className="flex flex-col gap-1.5 p-4">
          <Leaf className="h-4 w-4 text-primary" />
          <span className="text-2xl font-semibold tabular-nums">{stats.collectionsCount}</span>
          <span className="text-xs leading-snug text-muted-foreground">collections logged all-time</span>
        </Card>
      </div>
    </div>
  );
}
