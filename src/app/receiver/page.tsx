"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { MapPin, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { LoadingState } from "@/components/app/loading-state";
import { EmptyState } from "@/components/app/empty-state";
import { CategoryBadge } from "@/components/app/category-badge";
import { useRequiredProfile } from "@/lib/hooks/use-profile";
import { listInventory, claimBatchDirectly, type InventoryListing } from "@/lib/data/receiver";

export default function MarketplacePage() {
  const { profile, loading } = useRequiredProfile("receiver");
  const [listings, setListings] = useState<InventoryListing[] | null>(null);
  const [claimingId, setClaimingId] = useState<string | null>(null);

  async function refresh() {
    setListings(await listInventory());
  }

  useEffect(() => {
    if (!profile) return;
    let active = true;
    listInventory().then((data) => {
      if (active) setListings(data);
    });
    return () => {
      active = false;
    };
  }, [profile]);

  async function handleClaim(batchId: string) {
    if (!profile) return;
    setClaimingId(batchId);
    await claimBatchDirectly(batchId, profile.id);
    await refresh();
    setClaimingId(null);
    toast.success("Claimed—arrange pickup from the hub.");
  }

  if (loading || !profile || !listings) {
    return (
      <LoadingState>
        <Skeleton className="h-96 w-full rounded-2xl" />
      </LoadingState>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-semibold">Resource marketplace</h1>
        <p className="text-sm text-muted-foreground">Live inventory from nearby hubs.</p>
      </div>

      {listings.length === 0 && (
        <EmptyState
          icon={Store}
          title="No open inventory right now"
          description="New batches appear here as soon as households drop off at a hub near you."
        />
      )}

      <div className="flex flex-col gap-3">
        {listings.map((l) => (
          <Card key={l.batchId} className="flex flex-col gap-3 p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex flex-col gap-1">
                <CategoryBadge category={l.category} />
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="h-3 w-3" /> {l.hubName}
                </span>
              </div>
              <span className="text-lg font-semibold tabular-nums">{l.availableKg}kg</span>
            </div>
            <Button size="sm" onClick={() => handleClaim(l.batchId)} disabled={claimingId === l.batchId}>
              {claimingId === l.batchId ? "Claiming..." : "Claim"}
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
}
