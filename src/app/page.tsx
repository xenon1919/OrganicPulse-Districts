import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ThemeToggle } from "@/components/app/theme-toggle";
import { Logo, SproutIllustration, BowlIllustration } from "@/components/app/illustrations";
import type { Category } from "@/types/database";

const materials: { category: Category; label: string }[] = [
  { category: "A", label: "Calcium" },
  { category: "B", label: "Nitrogen" },
  { category: "C", label: "Carbon" },
];

export default function Home() {
  return (
    <div className="flex w-full flex-1 flex-col items-center bg-background px-5 pt-6 pb-8">
      <div className="flex w-full max-w-sm items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Logo className="h-4.5 w-4.5" />
          </div>
          <span className="font-display text-[15px] font-bold tracking-tight">OrganicPulse</span>
        </div>
        <ThemeToggle />
      </div>

      <div className="flex w-full max-w-sm flex-1 flex-col justify-center">
        <SproutIllustration className="mx-auto h-20 w-20" />

        <div className="mt-2 flex flex-col gap-3 text-center">
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
          {materials.map(({ category, label }) => (
            <div
              key={category}
              className="flex min-w-0 flex-1 flex-col items-center gap-1 rounded-xl border border-border bg-card px-2 py-2.5"
            >
              <BowlIllustration category={category} className="h-9 w-9" />
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
