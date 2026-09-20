import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

type StatTone = "primary" | "accent" | "info" | "success" | "warning" | "muted";

const TONE_CLASSES: Record<StatTone, string> = {
  primary: "bg-primary/10 text-primary",
  accent: "bg-accent/20 text-accent-foreground",
  info: "bg-info/15 text-info",
  success: "bg-success/15 text-success",
  warning: "bg-warning/20 text-warning-foreground",
  muted: "bg-muted text-muted-foreground",
};

interface StatCardProps {
  label: string;
  value: ReactNode;
  icon: LucideIcon;
  tone?: StatTone;
  hint?: string;
  className?: string;
  "data-ocid"?: string;
}

/** Compact metric tile used across the merchant dashboard. */
export function StatCard({
  label,
  value,
  icon: Icon,
  tone = "primary",
  hint,
  className,
  "data-ocid": dataOcid = "admin.stat_card",
}: StatCardProps) {
  return (
    <div
      data-ocid={dataOcid}
      className={cn(
        "flex items-start gap-3 rounded-2xl border border-border bg-card p-4 shadow-subtle transition-smooth hover:shadow-card",
        className,
      )}
    >
      <span
        className={cn(
          "flex size-10 shrink-0 items-center justify-center rounded-xl",
          TONE_CLASSES[tone],
        )}
      >
        <Icon className="size-5" aria-hidden="true" />
      </span>
      <div className="min-w-0 space-y-0.5">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          {label}
        </p>
        <p className="price text-2xl font-bold leading-tight text-foreground">
          {value}
        </p>
        {hint ? (
          <p className="truncate text-xs text-muted-foreground">{hint}</p>
        ) : null}
      </div>
    </div>
  );
}
