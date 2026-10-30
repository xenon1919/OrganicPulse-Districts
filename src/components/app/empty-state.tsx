import type { LucideIcon } from "lucide-react";
import { EmptyStateIllustration, type EmptyIllustrationName } from "@/components/app/illustrations";

export function EmptyState({
  icon: Icon,
  illustration,
  title,
  description,
}: {
  icon: LucideIcon;
  illustration?: EmptyIllustrationName;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border px-6 py-10 text-center">
      {illustration ? (
        <EmptyStateIllustration name={illustration} />
      ) : (
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
          <Icon className="h-5 w-5 text-muted-foreground" />
        </div>
      )}
      <p className="text-sm font-medium">{title}</p>
      <p className="text-xs leading-relaxed text-muted-foreground">{description}</p>
    </div>
  );
}
