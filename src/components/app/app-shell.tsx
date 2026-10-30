import type { ReactNode } from "react";
import { Leaf } from "lucide-react";
import { BottomNav, type NavItem } from "@/components/app/bottom-nav";
import { ThemeToggle } from "@/components/app/theme-toggle";

export function AppShell({ navItems, children }: { navItems: NavItem[]; children: ReactNode }) {
  return (
    <div className="flex flex-1 flex-col">
      <main className="mx-auto flex w-full max-w-sm flex-1 flex-col px-5 py-5">
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Leaf className="h-4 w-4" />
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
