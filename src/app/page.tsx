import Link from "next/link";
import { ArrowRight, Leaf, ScanLine, Sparkles, Sprout } from "lucide-react";
import { Card } from "@/components/ui/card";
import { ThemeToggle } from "@/components/app/theme-toggle";

const portals = [
  {
    role: "household",
    title: "Household",
    description: "Log sorted dry waste, earn Green Points, track your impact.",
    icon: Leaf,
    chipClass: "bg-category-a text-category-a-foreground",
  },
  {
    role: "receiver",
    title: "Receiver",
    description: "Manure manufacturers & terrace gardeners claiming nearby inventory.",
    icon: Sprout,
    chipClass: "bg-category-c text-category-c-foreground",
  },
  {
    role: "partner",
    title: "Collection Partner",
    description: "Scan household QR passes and log verified batch weights.",
    icon: ScanLine,
    chipClass: "bg-category-b text-category-b-foreground",
  },
] as const;

const categoryChips = [
  { label: "Calcium", sub: "Eggshells", className: "bg-category-a text-category-a-foreground" },
  { label: "Nitrogen", sub: "Tea & coffee", className: "bg-category-b text-category-b-foreground" },
  { label: "Carbon", sub: "Cardboard", className: "bg-category-c text-category-c-foreground" },
] as const;

export default function Home() {
  return (
    <div className="relative flex flex-1 flex-col overflow-hidden">
      {/* Mesh-gradient hero background */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="animate-blob absolute -top-24 -left-20 h-72 w-72 rounded-full bg-primary/35 blur-3xl" />
        <div className="animate-blob-delay absolute top-10 -right-24 h-80 w-80 rounded-full bg-accent/30 blur-3xl" />
        <div className="animate-blob absolute bottom-0 left-1/4 h-64 w-64 rounded-full bg-category-b/25 blur-3xl" />
      </div>

      <div className="absolute top-5 right-5 z-10">
        <ThemeToggle />
      </div>

      <div className="relative z-[1] flex w-full flex-1 flex-col items-center px-5 pt-16 pb-10">
        <div className="flex w-full max-w-sm flex-col gap-10">
          <div className="animate-fade-up flex flex-col items-center gap-5 text-center">
            <div className="flex items-center gap-1.5 rounded-full border border-border bg-card/70 px-3 py-1 text-[11px] font-medium text-muted-foreground backdrop-blur">
              <Sparkles className="h-3 w-3 text-accent" />
              Built with Meta SAM 3.1 &amp; Muse Spark
            </div>

            <h1 className="hero-gradient-text font-display text-[2.75rem] leading-[1.05] font-black tracking-tight">
              Turn your trash
              <br />
              into someone&apos;s
              <br />
              treasure.
            </h1>

            <p className="text-sm leading-relaxed text-muted-foreground">
              A circular-economy marketplace connecting households, local
              organic manure manufacturers, and terrace gardeners—one sorted
              caddy at a time.
            </p>
          </div>

          <div
            className="animate-fade-up flex justify-center gap-2"
            style={{ animationDelay: "120ms" }}
          >
            {categoryChips.map((c) => (
              <div
                key={c.label}
                className="flex flex-1 flex-col items-center gap-0.5 rounded-2xl border border-border bg-card/70 px-2 py-2.5 text-center backdrop-blur"
              >
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${c.className}`}>
                  {c.label}
                </span>
                <span className="text-[10px] text-muted-foreground">{c.sub}</span>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-3">
            {portals.map(({ role, title, description, icon: Icon, chipClass }, i) => (
              <Link
                key={role}
                href={`/login?role=${role}`}
                className="animate-fade-up"
                style={{ animationDelay: `${200 + i * 90}ms` }}
              >
                <Card className="group flex flex-row items-center gap-4 border-border/80 p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-accent/50 hover:shadow-md active:translate-y-0">
                  <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${chipClass}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex flex-1 flex-col gap-0.5">
                    <span className="font-display text-sm font-bold">{title}</span>
                    <span className="text-xs leading-snug text-muted-foreground">
                      {description}
                    </span>
                  </div>
                  <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-accent" />
                </Card>
              </Link>
            ))}
          </div>

          <p
            className="animate-fade-up text-center text-xs text-muted-foreground"
            style={{ animationDelay: "480ms" }}
          >
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-accent">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
