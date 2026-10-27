"use client";

import type { ReactNode } from "react";
import { Store, Bell } from "lucide-react";
import { AppShell } from "@/components/app/app-shell";

const navItems = [
  { href: "/receiver", label: "Marketplace", icon: Store },
  { href: "/receiver/notifications", label: "Matches", icon: Bell },
];

export default function ReceiverLayout({ children }: { children: ReactNode }) {
  return <AppShell navItems={navItems}>{children}</AppShell>;
}
