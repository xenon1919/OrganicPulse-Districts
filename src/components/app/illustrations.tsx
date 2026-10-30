import Image from "next/image";
import type { Category } from "@/types/database";

/** The app's brand mark - a leaf fused with a circular-economy arrow loop. */
export function Logo({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <Image
      src="/illustrations/logo-mark-v2.png"
      alt="OrganicPulse"
      width={64}
      height={64}
      className={`${className} object-contain`}
    />
  );
}

/** A small sprout growing from cupped hands - used on the household greeting banner. */
export function SproutIllustration({ className = "h-16 w-16" }: { className?: string }) {
  return (
    <Image
      src="/illustrations/sprout-hands-v2.png"
      alt=""
      width={128}
      height={128}
      className={`${className} object-contain`}
    />
  );
}

const BOWL_IMAGE: Record<Category, string> = {
  A: "/illustrations/bowl-calcium-v2.png",
  B: "/illustrations/bowl-nitrogen-v2.png",
  C: "/illustrations/bowl-carbon-v2.png",
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

export type EmptyIllustrationName = "empty-bowl" | "empty-notifications";

const EMPTY_ILLUSTRATION_IMAGE: Record<EmptyIllustrationName, string> = {
  "empty-bowl": "/illustrations/empty-bowl-v2.png",
  "empty-notifications": "/illustrations/empty-notifications-v2.png",
};

/** Used by EmptyState for a friendlier "nothing here yet" visual than a bare icon. */
export function EmptyStateIllustration({
  name,
  className = "h-20 w-20",
}: {
  name: EmptyIllustrationName;
  className?: string;
}) {
  return (
    <Image
      src={EMPTY_ILLUSTRATION_IMAGE[name]}
      alt=""
      width={160}
      height={160}
      className={`${className} object-contain`}
    />
  );
}
