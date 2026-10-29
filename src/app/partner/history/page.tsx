"use client";

import { useEffect, useState } from "react";
import { History } from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { LoadingState } from "@/components/app/loading-state";
import { EmptyState } from "@/components/app/empty-state";
import { CategoryBadge } from "@/components/app/category-badge";
import { useRequiredProfile } from "@/lib/hooks/use-profile";
import { listCollectionsAtHub } from "@/lib/data/partner";
import type { Collection } from "@/types/database";

export default function PartnerHistoryPage() {
  const { profile, loading } = useRequiredProfile("partner");
  const [collections, setCollections] = useState<Collection[] | null>(null);

  useEffect(() => {
    if (!profile?.hubId) return;
    listCollectionsAtHub(profile.hubId)
      .then(setCollections)
      .catch(() => toast.error("Couldn't load collection history—check your connection and reload."));
  }, [profile]);

  if (loading || !profile || !collections) {
    return (
      <LoadingState>
        <Skeleton className="h-96 w-full rounded-2xl" />
      </LoadingState>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="font-display text-xl font-extrabold">Collection history</h1>

      {collections.length === 0 && (
        <EmptyState
          icon={History}
          title="No collections yet"
          description="Logged drop-offs at your hub will show up here as they come in."
        />
      )}

      <div className="flex flex-col gap-3">
        {collections.map((c) => (
          <Card key={c.id} className="flex flex-col gap-2 p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{c.householdName}</span>
              <span className="text-xs text-muted-foreground">
                {new Date(c.collectedAt).toLocaleDateString()}
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {c.categoryAKg > 0 && <CategoryBadge category="A" />}
              {c.categoryBKg > 0 && <CategoryBadge category="B" />}
              {c.categoryCKg > 0 && <CategoryBadge category="C" />}
            </div>
            <span className="text-xs text-muted-foreground">
              {(c.categoryAKg + c.categoryBKg + c.categoryCKg).toFixed(1)}kg total
              {c.samVerification?.mismatch ? "—flagged for recheck" : ""}
            </span>
          </Card>
        ))}
      </div>
    </div>
  );
}
