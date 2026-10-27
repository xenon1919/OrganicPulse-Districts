import Link from "next/link";
import { Leaf, ScanLine, Sprout } from "lucide-react";
import { Card } from "@/components/ui/card";

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
    <div className="flex flex-1 flex-col items-center justify-center px-5 py-12">
      <div className="flex w-full max-w-sm flex-col gap-10">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/15">
            <Leaf className="h-7 w-7 text-primary" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">
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
              <Card className="flex flex-row items-center gap-4 p-4 transition-colors hover:border-accent/50">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-muted">
                  <Icon className={`h-5 w-5 ${accent}`} />
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-medium">{title}</span>
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
