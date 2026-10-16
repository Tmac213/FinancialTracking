import * as React from "react";
import { ReactNode } from "react";

interface EmptyStateProps {
  /** Icon component (e.g., from lucide-react) */
  icon: React.ElementType | ReactNode;
  /** Primary headline */
  title: string;
  /** Supporting description */
  description: string;
  /** Optional action element (e.g., a button) */
  action?: ReactNode;
}

/**
 * A premium‑styled empty‑state component used across the dashboard.
 * It displays a centered icon, a title, and a description.
 * The component leverages Tailwind utilities to keep UI consistent.
 */
export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-6 py-12 text-center">
      <div className="flex size-20 items-center justify-center rounded-full bg-muted">
        {typeof icon === "function" ? (
          /* icon may be a component type */
          React.createElement(icon as React.ElementType, { className: "size-10 text-muted-foreground" })
        ) : (
          icon
        )}
      </div>
      <h2 className="text-2xl font-semibold text-foreground">{title}</h2>
      <p className="max-w-md text-muted-foreground">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
