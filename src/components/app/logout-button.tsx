"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { logOut } from "@/lib/data/auth";

export function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    await logOut();
    router.push("/login");
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      aria-label="Log out"
      className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition-colors hover:text-destructive"
    >
      <LogOut className="h-4 w-4" />
    </button>
  );
}
