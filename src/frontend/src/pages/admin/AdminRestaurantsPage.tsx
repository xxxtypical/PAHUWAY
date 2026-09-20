import { AdminGuard } from "@/components/admin/AdminGuard";
import { RestaurantForm } from "@/components/admin/RestaurantForm";
import { EmptyState } from "@/components/common/EmptyState";
import { LoadingRows } from "@/components/common/LoadingState";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  useAdminRestaurants,
  useCreateRestaurant,
  useDeleteRestaurant,
  useUpdateRestaurant,
} from "@/hooks/use-admin";
import {
  blobUrl,
  formatDeliveryMinutes,
  formatPeso,
  hasImage,
} from "@/lib/format";
import type { Restaurant, RestaurantInput } from "@/types";
import { AlertCircle, Pencil, Plus, Store, Trash2 } from "lucide-react";
import { useState } from "react";

function RestaurantsBody() {
  const {
    data: restaurants,
    isLoading,
    isError,
    refetch,
  } = useAdminRestaurants();
  const createRestaurant = useCreateRestaurant();
  const updateRestaurant = useUpdateRestaurant();
  const deleteRestaurant = useDeleteRestaurant();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Restaurant | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Restaurant | null>(null);

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (restaurant: Restaurant) => {
    setEditing(restaurant);
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditing(null);
    createRestaurant.reset();
    updateRestaurant.reset();
  };

  const handleSubmit = (values: RestaurantInput) => {
    if (editing) {
      updateRestaurant.mutate(
        { id: editing.id, values },
        { onSuccess: () => closeForm() },
      );
    } else {
      createRestaurant.mutate(values, { onSuccess: () => closeForm() });
    }
  };

  const confirmDelete = () => {
    if (!pendingDelete) return;
    deleteRestaurant.mutate(pendingDelete.id, {
      onSuccess: () => setPendingDelete(null),
    });
  };

  const mutationError =
    createRestaurant.error ?? updateRestaurant.error ?? deleteRestaurant.error;

  return (
    <section data-ocid="admin.restaurants.page" className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Merchant dashboard
          </p>
          <h1 className="font-display text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
            Restaurants
          </h1>
          <p className="text-sm text-muted-foreground">
            Create and manage the restaurants on your marketplace.
          </p>
        </div>
        <Button
          type="button"
          onClick={openCreate}
          data-ocid="admin.create_restaurant_button"
          className="rounded-full font-semibold shadow-card"
        >
          <Plus className="size-4" aria-hidden="true" />
          New restaurant
        </Button>
      </header>

      {mutationError && !formOpen ? (
        <p
          data-ocid="admin.restaurants.error_state"
          className="rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          {mutationError.message}
        </p>
      ) : null}

      {isLoading ? (
        <LoadingRows count={4} />
      ) : isError ? (
        <EmptyState
          icon={AlertCircle}
          title="Could not load restaurants"
          description="The restaurant list could not be fetched. Check your connection and try again."
          action={
            <Button
              type="button"
              onClick={() => void refetch()}
              data-ocid="admin.restaurants.retry_button"
              className="rounded-full font-semibold shadow-card"
            >
              Try again
            </Button>
          }
        />
      ) : !restaurants || restaurants.length === 0 ? (
        <EmptyState
          data-ocid="admin.restaurants.empty_state"
          icon={Store}
          title="No restaurants yet"
          description="Add your first restaurant to start listing dishes and receiving orders."
          action={
            <Button
              type="button"
              onClick={openCreate}
              data-ocid="admin.create_restaurant_empty_button"
              className="rounded-full font-semibold shadow-card"
            >
              <Plus className="size-4" aria-hidden="true" />
              New restaurant
            </Button>
          }
        />
      ) : (
        <ul data-ocid="admin.restaurants.list" className="space-y-3">
          {restaurants.map((restaurant, index) => (
            <li
              key={String(restaurant.id)}
              data-ocid={`admin.restaurant_item.${index + 1}`}
              className="animate-fade-in-up flex flex-col gap-3 rounded-2xl border border-border bg-card p-3 shadow-subtle transition-smooth hover:shadow-card sm:flex-row sm:items-center"
            >
              <div className="h-24 w-full shrink-0 overflow-hidden rounded-xl bg-muted sm:size-20">
                {hasImage(restaurant.coverImageUrl) ? (
                  <img
                    src={blobUrl(restaurant.coverImageUrl)}
                    alt={`${restaurant.name} cover`}
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

              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-display text-base font-bold text-foreground">
                    {restaurant.name}
                  </h2>
                  <Badge className="rounded-full border-transparent bg-primary/10 text-primary">
                    {restaurant.cuisine}
                  </Badge>
                  {restaurant.promoLabel ? (
                    <Badge className="rounded-full border-transparent bg-accent text-accent-foreground">
                      {restaurant.promoLabel}
                    </Badge>
                  ) : null}
                </div>
                <p className="line-clamp-2 text-sm text-muted-foreground">
                  {restaurant.description || "No description yet."}
                </p>
                <p className="text-xs text-muted-foreground">
                  <span className="price font-semibold text-foreground">
                    {formatPeso(restaurant.deliveryFee)}
                  </span>{" "}
                  delivery ·{" "}
                  {formatDeliveryMinutes(restaurant.estimatedDeliveryMinutes)} ·{" "}
                  {restaurant.operatingHours}
                </p>
              </div>

              <div className="flex shrink-0 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => openEdit(restaurant)}
                  data-ocid={`admin.edit_restaurant_button.${index + 1}`}
                  className="rounded-full"
                >
                  <Pencil className="size-4" aria-hidden="true" />
                  Edit
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setPendingDelete(restaurant)}
                  data-ocid={`admin.delete_restaurant_button.${index + 1}`}
                  className="rounded-full text-destructive hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash2 className="size-4" aria-hidden="true" />
                  Delete
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Dialog open={formOpen} onOpenChange={(open) => !open && closeForm()}>
        <DialogContent
          data-ocid="admin.restaurant_form.dialog"
          className="max-h-[90dvh] overflow-y-auto rounded-2xl sm:max-w-2xl"
        >
          <DialogHeader>
            <DialogTitle className="font-display text-xl font-bold">
              {editing ? `Edit ${editing.name}` : "New restaurant"}
            </DialogTitle>
            <DialogDescription>
              Delivery fee is entered in Philippine pesos and stored as
              centavos.
            </DialogDescription>
          </DialogHeader>
          <RestaurantForm
            restaurant={editing ?? undefined}
            onSubmit={handleSubmit}
            onCancel={closeForm}
            isPending={createRestaurant.isPending || updateRestaurant.isPending}
            errorMessage={
              (createRestaurant.error ?? updateRestaurant.error)?.message
            }
          />
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => !open && setPendingDelete(null)}
      >
        <AlertDialogContent
          data-ocid="admin.delete_restaurant.dialog"
          className="rounded-2xl"
        >
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display text-lg font-bold">
              Delete {pendingDelete?.name}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes the restaurant and all of its menu items.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              data-ocid="admin.delete_restaurant_cancel_button"
              className="rounded-full"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={deleteRestaurant.isPending}
              data-ocid="admin.delete_restaurant_confirm_button"
              className="rounded-full bg-destructive font-semibold text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteRestaurant.isPending ? "Deleting…" : "Delete restaurant"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}

export function AdminRestaurantsPage() {
  return (
    <AdminGuard>
      <RestaurantsBody />
    </AdminGuard>
  );
}
