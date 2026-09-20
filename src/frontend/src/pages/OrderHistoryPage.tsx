import { EmptyState } from "@/components/common/EmptyState";
import { LoadingRows } from "@/components/common/LoadingState";
import { OrderCard } from "@/components/orders/OrderCard";
import { Button } from "@/components/ui/button";
import { useOrders } from "@/hooks/use-orders";
import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import { Link } from "@tanstack/react-router";
import { LogIn, Receipt, RefreshCw } from "lucide-react";

/** The signed-in caller's order history, newest first. */
export function OrderHistoryPage() {
  const { isAuthenticated, isInitializing, isLoggingIn, login } =
    useInternetIdentity();
  const { data: orders = [], isLoading, isError, refetch } = useOrders();

  if (!isAuthenticated) {
    return (
      <section data-ocid="orders.page" className="py-6">
        <EmptyState
          icon={LogIn}
          title="Sign in to see your orders"
          description="Your order history is saved to your account. Sign in to review past deliveries and reorder your favourites."
          action={
            <Button
              type="button"
              onClick={() => login()}
              disabled={isInitializing || isLoggingIn}
              data-ocid="orders.sign_in_button"
              className="rounded-full font-semibold"
            >
              {isInitializing
                ? "Loading…"
                : isLoggingIn
                  ? "Signing in…"
                  : "Sign in"}
            </Button>
          }
        />
      </section>
    );
  }

  return (
    <section data-ocid="orders.page" className="space-y-4">
      <header className="space-y-1">
        <h1 className="font-display text-2xl font-extrabold tracking-tight text-foreground">
          My orders
        </h1>
        <p className="text-sm text-muted-foreground">
          Your past and in-progress orders, newest first.
        </p>
      </header>

      {isLoading ? (
        <LoadingRows count={5} />
      ) : isError ? (
        <EmptyState
          icon={RefreshCw}
          title="We couldn't load your orders"
          description="Something went wrong while fetching your order history. Check your connection and try again."
          action={
            <Button
              type="button"
              onClick={() => void refetch()}
              data-ocid="orders.retry_button"
              className="rounded-full font-semibold"
            >
              Try again
            </Button>
          }
        />
      ) : orders.length === 0 ? (
        <EmptyState
          icon={Receipt}
          title="No orders yet"
          description="When you place your first order, it will show up here with live tracking and one-tap reordering."
          action={
            <Button asChild className="rounded-full font-semibold">
              <Link to="/" data-ocid="orders.browse_link">
                Browse restaurants
              </Link>
            </Button>
          }
        />
      ) : (
        <div data-ocid="orders.list" className="space-y-3">
          {orders.map((order, index) => (
            <OrderCard key={String(order.id)} order={order} index={index + 1} />
          ))}
        </div>
      )}
    </section>
  );
}
