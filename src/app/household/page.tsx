"use client";

import { useEffect, useState } from "react";
import { Check, Leaf, Sparkles, TreeDeciduous } from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { LoadingState } from "@/components/app/loading-state";
import { SproutIllustration, BowlIllustration } from "@/components/app/illustrations";
import { CATEGORY_GUIDE } from "@/components/app/category-badge";
import { useRequiredProfile } from "@/lib/hooks/use-profile";
import { getImpactStats } from "@/lib/data/household";
import type { Category } from "@/types/database";

const CATEGORIES: Category[] = ["A", "B", "C"];

export default function HouseholdHomePage() {
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
    <div className="flex flex-col gap-6">
      <Card className="flex items-center gap-3 bg-secondary/60 p-4">
        <SproutIllustration className="h-14 w-14 shrink-0" />
        <div className="flex flex-col gap-0.5">
          <h1 className="font-display text-lg font-bold">Hi, {profile.name.split(" ")[0]}!</h1>
          <p className="text-xs leading-snug text-muted-foreground">
            Thank you for being part of a greener tomorrow.
          </p>
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-3">
        <Card className="flex flex-col gap-2 p-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent">
            <Sparkles className="h-4 w-4 text-accent-foreground" />
          </div>
          <span className="tabular-stat font-display text-2xl font-black">{stats.points}</span>
          <span className="text-xs leading-snug text-muted-foreground">Green Points · {stats.tier}</span>
        </Card>
        <Card className="flex flex-col gap-2 p-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent">
            <Leaf className="h-4 w-4 text-accent-foreground" />
          </div>
          <span className="tabular-stat font-display text-2xl font-black">{stats.totalContributions}</span>
          <span className="text-xs leading-snug text-muted-foreground">Total Contributions</span>
        </Card>
      </div>

      <Card className="flex flex-col gap-2 p-4">
        <span className="text-sm font-medium">Next tier</span>
        <Progress value={progressPct} className="h-1.5" />
        <p className="text-xs text-muted-foreground">
          {stats.nextTier ? `${stats.nextTier.pointsAway} points to ${stats.nextTier.name}` : "Highest tier reached"}
        </p>
      </Card>

      <Card className="flex flex-col gap-1.5 p-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent">
          <TreeDeciduous className="h-4 w-4 text-accent-foreground" />
        </div>
        <span className="tabular-stat font-display text-2xl font-black">{stats.carbonSavedKgThisMonth}</span>
        <span className="text-xs leading-snug text-muted-foreground">kg CO2e saved this month</span>
      </Card>

      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-0.5">
          <h2 className="font-display text-base font-bold">What can you contribute?</h2>
          <p className="text-xs text-muted-foreground">
            Keep these 3 dry-waste categories separate, clean, and completely dry.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          {CATEGORIES.map((cat) => {
            const guide = CATEGORY_GUIDE[cat];
            return (
              <Card key={cat} className="flex gap-3 p-4">
                <BowlIllustration category={cat} className="h-14 w-14 shrink-0" />
                <div className="flex flex-1 flex-col gap-1.5">
                  <div className="flex flex-col">
                    <span className="text-sm font-bold">
                      {cat} — {guide.title}
                    </span>
                    <span className="text-xs text-muted-foreground">{guide.description}</span>
                  </div>
                  <ul className="flex flex-col gap-1">
                    {guide.rules.map((rule) => (
                      <li key={rule} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Check className="h-3 w-3 shrink-0 text-primary" />
                        {rule}
                      </li>
                    ))}
                  </ul>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
