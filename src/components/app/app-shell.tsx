import type { ReactNode } from "react";
import { BottomNav, type NavItem } from "@/components/app/bottom-nav";
import { ThemeToggle } from "@/components/app/theme-toggle";

export function AppShell({ navItems, children }: { navItems: NavItem[]; children: ReactNode }) {
  return (
    <div className="flex flex-1 flex-col">
      <main className="relative mx-auto flex w-full max-w-sm flex-1 flex-col px-5 py-6">
        <div className="absolute top-5 right-5 z-10">
          <ThemeToggle />
        </div>
        {children}
      </main>
      <BottomNav items={navItems} />
    </div>
  );
}
