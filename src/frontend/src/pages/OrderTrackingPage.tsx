import { EmptyState } from "@/components/common/EmptyState";
import { LoadingRows } from "@/components/common/LoadingState";
import { OrderDetail } from "@/components/orders/OrderDetail";
import { Button } from "@/components/ui/button";
import { useOrder } from "@/hooks/use-orders";
import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import { Link, useParams } from "@tanstack/react-router";
import { ArrowLeft, LogIn, PackageSearch } from "lucide-react";

/** Live tracking view for a single order, polled while it is in transit. */
export function OrderTrackingPage() {
  const { id } = useParams({ from: "/order/$id" });
  const { isAuthenticated, isInitializing, isLoggingIn, login } =
    useInternetIdentity();
  const { data: order, isLoading, isError, refetch } = useOrder(BigInt(id));

  if (!isAuthenticated) {
    return (
      <section data-ocid="order_tracking.page" className="py-6">
        <EmptyState
          icon={LogIn}
          title="Sign in to track your order"
          description="Your order updates are tied to your account. Sign in to follow your delivery from the kitchen to your door."
          action={
            <Button
              type="button"
              onClick={() => login()}
              disabled={isInitializing || isLoggingIn}
              data-ocid="order_tracking.sign_in_button"
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

  if (isLoading) {
    return (
      <section data-ocid="order_tracking.page" className="space-y-4">
        <LoadingRows count={4} />
      </section>
    );
  }

  if (isError) {
    return (
      <section data-ocid="order_tracking.page" className="py-6">
        <EmptyState
          icon={PackageSearch}
          title="We couldn't load this order"
          description="Something went wrong while fetching your order. Check your connection and try again."
          action={
            <Button
              type="button"
              onClick={() => void refetch()}
              data-ocid="order_tracking.retry_button"
              className="rounded-full font-semibold"
            >
              Try again
            </Button>
          }
        />
      </section>
    );
  }

  if (!order) {
    return (
      <section data-ocid="order_tracking.page" className="py-6">
        <EmptyState
          icon={PackageSearch}
          title="Order not found"
          description="This order may have been removed, or the link is incorrect."
          action={
            <Button asChild className="rounded-full font-semibold">
              <Link to="/orders" data-ocid="order_tracking.orders_link">
                View my orders
              </Link>
            </Button>
          }
        />
      </section>
    );
  }

  return (
    <section data-ocid="order_tracking.page" className="space-y-4">
      <Button
        asChild
        variant="ghost"
        size="sm"
        className="-ml-2 rounded-full text-muted-foreground"
      >
        <Link to="/orders" data-ocid="order_tracking.back_link">
          <ArrowLeft className="size-4" aria-hidden="true" />
          My orders
        </Link>
      </Button>

      <header className="space-y-1">
        <h1 className="font-display text-2xl font-extrabold tracking-tight text-foreground">
          Track your order
        </h1>
        <p className="text-sm text-muted-foreground">
          Follow your rider from the kitchen to your door.
        </p>
      </header>

      <OrderDetail order={order} />
    </section>
  );
}
