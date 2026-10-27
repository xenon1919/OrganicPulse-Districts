"use client";

import { useState } from "react";
import { toast } from "sonner";
import { CheckCircle2, ScanLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { LoadingState } from "@/components/app/loading-state";
import { QrScanner } from "@/components/app/qr-scanner";
import { CATEGORY_META } from "@/components/app/category-badge";
import { useRequiredProfile } from "@/lib/hooks/use-profile";
import { findHouseholdByQr, getPendingCaddyFor, recordCollection } from "@/lib/data/partner";
import type { MockProfile, MockCaddyDeclaration } from "@/lib/mock/store";
import type { SamVerification } from "@/lib/data/ai";

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
  | { step: "review"; household: MockProfile; pending: MockCaddyDeclaration | null }
  | { step: "done"; pointsAwarded: number; sam: SamVerification };

export default function PartnerScanPage() {
  const { profile, loading } = useRequiredProfile("partner");
  const [stage, setStage] = useState<Stage>({ step: "scanning" });
  const [weights, setWeights] = useState({ A: "0", B: "0", C: "0" });
  const [submitting, setSubmitting] = useState(false);

  async function handleScan(payload: string) {
    const household = await findHouseholdByQr(payload);
    if (!household) {
      toast.error("No household found for that QR code.");
      return;
    }
    const pending = await getPendingCaddyFor(household.id);
    setWeights({
      A: (pending?.category_a_kg ?? 0).toFixed(1),
      B: (pending?.category_b_kg ?? 0).toFixed(1),
      C: (pending?.category_c_kg ?? 0).toFixed(1),
    });
    setStage({ step: "review", household, pending: pending ?? null });
  }

  async function handleConfirm() {
    if (stage.step !== "review" || !profile) return;
    setSubmitting(true);
    const { pointsAwarded, collection } = await recordCollection({
      partnerId: profile.id,
      householdId: stage.household.id,
      hubId: profile.hub_id ?? stage.household.hub_id ?? "",
      weights: { A: Number(weights.A) || 0, B: Number(weights.B) || 0, C: Number(weights.C) || 0 },
    });
    setSubmitting(false);
    setStage({ step: "done", pointsAwarded, sam: collection.sam_verification! });
  }

  function resetToScan() {
    setStage({ step: "scanning" });
    setWeights({ A: "0", B: "0", C: "0" });
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
        <h1 className="text-xl font-semibold">Scan &amp; log</h1>
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
            <span className="text-xs text-muted-foreground">
              {stage.pending ? "Pre-filled from their caddy log" : "No pending log—enter weighed amounts"}
            </span>
          </div>

          {(["A", "B", "C"] as const).map((cat) => {
            const meta = CATEGORY_META[cat];
            return (
              <div key={cat} className="flex flex-col gap-1.5">
                <Label htmlFor={`weight-${cat}`}>{meta.label} (kg)</Label>
                <Input
                  id={`weight-${cat}`}
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="0.1"
                  value={weights[cat]}
                  onChange={(e) => setWeights((w) => ({ ...w, [cat]: e.target.value }))}
                />
              </div>
            );
          })}

          {(() => {
            const total = (Number(weights.A) || 0) + (Number(weights.B) || 0) + (Number(weights.C) || 0);
            return (
              <div className="flex flex-col gap-2">
                {total <= 0 && (
                  <p className="text-xs text-muted-foreground">Enter at least one category weight to continue.</p>
                )}
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1" onClick={resetToScan}>
                    Cancel
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={handleConfirm}
                    disabled={submitting || total <= 0}
                    aria-busy={submitting}
                  >
                    {submitting ? "Verifying..." : "Confirm weights"}
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
            <span className="text-2xl font-semibold">+{stage.pointsAwarded} pts</span>
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
