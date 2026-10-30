import Link from "next/link";
import { ArrowRight, Coffee, Egg, Leaf, Package } from "lucide-react";
import { ThemeToggle } from "@/components/app/theme-toggle";

const materials = [
  { label: "Calcium", icon: Egg, swatch: "bg-category-a text-category-a-foreground" },
  { label: "Nitrogen", icon: Coffee, swatch: "bg-category-b text-category-b-foreground" },
  { label: "Carbon", icon: Package, swatch: "bg-category-c text-category-c-foreground" },
] as const;

export default function Home() {
  return (
    <div className="flex w-full flex-1 flex-col items-center bg-background px-5 pt-6 pb-8">
      <div className="flex w-full max-w-sm items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Leaf className="h-4 w-4" />
          </div>
          <span className="font-display text-[15px] font-bold tracking-tight">OrganicPulse</span>
        </div>
        <ThemeToggle />
      </div>

      <div className="flex w-full max-w-sm flex-1 flex-col justify-center">
        <div className="flex flex-col gap-3">
          <h1 className="font-display text-[2.3rem] leading-[1.08] font-black tracking-tight text-balance">
            Your waste.
            <br />
            Someone else&apos;s harvest.
          </h1>
          <p className="text-[15px] leading-relaxed text-muted-foreground">
            Sort eggshells, coffee grounds, and cardboard at home. We match it
            with a neighbour who turns it into manure, with every drop photo
            checked before it counts.
          </p>
        </div>

        <div className="mt-6 flex gap-2">
          {materials.map(({ label, icon: Icon, swatch }) => (
            <div
              key={label}
              className="flex min-w-0 flex-1 items-center gap-1.5 rounded-xl border border-border bg-card px-2 py-2"
            >
              <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${swatch}`}>
                <Icon className="h-3.5 w-3.5" />
              </div>
              <span className="truncate text-xs font-semibold">{label}</span>
            </div>
          ))}
        </div>

        <Link
          href="/login?role=household"
          className="mt-8 flex items-center justify-center gap-2 rounded-2xl bg-primary py-4 text-[15px] font-bold text-primary-foreground transition-opacity active:opacity-90"
        >
          Get started as a household
          <ArrowRight className="h-4 w-4" />
        </Link>

        <p className="mt-6 px-1 text-center text-xs text-muted-foreground">
          Run a collection hub or receive inventory?{" "}
          <Link href="/login?role=partner" className="font-semibold text-foreground">
            Partner login
          </Link>{" "}
          ·{" "}
          <Link href="/login?role=receiver" className="font-semibold text-foreground">
            Receiver login
          </Link>
        </p>

        <p className="mt-10 text-center text-sm text-muted-foreground">
          Already sorting with us?{" "}
          <Link href="/login" className="font-bold text-primary">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
