import { OrderStatusTimeline } from "@/components/orders/OrderStatusTimeline";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useAddToCart } from "@/hooks/use-cart";
import { ORDER_STATUS_LABELS, PAYMENT_METHOD_LABELS } from "@/lib/constants";
import {
  formatAddressFull,
  formatDateTime,
  formatDeliveryMinutes,
  formatPeso,
  formatQuantity,
} from "@/lib/format";
import type { Order } from "@/types";
import { useNavigate } from "@tanstack/react-router";
import {
  Banknote,
  Clock,
  CreditCard,
  MapPin,
  RotateCcw,
  StickyNote,
} from "lucide-react";
import { toast } from "sonner";

interface OrderDetailProps {
  order: Order;
}

/** Full order view: timeline, items, totals, address, payment, and reorder. */
export function OrderDetail({ order }: OrderDetailProps) {
  const navigate = useNavigate();
  const addToCart = useAddToCart();

  const handleReorder = () => {
    const lines = order.items;
    if (lines.length === 0) {
      toast.error("This order has no items to reorder.");
      return;
    }

    let remaining = lines.length;
    let failed = false;
    let conflict: { currentRestaurantName: string } | null = null;

    for (const line of lines) {
      addToCart.mutate(
        {
          restaurantId: order.restaurantId,
          menuItemId: line.menuItemId,
          quantity: line.quantity,
        },
        {
          onSuccess: (result) => {
            // A different-restaurant cart is reported as a variant, not an
            // error, so it must be inspected explicitly.
            if (result.__kind__ === "differentRestaurant") {
              conflict = {
                currentRestaurantName:
                  result.differentRestaurant.currentRestaurantName,
              };
            }
          },
          onError: () => {
            failed = true;
          },
          onSettled: () => {
            remaining -= 1;
            if (remaining > 0) return;
            if (conflict) {
              toast.error(
                `Your cart already has items from ${conflict.currentRestaurantName}. Empty it before reordering from ${order.restaurantName}.`,
              );
              return;
            }
            if (failed) {
              toast.error("Some items could not be added to your cart.");
              return;
            }
            toast.success("Items added to your cart.");
            void navigate({ to: "/cart" });
          },
        },
      );
    }
  };

  const PaymentIcon = order.paymentMethod === "card" ? CreditCard : Banknote;

  return (
    <div data-ocid="order_detail" className="space-y-4">
      <section className="rounded-2xl border border-border bg-card p-4 shadow-subtle sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Order #{order.orderNumber}
            </p>
            <h2 className="mt-0.5 truncate font-display text-xl font-extrabold text-foreground">
              {order.restaurantName}
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Placed {formatDateTime(order.createdAt)}
            </p>
          </div>
          <span className="rounded-full bg-secondary px-3 py-1 text-xs font-bold uppercase tracking-wider text-secondary-foreground">
            {ORDER_STATUS_LABELS[order.status]}
          </span>
        </div>

        <div className="mt-5">
          <OrderStatusTimeline status={order.status} />
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 rounded-xl bg-secondary/60 px-3 py-2.5 text-sm">
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <Clock className="size-4 text-primary" aria-hidden="true" />
            Estimated{" "}
            <strong className="font-semibold text-foreground">
              {formatDeliveryMinutes(order.estimatedDeliveryMinutes)}
            </strong>
          </span>
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <PaymentIcon className="size-4 text-primary" aria-hidden="true" />
            {PAYMENT_METHOD_LABELS[order.paymentMethod]}
          </span>
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-card p-4 shadow-subtle sm:p-5">
        <h3 className="font-display text-base font-bold text-foreground">
          Items
        </h3>
        <ul className="mt-3 space-y-3">
          {order.items.map((line, index) => (
            <li
              key={`${String(line.menuItemId)}-${index}`}
              data-ocid={`order_detail.item.${index + 1}`}
              className="flex items-start justify-between gap-3"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-foreground">
                  {line.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatQuantity(line.quantity)} · {formatPeso(line.unitPrice)}{" "}
                  each
                </p>
              </div>
              <span className="price shrink-0 text-sm font-semibold text-foreground">
                {formatPeso(line.unitPrice * line.quantity)}
              </span>
            </li>
          ))}
        </ul>

        <Separator className="my-4" />

        <dl className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <dt className="text-muted-foreground">Subtotal</dt>
            <dd className="price font-semibold text-foreground">
              {formatPeso(order.subtotal)}
            </dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className="text-muted-foreground">Delivery fee</dt>
            <dd className="price font-semibold text-foreground">
              {formatPeso(order.deliveryFee)}
            </dd>
          </div>
          <div className="flex items-center justify-between border-t border-border pt-2">
            <dt className="font-display font-bold text-foreground">Total</dt>
            <dd className="price text-lg font-extrabold text-primary">
              {formatPeso(order.total)}
            </dd>
          </div>
        </dl>
      </section>

      <section className="rounded-2xl border border-border bg-card p-4 shadow-subtle sm:p-5">
        <h3 className="flex items-center gap-2 font-display text-base font-bold text-foreground">
          <MapPin className="size-4 text-primary" aria-hidden="true" />
          Delivery address
        </h3>
        <p className="mt-2 text-sm font-semibold text-foreground">
          {order.address.addressLabel}
        </p>
        <p className="mt-0.5 text-sm text-muted-foreground">
          {formatAddressFull(order.address)}
        </p>

        {order.deliveryNotes ? (
          <p className="mt-3 flex items-start gap-2 rounded-xl bg-secondary/60 px-3 py-2 text-sm text-muted-foreground">
            <StickyNote
              className="mt-0.5 size-4 shrink-0 text-primary"
              aria-hidden="true"
            />
            {order.deliveryNotes}
          </p>
        ) : null}
      </section>

      <Button
        type="button"
        onClick={handleReorder}
        disabled={addToCart.isPending}
        data-ocid="order_detail.reorder_button"
        className="w-full rounded-full font-semibold"
      >
        <RotateCcw className="size-4" aria-hidden="true" />
        {addToCart.isPending ? "Adding items…" : "Reorder these items"}
      </Button>
    </div>
  );
}
