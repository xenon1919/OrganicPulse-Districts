import type { Category } from "@/types/database";

/** A small sprout growing from a mound of soil - used on the household greeting banner. */
export function SproutIllustration({ className = "h-16 w-16" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="32" cy="50" rx="22" ry="8" className="fill-category-b/30" />
      <path
        d="M10 48c0-9 6-16 22-16s22 7 22 16H10z"
        className="fill-category-b"
      />
      <path d="M14 48c1-7 7-12 18-12s17 5 18 12H14z" className="fill-category-b-foreground/15" />
      <path
        d="M32 34V18"
        stroke="currentColor"
        className="text-primary"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path
        d="M32 24c-2-7-9-10-15-8 1 7 7 12 15 8z"
        className="fill-primary"
      />
      <path
        d="M32 20c2-7 9-9 15-7-1 7-8 11-15 7z"
        className="fill-accent-foreground/70"
      />
      <circle cx="46" cy="16" r="2" className="fill-category-c" />
      <circle cx="18" cy="14" r="1.5" className="fill-primary/60" />
      <circle cx="50" cy="30" r="1.5" className="fill-category-c/70" />
    </svg>
  );
}

const BOWL_CONTENTS: Record<Category, { fill: string; shapes: Array<[number, number, number]> }> = {
  A: {
    fill: "fill-category-a",
    shapes: [
      [26, 30, 5],
      [34, 28, 4],
      [30, 34, 3.5],
      [40, 32, 3],
      [22, 34, 3],
    ],
  },
  B: {
    fill: "fill-category-b",
    shapes: [
      [25, 29, 2],
      [30, 32, 1.6],
      [35, 28, 2],
      [38, 33, 1.6],
      [28, 35, 1.8],
      [33, 36, 1.4],
      [22, 31, 1.6],
    ],
  },
  C: {
    fill: "fill-category-c",
    shapes: [
      [24, 30, 6],
      [34, 32, 5],
      [29, 27, 4],
    ],
  },
};

/** A simple bowl holding the category's material - used on the "what can you contribute" cards. */
export function BowlIllustration({ category, className = "h-16 w-16" }: { category: Category; className?: string }) {
  const { fill, shapes } = BOWL_CONTENTS[category];
  return (
    <svg viewBox="0 0 64 64" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="32" cy="52" rx="18" ry="4" className="fill-foreground/10" />
      <path d="M12 34h40l-4 16a6 6 0 0 1-6 5H22a6 6 0 0 1-6-5l-4-16z" className="fill-card stroke-border" strokeWidth="1.5" />
      {shapes.map(([cx, cy, r], i) => (
        <circle key={i} cx={cx} cy={cy} r={r} className={fill} opacity={0.9 - i * 0.05} />
      ))}
      <path d="M12 34h40" className="stroke-border" strokeWidth="1.5" />
    </svg>
  );
}
