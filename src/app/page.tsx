import Link from "next/link";
import { ChevronRight, Coffee, Egg, Leaf, Package, ScanLine, Sprout } from "lucide-react";
import { ThemeToggle } from "@/components/app/theme-toggle";

const materials = [
  { label: "Calcium", sub: "Eggshells", icon: Egg, swatch: "bg-category-a text-category-a-foreground" },
  { label: "Nitrogen", sub: "Coffee grounds", icon: Coffee, swatch: "bg-category-b text-category-b-foreground" },
  { label: "Carbon", sub: "Cardboard", icon: Package, swatch: "bg-category-c text-category-c-foreground" },
] as const;

const stages = [
  {
    index: "01",
    role: "household",
    name: "Household",
    detail: "Sort eggshells, coffee grounds, and cardboard. Log a photo-verified drop.",
    icon: Leaf,
    tint: "bg-category-a/25",
    swatch: "bg-category-a text-category-a-foreground",
  },
  {
    index: "02",
    role: "partner",
    name: "Collection partner",
    detail: "Weigh what comes in at the hub and confirm it against the photo.",
    icon: ScanLine,
    tint: "bg-category-b/15",
    swatch: "bg-category-b text-category-b-foreground",
  },
  {
    index: "03",
    role: "receiver",
    name: "Receiver",
    detail: "Claim nearby inventory for manure-making or terrace gardening.",
    icon: Sprout,
    tint: "bg-category-c/20",
    swatch: "bg-category-c text-category-c-foreground",
  },
] as const;

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <div className="relative overflow-hidden rounded-b-[2rem] bg-primary px-5 pt-6 pb-8 text-primary-foreground">
        <div
          aria-hidden
          className="pointer-events-none absolute top-[-35%] left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-primary-foreground/10 blur-3xl"
        />

        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-foreground/15">
              <Leaf className="h-4 w-4" />
            </div>
            <span className="font-display text-[15px] font-semibold tracking-tight">
              OrganicPulse
            </span>
          </div>
          <ThemeToggle />
        </div>

        <div className="relative mt-8 flex flex-col gap-3">
          <p className="font-mono text-xs text-primary-foreground/70">Malkajgiri district · pilot</p>
          <h1 className="font-display text-[2.3rem] leading-[1.12] font-semibold tracking-tight text-balance">
            What your kitchen throws away still has somewhere to go.
          </h1>
          <p className="text-[15px] leading-relaxed text-primary-foreground/80">
            Sorted at home, weighed at the hub, turned into manure by someone
            nearby — checked at every step by Meta&apos;s SAM 3.1.
          </p>
        </div>

        <div className="relative mt-7 flex gap-3">
          {materials.map(({ label, sub, icon: Icon, swatch }) => (
            <div
              key={label}
              className="flex flex-1 flex-col items-center gap-1.5 rounded-2xl bg-primary-foreground/10 px-2 py-3 text-center"
            >
              <div className={`flex h-11 w-11 items-center justify-center rounded-full shadow-sm ${swatch}`}>
                <Icon className="h-5 w-5" />
              </div>
              <span className="text-xs font-semibold">{label}</span>
              <span className="text-[10px] text-primary-foreground/70">{sub}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex w-full flex-1 flex-col items-center px-5 py-7">
        <div className="flex w-full max-w-sm flex-1 flex-col">
          <p className="px-1 text-sm font-medium text-muted-foreground">Continue as</p>

          <div className="mt-3 flex flex-col gap-3">
            {stages.map(({ index, role, name, detail, icon: Icon, tint, swatch }) => (
              <Link key={role} href={`/login?role=${role}`}>
                <div
                  className={`flex items-center gap-4 rounded-2xl ${tint} p-4 shadow-sm transition-transform active:scale-[0.98]`}
                >
                  <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${swatch}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex flex-1 flex-col gap-0.5">
                    <span className="font-mono text-[10px] text-muted-foreground">{index}</span>
                    <span className="font-display text-base font-semibold">{name}</span>
                    <span className="text-xs leading-snug text-muted-foreground">{detail}</span>
                  </div>
                  <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-auto flex flex-col gap-3 pt-10">
            <p className="text-sm text-muted-foreground">
              Already sorting with us?{" "}
              <Link href="/login" className="font-semibold text-primary">
                Log in
              </Link>
            </p>
            <p className="font-mono text-[11px] text-muted-foreground/70">
              verify: sam-3.1 · match: muse-spark-1.3
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
