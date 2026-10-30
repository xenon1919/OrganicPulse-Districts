"use client";

import type { ReactNode } from "react";
import { Home, QrCode, User } from "lucide-react";
import { AppShell } from "@/components/app/app-shell";

const navItems = [
  { href: "/household", label: "Home", icon: Home },
  { href: "/household/qr", label: "QR Pass", icon: QrCode },
  { href: "/household/profile", label: "Profile", icon: User },
];

export default function HouseholdLayout({ children }: { children: ReactNode }) {
  return <AppShell navItems={navItems}>{children}</AppShell>;
}
