"use client";

import { useEffect, useState } from "react";
import { ChevronRight, Leaf, Sparkles, TreeDeciduous } from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { LoadingState } from "@/components/app/loading-state";
import { SproutIllustration, BowlIllustration } from "@/components/app/illustrations";
import { CATEGORY_GUIDE } from "@/components/app/category-badge";
import { useRequiredProfile } from "@/lib/hooks/use-profile";
import { getImpactStats } from "@/lib/data/household";
import type { Category } from "@/types/database";

const CATEGORIES: Category[] = ["A", "B", "C"];

function ImpactRow({
  icon: Icon,
  label,
  value,
  caption,
}: {
  icon: typeof Leaf;
  label: string;
  value: string | number;
  caption: string;
}) {
  return (
    <Card className="flex flex-row items-center gap-3 p-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent">
        <Icon className="h-4 w-4 text-accent-foreground" />
      </div>
      <div className="flex flex-1 flex-col">
        <span className="text-xs text-muted-foreground">{label}</span>
        <span className="tabular-stat font-display text-lg font-black">{value}</span>
      </div>
      <span className="text-right text-[11px] leading-snug text-muted-foreground">{caption}</span>
    </Card>
  );
}

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
        <div className="flex flex-col gap-3">
          <Skeleton className="h-20 w-full rounded-2xl" />
          <Skeleton className="h-16 w-full rounded-2xl" />
          <Skeleton className="h-16 w-full rounded-2xl" />
          <Skeleton className="h-16 w-full rounded-2xl" />
        </div>
      </LoadingState>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <Card className="flex flex-row items-center gap-3 bg-secondary/60 p-3.5">
        <SproutIllustration className="h-14 w-14 shrink-0" />
        <div className="flex flex-col gap-0.5">
          <h1 className="font-display text-base font-bold">Hi, {profile.name.split(" ")[0]}!</h1>
          <p className="text-xs leading-snug text-muted-foreground">
            Thank you for being part of a greener tomorrow.
          </p>
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-3">
        <Card className="flex flex-col gap-1 p-3">
          <div className="flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs font-medium">Green Points</span>
          </div>
          <span className="tabular-stat font-display text-2xl font-black">{stats.points}</span>
          <span className="text-[11px] leading-snug text-muted-foreground">
            {stats.nextTier ? `${stats.nextTier.pointsAway} to ${stats.nextTier.name}` : "Highest tier reached"}
          </span>
        </Card>
        <Card className="flex flex-col gap-1 p-3">
          <div className="flex items-center gap-1.5">
            <Leaf className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs font-medium">Contributions</span>
          </div>
          <span className="tabular-stat font-display text-2xl font-black">{stats.totalContributions}</span>
          <span className="text-[11px] leading-snug text-muted-foreground">all-time, {stats.tier} tier</span>
        </Card>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-0.5">
          <h2 className="font-display text-base font-bold">Your Impact</h2>
          <p className="text-xs text-muted-foreground">Small actions. Big change.</p>
        </div>
        <div className="flex flex-col gap-2.5">
          <ImpactRow
            icon={Leaf}
            label="Total Contributions"
            value={stats.totalContributions}
            caption="Across all categories"
          />
          <ImpactRow
            icon={TreeDeciduous}
            label="CO2e Saved"
            value={`${stats.carbonSavedKgThisMonth}kg`}
            caption="This month"
          />
          <ImpactRow icon={Sparkles} label="Current Tier" value={stats.tier} caption="Keep going!" />
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-0.5">
          <h2 className="font-display text-base font-bold">What can you contribute?</h2>
          <p className="text-xs text-muted-foreground">
            Keep these 3 dry-waste categories separate, clean, and completely dry.
          </p>
        </div>

        <div className="flex flex-col gap-2.5">
          {CATEGORIES.map((cat, i) => {
            const guide = CATEGORY_GUIDE[cat];
            return (
              <Card key={cat} className="flex flex-row items-center gap-3 p-3">
                <BowlIllustration category={cat} className="h-12 w-12 shrink-0" />
                <div className="flex flex-1 flex-col">
                  <span className="text-sm font-bold">
                    {i + 1}. {cat} — {guide.title}
                  </span>
                  <span className="text-xs leading-snug text-muted-foreground">{guide.description}</span>
                </div>
                <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
              </Card>
            );
          })}
        </div>
      </div>

      <div className="flex items-center gap-2.5 rounded-2xl bg-secondary/60 px-3.5 py-3">
        <Leaf className="h-4 w-4 shrink-0 text-primary" />
        <p className="text-xs leading-snug text-muted-foreground">
          Together, we turn everyday dry waste into valuable resources for a greener future.
        </p>
      </div>
    </div>
  );
}
