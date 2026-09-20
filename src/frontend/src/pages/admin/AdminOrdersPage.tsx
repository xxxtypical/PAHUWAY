import { AdminGuard } from "@/components/admin/AdminGuard";
import { AdminOrderRow } from "@/components/admin/AdminOrderRow";
import { EmptyState } from "@/components/common/EmptyState";
import { LoadingRows } from "@/components/common/LoadingState";
import { Button } from "@/components/ui/button";
import { useAdvanceOrderStatus, useAllOrders } from "@/hooks/use-admin";
import { ORDER_STATUS_FLOW, ORDER_STATUS_LABELS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { Order, OrderStatus } from "@/types";
import { AlertCircle, ClipboardList } from "lucide-react";
import { useState } from "react";

type StatusFilter = OrderStatus | "all";

const FILTERS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "All orders" },
  ...ORDER_STATUS_FLOW.map((status) => ({
    value: status,
    label: ORDER_STATUS_LABELS[status],
  })),
];

function OrdersBody() {
  const [filter, setFilter] = useState<StatusFilter>("all");
  const {
    data: orders,
    isLoading,
    isError,
    refetch,
  } = useAllOrders(filter === "all" ? null : filter);
  const advanceOrder = useAdvanceOrderStatus();
  const [advancingId, setAdvancingId] = useState<string | null>(null);

  const handleAdvance = (order: Order) => {
    setAdvancingId(String(order.id));
    advanceOrder.mutate(order.id, {
      onSettled: () => setAdvancingId(null),
    });
  };

  return (
    <section data-ocid="admin.orders.page" className="space-y-6">
      <header className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Merchant dashboard
        </p>
        <h1 className="font-display text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
          Incoming orders
        </h1>
        <p className="text-sm text-muted-foreground">
          Advance each order through the delivery timeline.
        </p>
      </header>

      <div
        data-ocid="admin.orders.filter.tabs"
        className="chip-rail -mx-4 flex gap-2 px-4 pb-1"
      >
        {FILTERS.map((option) => {
          const active = filter === option.value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => setFilter(option.value)}
              aria-pressed={active}
              data-ocid={`admin.orders.filter.${option.value}`}
              className={cn(
                "rounded-full border px-3.5 py-1.5 text-sm font-semibold transition-smooth",
                active
                  ? "border-transparent bg-primary text-primary-foreground shadow-card"
                  : "border-border bg-card text-muted-foreground hover:bg-secondary hover:text-foreground",
              )}
            >
              {option.label}
            </button>
          );
        })}
      </div>

      {advanceOrder.error ? (
        <p
          data-ocid="admin.orders.error_state"
          className="rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          {advanceOrder.error.message}
        </p>
      ) : null}

      {isLoading ? (
        <LoadingRows count={4} />
      ) : isError ? (
        <EmptyState
          icon={AlertCircle}
          title="Could not load orders"
          description="The order queue could not be fetched. Check your connection and try again."
          action={
            <Button
              type="button"
              onClick={() => void refetch()}
              data-ocid="admin.orders.retry_button"
              className="rounded-full font-semibold shadow-card"
            >
              Try again
            </Button>
          }
        />
      ) : !orders || orders.length === 0 ? (
        <EmptyState
          data-ocid="admin.orders.empty_state"
          icon={ClipboardList}
          title={
            filter === "all"
              ? "No orders yet"
              : `No ${ORDER_STATUS_LABELS[filter].toLowerCase()} orders`
          }
          description={
            filter === "all"
              ? "New orders will appear here the moment a customer checks out."
              : "Try a different status filter to see other orders."
          }
          action={
            filter === "all" ? undefined : (
              <Button
                type="button"
                onClick={() => setFilter("all")}
                data-ocid="admin.orders.show_all_button"
                className="rounded-full font-semibold shadow-card"
              >
                Show all orders
              </Button>
            )
          }
        />
      ) : (
        <ul data-ocid="admin.orders.list" className="space-y-3">
          {orders.map((order, index) => (
            <li key={String(order.id)}>
              <AdminOrderRow
                order={order}
                index={index}
                onAdvance={handleAdvance}
                isAdvancing={advancingId === String(order.id)}
              />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export function AdminOrdersPage() {
  return (
    <AdminGuard>
      <OrdersBody />
    </AdminGuard>
  );
}
