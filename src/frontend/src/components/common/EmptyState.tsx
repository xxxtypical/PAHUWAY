import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
  "data-ocid"?: string;
}

/** Friendly empty state with an icon, headline, and optional primary action. */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
  "data-ocid": dataOcid = "empty_state",
}: EmptyStateProps) {
  return (
    <div
      data-ocid={dataOcid}
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border bg-card px-6 py-12 text-center",
        className,
      )}
    >
      {Icon ? (
        <span className="flex size-14 items-center justify-center rounded-full bg-secondary text-primary">
          <Icon className="size-6" aria-hidden="true" />
        </span>
      ) : null}
      <h3 className="font-display text-lg font-bold text-foreground">
        {title}
      </h3>
      {description ? (
        <p className="max-w-sm text-sm text-muted-foreground">{description}</p>
      ) : null}
      {action ? <div className="mt-1">{action}</div> : null}
    </div>
  );
}
