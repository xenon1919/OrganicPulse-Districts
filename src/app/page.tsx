import Link from "next/link";
import { ArrowRight, Coffee, Egg, Leaf, Package, ScanLine, Sprout } from "lucide-react";
import { ThemeToggle } from "@/components/app/theme-toggle";

const categories = [
  { label: "Calcium", icon: Egg, bubble: "bg-category-a text-category-a-foreground" },
  { label: "Nitrogen", icon: Coffee, bubble: "bg-category-b text-category-b-foreground" },
  { label: "Carbon", icon: Package, bubble: "bg-category-c text-category-c-foreground" },
] as const;

const portals = [
  {
    role: "household",
    title: "Household",
    description: "Log sorted dry waste, earn Green Points, track your impact.",
    icon: Leaf,
    bg: "bg-category-a/20",
    border: "border-category-a",
    iconBg: "bg-category-a text-category-a-foreground",
  },
  {
    role: "receiver",
    title: "Receiver",
    description: "Manure manufacturers & terrace gardeners claiming nearby inventory.",
    icon: Sprout,
    bg: "bg-category-c/20",
    border: "border-category-c",
    iconBg: "bg-category-c text-category-c-foreground",
  },
  {
    role: "partner",
    title: "Collection Partner",
    description: "Scan household QR passes and log verified batch weights.",
    icon: ScanLine,
    bg: "bg-category-b/20",
    border: "border-category-b",
    iconBg: "bg-category-b text-category-b-foreground",
  },
] as const;

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <div className="relative overflow-hidden rounded-b-[2.5rem] bg-primary px-5 pt-6 pb-9 text-primary-foreground">
        <div aria-hidden className="pointer-events-none absolute -top-12 -right-16 h-48 w-48 rounded-full bg-white/10" />
        <div aria-hidden className="pointer-events-none absolute -bottom-20 -left-12 h-44 w-44 rounded-full bg-black/10" />

        <div className="relative z-[1] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-foreground/15">
              <Leaf className="h-5 w-5" />
            </div>
            <span className="font-display text-base font-extrabold tracking-tight">OrganicPulse</span>
          </div>
          <ThemeToggle />
        </div>

        <div className="relative z-[1] mt-8 flex flex-col gap-3">
          <span className="w-fit rounded-full bg-primary-foreground/15 px-3 py-1 text-[11px] font-bold">
            Powered by Meta SAM 3.1 &amp; Muse Spark
          </span>
          <h1 className="font-display text-[2.4rem] leading-[1.05] font-black tracking-tight">
            Turn your trash into someone&apos;s treasure.
          </h1>
          <p className="text-sm leading-relaxed font-medium text-primary-foreground/85">
            Sort it, scan it, and a neighbour turns it into manure or compost
            — you earn Green Points for every kg.
          </p>
        </div>

        <div className="relative z-[1] mt-7 flex gap-3">
          {categories.map(({ label, icon: Icon, bubble }) => (
            <div key={label} className="flex flex-1 flex-col items-center gap-1.5">
              <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${bubble} shadow-[3px_3px_0_0_rgba(0,0,0,0.18)]`}>
                <Icon className="h-6 w-6" />
              </div>
              <span className="text-[11px] font-bold">{label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex w-full flex-1 flex-col items-center px-5 py-7">
        <div className="flex w-full max-w-sm flex-col gap-4">
          <p className="px-1 font-display text-xs font-extrabold tracking-wide text-muted-foreground uppercase">
            I am a...
          </p>

          <div className="flex flex-col gap-4">
            {portals.map(({ role, title, description, icon: Icon, bg, border, iconBg }) => (
              <Link key={role} href={`/login?role=${role}`}>
                <div
                  className={`flex items-center gap-4 rounded-3xl border-2 ${border} ${bg} p-4 shadow-[4px_4px_0_0_var(--foreground)] transition-transform active:translate-x-1 active:translate-y-1 active:shadow-none`}
                >
                  <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${iconBg}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="flex flex-1 flex-col gap-0.5">
                    <span className="font-display text-base font-extrabold">{title}</span>
                    <span className="text-xs leading-snug font-medium text-foreground/70">
                      {description}
                    </span>
                  </div>
                  <ArrowRight className="h-5 w-5 shrink-0 text-foreground/50" />
                </div>
              </Link>
            ))}
          </div>

          <p className="pt-2 text-center text-xs font-medium text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="font-bold text-accent">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
