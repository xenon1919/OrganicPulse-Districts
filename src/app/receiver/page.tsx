"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { MapPin, Plus, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { LoadingState } from "@/components/app/loading-state";
import { EmptyState } from "@/components/app/empty-state";
import { CategoryBadge, CATEGORY_META } from "@/components/app/category-badge";
import { useRequiredProfile } from "@/lib/hooks/use-profile";
import {
  subscribeToInventory,
  claimBatchDirectly,
  createDemandRequest,
  type InventoryListing,
} from "@/lib/data/receiver";
import type { Category } from "@/types/database";

const CATEGORIES: Category[] = ["A", "B", "C"];

function RequirementDialog({ receiverId, receiverName }: { receiverId: string; receiverName: string }) {
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState<Category>("A");
  const [desiredKg, setDesiredKg] = useState("5");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    const kg = Number(desiredKg);
    if (!kg || kg <= 0) return;
    setSubmitting(true);
    try {
      await createDemandRequest(receiverId, receiverName, category, kg);
      toast.success("Requirement placed—we'll match you when it's available.");
      setOpen(false);
      setDesiredKg("5");
    } catch {
      toast.error("Couldn't place that—check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="w-full gap-1.5">
          <Plus className="h-3.5 w-3.5" />
          Place a requirement
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Place a requirement</DialogTitle>
          <DialogDescription>
            Tell us what you need—you&rsquo;ll get matched automatically as households drop it off.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label>Category</Label>
            <div className="flex gap-2">
              {CATEGORIES.map((cat) => {
                const meta = CATEGORY_META[cat];
                const Icon = meta.icon;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={`flex flex-1 flex-col items-center gap-1 rounded-xl border p-2.5 transition-colors ${
                      category === cat ? "border-primary bg-primary/10" : "border-border"
                    }`}
                  >
                    <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${meta.bg}`}>
                      <Icon className={`h-4 w-4 ${meta.fg}`} />
                    </div>
                    <span className="text-xs font-medium">{meta.short}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="desired-kg">Amount needed (kg)</Label>
            <Input
              id="desired-kg"
              type="number"
              inputMode="decimal"
              min="0"
              step="0.5"
              value={desiredKg}
              onChange={(e) => {
                const raw = e.target.value;
                if (raw !== "" && Number(raw) < 0) return;
                setDesiredKg(raw);
              }}
            />
          </div>
        </div>

        <DialogFooter>
          <Button onClick={handleSubmit} disabled={submitting || !Number(desiredKg)} aria-busy={submitting}>
            {submitting ? "Placing..." : "Place requirement"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function MarketplacePage() {
  const { profile, loading } = useRequiredProfile("receiver");
  const [listings, setListings] = useState<InventoryListing[] | null>(null);
  const [claimingId, setClaimingId] = useState<string | null>(null);

  useEffect(() => {
    if (!profile) return;
    return subscribeToInventory(setListings);
  }, [profile]);

  async function handleClaim(batchId: string) {
    if (!profile) return;
    setClaimingId(batchId);
    try {
      const claimed = await claimBatchDirectly(batchId, profile.id, profile.name);
      if (claimed) {
        toast.success("Claimed—arrange pickup from the hub.");
      } else {
        toast.error("Someone else just claimed this—check the marketplace for other batches.");
      }
    } catch {
      toast.error("Couldn't claim this—check your connection and try again.");
    } finally {
      setClaimingId(null);
    }
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
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <h1 className="font-display text-xl font-extrabold">Marketplace</h1>
          <p className="text-sm text-muted-foreground">Live inventory from nearby hubs.</p>
        </div>
        <RequirementDialog receiverId={profile.id} receiverName={profile.name} />
      </div>

      {listings.length === 0 && (
        <EmptyState
          icon={Store}
          illustration="empty-bowl"
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
              <span className="font-display tabular-stat text-lg font-black">{l.availableKg}kg</span>
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
