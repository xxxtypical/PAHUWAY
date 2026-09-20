import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ORDER_STATUS_FLOW,
  ORDER_STATUS_LABELS,
  PAYMENT_METHOD_LABELS,
} from "@/lib/constants";
import { formatPeso, formatRelative } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Order, OrderStatus } from "@/types";
import { ArrowRight, Loader2, MapPin, Phone } from "lucide-react";

const STATUS_CLASSES: Record<OrderStatus, string> = {
  placed: "border-transparent bg-muted text-muted-foreground",
  confirmed: "border-transparent bg-primary/10 text-primary",
  preparing: "border-transparent bg-warning/25 text-warning-foreground",
  outForDelivery: "border-transparent bg-info/20 text-info",
  delivered: "border-transparent bg-success/15 text-success",
};

interface AdminOrderRowProps {
  order: Order;
  onAdvance: (order: Order) => void;
  isAdvancing: boolean;
  index: number;
}

/** One incoming order with its delivery timeline and advance action. */
export function AdminOrderRow({
  order,
  onAdvance,
  isAdvancing,
  index,
}: AdminOrderRowProps) {
  const currentIndex = ORDER_STATUS_FLOW.indexOf(order.status);
  const nextStatus =
    currentIndex >= 0 && currentIndex < ORDER_STATUS_FLOW.length - 1
      ? ORDER_STATUS_FLOW[currentIndex + 1]
      : null;
  const itemCount = order.items.reduce(
    (total, line) => total + Number(line.quantity),
    0,
  );

  return (
    <article
      data-ocid={`admin.order_row.${index + 1}`}
      className="animate-fade-in-up rounded-2xl border border-border bg-card p-4 shadow-subtle transition-smooth hover:shadow-card"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-display text-base font-bold text-foreground">
              {order.orderNumber}
            </h3>
            <Badge className={cn("rounded-full", STATUS_CLASSES[order.status])}>
              {ORDER_STATUS_LABELS[order.status]}
            </Badge>
          </div>
          <p className="truncate text-sm font-semibold text-foreground">
            {order.restaurantName}
          </p>
          <p className="text-xs text-muted-foreground">
            {formatRelative(order.createdAt)} · {itemCount}{" "}
            {itemCount === 1 ? "item" : "items"} ·{" "}
            {PAYMENT_METHOD_LABELS[order.paymentMethod]}
          </p>
        </div>

        <div className="text-right">
          <p className="price text-lg font-bold text-foreground">
            {formatPeso(order.total)}
          </p>
          <p className="text-xs text-muted-foreground">
            incl. {formatPeso(order.deliveryFee)} delivery
          </p>
        </div>
      </div>

      <div className="mt-3 space-y-1.5 border-t border-border pt-3 text-xs text-muted-foreground">
        <p className="flex items-start gap-1.5">
          <MapPin className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
          <span className="min-w-0">
            {order.address.street}, Brgy. {order.address.barangay},{" "}
            {order.address.city}
            {order.address.landmark ? ` · ${order.address.landmark}` : ""}
          </span>
        </p>
        {order.deliveryNotes ? (
          <p className="flex items-start gap-1.5">
            <Phone className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
            <span className="min-w-0 italic">{order.deliveryNotes}</span>
          </p>
        ) : null}
      </div>

      <ul className="mt-3 space-y-1">
        {order.items.map((line) => (
          <li
            key={`${order.id}-${line.menuItemId}`}
            className="flex items-center justify-between gap-3 text-sm"
          >
            <span className="min-w-0 truncate text-foreground">
              <span className="price mr-1.5 text-xs text-muted-foreground">
                ×{Number(line.quantity)}
              </span>
              {line.name}
            </span>
            <span className="price shrink-0 text-xs text-muted-foreground">
              {formatPeso(line.unitPrice * line.quantity)}
            </span>
          </li>
        ))}
      </ul>

      <div className="mt-4 flex items-center justify-between gap-3">
        <p className="text-xs text-muted-foreground">
          {nextStatus
            ? `Next: ${ORDER_STATUS_LABELS[nextStatus]}`
            : "Delivered — no further action"}
        </p>
        {nextStatus ? (
          <Button
            type="button"
            size="sm"
            onClick={() => onAdvance(order)}
            disabled={isAdvancing}
            data-ocid={`admin.advance_order_button.${index + 1}`}
            className="rounded-full font-semibold shadow-card"
          >
            {isAdvancing ? (
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            ) : (
              <ArrowRight className="size-4" aria-hidden="true" />
            )}
            {isAdvancing
              ? "Updating…"
              : `Mark ${ORDER_STATUS_LABELS[nextStatus].toLowerCase()}`}
          </Button>
        ) : null}
      </div>
    </article>
  );
}
