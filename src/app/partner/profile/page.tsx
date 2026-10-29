"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { LoadingState } from "@/components/app/loading-state";
import { ProfileView } from "@/components/app/profile-view";
import { useRequiredProfile } from "@/lib/hooks/use-profile";

export default function PartnerProfilePage() {
  const { profile, loading } = useRequiredProfile("partner");

  if (loading || !profile) {
    return (
      <LoadingState>
        <Skeleton className="h-32 w-full rounded-2xl" />
      </LoadingState>
    );
  }

  return <ProfileView profile={profile} />;
}
