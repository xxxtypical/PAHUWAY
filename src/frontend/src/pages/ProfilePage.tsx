import { EmptyState } from "@/components/common/EmptyState";
import { Button } from "@/components/ui/button";
import { useDefaultAddress } from "@/hooks/use-addresses";
import { useOrders } from "@/hooks/use-orders";
import { APP_NAME, APP_TAGLINE } from "@/lib/constants";
import { formatAddressFull, formatItemCount } from "@/lib/format";
import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import { Link } from "@tanstack/react-router";
import {
  ChevronRight,
  LogIn,
  LogOut,
  MapPin,
  Package,
  Plus,
  User,
} from "lucide-react";

/** Account overview: identity, order count, and the default delivery address. */
export function ProfilePage() {
  const { isAuthenticated, isInitializing, isLoggingIn, login, clear } =
    useInternetIdentity();
  const { defaultAddress, isLoading: isLoadingAddress } = useDefaultAddress();
  const { data: orders = [] } = useOrders();

  if (!isAuthenticated) {
    return (
      <section data-ocid="profile.page" className="py-6">
        <EmptyState
          icon={User}
          title="You're not signed in"
          description={`Sign in with Internet Identity to save addresses, track orders, and keep your history with ${APP_NAME}.`}
          action={
            <Button
              type="button"
              onClick={() => login()}
              disabled={isInitializing || isLoggingIn}
              data-ocid="profile.sign_in_button"
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

  const orderCount = orders.length;

  return (
    <section data-ocid="profile.page" className="space-y-4">
      <header className="space-y-1">
        <h1 className="font-display text-2xl font-extrabold tracking-tight text-foreground">
          Profile
        </h1>
        <p className="text-sm text-muted-foreground">
          Your account details and delivery preferences.
        </p>
      </header>

      <div className="rounded-2xl border border-border bg-card p-4 shadow-subtle sm:p-5">
        <div className="flex items-center gap-3">
          <span
            aria-hidden="true"
            className="flex size-14 shrink-0 items-center justify-center rounded-full bg-gradient-primary text-primary-foreground"
          >
            <User className="size-7" />
          </span>
          <div className="min-w-0">
            <p className="truncate font-display text-lg font-bold text-foreground">
              {APP_NAME} member
            </p>
            <p className="truncate text-sm text-muted-foreground">
              Signed in with Internet Identity
            </p>
          </div>
        </div>

        <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-border pt-4">
          <div className="rounded-xl bg-secondary/60 px-3 py-2.5">
            <dt className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Orders placed
            </dt>
            <dd className="price mt-0.5 text-xl font-extrabold text-foreground">
              {orderCount}
            </dd>
          </div>
          <div className="rounded-xl bg-secondary/60 px-3 py-2.5">
            <dt className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Account status
            </dt>
            <dd className="mt-0.5 text-sm font-bold text-success">Active</dd>
          </div>
        </dl>
      </div>

      <div className="rounded-2xl border border-border bg-card p-4 shadow-subtle sm:p-5">
        <div className="flex items-center justify-between gap-3">
          <h2 className="flex items-center gap-2 font-display text-base font-bold text-foreground">
            <MapPin className="size-4 text-primary" aria-hidden="true" />
            Default delivery address
          </h2>
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="rounded-full text-primary"
          >
            <Link to="/addresses" data-ocid="profile.manage_addresses_link">
              Manage
              <ChevronRight className="size-4" aria-hidden="true" />
            </Link>
          </Button>
        </div>

        {isLoadingAddress ? (
          <p className="mt-3 text-sm text-muted-foreground">
            Loading your address…
          </p>
        ) : defaultAddress ? (
          <div className="mt-3">
            <p className="text-sm font-semibold text-foreground">
              {defaultAddress.addressLabel}
            </p>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {formatAddressFull(defaultAddress)}
            </p>
          </div>
        ) : (
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">
              No delivery address saved yet.
            </p>
            <Button asChild size="sm" className="rounded-full font-semibold">
              <Link to="/addresses" data-ocid="profile.add_address_link">
                <Plus className="size-4" aria-hidden="true" />
                Add address
              </Link>
            </Button>
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-border bg-card p-4 shadow-subtle sm:p-5">
        <h2 className="font-display text-base font-bold text-foreground">
          Quick links
        </h2>
        <div className="mt-3 space-y-2">
          <Link
            to="/orders"
            data-ocid="profile.orders_link"
            className="flex items-center justify-between gap-3 rounded-xl border border-border px-3 py-3 transition-smooth hover:border-primary/40 hover:bg-secondary"
          >
            <span className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <Package className="size-4 text-primary" aria-hidden="true" />
              My orders
            </span>
            <span className="flex items-center gap-2 text-xs text-muted-foreground">
              {formatItemCount(orderCount)}
              <ChevronRight className="size-4" aria-hidden="true" />
            </span>
          </Link>
          <Link
            to="/addresses"
            data-ocid="profile.addresses_link"
            className="flex items-center justify-between gap-3 rounded-xl border border-border px-3 py-3 transition-smooth hover:border-primary/40 hover:bg-secondary"
          >
            <span className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <MapPin className="size-4 text-primary" aria-hidden="true" />
              Saved addresses
            </span>
            <ChevronRight
              className="size-4 text-muted-foreground"
              aria-hidden="true"
            />
          </Link>
        </div>
      </div>

      <p className="px-1 text-center text-xs text-muted-foreground">
        {APP_NAME} — {APP_TAGLINE}
      </p>

      <Button
        type="button"
        variant="outline"
        onClick={clear}
        data-ocid="profile.sign_out_button"
        className="w-full rounded-full font-semibold text-destructive hover:bg-destructive/10 hover:text-destructive"
      >
        <LogOut className="size-4" aria-hidden="true" />
        Sign out
      </Button>
    </section>
  );
}
