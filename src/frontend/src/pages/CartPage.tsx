import { CartLineItem } from "@/components/cart/CartLineItem";
import { CartSummary } from "@/components/cart/CartSummary";
import { EmptyState } from "@/components/common/EmptyState";
import { LoadingRows } from "@/components/common/LoadingState";
import { Button } from "@/components/ui/button";
import { useCartContext } from "@/context/CartContext";
import { useClearCart } from "@/hooks/use-cart";
import { formatItemCount } from "@/lib/format";
import { Link } from "@tanstack/react-router";
import { ArrowRight, ShoppingBag, Trash2 } from "lucide-react";
import { toast } from "sonner";

/** Cart review: line items, quantity controls, and the peso order summary. */
export function CartPage() {
  const {
    items,
    itemCount,
    subtotal,
    deliveryFee,
    total,
    restaurantName,
    isEmpty,
    isLoading,
  } = useCartContext();
  const clearCart = useClearCart();

  const handleClear = () => {
    clearCart.mutate(undefined, {
      onSuccess: () => toast.success("Cart cleared"),
      onError: () => toast.error("Could not clear your cart."),
    });
  };

  if (isLoading) {
    return (
      <section data-ocid="cart.page" className="space-y-4">
        <h1 className="font-display text-2xl font-extrabold tracking-tight text-foreground">
          Your cart
        </h1>
        <LoadingRows count={3} />
      </section>
    );
  }

  if (isEmpty) {
    return (
      <section data-ocid="cart.page" className="py-6">
        <EmptyState
          icon={ShoppingBag}
          title="Your cart is empty"
          description="Browse restaurants near you and add dishes to get started."
          action={
            <Button asChild className="rounded-full font-semibold shadow-card">
              <Link to="/" data-ocid="cart.browse_button">
                Browse restaurants
              </Link>
            </Button>
          }
        />
      </section>
    );
  }

  return (
    <section data-ocid="cart.page" className="animate-fade-in space-y-4">
      <header className="flex items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-extrabold tracking-tight text-foreground">
            Your cart
          </h1>
          {restaurantName ? (
            <p className="text-sm text-muted-foreground">
              From <span className="font-semibold">{restaurantName}</span> ·{" "}
              {formatItemCount(itemCount)}
            </p>
          ) : null}
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleClear}
          disabled={clearCart.isPending}
          data-ocid="cart.clear_button"
          className="rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
        >
          <Trash2 className="size-4" aria-hidden="true" />
          Clear
        </Button>
      </header>

      <div className="grid gap-4 lg:grid-cols-[1fr_20rem] lg:items-start">
        <ul data-ocid="cart.list" className="space-y-3">
          {items.map((item, index) => (
            <CartLineItem
              key={String(item.menuItemId)}
              item={item}
              index={index}
            />
          ))}
        </ul>

        <CartSummary
          subtotal={subtotal}
          deliveryFee={deliveryFee}
          total={total}
          className="lg:sticky lg:top-24"
          action={
            <Button
              asChild
              size="lg"
              data-ocid="cart.checkout_button"
              className="w-full rounded-full font-semibold shadow-card"
            >
              <Link to="/checkout">
                Proceed to checkout
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </Button>
          }
        />
      </div>
    </section>
  );
}
