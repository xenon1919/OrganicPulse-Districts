"use client";

import type { ReactNode } from "react";
import { ScanLine, History, User } from "lucide-react";
import { AppShell } from "@/components/app/app-shell";

const navItems = [
  { href: "/partner", label: "Scan", icon: ScanLine },
  { href: "/partner/history", label: "History", icon: History },
  { href: "/partner/profile", label: "Profile", icon: User },
];

export default function PartnerLayout({ children }: { children: ReactNode }) {
  return <AppShell navItems={navItems}>{children}</AppShell>;
}
