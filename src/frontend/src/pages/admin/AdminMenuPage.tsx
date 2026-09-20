import { AdminGuard } from "@/components/admin/AdminGuard";
import { MenuItemForm } from "@/components/admin/MenuItemForm";
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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useAddMenuItem,
  useAdminRestaurants,
  useRemoveMenuItem,
  useUpdateMenuItem,
} from "@/hooks/use-admin";
import { useRestaurant } from "@/hooks/use-restaurants";
import { blobUrl, formatPeso, hasImage } from "@/lib/format";
import type { MenuItem, MenuItemInput, Restaurant } from "@/types";
import {
  AlertCircle,
  Pencil,
  Plus,
  Trash2,
  UtensilsCrossed,
} from "lucide-react";
import { useState } from "react";

function MenuBody() {
  const {
    data: restaurants,
    isLoading,
    isError,
    refetch,
  } = useAdminRestaurants();
  const addMenuItem = useAddMenuItem();
  const updateMenuItem = useUpdateMenuItem();
  const removeMenuItem = useRemoveMenuItem();

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<MenuItem | null>(null);
  const [pendingRemove, setPendingRemove] = useState<MenuItem | null>(null);

  const list = restaurants ?? [];
  const selected: Restaurant | undefined =
    list.find((restaurant) => String(restaurant.id) === selectedId) ?? list[0];
  const selectedValue = selected ? String(selected.id) : undefined;

  const {
    data: detail,
    isLoading: isMenuLoading,
    isError: isMenuError,
    refetch: refetchMenu,
  } = useRestaurant(selected?.id);
  const menuItems = detail?.menu ?? [];

  const openAdd = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (item: MenuItem) => {
    setEditing(item);
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditing(null);
    addMenuItem.reset();
    updateMenuItem.reset();
  };

  const handleSubmit = (values: MenuItemInput) => {
    if (!selected) return;
    if (editing) {
      updateMenuItem.mutate(
        { itemId: editing.id, values },
        { onSuccess: () => closeForm() },
      );
    } else {
      addMenuItem.mutate(
        { restaurantId: selected.id, values },
        { onSuccess: () => closeForm() },
      );
    }
  };

  const confirmRemove = () => {
    if (!pendingRemove) return;
    removeMenuItem.mutate(pendingRemove.id, {
      onSuccess: () => setPendingRemove(null),
    });
  };

  const mutationError =
    addMenuItem.error ?? updateMenuItem.error ?? removeMenuItem.error;

  return (
    <section data-ocid="admin.menu.page" className="space-y-6">
      <header className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Merchant dashboard
        </p>
        <h1 className="font-display text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
          Menu
        </h1>
        <p className="text-sm text-muted-foreground">
          Add dishes, set prices, and control availability.
        </p>
      </header>

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
              data-ocid="admin.menu.retry_button"
              className="rounded-full font-semibold shadow-card"
            >
              Try again
            </Button>
          }
        />
      ) : list.length === 0 ? (
        <EmptyState
          data-ocid="admin.menu.empty_state"
          icon={UtensilsCrossed}
          title="No restaurants to manage"
          description="Create a restaurant first, then add its dishes here."
        />
      ) : (
        <>
          <div className="flex flex-wrap items-end justify-between gap-3 rounded-2xl border border-border bg-card p-4 shadow-subtle">
            <div className="w-full space-y-2 sm:max-w-xs">
              <Label htmlFor="menu-restaurant-select">Restaurant</Label>
              <Select
                value={selectedValue}
                onValueChange={(value) => setSelectedId(value)}
              >
                <SelectTrigger
                  id="menu-restaurant-select"
                  data-ocid="admin.menu.restaurant_select"
                  className="w-full rounded-xl"
                >
                  <SelectValue placeholder="Choose a restaurant" />
                </SelectTrigger>
                <SelectContent>
                  {list.map((restaurant) => (
                    <SelectItem
                      key={String(restaurant.id)}
                      value={String(restaurant.id)}
                    >
                      {restaurant.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              type="button"
              onClick={openAdd}
              data-ocid="admin.add_menu_item_button"
              className="rounded-full font-semibold shadow-card"
            >
              <Plus className="size-4" aria-hidden="true" />
              Add dish
            </Button>
          </div>

          {mutationError && !formOpen ? (
            <p
              data-ocid="admin.menu.error_state"
              className="rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
            >
              {mutationError.message}
            </p>
          ) : null}

          {isMenuLoading ? (
            <LoadingRows count={3} />
          ) : isMenuError ? (
            <EmptyState
              icon={AlertCircle}
              title="Could not load the menu"
              description="This restaurant's dishes could not be fetched. Check your connection and try again."
              action={
                <Button
                  type="button"
                  onClick={() => void refetchMenu()}
                  data-ocid="admin.menu.items_retry_button"
                  className="rounded-full font-semibold shadow-card"
                >
                  Try again
                </Button>
              }
            />
          ) : menuItems.length === 0 ? (
            <EmptyState
              data-ocid="admin.menu.items_empty_state"
              icon={UtensilsCrossed}
              title={`${selected?.name ?? "This restaurant"} has no dishes yet`}
              description="Add the first dish so customers can order from this restaurant."
              action={
                <Button
                  type="button"
                  onClick={openAdd}
                  data-ocid="admin.add_menu_item_empty_button"
                  className="rounded-full font-semibold shadow-card"
                >
                  <Plus className="size-4" aria-hidden="true" />
                  Add dish
                </Button>
              }
            />
          ) : (
            <ul data-ocid="admin.menu.list" className="space-y-3">
              {menuItems.map((item, index) => (
                <li
                  key={String(item.id)}
                  data-ocid={`admin.menu_item.${index + 1}`}
                  className="animate-fade-in-up flex flex-col gap-3 rounded-2xl border border-border bg-card p-3 shadow-subtle transition-smooth hover:shadow-card sm:flex-row sm:items-center"
                >
                  <div className="h-24 w-full shrink-0 overflow-hidden rounded-xl bg-muted sm:size-20">
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

                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-display text-base font-bold text-foreground">
                        {item.name}
                      </h2>
                      {item.category ? (
                        <Badge className="rounded-full border-transparent bg-secondary text-secondary-foreground">
                          {item.category}
                        </Badge>
                      ) : null}
                      <Badge
                        className={
                          item.available
                            ? "rounded-full border-transparent bg-success/15 text-success"
                            : "rounded-full border-transparent bg-muted text-muted-foreground"
                        }
                      >
                        {item.available ? "Available" : "Unavailable"}
                      </Badge>
                    </div>
                    <p className="line-clamp-2 text-sm text-muted-foreground">
                      {item.description || "No description yet."}
                    </p>
                    <p className="price text-base font-bold text-foreground">
                      {formatPeso(item.price)}
                    </p>
                  </div>

                  <div className="flex shrink-0 gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => openEdit(item)}
                      data-ocid={`admin.edit_menu_item_button.${index + 1}`}
                      className="rounded-full"
                    >
                      <Pencil className="size-4" aria-hidden="true" />
                      Edit
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setPendingRemove(item)}
                      data-ocid={`admin.remove_menu_item_button.${index + 1}`}
                      className="rounded-full text-destructive hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="size-4" aria-hidden="true" />
                      Remove
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </>
      )}

      <Dialog open={formOpen} onOpenChange={(open) => !open && closeForm()}>
        <DialogContent
          data-ocid="admin.menu_item_form.dialog"
          className="max-h-[90dvh] overflow-y-auto rounded-2xl sm:max-w-2xl"
        >
          <DialogHeader>
            <DialogTitle className="font-display text-xl font-bold">
              {editing ? `Edit ${editing.name}` : "Add a dish"}
            </DialogTitle>
            <DialogDescription>
              {selected
                ? `This dish will appear on ${selected.name}'s menu.`
                : "Choose a restaurant first."}
            </DialogDescription>
          </DialogHeader>
          <MenuItemForm
            item={editing ?? undefined}
            onSubmit={handleSubmit}
            onCancel={closeForm}
            isPending={addMenuItem.isPending || updateMenuItem.isPending}
            errorMessage={(addMenuItem.error ?? updateMenuItem.error)?.message}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={pendingRemove !== null}
        onOpenChange={(open) => !open && setPendingRemove(null)}
      >
        <AlertDialogContent
          data-ocid="admin.remove_menu_item.dialog"
          className="rounded-2xl"
        >
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display text-lg font-bold">
              Remove {pendingRemove?.name}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This dish will no longer appear on the menu. This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              data-ocid="admin.remove_menu_item_cancel_button"
              className="rounded-full"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmRemove}
              disabled={removeMenuItem.isPending}
              data-ocid="admin.remove_menu_item_confirm_button"
              className="rounded-full bg-destructive font-semibold text-destructive-foreground hover:bg-destructive/90"
            >
              {removeMenuItem.isPending ? "Removing…" : "Remove dish"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}

export function AdminMenuPage() {
  return (
    <AdminGuard>
      <MenuBody />
    </AdminGuard>
  );
}
