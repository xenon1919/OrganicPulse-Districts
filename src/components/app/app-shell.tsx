import type { ReactNode } from "react";
import { BottomNav, type NavItem } from "@/components/app/bottom-nav";
import { ThemeToggle } from "@/components/app/theme-toggle";
import { Logo } from "@/components/app/illustrations";

export function AppShell({ navItems, children }: { navItems: NavItem[]; children: ReactNode }) {
  return (
    <div className="flex flex-1 flex-col">
      <main className="mx-auto flex w-full max-w-sm flex-1 flex-col px-5 py-5">
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Logo className="h-4.5 w-4.5" />
            </div>
            <div className="flex flex-col leading-none">
              <span className="font-display text-sm font-bold">OrganicPulse</span>
              <span className="text-[10px] text-muted-foreground">Districts</span>
            </div>
          </div>
          <ThemeToggle />
        </div>
        {children}
      </main>
      <BottomNav items={navItems} />
    </div>
  );
}
