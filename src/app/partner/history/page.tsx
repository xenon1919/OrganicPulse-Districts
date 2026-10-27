"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CategoryBadge } from "@/components/app/category-badge";
import { useRequiredProfile } from "@/lib/hooks/use-profile";
import { listCollectionsAtHub } from "@/lib/data/partner";
import type { MockCollection } from "@/lib/mock/store";

export default function PartnerHistoryPage() {
  const { profile, loading } = useRequiredProfile("partner");
  const [collections, setCollections] = useState<(MockCollection & { householdName: string })[] | null>(null);

  useEffect(() => {
    if (!profile?.hub_id) return;
    listCollectionsAtHub(profile.hub_id).then(setCollections);
  }, [profile]);

  if (loading || !profile || !collections) {
    return <Skeleton className="h-96 w-full rounded-2xl" />;
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold">Collection history</h1>

      {collections.length === 0 && (
        <p className="text-sm text-muted-foreground">No collections logged at this hub yet.</p>
      )}

      <div className="flex flex-col gap-3">
        {collections.map((c) => (
          <Card key={c.id} className="flex flex-col gap-2 p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{c.householdName}</span>
              <span className="text-xs text-muted-foreground">
                {new Date(c.collected_at).toLocaleDateString()}
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {c.category_a_kg > 0 && <CategoryBadge category="A" />}
              {c.category_b_kg > 0 && <CategoryBadge category="B" />}
              {c.category_c_kg > 0 && <CategoryBadge category="C" />}
            </div>
            <span className="text-xs text-muted-foreground">
              {(c.category_a_kg + c.category_b_kg + c.category_c_kg).toFixed(1)}kg total
              {c.sam_verification?.mismatch ? " - flagged for recheck" : ""}
            </span>
          </Card>
        ))}
      </div>
    </div>
  );
}
