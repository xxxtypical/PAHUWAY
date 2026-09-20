import { AdminGuard } from "@/components/admin/AdminGuard";
import { StatCard } from "@/components/admin/StatCard";
import { EmptyState } from "@/components/common/EmptyState";
import { LoadingState } from "@/components/common/LoadingState";
import { Button } from "@/components/ui/button";
import { useDashboardSummary } from "@/hooks/use-admin";
import { ORDER_STATUS_FLOW, ORDER_STATUS_LABELS } from "@/lib/constants";
import { Link } from "@tanstack/react-router";
import {
  AlertCircle,
  Bike,
  ChefHat,
  ClipboardList,
  Package,
  Store,
  UtensilsCrossed,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

const STATUS_ICONS: Record<string, LucideIcon> = {
  placed: ClipboardList,
  confirmed: Package,
  preparing: ChefHat,
  outForDelivery: Bike,
  delivered: Store,
};

const QUICK_LINKS = [
  {
    to: "/admin/orders",
    label: "Incoming orders",
    description: "Advance orders through the delivery timeline.",
    icon: ClipboardList,
  },
  {
    to: "/admin/restaurants",
    label: "Restaurants",
    description: "Create and edit the restaurants on your marketplace.",
    icon: Store,
  },
  {
    to: "/admin/menu",
    label: "Menu",
    description: "Add dishes, set prices, and control availability.",
    icon: UtensilsCrossed,
  },
] as const;

function DashboardBody() {
  const { data, isLoading, isError, refetch } = useDashboardSummary();

  if (isLoading) {
    return (
      <section data-ocid="admin.dashboard.page" className="space-y-6">
        <LoadingState count={6} />
      </section>
    );
  }

  if (isError || !data) {
    return (
      <section data-ocid="admin.dashboard.page" className="py-6">
        <EmptyState
          icon={AlertCircle}
          title="Could not load the dashboard"
          description="The summary counts could not be fetched. Check your connection and try again."
          action={
            <Button
              type="button"
              onClick={() => void refetch()}
              data-ocid="admin.dashboard.retry_button"
              className="rounded-full font-semibold shadow-card"
            >
              Try again
            </Button>
          }
        />
      </section>
    );
  }

  const counts = data.ordersByStatus;
  const totalOrders = ORDER_STATUS_FLOW.reduce(
    (total, status) => total + Number(counts[status]),
    0,
  );

  return (
    <section data-ocid="admin.dashboard.page" className="space-y-8">
      <header className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Merchant dashboard
        </p>
        <h1 className="font-display text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
          Today at a glance
        </h1>
        <p className="text-sm text-muted-foreground">
          Restaurants, menu items, and every order moving through your
          marketplace.
        </p>
      </header>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
        <StatCard
          data-ocid="admin.stat_card.restaurants"
          label="Restaurants"
          value={Number(data.restaurantCount)}
          icon={Store}
          tone="primary"
          hint="Live on the marketplace"
        />
        <StatCard
          data-ocid="admin.stat_card.menu_items"
          label="Menu items"
          value={Number(data.menuItemCount)}
          icon={UtensilsCrossed}
          tone="accent"
          hint="Across all restaurants"
        />
        <StatCard
          data-ocid="admin.stat_card.total_orders"
          label="Total orders"
          value={totalOrders}
          icon={ClipboardList}
          tone="info"
          hint="All statuses"
        />
      </div>

      <div className="space-y-3">
        <h2 className="font-display text-lg font-bold text-foreground">
          Orders by status
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-5">
          {ORDER_STATUS_FLOW.map((status) => (
            <StatCard
              key={status}
              data-ocid={`admin.stat_card.status_${status}`}
              label={ORDER_STATUS_LABELS[status]}
              value={Number(counts[status])}
              icon={STATUS_ICONS[status] ?? ClipboardList}
              tone={
                status === "delivered"
                  ? "success"
                  : status === "outForDelivery"
                    ? "info"
                    : status === "preparing"
                      ? "warning"
                      : "muted"
              }
            />
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <h2 className="font-display text-lg font-bold text-foreground">
          Manage your marketplace
        </h2>
        <div className="grid gap-3 sm:grid-cols-3 sm:gap-4">
          {QUICK_LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              data-ocid={`admin.quick_link.${link.label.toLowerCase().replace(/\s+/g, "_")}`}
              className="group flex flex-col gap-2 rounded-2xl border border-border bg-card p-4 shadow-subtle transition-smooth hover:-translate-y-0.5 hover:shadow-card-hover"
            >
              <span className="flex size-10 items-center justify-center rounded-xl bg-secondary text-primary">
                <link.icon className="size-5" aria-hidden="true" />
              </span>
              <span className="font-display text-base font-bold text-foreground">
                {link.label}
              </span>
              <span className="text-sm text-muted-foreground">
                {link.description}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export function AdminDashboardPage() {
  return (
    <AdminGuard>
      <DashboardBody />
    </AdminGuard>
  );
}
