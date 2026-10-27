"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useRequiredProfile } from "@/lib/hooks/use-profile";

export default function QrPassPage() {
  const { profile, loading } = useRequiredProfile("household");
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!profile) return;
    QRCode.toDataURL(profile.id, {
      width: 280,
      margin: 2,
      color: { dark: "#16181a", light: "#eef3ee" },
    }).then(setQrDataUrl);
  }, [profile]);

  if (loading || !profile) {
    return <Skeleton className="h-96 w-full rounded-2xl" />;
  }

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="flex flex-col items-center gap-1 text-center">
        <h1 className="text-xl font-semibold">Your QR Pass</h1>
        <p className="text-sm text-muted-foreground">
          Show this to your collection partner on collection day.
        </p>
      </div>

      <Card className="flex flex-col items-center gap-4 p-6">
        {qrDataUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={qrDataUrl} alt="Household QR pass" className="h-56 w-56 rounded-lg" />
        ) : (
          <Skeleton className="h-56 w-56 rounded-lg" />
        )}
        <span className="text-sm font-medium">{profile.name}</span>
        <span className="rounded bg-muted px-2 py-1 font-mono text-[11px] tracking-wide text-muted-foreground">
          {profile.id}
        </span>
      </Card>
      <p className="text-center text-xs text-muted-foreground">
        Camera trouble? The partner can type the code above instead.
      </p>
    </div>
  );
}
