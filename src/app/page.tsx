import Link from "next/link";
import { ChevronRight, Leaf } from "lucide-react";
import { ThemeToggle } from "@/components/app/theme-toggle";

const stages = [
  {
    index: "01",
    role: "household",
    name: "Household",
    detail: "Sort eggshells, coffee grounds, and cardboard. Log a photo-verified drop.",
    chip: "bg-category-a text-category-a-foreground",
  },
  {
    index: "02",
    role: "partner",
    name: "Collection partner",
    detail: "Weigh what comes in at the hub and confirm it against the photo.",
    chip: "bg-category-b text-category-b-foreground",
  },
  {
    index: "03",
    role: "receiver",
    name: "Receiver",
    detail: "Claim nearby inventory for manure-making or terrace gardening.",
    chip: "bg-category-c text-category-c-foreground",
  },
] as const;

export default function Home() {
  return (
    <div className="flex w-full flex-1 flex-col items-center px-5 pt-6 pb-8">
      <div className="flex w-full max-w-sm flex-1 flex-col">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Leaf className="h-4 w-4" />
            </div>
            <span className="font-display text-[15px] font-semibold tracking-tight">
              OrganicPulse
            </span>
          </div>
          <ThemeToggle />
        </div>

        <div className="mt-10 flex flex-col gap-4">
          <p className="font-mono text-xs text-muted-foreground">Malkajgiri district · pilot</p>

          <h1 className="font-display text-[2.1rem] leading-[1.15] font-semibold tracking-tight text-balance">
            What your kitchen throws away still has somewhere to go.
          </h1>

          <p className="text-[15px] leading-relaxed text-muted-foreground">
            Eggshells, coffee grounds, and cardboard get sorted at home,
            weighed at the hub, and turned into manure by someone nearby —
            checked at every step by Meta&apos;s SAM 3.1.
          </p>
        </div>

        <div className="mt-9 flex flex-col divide-y divide-border border-y border-border">
          {stages.map(({ index, role, name, detail, chip }) => (
            <Link
              key={role}
              href={`/login?role=${role}`}
              className="group flex items-center gap-4 py-4 transition-colors hover:bg-muted/60 active:bg-muted"
            >
              <span
                className={`font-display flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm font-semibold tabular-nums ${chip}`}
              >
                {index}
              </span>
              <div className="flex flex-1 flex-col gap-0.5">
                <span className="text-[15px] font-semibold">{name}</span>
                <span className="text-xs leading-snug text-muted-foreground">{detail}</span>
              </div>
              <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground/60 transition-transform group-hover:translate-x-0.5" />
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
  );
}
