"use client";

import type { ReactNode } from "react";
import { ScanLine, History } from "lucide-react";
import { AppShell } from "@/components/app/app-shell";

const navItems = [
  { href: "/partner", label: "Scan", icon: ScanLine },
  { href: "/partner/history", label: "History", icon: History },
];

export default function PartnerLayout({ children }: { children: ReactNode }) {
  return <AppShell navItems={navItems}>{children}</AppShell>;
}
