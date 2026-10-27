import type { ReactNode } from "react";
import { BottomNav, type NavItem } from "@/components/app/bottom-nav";

export function AppShell({ navItems, children }: { navItems: NavItem[]; children: ReactNode }) {
  return (
    <div className="flex flex-1 flex-col">
      <main className="mx-auto flex w-full max-w-sm flex-1 flex-col px-5 py-6">{children}</main>
      <BottomNav items={navItems} />
    </div>
  );
}
