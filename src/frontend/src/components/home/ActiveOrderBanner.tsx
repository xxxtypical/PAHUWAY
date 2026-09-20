import { Currency } from "@/components/common/Currency";
import { useOrders } from "@/hooks/use-orders";
import { ORDER_STATUS_LABELS } from "@/lib/constants";
import { formatRelative } from "@/lib/format";
import { cn } from "@/lib/utils";
import { OrderStatus } from "@/types";
import { Link } from "@tanstack/react-router";
import { Bike, ChevronRight, PackageCheck } from "lucide-react";

/**
 * Live order strip shown on the home feed while the caller has an order that
 * has not been delivered yet. Renders nothing when there is no active order.
 */
export function ActiveOrderBanner({ className }: { className?: string }) {
  const { data: orders = [], isLoading } = useOrders();

  const activeOrder = orders.find(
    (order) => order.status !== OrderStatus.delivered,
  );

  if (isLoading || !activeOrder) return null;

  const isOutForDelivery = activeOrder.status === OrderStatus.outForDelivery;
  const Icon = isOutForDelivery ? Bike : PackageCheck;

  return (
    <Link
      to="/order/$id"
      params={{ id: String(activeOrder.id) }}
      data-ocid="home.active_order_banner"
      className={cn(
        "group flex items-center gap-3 rounded-2xl border p-3 shadow-subtle transition-smooth hover:-translate-y-0.5 hover:shadow-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:p-4",
        isOutForDelivery
          ? "border-info/40 bg-info/10"
          : "border-primary/30 bg-secondary",
        className,
      )}
    >
      <span
        className={cn(
          "flex size-11 shrink-0 items-center justify-center rounded-full",
          isOutForDelivery
            ? "bg-info text-info-foreground"
            : "bg-primary text-primary-foreground",
        )}
      >
        <Icon className="size-5" aria-hidden="true" />
      </span>

      <div className="min-w-0 flex-1">
        <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
          {isOutForDelivery ? "On the way" : "Active order"}
          <span className="font-medium normal-case tracking-normal">
            {formatRelative(activeOrder.createdAt)}
          </span>
        </p>
        <p className="truncate font-display text-sm font-bold text-foreground">
          {activeOrder.restaurantName}
        </p>
        <p className="truncate text-xs text-muted-foreground">
          {ORDER_STATUS_LABELS[activeOrder.status]} ·{" "}
          <Currency
            value={activeOrder.total}
            short
            className="text-xs font-semibold text-foreground"
          />
        </p>
      </div>

      <span className="flex shrink-0 items-center gap-1 text-xs font-bold text-primary">
        Track
        <ChevronRight
          className="size-4 transition-transform group-hover:translate-x-0.5"
          aria-hidden="true"
        />
      </span>
    </Link>
  );
}
