import Link from "next/link";
import { ChevronRight, Coffee, Egg, Leaf, Package, ScanLine, Sprout } from "lucide-react";
import { ThemeToggle } from "@/components/app/theme-toggle";

const materials = [
  { label: "Calcium", icon: Egg, swatch: "bg-category-a text-category-a-foreground" },
  { label: "Nitrogen", icon: Coffee, swatch: "bg-category-b text-category-b-foreground" },
  { label: "Carbon", icon: Package, swatch: "bg-category-c text-category-c-foreground" },
] as const;

const stages = [
  {
    index: "01",
    role: "household",
    name: "Household",
    detail: "Sort eggshells, coffee grounds, and cardboard. Log a photo-verified drop.",
    icon: Leaf,
    swatch: "bg-category-a text-category-a-foreground",
  },
  {
    index: "02",
    role: "partner",
    name: "Collection partner",
    detail: "Weigh what comes in at the hub and confirm it against the photo.",
    icon: ScanLine,
    swatch: "bg-category-b text-category-b-foreground",
  },
  {
    index: "03",
    role: "receiver",
    name: "Receiver",
    detail: "Claim nearby inventory for manure-making or terrace gardening.",
    icon: Sprout,
    swatch: "bg-category-c text-category-c-foreground",
  },
] as const;

export default function Home() {
  return (
    <div className="flex w-full flex-1 flex-col items-center bg-background px-5 pt-6 pb-8">
      <div className="flex w-full max-w-sm flex-1 flex-col">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Leaf className="h-4 w-4" />
            </div>
            <span className="font-display text-[15px] font-bold tracking-tight">OrganicPulse</span>
          </div>
          <ThemeToggle />
        </div>

        <div className="mt-8 flex w-fit items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5">
          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
          <span className="font-mono text-[11px] tracking-wide text-muted-foreground">
            MALKAJGIRI · PILOT DISTRICT
          </span>
        </div>

        <div className="mt-5 flex flex-col gap-3">
          <h1 className="font-display text-[2.3rem] leading-[1.08] font-black tracking-tight text-balance">
            Your waste.
            <br />
            Someone else&apos;s harvest.
          </h1>
          <p className="text-[15px] leading-relaxed text-muted-foreground">
            Sort it at home, get it weighed at the hub, and a neighbour turns
            it into manure — checked at every step by Meta&apos;s SAM 3.1.
          </p>
        </div>

        <div className="mt-6 flex gap-2.5">
          {materials.map(({ label, icon: Icon, swatch }) => (
            <div
              key={label}
              className="flex flex-1 items-center gap-2 rounded-xl border border-border bg-card px-2.5 py-2"
            >
              <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${swatch}`}>
                <Icon className="h-3.5 w-3.5" />
              </div>
              <span className="text-xs font-semibold">{label}</span>
            </div>
          ))}
        </div>

        <div className="mt-8 flex flex-col gap-3">
          {stages.map(({ index, role, name, detail, icon: Icon, swatch }) => (
            <Link key={role} href={`/login?role=${role}`}>
              <div className="relative flex items-center gap-4 overflow-hidden rounded-2xl border border-border bg-card p-4 transition-colors active:bg-muted">
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0 bg-gradient-to-br from-foreground/[0.04] via-transparent to-transparent"
                />
                <div className={`relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${swatch}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="relative flex flex-1 flex-col gap-0.5">
                  <span className="font-mono text-[10px] text-muted-foreground">{index}</span>
                  <span className="font-display text-base font-bold">{name}</span>
                  <span className="text-xs leading-snug text-muted-foreground">{detail}</span>
                </div>
                <ChevronRight className="relative h-4 w-4 shrink-0 text-muted-foreground" />
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-auto flex flex-col gap-3 pt-10">
          <p className="text-sm text-muted-foreground">
            Already sorting with us?{" "}
            <Link href="/login" className="font-bold text-primary">
              Log in
            </Link>
          </p>
          <p className="font-mono text-[11px] text-muted-foreground/70">
            verify: sam-3.1 · match: muse-spark-1.3
          </p>
        </div>
      </div>
    </div>
  );
}
