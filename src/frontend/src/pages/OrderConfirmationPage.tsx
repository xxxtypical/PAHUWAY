import { Currency } from "@/components/common/Currency";
import { EmptyState } from "@/components/common/EmptyState";
import { Button } from "@/components/ui/button";
import { useOrder } from "@/hooks/use-orders";
import { PAYMENT_METHOD_LABELS } from "@/lib/constants";
import {
  formatAddressFull,
  formatDeliveryTime,
  formatPeso,
  formatQuantity,
} from "@/lib/format";
import { Link, useParams } from "@tanstack/react-router";
import { CheckCircle2, Clock, MapPin, Receipt, Truck } from "lucide-react";

/** Order confirmation: order number, ETA, summary, and tracking link. */
export function OrderConfirmationPage() {
  const { id } = useParams({ from: "/order/$id/confirmation" });
  const orderId = BigInt(id);
  const { data: order, isLoading, isError } = useOrder(orderId);

  if (isLoading) {
    return (
      <section data-ocid="order_confirmation.page" className="space-y-4">
        <div className="h-40 animate-pulse rounded-2xl bg-muted" />
        <div className="h-56 animate-pulse rounded-2xl bg-muted" />
      </section>
    );
  }

  if (isError || !order) {
    return (
      <section data-ocid="order_confirmation.page" className="py-6">
        <EmptyState
          icon={Receipt}
          title="Order not found"
          description="We could not find this order. Check your order history for the latest status."
          action={
            <Button asChild className="rounded-full font-semibold shadow-card">
              <Link to="/orders" data-ocid="order_confirmation.orders_link">
                View my orders
              </Link>
            </Button>
          }
        />
      </section>
    );
  }

  return (
    <section
      data-ocid="order_confirmation.page"
      className="animate-fade-in space-y-5"
    >
      {/* Success banner */}
      <div className="overflow-hidden rounded-2xl bg-gradient-promo p-5 text-center shadow-card">
        <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-card/95 text-success">
          <CheckCircle2 className="size-8" aria-hidden="true" />
        </span>
        <h1 className="mt-3 font-display text-2xl font-extrabold tracking-tight text-primary-foreground">
          Order confirmed!
        </h1>
        <p className="mt-1 text-sm text-primary-foreground/90">
          {order.restaurantName} is preparing your food.
        </p>
        <p
          data-ocid="order_confirmation.order_number"
          className="price mt-3 inline-block rounded-full bg-card/95 px-4 py-1.5 text-sm font-bold text-foreground"
        >
          {order.orderNumber}
        </p>
      </div>

      {/* ETA + address */}
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="flex items-start gap-3 rounded-2xl border border-border bg-card p-4 shadow-subtle">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-info/15 text-info">
            <Clock className="size-5" aria-hidden="true" />
          </span>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Estimated arrival
            </p>
            <p
              data-ocid="order_confirmation.eta"
              className="price font-display text-lg font-extrabold text-foreground"
            >
              {formatDeliveryTime(order.estimatedDeliveryMinutes)}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3 rounded-2xl border border-border bg-card p-4 shadow-subtle">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
            <MapPin className="size-5" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Delivering to
            </p>
            <p className="truncate font-display text-sm font-bold text-foreground">
              {order.address.addressLabel}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {formatAddressFull(order.address)}
            </p>
          </div>
        </div>
      </div>

      {/* Order summary */}
      <section
        data-ocid="order_confirmation.summary"
        className="space-y-3 rounded-2xl border border-border bg-card p-4 shadow-card"
      >
        <h2 className="font-display text-base font-extrabold tracking-tight text-foreground">
          Order summary
        </h2>

        <ul className="divide-y divide-border">
          {order.items.map((line, index) => (
            <li
              key={`${String(line.menuItemId)}-${index}`}
              data-ocid={`order_confirmation.item.${index + 1}`}
              className="flex items-center justify-between gap-3 py-2.5"
            >
              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold text-foreground">
                  {line.name}
                </span>
                <span className="price text-xs text-muted-foreground">
                  {formatQuantity(line.quantity)} · {formatPeso(line.unitPrice)}
                </span>
              </span>
              <Currency
                value={line.unitPrice * line.quantity}
                className="shrink-0 text-sm font-bold"
              />
            </li>
          ))}
        </ul>

        <dl className="space-y-2 border-t border-border pt-3 text-sm">
          <div className="flex items-center justify-between gap-3">
            <dt className="text-muted-foreground">Subtotal</dt>
            <dd>
              <Currency value={order.subtotal} className="font-semibold" />
            </dd>
          </div>
          <div className="flex items-center justify-between gap-3">
            <dt className="text-muted-foreground">Delivery fee</dt>
            <dd>
              <Currency value={order.deliveryFee} className="font-semibold" />
            </dd>
          </div>
          <div className="flex items-center justify-between gap-3 border-t border-border pt-3">
            <dt className="font-display text-base font-extrabold text-foreground">
              Total
            </dt>
            <dd>
              <Currency
                value={order.total}
                data-ocid="order_confirmation.total"
                className="text-lg font-extrabold text-primary"
              />
            </dd>
          </div>
        </dl>

        <div className="flex items-center gap-2 rounded-xl bg-secondary px-3 py-2 text-xs text-secondary-foreground">
          <Truck className="size-4 shrink-0 text-primary" aria-hidden="true" />
          Paid via {PAYMENT_METHOD_LABELS[order.paymentMethod]}
        </div>
      </section>

      {/* Actions */}
      <div className="flex flex-col gap-2 sm:flex-row">
        <Button
          asChild
          size="lg"
          data-ocid="order_confirmation.track_button"
          className="flex-1 rounded-full font-semibold shadow-card"
        >
          <Link to="/order/$id" params={{ id: String(order.id) }}>
            <Truck className="size-4" aria-hidden="true" />
            Track my order
          </Link>
        </Button>
        <Button
          asChild
          variant="secondary"
          size="lg"
          data-ocid="order_confirmation.home_button"
          className="flex-1 rounded-full font-semibold"
        >
          <Link to="/">Order something else</Link>
        </Button>
      </div>
    </section>
  );
}
