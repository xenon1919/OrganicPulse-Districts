import type { ReactNode } from "react";

/** Wraps skeleton placeholders with an accessible busy status for screen readers. */
export function LoadingState({ children }: { children: ReactNode }) {
  return (
    <div role="status" aria-busy="true" aria-label="Loading">
      {children}
    </div>
  );
}
