"use client";

import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { LogOut, MapPin, Phone } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { logOut } from "@/lib/data/auth";
import type { UserProfile } from "@/types/database";

const ROLE_LABEL: Record<UserProfile["role"], string> = {
  household: "Household",
  receiver: "Receiver",
  partner: "Collection Partner",
};

function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function ProfileView({ profile, children }: { profile: UserProfile; children?: ReactNode }) {
  const router = useRouter();

  async function handleLogout() {
    await logOut();
    router.replace("/login");
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col items-center gap-3 pt-2 text-center">
        <Avatar size="lg" className="h-16 w-16">
          <AvatarFallback className="font-display text-lg font-extrabold text-primary">
            {initials(profile.name)}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col items-center gap-1">
          <h1 className="font-display text-xl font-extrabold">{profile.name}</h1>
          <Badge variant="secondary">{ROLE_LABEL[profile.role]}</Badge>
        </div>
      </div>

      <Card className="flex flex-col gap-3 p-4">
        <div className="flex items-center gap-2.5 text-sm">
          <Phone className="h-4 w-4 shrink-0 text-muted-foreground" />
          <span>{profile.phone}</span>
        </div>
        <Separator />
        <div className="flex items-start gap-2.5 text-sm">
          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
          <div className="flex flex-col">
            <span>{profile.address}</span>
            <span className="text-xs text-muted-foreground">
              {profile.pincode}
              {profile.hubName ? ` · ${profile.hubName}` : ""}
            </span>
          </div>
        </div>
      </Card>

      {children}

      <button
        type="button"
        onClick={handleLogout}
        className="flex items-center justify-center gap-2 rounded-xl border border-border bg-card p-3 text-sm font-medium text-muted-foreground transition-colors hover:border-destructive/40 hover:text-destructive"
      >
        <LogOut className="h-4 w-4" />
        Log out
      </button>
    </div>
  );
}
