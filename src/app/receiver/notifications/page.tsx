"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Bell, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { LoadingState } from "@/components/app/loading-state";
import { EmptyState } from "@/components/app/empty-state";
import { CategoryBadge } from "@/components/app/category-badge";
import { useRequiredProfile } from "@/lib/hooks/use-profile";
import { subscribeToMatchesForReceiver, claimMatch, type MatchNotification } from "@/lib/data/receiver";

export default function NotificationsPage() {
  const { profile, loading } = useRequiredProfile("receiver");
  const [matches, setMatches] = useState<MatchNotification[] | null>(null);
  const [claimingId, setClaimingId] = useState<string | null>(null);

  useEffect(() => {
    if (!profile) return;
    return subscribeToMatchesForReceiver(profile.id, setMatches);
  }, [profile]);

  async function handleClaim(matchId: string) {
    if (!profile) return;
    setClaimingId(matchId);
    try {
      const claimed = await claimMatch(matchId);
      if (claimed) {
        toast.success("Claimed—arrange pickup from the hub.");
      } else {
        toast.error("This match is no longer available.");
      }
    } catch {
      toast.error("Couldn't claim this—check your connection and try again.");
    } finally {
      setClaimingId(null);
    }
  }

  if (loading || !profile || !matches) {
    return (
      <LoadingState>
        <Skeleton className="h-96 w-full rounded-2xl" />
      </LoadingState>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h1 className="font-display text-xl font-extrabold">Matches</h1>
        <p className="text-sm text-muted-foreground">Proposed by the matching agent as inventory comes in.</p>
      </div>

      {matches.length === 0 && (
        <EmptyState
          icon={Bell}
          title="No matches yet"
          description="Active demand requests get matched automatically as households drop off nearby."
        />
      )}

      <div className="flex flex-col gap-3">
        {matches.map((m) => (
          <Card key={m.matchId} className="flex flex-col gap-3 p-4">
            <div className="flex items-start justify-between gap-3">
              <CategoryBadge category={m.category} />
              <span className="font-display tabular-stat text-lg font-black">{m.availableKg}kg</span>
            </div>
            <span className="text-xs text-muted-foreground">{m.hubName}</span>

            {m.rationale && (
              <div className="flex gap-2 rounded-lg bg-accent/10 p-3 text-xs text-accent">
                <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                <span className="leading-relaxed">{m.rationale}</span>
              </div>
            )}

            {m.status === "proposed" ? (
              <Button size="sm" onClick={() => handleClaim(m.matchId)} disabled={claimingId === m.matchId}>
                {claimingId === m.matchId ? "Claiming..." : "Tap to claim"}
              </Button>
            ) : (
              <span className="text-xs font-medium capitalize text-primary">{m.status}</span>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
