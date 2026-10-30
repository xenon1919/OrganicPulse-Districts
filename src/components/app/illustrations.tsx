import Image from "next/image";
import type { Category } from "@/types/database";

/** A small sprout growing from cupped hands - used on the household greeting banner. */
export function SproutIllustration({ className = "h-16 w-16" }: { className?: string }) {
  return (
    <Image
      src="/illustrations/sprout-hands.png"
      alt=""
      width={128}
      height={128}
      className={`${className} object-contain`}
    />
  );
}

const BOWL_IMAGE: Record<Category, string> = {
  A: "/illustrations/bowl-calcium.png",
  B: "/illustrations/bowl-nitrogen.png",
  C: "/illustrations/bowl-carbon.png",
};

/** A bowl holding the category's material - used on the "what can you contribute" cards. */
export function BowlIllustration({ category, className = "h-16 w-16" }: { category: Category; className?: string }) {
  return (
    <Image
      src={BOWL_IMAGE[category]}
      alt=""
      width={128}
      height={128}
      className={`${className} object-contain`}
    />
  );
}
