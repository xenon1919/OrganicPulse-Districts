import { Egg, Coffee, Package } from "lucide-react";
import type { Category } from "@/types/database";

export const CATEGORY_META: Record<
  Category,
  { label: string; short: string; icon: typeof Egg; bg: string; fg: string }
> = {
  A: { label: "Calcium—Eggshells", short: "Calcium", icon: Egg, bg: "bg-category-a", fg: "text-category-a-foreground" },
  B: { label: "Nitrogen—Tea/Coffee", short: "Nitrogen", icon: Coffee, bg: "bg-category-b", fg: "text-category-b-foreground" },
  C: { label: "Carbon—Cardboard", short: "Carbon", icon: Package, bg: "bg-category-c", fg: "text-category-c-foreground" },
};

export const CATEGORY_GUIDE: Record<Category, { title: string; description: string; rules: string[] }> = {
  A: {
    title: "Calcium & Minerals",
    description: "Clean, sun-dried eggshells.",
    rules: ["No food residue", "Completely dry", "No plastic or mixed waste"],
  },
  B: {
    title: "Nitrogen & Activators",
    description: "Sun-dried coffee grounds and spent tea leaves.",
    rules: ["No mold or moisture", "No additives (milk, sugar, etc.)", "Completely dry"],
  },
  C: {
    title: "Dry Carbon",
    description: "Shredded cardboard and clean paper scraps.",
    rules: ["Clean and uncoated", "No plastic or glossy paper", "Completely dry"],
  },
};

export function CategoryBadge({ category, className = "" }: { category: Category; className?: string }) {
  const meta = CATEGORY_META[category];
  const Icon = meta.icon;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${meta.bg} ${meta.fg} ${className}`}
    >
      <Icon className="h-3.5 w-3.5" />
      {meta.short}
    </span>
  );
}

export function CategoryIcon({ category, className = "h-5 w-5" }: { category: Category; className?: string }) {
  const Icon = CATEGORY_META[category].icon;
  return <Icon className={className} />;
}
