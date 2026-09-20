import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface LoadingStateProps {
  /** Number of skeleton cards to render. */
  count?: number;
  className?: string;
  label?: string;
  "data-ocid"?: string;
}

const SKELETON_IDS = Array.from(
  { length: 8 },
  (_, i) => `loading-skeleton-${i}`,
);

/** Layout-matched skeleton grid used while backend data loads. */
export function LoadingState({
  count = 4,
  className,
  label = "Loading",
  "data-ocid": dataOcid = "loading_state",
}: LoadingStateProps) {
  return (
    <output
      data-ocid={dataOcid}
      aria-label={label}
      className={cn(
        "grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3",
        className,
      )}
    >
      {SKELETON_IDS.slice(0, count).map((id) => (
        <div
          key={id}
          className="overflow-hidden rounded-2xl border border-border bg-card shadow-subtle"
        >
          <Skeleton className="aspect-[4/3] w-full rounded-none" />
          <div className="space-y-2 p-3">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
            <Skeleton className="h-3 w-2/3" />
          </div>
        </div>
      ))}
    </output>
  );
}

/** Single-line skeleton for dense list rows. */
export function LoadingRows({
  count = 5,
  className,
  "data-ocid": dataOcid = "loading_state",
}: {
  count?: number;
  className?: string;
  "data-ocid"?: string;
}) {
  return (
    <output
      data-ocid={dataOcid}
      aria-label="Loading"
      className={cn("block space-y-3", className)}
    >
      {SKELETON_IDS.slice(0, count).map((id) => (
        <div
          key={id}
          className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3 shadow-subtle"
        >
          <Skeleton className="size-14 shrink-0 rounded-xl" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </output>
  );
}
