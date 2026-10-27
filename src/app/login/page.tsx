"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Leaf, ScanLine, Sprout } from "lucide-react";
import { Card } from "@/components/ui/card";
import { ThemeToggle } from "@/components/app/theme-toggle";
import { listDemoProfiles, logIn } from "@/lib/data/auth";
import type { MockProfile } from "@/lib/mock/store";

const ROLE_ICON = { household: Leaf, receiver: Sprout, partner: ScanLine } as const;

export default function LoginPage() {
  const router = useRouter();
  const [profiles, setProfiles] = useState<MockProfile[]>([]);

  useEffect(() => {
    listDemoProfiles().then(setProfiles);
  }, []);

  async function handleLogin(profile: MockProfile) {
    await logIn(profile.id);
    const dest = { household: "/household", receiver: "/receiver", partner: "/partner" }[profile.role];
    router.push(dest);
  }

  return (
    <div className="relative flex flex-1 flex-col items-center justify-center px-5 py-12">
      <div className="absolute top-5 right-5 z-10">
        <ThemeToggle />
      </div>
      <div className="flex w-full max-w-sm flex-col gap-6">
        <div className="flex flex-col gap-1 text-center">
          <h1 className="font-display text-xl font-extrabold">Log in</h1>
          <p className="text-sm text-muted-foreground">Demo accounts seeded for this build.</p>
        </div>

        <div className="flex flex-col gap-2">
          {profiles.map((p) => {
            const Icon = ROLE_ICON[p.role];
            return (
              <button key={p.id} onClick={() => handleLogin(p)} className="text-left">
                <Card className="flex flex-row items-center gap-3 p-3.5 transition-colors hover:border-accent/50">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                    <Icon className="h-4 w-4 text-accent" />
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-medium">{p.name}</span>
                    <span className="text-xs capitalize text-muted-foreground">{p.role}</span>
                  </div>
                </Card>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
