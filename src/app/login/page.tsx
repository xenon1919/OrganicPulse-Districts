"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Leaf, ScanLine, Sprout } from "lucide-react";
import { toast } from "sonner";
import { onAuthStateChanged, type ConfirmationResult } from "firebase/auth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { ThemeToggle } from "@/components/app/theme-toggle";
import { OtpInput } from "@/components/app/otp-input";
import { getAuthClient } from "@/lib/firebase/client";
import { sendOtp, confirmOtp, getUserProfile, completeProfile } from "@/lib/data/auth";
import { getHubs } from "@/lib/data/household";
import type { Hub } from "@/types/database";
import type { ProfileRole, ReceiverType } from "@/types/database";

const ROLES: { value: ProfileRole; label: string; icon: typeof Leaf }[] = [
  { value: "household", label: "Household", icon: Leaf },
  { value: "receiver", label: "Receiver", icon: Sprout },
  { value: "partner", label: "Collection Partner", icon: ScanLine },
];

const RECAPTCHA_CONTAINER_ID = "recaptcha-container";
const ROLE_HOME = { household: "/household", receiver: "/receiver", partner: "/partner" } as const;

function LoginFlow() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialRole = (searchParams.get("role") as ProfileRole) ?? "household";

  const [step, setStep] = useState<"checking" | "phone" | "otp" | "profile">("checking");
  const [phoneDigits, setPhoneDigits] = useState("");
  const [otp, setOtp] = useState("");
  const [confirmation, setConfirmation] = useState<ConfirmationResult | null>(null);
  const [uid, setUid] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Profile-completion fields
  const [role, setRole] = useState<ProfileRole>(initialRole);
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [pincode, setPincode] = useState("");
  const [hubId, setHubId] = useState("");
  const [receiverType, setReceiverType] = useState<ReceiverType>("manufacturer");
  const [hubs, setHubs] = useState<Hub[]>([]);

  useEffect(() => {
    // Hubs require an authenticated read (see firestore.rules) and are only
    // needed once we reach the post-OTP profile step.
    if (step !== "profile") return;
    getHubs().then((list) => {
      setHubs(list);
      setHubId((current) => current || list[0]?.id || "");
    });
  }, [step]);

  useEffect(() => {
    // Already signed in (e.g. Firebase session persisted, or the back
    // button/a bookmark brought us here) - skip straight to their home
    // instead of showing the phone form again.
    const unsubscribe = onAuthStateChanged(getAuthClient(), async (user) => {
      if (!user) {
        setStep((current) => (current === "checking" ? "phone" : current));
        return;
      }
      const existing = await getUserProfile(user.uid);
      if (existing) {
        router.replace(ROLE_HOME[existing.role]);
        return;
      }
      // Signed in but never finished the profile step - let them continue it.
      setUid(user.uid);
      setStep("profile");
    });
    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const phoneE164 = `+91${phoneDigits}`;

  async function handleSendOtp(e: React.FormEvent) {
    e.preventDefault();
    if (phoneDigits.length !== 10) {
      toast.error("Enter a 10-digit phone number.");
      return;
    }
    setSubmitting(true);
    try {
      const result = await sendOtp(phoneE164, RECAPTCHA_CONTAINER_ID);
      setConfirmation(result);
      setStep("otp");
      toast.success("OTP sent.");
    } catch {
      toast.error("Could not send OTP - check the number and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleConfirmOtp(e: React.FormEvent) {
    e.preventDefault();
    await verifyCode(otp);
  }

  async function verifyCode(code: string) {
    if (!confirmation || code.length !== 6 || submitting) return;
    setSubmitting(true);
    try {
      const signedInUid = await confirmOtp(confirmation, code);
      const existing = await getUserProfile(signedInUid);
      if (existing) {
        router.replace(ROLE_HOME[existing.role]);
        return;
      }
      setUid(signedInUid);
      setStep("profile");
    } catch {
      toast.error("Incorrect code - try again.");
      setOtp("");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleCompleteProfile(e: React.FormEvent) {
    e.preventDefault();
    if (!uid || !name.trim() || !hubId || !address.trim() || !pincode.trim()) return;
    setSubmitting(true);
    try {
      const profile = await completeProfile({
        uid,
        role,
        name: name.trim(),
        phone: phoneE164,
        address: address.trim(),
        pincode: pincode.trim(),
        hubId,
        receiverType: role === "receiver" ? receiverType : undefined,
      });
      router.replace(ROLE_HOME[profile.role]);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="relative flex flex-1 flex-col items-center justify-center px-5 py-12">
      <div className="absolute top-5 right-5 z-10">
        <ThemeToggle />
      </div>
      <div id={RECAPTCHA_CONTAINER_ID} />

      {step === "checking" && <Skeleton className="h-64 w-full max-w-sm rounded-2xl" />}

      {step === "phone" && (
        <Card className="flex w-full max-w-sm flex-col gap-6 p-6">
          <div className="flex flex-col gap-1">
            <h1 className="font-display text-xl font-extrabold">Log in</h1>
            <p className="text-sm text-muted-foreground">We&rsquo;ll text you a one-time code.</p>
          </div>
          <form onSubmit={handleSendOtp} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="phone">Phone number</Label>
              <div className="flex items-center gap-2">
                <span className="flex h-9 items-center rounded-md border border-input px-3 text-sm text-muted-foreground">
                  +91
                </span>
                <Input
                  id="phone"
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel"
                  placeholder="98765 43210"
                  value={phoneDigits}
                  onChange={(e) => setPhoneDigits(e.target.value.replace(/\D/g, "").slice(0, 10))}
                  required
                />
              </div>
            </div>
            <Button type="submit" disabled={submitting || phoneDigits.length !== 10}>
              {submitting ? "Sending…" : "Send OTP"}
            </Button>
          </form>
        </Card>
      )}

      {step === "otp" && (
        <Card className="flex w-full max-w-sm flex-col gap-6 p-6">
          <div className="flex flex-col gap-1">
            <h1 className="font-display text-xl font-extrabold">Enter the code</h1>
            <p className="text-sm text-muted-foreground">Sent to +91 {phoneDigits}</p>
          </div>
          <form onSubmit={handleConfirmOtp} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label>6-digit OTP</Label>
              <OtpInput value={otp} onChange={setOtp} onComplete={verifyCode} disabled={submitting} />
            </div>
            <Button type="submit" disabled={submitting || otp.length !== 6}>
              {submitting ? "Verifying…" : "Verify"}
            </Button>
            <button
              type="button"
              className="text-xs font-medium text-primary"
              onClick={() => {
                setStep("phone");
                setOtp("");
              }}
            >
              Change number
            </button>
          </form>
        </Card>
      )}

      {step === "profile" && (
        <Card className="flex w-full max-w-sm flex-col gap-6 p-6">
          <div className="flex flex-col gap-1">
            <h1 className="font-display text-xl font-extrabold">Complete your profile</h1>
            <p className="text-sm text-muted-foreground">One last step before you&rsquo;re in.</p>
          </div>

          <div className="flex gap-2">
            {ROLES.map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                type="button"
                onClick={() => setRole(value)}
                className={`flex flex-1 flex-col items-center gap-1.5 rounded-xl border px-2 py-3 text-xs transition-colors ${
                  role === value ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="font-medium">{label}</span>
              </button>
            ))}
          </div>

          <form onSubmit={handleCompleteProfile} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Priya Rao"
                autoComplete="name"
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="House / street"
                autoComplete="street-address"
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="pincode">Pincode</Label>
              <Input
                id="pincode"
                inputMode="numeric"
                value={pincode}
                onChange={(e) => setPincode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="500010"
                autoComplete="postal-code"
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="hub">Neighborhood hub</Label>
              <select
                id="hub"
                value={hubId}
                onChange={(e) => setHubId(e.target.value)}
                className="h-9 rounded-md border border-input bg-transparent px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {hubs.map((h) => (
                  <option key={h.id} value={h.id} className="bg-card">
                    {h.name}
                  </option>
                ))}
              </select>
            </div>

            {role === "receiver" && (
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="receiverType">I am a</Label>
                <select
                  id="receiverType"
                  value={receiverType}
                  onChange={(e) => setReceiverType(e.target.value as ReceiverType)}
                  className="h-9 rounded-md border border-input bg-transparent px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="manufacturer" className="bg-card">Organic manure manufacturer</option>
                  <option value="gardener" className="bg-card">Urban terrace gardener</option>
                  <option value="both" className="bg-card">Gardener-manufacturer</option>
                </select>
              </div>
            )}

            <Button type="submit" disabled={submitting || !name.trim() || !address.trim() || !pincode.trim()}>
              {submitting ? "Creating…" : "Create account"}
            </Button>
          </form>
        </Card>
      )}
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginFlow />
    </Suspense>
  );
}
