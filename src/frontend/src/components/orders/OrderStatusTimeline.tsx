import { ORDER_STATUS_FLOW, ORDER_STATUS_LABELS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { OrderStatus } from "@/types";
import { Check } from "lucide-react";

interface OrderStatusTimelineProps {
  status: OrderStatus;
  className?: string;
}

/**
 * Horizontal delivery stepper. Completed steps are filled, the current step is
 * highlighted with a ring, and upcoming steps stay muted.
 */
export function OrderStatusTimeline({
  status,
  className,
}: OrderStatusTimelineProps) {
  const currentIndex = Math.max(0, ORDER_STATUS_FLOW.indexOf(status));

  return (
    <ol
      data-ocid="order_timeline"
      className={cn("flex w-full items-start", className)}
    >
      {ORDER_STATUS_FLOW.map((step, index) => {
        const isComplete = index < currentIndex;
        const isCurrent = index === currentIndex;
        const isLast = index === ORDER_STATUS_FLOW.length - 1;

        return (
          <li
            key={step}
            data-ocid={`order_timeline.step.${index + 1}`}
            data-state={
              isComplete ? "complete" : isCurrent ? "current" : "upcoming"
            }
            className="flex min-w-0 flex-1 flex-col items-center gap-2"
          >
            <div className="flex w-full items-center">
              <span
                aria-hidden="true"
                className={cn(
                  "h-1 flex-1 rounded-full transition-smooth",
                  index === 0
                    ? "bg-transparent"
                    : isComplete || isCurrent
                      ? "bg-primary"
                      : "bg-border",
                )}
              />
              <span
                className={cn(
                  "flex size-8 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold transition-smooth",
                  isComplete
                    ? "border-primary bg-primary text-primary-foreground"
                    : isCurrent
                      ? "border-primary bg-card text-primary ring-4 ring-primary/15"
                      : "border-border bg-card text-muted-foreground",
                )}
              >
                {isComplete ? (
                  <Check className="size-4" aria-hidden="true" />
                ) : (
                  index + 1
                )}
              </span>
              <span
                aria-hidden="true"
                className={cn(
                  "h-1 flex-1 rounded-full transition-smooth",
                  isLast
                    ? "bg-transparent"
                    : isComplete
                      ? "bg-primary"
                      : "bg-border",
                )}
              />
            </div>
            <span
              className={cn(
                "px-0.5 text-center text-[11px] font-semibold leading-tight sm:text-xs",
                isCurrent
                  ? "text-primary"
                  : isComplete
                    ? "text-foreground"
                    : "text-muted-foreground",
              )}
            >
              {ORDER_STATUS_LABELS[step]}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
