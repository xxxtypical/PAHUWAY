import { Currency } from "@/components/common/Currency";
import { Button } from "@/components/ui/button";
import { useRemoveCartItem, useUpdateCartItem } from "@/hooks/use-cart";
import { blobUrl, formatPeso, hasImage } from "@/lib/format";
import type { CartItem } from "@/types";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface CartLineItemProps {
  item: CartItem;
  index: number;
}

/** A cart row with quantity stepper, line total, and remove action. */
export function CartLineItem({ item, index }: CartLineItemProps) {
  const updateCartItem = useUpdateCartItem();
  const removeCartItem = useRemoveCartItem();
  const [pending, setPending] = useState(false);

  const quantity = Number(item.quantity);
  const lineTotal = item.unitPrice * item.quantity;

  const run = (action: () => void) => {
    setPending(true);
    action();
  };

  const handleIncrement = () =>
    run(() =>
      updateCartItem.mutate(
        { menuItemId: item.menuItemId, quantity: BigInt(quantity + 1) },
        {
          onError: () => toast.error("Could not update your cart."),
          onSettled: () => setPending(false),
        },
      ),
    );

  const handleDecrement = () =>
    run(() =>
      updateCartItem.mutate(
        { menuItemId: item.menuItemId, quantity: BigInt(quantity - 1) },
        {
          onError: () => toast.error("Could not update your cart."),
          onSettled: () => setPending(false),
        },
      ),
    );

  const handleRemove = () =>
    run(() =>
      removeCartItem.mutate(item.menuItemId, {
        onSuccess: () => toast.success(`${item.name} removed`),
        onError: () => toast.error("Could not remove this item."),
        onSettled: () => setPending(false),
      }),
    );

  return (
    <li
      data-ocid={`cart.item.${index + 1}`}
      className="flex gap-3 rounded-2xl border border-border bg-card p-3 shadow-subtle"
    >
      <div className="size-16 shrink-0 overflow-hidden rounded-xl bg-muted sm:size-20">
        {hasImage(item.imageUrl) ? (
          <img
            src={blobUrl(item.imageUrl)}
            alt={item.name}
            loading="lazy"
            className="size-full object-cover"
          />
        ) : (
          <img
            src="/assets/images/placeholder.svg"
            alt=""
            aria-hidden="true"
            className="size-full object-cover"
          />
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="truncate font-display text-sm font-bold text-foreground">
              {item.name}
            </h3>
            <p className="text-xs text-muted-foreground">
              <Currency value={item.unitPrice} short muted /> each
            </p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={`Remove ${item.name} from cart`}
            disabled={pending}
            onClick={handleRemove}
            data-ocid={`cart.remove_button.${index + 1}`}
            className="size-8 shrink-0 rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
          >
            <Trash2 className="size-4" aria-hidden="true" />
          </Button>
        </div>

        <div className="mt-auto flex items-center justify-between gap-2 pt-2">
          <div className="flex items-center gap-1 rounded-full border border-border bg-secondary p-0.5">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label={`Decrease quantity of ${item.name}`}
              disabled={pending}
              onClick={handleDecrement}
              data-ocid={`cart.decrement_button.${index + 1}`}
              className="size-8 rounded-full hover:bg-card"
            >
              <Minus className="size-4" aria-hidden="true" />
            </Button>
            <span
              data-ocid={`cart.quantity.${index + 1}`}
              className="price min-w-6 text-center text-sm font-bold text-foreground"
            >
              {quantity}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label={`Increase quantity of ${item.name}`}
              disabled={pending}
              onClick={handleIncrement}
              data-ocid={`cart.increment_button.${index + 1}`}
              className="size-8 rounded-full hover:bg-card"
            >
              <Plus className="size-4" aria-hidden="true" />
            </Button>
          </div>

          <span
            data-ocid={`cart.line_total.${index + 1}`}
            className="price text-sm font-bold text-foreground"
            aria-label={`Line total ${formatPeso(lineTotal)}`}
          >
            {formatPeso(lineTotal)}
          </span>
        </div>
      </div>
    </li>
  );
}
