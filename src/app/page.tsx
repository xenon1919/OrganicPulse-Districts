import Link from "next/link";
import { Leaf, ScanLine, Sprout } from "lucide-react";
import { Card } from "@/components/ui/card";
import { ThemeToggle } from "@/components/app/theme-toggle";

const portals = [
  {
    role: "household",
    title: "Household",
    description: "Log sorted dry waste, earn Green Points, track your impact.",
    icon: Leaf,
    accent: "text-primary",
  },
  {
    role: "receiver",
    title: "Receiver",
    description: "Manure manufacturers & terrace gardeners claiming nearby inventory.",
    icon: Sprout,
    accent: "text-accent",
  },
  {
    role: "partner",
    title: "Collection Partner",
    description: "Scan household QR passes and log verified batch weights.",
    icon: ScanLine,
    accent: "text-category-b",
  },
] as const;

export default function Home() {
  return (
    <div className="relative flex flex-1 flex-col items-center justify-center overflow-hidden px-5 py-12">
      <div className="glow-blob top-[-100px] left-[-80px] h-72 w-72 bg-primary/25" />
      <div className="glow-blob top-40 right-[-100px] h-64 w-64 bg-accent/20" />

      <div className="absolute top-5 right-5 z-10">
        <ThemeToggle />
      </div>

      <div className="relative flex w-full max-w-sm flex-col gap-10">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/25 to-accent/10 shadow-[0_18px_40px_-18px] shadow-primary/40">
            <Leaf className="h-8 w-8 text-primary" />
          </div>
          <h1 className="font-display text-3xl font-bold tracking-tight">
            OrganicPulse Districts
          </h1>
          <p className="text-sm leading-relaxed text-muted-foreground">
            A zero-waste marketplace connecting households, local organic
            manure manufacturers, and terrace gardeners.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          {portals.map(({ role, title, description, icon: Icon, accent }) => (
            <Link key={role} href={`/signup?role=${role}`}>
              <Card className="flex flex-row items-center gap-4 p-4 transition-all hover:border-accent/50 hover:shadow-[0_12px_30px_-16px] hover:shadow-accent/40">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-muted">
                  <Icon className={`h-5 w-5 ${accent}`} />
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="font-display text-sm font-semibold">{title}</span>
                  <span className="text-xs leading-snug text-muted-foreground">
                    {description}
                  </span>
                </div>
              </Card>
            </Link>
          ))}
        </div>

        <p className="text-center text-xs text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-accent">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
