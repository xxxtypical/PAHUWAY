import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ORDER_STATUS_LABELS } from "@/lib/constants";
import { formatDate, formatItemCount, formatPeso } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Order, OrderStatus } from "@/types";
import { Link } from "@tanstack/react-router";
import { ChevronRight, Receipt } from "lucide-react";

interface OrderCardProps {
  order: Order;
  /** 1-based position, used for deterministic test markers. */
  index: number;
}

const STATUS_STYLES: Record<OrderStatus, string> = {
  placed: "bg-secondary text-secondary-foreground",
  confirmed: "bg-secondary text-secondary-foreground",
  preparing: "bg-warning/20 text-warning-foreground",
  outForDelivery: "bg-info/20 text-info-foreground",
  delivered: "bg-success/15 text-success",
};

/** Compact order-history row: restaurant, items, total, status, and date. */
export function OrderCard({ order, index }: OrderCardProps) {
  const itemCount = order.items.reduce(
    (sum, line) => sum + Number(line.quantity),
    0,
  );
  const itemNames = order.items.map((line) => line.name).join(", ");

  return (
    <article
      data-ocid={`orders.item.${index}`}
      className="group rounded-2xl border border-border bg-card p-4 shadow-subtle transition-smooth hover:border-primary/40 hover:shadow-card"
    >
      <div className="flex items-start gap-3">
        <span
          aria-hidden="true"
          className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-secondary text-primary"
        >
          <Receipt className="size-5" />
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="min-w-0 truncate font-display text-base font-bold text-foreground">
              {order.restaurantName}
            </h3>
            <Badge
              variant="secondary"
              className={cn(
                "rounded-full border-0 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                STATUS_STYLES[order.status],
              )}
            >
              {ORDER_STATUS_LABELS[order.status]}
            </Badge>
          </div>

          <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">
            {itemNames || "No items"}
          </p>

          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            <span className="font-mono text-[11px] font-semibold text-foreground">
              #{order.orderNumber}
            </span>
            <span>{formatItemCount(itemCount)}</span>
            <span>{formatDate(order.createdAt)}</span>
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-end gap-2">
          <span className="price text-base font-bold text-foreground">
            {formatPeso(order.total)}
          </span>
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="rounded-full text-primary"
          >
            <Link
              to="/order/$id"
              params={{ id: String(order.id) }}
              data-ocid={`orders.open_button.${index}`}
              aria-label={`View order ${order.orderNumber}`}
            >
              View
              <ChevronRight className="size-4" aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </div>
    </article>
  );
}
