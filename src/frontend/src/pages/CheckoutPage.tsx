import { CartSummary } from "@/components/cart/CartSummary";
import { PaymentMethodSelector } from "@/components/checkout/PaymentMethodSelector";
import { AddressPrompt } from "@/components/common/AddressSelector";
import { EmptyState } from "@/components/common/EmptyState";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCartContext } from "@/context/CartContext";
import { useAddresses } from "@/hooks/use-addresses";
import { usePlaceOrder } from "@/hooks/use-orders";
import { formatAddressFull } from "@/lib/format";
import { cn } from "@/lib/utils";
import { PaymentMethod } from "@/types";
import { Link, useNavigate } from "@tanstack/react-router";
import { Check, MapPin, ShoppingBag } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

/** Checkout: address selection, delivery notes, payment method, place order. */
export function CheckoutPage() {
  const navigate = useNavigate();
  const {
    items,
    subtotal,
    deliveryFee,
    total,
    restaurantId,
    isEmpty,
    isLoading,
  } = useCartContext();
  const { data: addresses = [], isLoading: addressesLoading } = useAddresses();
  const placeOrder = usePlaceOrder();

  const [addressId, setAddressId] = useState<bigint | null>(null);
  const [notes, setNotes] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(
    PaymentMethod.cashOnDelivery,
  );

  // Preselect the default address once addresses load.
  useEffect(() => {
    if (addressId !== null || addresses.length === 0) return;
    const preferred =
      addresses.find((address) => address.isDefault) ?? addresses[0];
    setAddressId(preferred.id);
  }, [addresses, addressId]);

  const handlePlaceOrder = () => {
    if (restaurantId === null || addressId === null) return;
    const trimmedNotes = notes.trim();
    placeOrder.mutate(
      {
        restaurantId,
        addressId,
        paymentMethod,
        deliveryNotes: trimmedNotes.length > 0 ? trimmedNotes : undefined,
      },
      {
        onSuccess: (order) => {
          toast.success("Order placed!");
          void navigate({
            to: "/order/$id/confirmation",
            params: { id: String(order.id) },
          });
        },
        onError: () =>
          toast.error("Could not place your order. Please try again."),
      },
    );
  };

  if (isLoading) {
    return (
      <section data-ocid="checkout.page" className="space-y-4">
        <h1 className="font-display text-2xl font-extrabold tracking-tight text-foreground">
          Checkout
        </h1>
        <div className="h-40 animate-pulse rounded-2xl bg-muted" />
      </section>
    );
  }

  if (isEmpty) {
    return (
      <section data-ocid="checkout.page" className="py-6">
        <EmptyState
          icon={ShoppingBag}
          title="Nothing to check out"
          description="Add dishes to your cart before placing an order."
          action={
            <Button asChild className="rounded-full font-semibold shadow-card">
              <Link to="/" data-ocid="checkout.browse_button">
                Browse restaurants
              </Link>
            </Button>
          }
        />
      </section>
    );
  }

  const hasAddresses = addresses.length > 0;
  const canPlaceOrder =
    hasAddresses && addressId !== null && !placeOrder.isPending;

  return (
    <section data-ocid="checkout.page" className="animate-fade-in space-y-5">
      <h1 className="font-display text-2xl font-extrabold tracking-tight text-foreground">
        Checkout
      </h1>

      <div className="grid gap-5 lg:grid-cols-[1fr_20rem] lg:items-start">
        <div className="space-y-5">
          {/* Delivery address */}
          <section
            data-ocid="checkout.address_section"
            className="space-y-3 rounded-2xl border border-border bg-card p-4 shadow-card"
          >
            <h2 className="font-display text-base font-extrabold tracking-tight text-foreground">
              Delivery address
            </h2>

            {addressesLoading ? (
              <div className="h-20 animate-pulse rounded-xl bg-muted" />
            ) : !hasAddresses ? (
              <AddressPrompt />
            ) : (
              <ul className="space-y-2">
                {addresses.map((address) => {
                  const selected = addressId === address.id;
                  return (
                    <li key={String(address.id)}>
                      <button
                        type="button"
                        onClick={() => setAddressId(address.id)}
                        data-ocid={`checkout.address_option.${String(address.id)}`}
                        className={cn(
                          "flex w-full items-start gap-3 rounded-2xl border p-3 text-left transition-smooth",
                          selected
                            ? "border-primary bg-primary/5 shadow-subtle"
                            : "border-border bg-card hover:border-primary/40 hover:bg-secondary",
                        )}
                      >
                        <span
                          className={cn(
                            "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full",
                            selected
                              ? "bg-primary text-primary-foreground"
                              : "bg-secondary text-muted-foreground",
                          )}
                        >
                          <MapPin className="size-4" aria-hidden="true" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="flex items-center gap-2">
                            <span className="truncate font-display text-sm font-bold text-foreground">
                              {address.addressLabel}
                            </span>
                            {address.isDefault ? (
                              <span className="shrink-0 rounded-full bg-accent px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-accent-foreground">
                                Default
                              </span>
                            ) : null}
                          </span>
                          <span className="mt-0.5 block text-xs text-muted-foreground">
                            {formatAddressFull(address)}
                          </span>
                        </span>
                        {selected ? (
                          <Check
                            className="mt-1 size-4 shrink-0 text-primary"
                            aria-hidden="true"
                          />
                        ) : null}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          {/* Delivery notes */}
          <section
            data-ocid="checkout.notes_section"
            className="space-y-3 rounded-2xl border border-border bg-card p-4 shadow-card"
          >
            <Label
              htmlFor="delivery-notes"
              className="font-display text-base font-extrabold tracking-tight text-foreground"
            >
              Delivery notes
            </Label>
            <Textarea
              id="delivery-notes"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="e.g. Leave at the guardhouse, call when you arrive."
              rows={3}
              data-ocid="checkout.notes_textarea"
              className="resize-none rounded-xl"
            />
            <p className="text-xs text-muted-foreground">
              Optional — help your rider find you faster.
            </p>
          </section>

          {/* Payment method */}
          <section className="rounded-2xl border border-border bg-card p-4 shadow-card">
            <PaymentMethodSelector
              value={paymentMethod}
              onChange={setPaymentMethod}
            />
          </section>
        </div>

        <CartSummary
          subtotal={subtotal}
          deliveryFee={deliveryFee}
          total={total}
          className="lg:sticky lg:top-24"
          data-ocid="checkout.summary"
          action={
            <div className="space-y-2">
              <Button
                type="button"
                size="lg"
                onClick={handlePlaceOrder}
                disabled={!canPlaceOrder}
                data-ocid="checkout.place_order_button"
                className="w-full rounded-full font-semibold shadow-card"
              >
                {placeOrder.isPending ? "Placing order…" : "Place order"}
              </Button>
              {!hasAddresses ? (
                <p className="text-center text-xs text-muted-foreground">
                  Add a delivery address to place your order.
                </p>
              ) : null}
            </div>
          }
        />
      </div>

      <p className="text-center text-xs text-muted-foreground">
        {items.length} dish{items.length === 1 ? "" : "es"} in this order
      </p>
    </section>
  );
}
