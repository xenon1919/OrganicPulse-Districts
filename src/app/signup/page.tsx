"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Leaf, ScanLine, Sprout } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signUp } from "@/lib/data/auth";
import { getHubs } from "@/lib/data/household";
import type { MockHub } from "@/lib/mock/store";
import type { ProfileRole, ReceiverType } from "@/types/database";

const ROLES: { value: ProfileRole; label: string; icon: typeof Leaf }[] = [
  { value: "household", label: "Household", icon: Leaf },
  { value: "receiver", label: "Receiver", icon: Sprout },
  { value: "partner", label: "Collection Partner", icon: ScanLine },
];

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialRole = (searchParams.get("role") as ProfileRole) ?? "household";

  const [role, setRole] = useState<ProfileRole>(initialRole);
  const [name, setName] = useState("");
  const [hubId, setHubId] = useState("");
  const [receiverType, setReceiverType] = useState<ReceiverType>("manufacturer");
  const [hubs, setHubs] = useState<MockHub[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getHubs().then((list) => {
      setHubs(list);
      setHubId((current) => current || list[0]?.id || "");
    });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !hubId) return;
    setSubmitting(true);
    const profile = await signUp({
      role,
      name: name.trim(),
      hubId,
      receiverType: role === "receiver" ? receiverType : undefined,
    });
    const dest = { household: "/household", receiver: "/receiver", partner: "/partner" }[profile.role];
    router.push(dest);
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-5 py-12">
      <Card className="flex w-full max-w-sm flex-col gap-6 p-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-semibold">Create account</h1>
          <p className="text-sm text-muted-foreground">Pick a role to get started.</p>
        </div>

        <div className="flex gap-2">
          {ROLES.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              type="button"
              onClick={() => setRole(value)}
              className={`flex flex-1 flex-col items-center gap-1.5 rounded-xl border px-2 py-3 text-xs transition-colors ${
                role === value ? "border-accent bg-accent/10 text-accent" : "border-border text-muted-foreground"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span className="font-medium">{label}</span>
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="name">Name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Priya Rao" required />
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
                  {h.name} - {h.neighborhood}
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

          <Button type="submit" disabled={submitting || !name.trim()}>
            {submitting ? "Creating..." : "Create account"}
          </Button>
        </form>
      </Card>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense>
      <SignupForm />
    </Suspense>
  );
}
