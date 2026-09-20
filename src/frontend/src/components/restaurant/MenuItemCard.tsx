import { Currency } from "@/components/common/Currency";
import { Button } from "@/components/ui/button";
import { useCartContext } from "@/context/CartContext";
import { useAddToCart, useUpdateCartItem } from "@/hooks/use-cart";
import { blobUrl, hasImage } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { MenuItem } from "@/types";
import { Minus, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface MenuItemCardProps {
  item: MenuItem;
  /** Called when the backend reports a cart from a different restaurant. */
  onConflict: (
    info: {
      requestedRestaurantId: bigint;
      requestedRestaurantName: string;
      currentRestaurantId: bigint;
      currentRestaurantName: string;
    },
    requested: { menuItemId: bigint; quantity: bigint },
  ) => void;
  index?: number;
}

/**
 * A single dish row: photo, name, description, peso price, and an
 * add-to-cart control with quantity stepper. Unavailable dishes are
 * visibly disabled and cannot be added.
 */
export function MenuItemCard({
  item,
  onConflict,
  index = 0,
}: MenuItemCardProps) {
  const { quantityOf } = useCartContext();
  const addToCart = useAddToCart();
  const updateCartItem = useUpdateCartItem();
  const [pending, setPending] = useState(false);

  const inCart = quantityOf(item.id);
  const disabled = !item.available || pending;

  const handleAdd = () => {
    setPending(true);
    addToCart.mutate(
      { restaurantId: item.restaurantId, menuItemId: item.id, quantity: 1n },
      {
        onSuccess: (result) => {
          if (result.__kind__ === "differentRestaurant") {
            onConflict(result.differentRestaurant, {
              menuItemId: item.id,
              quantity: 1n,
            });
          } else {
            toast.success(`${item.name} added to your cart`);
          }
        },
        onError: () =>
          toast.error("Could not add this dish. Please try again."),
        onSettled: () => setPending(false),
      },
    );
  };

  const handleIncrement = () => {
    setPending(true);
    updateCartItem.mutate(
      { menuItemId: item.id, quantity: BigInt(inCart + 1) },
      {
        onError: () => toast.error("Could not update your cart."),
        onSettled: () => setPending(false),
      },
    );
  };

  const handleDecrement = () => {
    setPending(true);
    updateCartItem.mutate(
      { menuItemId: item.id, quantity: BigInt(Math.max(0, inCart - 1)) },
      {
        onError: () => toast.error("Could not update your cart."),
        onSettled: () => setPending(false),
      },
    );
  };

  return (
    <article
      data-ocid={`menu.item.${index + 1}`}
      className={cn(
        "group flex gap-3 rounded-2xl border border-border bg-card p-3 shadow-subtle transition-smooth",
        item.available
          ? "hover:-translate-y-0.5 hover:shadow-card-hover"
          : "opacity-70",
      )}
    >
      <div className="relative size-24 shrink-0 overflow-hidden rounded-xl bg-muted sm:size-28">
        {hasImage(item.imageUrl) ? (
          <img
            src={blobUrl(item.imageUrl)}
            alt={item.name}
            loading="lazy"
            className={cn(
              "size-full object-cover transition-smooth group-hover:scale-105",
              !item.available && "grayscale",
            )}
          />
        ) : (
          <img
            src="/assets/images/placeholder.svg"
            alt=""
            aria-hidden="true"
            className={cn(
              "size-full object-cover",
              !item.available && "grayscale",
            )}
          />
        )}
        {!item.available ? (
          <span
            data-ocid={`menu.unavailable_badge.${index + 1}`}
            className="absolute inset-x-1 bottom-1 rounded-full bg-foreground/85 px-2 py-0.5 text-center text-[10px] font-bold uppercase tracking-wider text-background"
          >
            Sold out
          </span>
        ) : null}
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <h3 className="font-display text-sm font-bold leading-snug text-foreground sm:text-base">
          {item.name}
        </h3>
        {item.description ? (
          <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground sm:text-sm">
            {item.description}
          </p>
        ) : null}

        <div className="mt-auto flex items-end justify-between gap-2 pt-2">
          <Currency
            value={item.price}
            className="text-base font-bold text-foreground sm:text-lg"
          />

          {!item.available ? (
            <span className="text-xs font-semibold text-muted-foreground">
              Unavailable
            </span>
          ) : inCart > 0 ? (
            <div
              data-ocid={`menu.quantity_control.${index + 1}`}
              className="flex items-center gap-1 rounded-full border border-border bg-secondary p-0.5"
            >
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label={`Remove one ${item.name}`}
                disabled={disabled}
                onClick={handleDecrement}
                data-ocid={`menu.decrement_button.${index + 1}`}
                className="size-8 rounded-full hover:bg-card"
              >
                <Minus className="size-4" aria-hidden="true" />
              </Button>
              <span
                data-ocid={`menu.quantity.${index + 1}`}
                className="price min-w-6 text-center text-sm font-bold text-foreground"
              >
                {inCart}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label={`Add one more ${item.name}`}
                disabled={disabled}
                onClick={handleIncrement}
                data-ocid={`menu.increment_button.${index + 1}`}
                className="size-8 rounded-full hover:bg-card"
              >
                <Plus className="size-4" aria-hidden="true" />
              </Button>
            </div>
          ) : (
            <Button
              type="button"
              size="sm"
              disabled={disabled}
              onClick={handleAdd}
              data-ocid={`menu.add_button.${index + 1}`}
              className="rounded-full font-semibold shadow-card"
            >
              <Plus className="size-4" aria-hidden="true" />
              Add
            </Button>
          )}
        </div>
      </div>
    </article>
  );
}
