"use client";

import { Package } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { LoadingState } from "@/components/app/loading-state";
import { ProfileView } from "@/components/app/profile-view";
import { useRequiredProfile } from "@/lib/hooks/use-profile";
import type { ReceiverType } from "@/types/database";

const RECEIVER_TYPE_LABEL: Record<ReceiverType, string> = {
  manufacturer: "Organic manure manufacturer",
  gardener: "Terrace gardener",
  both: "Manufacturer & terrace gardener",
};

export default function ReceiverProfilePage() {
  const { profile, loading } = useRequiredProfile("receiver");

  if (loading || !profile) {
    return (
      <LoadingState>
        <div className="flex flex-col gap-4">
          <Skeleton className="h-32 w-full rounded-2xl" />
          <Skeleton className="h-16 w-full rounded-2xl" />
        </div>
      </LoadingState>
    );
  }

  return (
    <ProfileView profile={profile}>
      {profile.receiverType && (
        <Card className="flex flex-row items-center gap-3 p-4">
          <Package className="h-4 w-4 shrink-0 text-accent" />
          <div className="flex flex-col">
            <span className="text-sm font-medium">{RECEIVER_TYPE_LABEL[profile.receiverType]}</span>
            <span className="text-xs text-muted-foreground">Matched against this receiver type</span>
          </div>
        </Card>
      )}
    </ProfileView>
  );
}
