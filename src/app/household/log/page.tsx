"use client";

import { useEffect, useRef, useState } from "react";
import { Camera } from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { LoadingState } from "@/components/app/loading-state";
import { CATEGORY_META } from "@/components/app/category-badge";
import { useRequiredProfile } from "@/lib/hooks/use-profile";
import { getCaddyDeclaration, tapCategory, attachCaddyPhoto, TAP_INCREMENT_KG } from "@/lib/data/household";
import type { CaddyDeclaration, Category } from "@/types/database";

const CATEGORIES: Category[] = ["A", "B", "C"];

export default function LogCollectionPage() {
  const { profile, loading } = useRequiredProfile("household");
  const [decl, setDecl] = useState<CaddyDeclaration | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!profile) return;
    getCaddyDeclaration(profile.id)
      .then(setDecl)
      .catch(() => toast.error("Couldn't load your caddy log—check your connection and reload."));
  }, [profile]);

  async function handleTap(category: Category) {
    if (!profile) return;
    try {
      const updated = await tapCategory(profile.id, category);
      setDecl(updated);
      toast.success(`Added to your ${CATEGORY_META[category].short} caddy`);
    } catch {
      toast.error("Couldn't save that—check your connection and try again.");
    }
  }

  async function handlePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    if (!profile) return;
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const updated = await attachCaddyPhoto(profile.id, file);
      setDecl(updated);
      toast.success("Photo attached—used to verify your drop-off on collection day.");
    } catch {
      toast.error("Photo upload failed—check your connection and try again.");
    } finally {
      setUploading(false);
      // Without this, re-selecting the same file after a failed upload
      // wouldn't fire onChange again (the input's value hasn't "changed").
      e.target.value = "";
    }
  }

  if (loading || !profile || !decl) {
    return (
      <LoadingState>
        <div className="flex flex-col gap-4">
          <Skeleton className="h-10 w-2/3" />
          <Skeleton className="h-64 w-full rounded-2xl" />
        </div>
      </LoadingState>
    );
  }

  const weights: Record<Category, number> = {
    A: decl.categoryAKg,
    B: decl.categoryBKg,
    C: decl.categoryCKg,
  };
  const counts: Record<Category, number> = {
    A: Math.round(weights.A / TAP_INCREMENT_KG),
    B: Math.round(weights.B / TAP_INCREMENT_KG),
    C: Math.round(weights.C / TAP_INCREMENT_KG),
  };
  const totalCount = counts.A + counts.B + counts.C;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="font-display text-xl font-extrabold">Log collection</h1>
        <p className="text-sm text-muted-foreground">Tap each time you add to your caddy this week.</p>
      </div>

      <div className="flex flex-col gap-3">
        {CATEGORIES.map((category) => {
          const meta = CATEGORY_META[category];
          const Icon = meta.icon;
          return (
            <button key={category} onClick={() => handleTap(category)} className="text-left">
              <Card className="flex flex-row items-center gap-4 p-4 transition-transform active:scale-[0.98]">
                <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${meta.bg}`}>
                  <Icon className={`h-5 w-5 ${meta.fg}`} />
                </div>
                <div className="flex flex-1 flex-col gap-0.5">
                  <span className="text-sm font-medium">{meta.label}</span>
                  <span className="text-xs text-muted-foreground">Tap to add</span>
                </div>
                <span className="font-display tabular-stat text-lg font-black text-accent">
                  ×{counts[category]}
                </span>
              </Card>
            </button>
          );
        })}
      </div>

      <Card className="flex flex-col gap-3 p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Caddy photo</span>
          <span className="text-xs text-muted-foreground">Optional, speeds up verification</span>
        </div>
        {decl.photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={decl.photoUrl} alt="Caddy contents" className="h-40 w-full rounded-lg object-cover" />
        ) : (
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="flex h-32 w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border text-muted-foreground"
          >
            <Camera className="h-6 w-6" />
            <span className="text-xs">{uploading ? "Uploading…" : "Attach a photo of your caddy"}</span>
          </button>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handlePhoto}
        />
        {decl.photoUrl && !uploading && (
          <button onClick={() => fileInputRef.current?.click()} className="text-xs font-medium text-accent">
            Retake photo
          </button>
        )}
      </Card>

      <p className="text-center text-xs text-muted-foreground">
        {totalCount} item{totalCount === 1 ? "" : "s"} logged so far—bring it to your hub&rsquo;s next collection day.
      </p>
    </div>
  );
}
