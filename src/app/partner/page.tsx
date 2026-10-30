"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Check, CheckCircle2, ScanLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { LoadingState } from "@/components/app/loading-state";
import { QrScanner } from "@/components/app/qr-scanner";
import { CATEGORY_META } from "@/components/app/category-badge";
import { useRequiredProfile } from "@/lib/hooks/use-profile";
import { findHouseholdByQr, getPendingCaddyFor, recordCollection } from "@/lib/data/partner";
import type { CaddyDeclaration, Category, SamVerification, UserProfile } from "@/types/database";

const CATEGORIES: Category[] = ["A", "B", "C"];

function ManualEntry({ onSubmit }: { onSubmit: (payload: string) => void }) {
  const [value, setValue] = useState("");
  return (
    <details className="text-xs text-muted-foreground" open>
      <summary className="cursor-pointer select-none">Camera not working? Enter the pass code manually</summary>
      <div className="mt-2 flex gap-2">
        <Input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Household pass code"
          className="text-xs"
        />
        <Button
          onClick={() => {
            if (value.trim()) onSubmit(value.trim());
          }}
        >
          Look up
        </Button>
      </div>
    </details>
  );
}

type Stage =
  | { step: "scanning" }
  | { step: "review"; household: UserProfile; pending: CaddyDeclaration | null }
  | { step: "done"; pointsAwarded: number; sam: SamVerification };

const PENDING_FIELD = { A: "categoryAKg", B: "categoryBKg", C: "categoryCKg" } as const;

export default function PartnerScanPage() {
  const { profile, loading } = useRequiredProfile("partner");
  const [stage, setStage] = useState<Stage>({ step: "scanning" });
  const [confirmed, setConfirmed] = useState<Record<Category, boolean>>({ A: false, B: false, C: false });
  const [submitting, setSubmitting] = useState(false);

  async function handleScan(payload: string) {
    try {
      const household = await findHouseholdByQr(payload);
      if (!household) {
        toast.error("No household found for that QR code.");
        return;
      }
      const pending = await getPendingCaddyFor(household.id);
      setConfirmed({
        A: (pending?.categoryAKg ?? 0) > 0,
        B: (pending?.categoryBKg ?? 0) > 0,
        C: (pending?.categoryCKg ?? 0) > 0,
      });
      setStage({ step: "review", household, pending: pending ?? null });
    } catch {
      toast.error("Couldn't look up that household—check your connection and try again.");
    }
  }

  async function handleConfirm() {
    if (stage.step !== "review" || !profile) return;
    const pending = stage.pending;
    setSubmitting(true);
    try {
      const weights = {
        A: confirmed.A ? (pending?.categoryAKg ?? 0) : 0,
        B: confirmed.B ? (pending?.categoryBKg ?? 0) : 0,
        C: confirmed.C ? (pending?.categoryCKg ?? 0) : 0,
      };
      const { pointsAwarded, collection } = await recordCollection({
        partnerId: profile.id,
        householdId: stage.household.id,
        hubId: profile.hubId ?? stage.household.hubId ?? "",
        weights,
      });
      setStage({ step: "done", pointsAwarded, sam: collection.samVerification! });
    } catch {
      toast.error("Couldn't record the collection—check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  function resetToScan() {
    setStage({ step: "scanning" });
    setConfirmed({ A: false, B: false, C: false });
  }

  if (loading || !profile) {
    return (
      <LoadingState>
        <Skeleton className="h-96 w-full rounded-2xl" />
      </LoadingState>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-1">
        <h1 className="font-display text-xl font-extrabold">Scan &amp; collect</h1>
        <p className="text-sm text-muted-foreground">{profile.name}</p>
      </div>

      {stage.step === "scanning" && (
        <Card className="flex flex-col gap-3 p-4">
          <QrScanner active onScan={handleScan} />
          <p className="flex items-center gap-2 text-xs text-muted-foreground">
            <ScanLine className="h-3.5 w-3.5" /> Point the camera at a household&rsquo;s QR pass.
          </p>
          <ManualEntry onSubmit={handleScan} />
        </Card>
      )}

      {stage.step === "review" && (
        <Card className="flex flex-col gap-4 p-4">
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-medium">{stage.household.name}</span>
            <span className="text-xs text-muted-foreground">Confirm what you&rsquo;re picking up—no weighing needed</span>
          </div>

          <div className="flex flex-col gap-2">
            {CATEGORIES.map((cat) => {
              const meta = CATEGORY_META[cat];
              const Icon = meta.icon;
              const declared = (stage.pending?.[PENDING_FIELD[cat]] ?? 0) > 0;
              const isOn = confirmed[cat];
              return (
                <button
                  key={cat}
                  type="button"
                  disabled={!declared}
                  onClick={() => setConfirmed((c) => ({ ...c, [cat]: !c[cat] }))}
                  className={`flex items-center gap-3 rounded-xl border p-3 text-left transition-colors disabled:opacity-40 ${
                    isOn ? "border-primary bg-primary/10" : "border-border"
                  }`}
                >
                  <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${meta.bg}`}>
                    <Icon className={`h-4 w-4 ${meta.fg}`} />
                  </div>
                  <div className="flex flex-1 flex-col">
                    <span className="text-sm font-medium">{meta.label}</span>
                    <span className="text-xs text-muted-foreground">
                      {declared ? "Logged by the household" : "Nothing logged for this category"}
                    </span>
                  </div>
                  <div
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                      isOn ? "border-primary bg-primary text-primary-foreground" : "border-border"
                    }`}
                  >
                    {isOn && <Check className="h-3 w-3" />}
                  </div>
                </button>
              );
            })}
          </div>

          {(() => {
            const anyConfirmed = CATEGORIES.some((c) => confirmed[c]);
            return (
              <div className="flex flex-col gap-2">
                {!anyConfirmed && (
                  <p className="text-xs text-muted-foreground">Confirm at least one category to continue.</p>
                )}
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1" onClick={resetToScan}>
                    Cancel
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={handleConfirm}
                    disabled={submitting || !anyConfirmed}
                    aria-busy={submitting}
                  >
                    {submitting ? "Verifying..." : "Confirm pickup"}
                  </Button>
                </div>
              </div>
            );
          })()}
        </Card>
      )}

      {stage.step === "done" && (
        <Card className="flex flex-col gap-4 p-5">
          <div className="flex items-center gap-2 text-primary">
            <CheckCircle2 className="h-5 w-5" />
            <span className="text-sm font-medium">Collection recorded</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="font-display tabular-stat text-2xl font-black text-primary">+{stage.pointsAwarded} pts</span>
            <span className="text-xs text-muted-foreground">credited to the household</span>
          </div>
          <div
            className={`flex flex-col gap-1 rounded-lg p-3 text-xs ${
              stage.sam.mismatch ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary"
            }`}
          >
            <span className="font-medium">
              SAM photo check: {Math.round(stage.sam.confidence * 100)}% confidence
              {stage.sam.mismatch ? "—review recommended" : ""}
            </span>
            <span className="text-muted-foreground">{stage.sam.note}</span>
          </div>
          <Button onClick={resetToScan}>Scan next household</Button>
        </Card>
      )}
    </div>
  );
}
