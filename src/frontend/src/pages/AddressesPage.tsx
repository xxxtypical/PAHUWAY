import { AddressCard } from "@/components/addresses/AddressCard";
import { AddressForm } from "@/components/addresses/AddressForm";
import { EmptyState } from "@/components/common/EmptyState";
import { LoadingRows } from "@/components/common/LoadingState";
import { Button } from "@/components/ui/button";
import {
  useAddAddress,
  useAddresses,
  useDeleteAddress,
  useSetDefaultAddress,
  useUpdateAddress,
} from "@/hooks/use-addresses";
import type { Address, AddressInput } from "@/types";
import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import { LogIn, MapPin, Plus, RefreshCw } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

type FormMode =
  | { kind: "closed" }
  | { kind: "create" }
  | { kind: "edit"; address: Address };

/** Manage saved delivery addresses: add, edit, set default, and delete. */
export function AddressesPage() {
  const { isAuthenticated, isInitializing, isLoggingIn, login } =
    useInternetIdentity();
  const { data: addresses = [], isLoading, isError, refetch } = useAddresses();
  const addAddress = useAddAddress();
  const updateAddress = useUpdateAddress();
  const setDefault = useSetDefaultAddress();
  const deleteAddress = useDeleteAddress();

  const [formMode, setFormMode] = useState<FormMode>({ kind: "closed" });
  const [formError, setFormError] = useState<string | undefined>(undefined);

  const closeForm = () => {
    setFormMode({ kind: "closed" });
    setFormError(undefined);
  };

  const handleSubmit = (values: AddressInput) => {
    setFormError(undefined);
    if (formMode.kind === "edit") {
      updateAddress.mutate(
        { id: formMode.address.id, values },
        {
          onSuccess: () => {
            toast.success("Address updated.");
            closeForm();
          },
          onError: () =>
            setFormError("Could not save this address. Try again."),
        },
      );
      return;
    }
    addAddress.mutate(values, {
      onSuccess: () => {
        toast.success("Address saved.");
        closeForm();
      },
      onError: () => setFormError("Could not save this address. Try again."),
    });
  };

  const handleSetDefault = (address: Address) => {
    setDefault.mutate(address.id, {
      onSuccess: () =>
        toast.success(`${address.addressLabel} is now your default.`),
      onError: () => toast.error("Could not update the default address."),
    });
  };

  const handleDelete = (address: Address) => {
    deleteAddress.mutate(address.id, {
      onSuccess: () => toast.success("Address removed."),
      onError: () => toast.error("Could not remove this address."),
    });
  };

  if (!isAuthenticated) {
    return (
      <section data-ocid="addresses.page" className="py-6">
        <EmptyState
          icon={LogIn}
          title="Sign in to manage addresses"
          description="Saved addresses are tied to your account so checkout is faster on every device."
          action={
            <Button
              type="button"
              onClick={() => login()}
              disabled={isInitializing || isLoggingIn}
              data-ocid="addresses.sign_in_button"
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

  const isEditing = formMode.kind === "edit";
  const isPending = isEditing ? updateAddress.isPending : addAddress.isPending;

  return (
    <section data-ocid="addresses.page" className="space-y-4">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div className="space-y-1">
          <h1 className="font-display text-2xl font-extrabold tracking-tight text-foreground">
            Saved addresses
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage the barangays and landmarks you deliver to.
          </p>
        </div>
        {formMode.kind === "closed" ? (
          <Button
            type="button"
            onClick={() => setFormMode({ kind: "create" })}
            data-ocid="addresses.add_button"
            className="rounded-full font-semibold"
          >
            <Plus className="size-4" aria-hidden="true" />
            Add address
          </Button>
        ) : null}
      </header>

      {formMode.kind !== "closed" ? (
        <AddressForm
          address={formMode.kind === "edit" ? formMode.address : undefined}
          onSubmit={handleSubmit}
          onCancel={closeForm}
          isPending={isPending}
          errorMessage={formError}
        />
      ) : null}

      {isLoading ? (
        <LoadingRows count={3} />
      ) : isError ? (
        <EmptyState
          icon={RefreshCw}
          title="We couldn't load your addresses"
          description="Something went wrong while fetching your saved addresses. Check your connection and try again."
          action={
            <Button
              type="button"
              onClick={() => void refetch()}
              data-ocid="addresses.retry_button"
              className="rounded-full font-semibold"
            >
              Try again
            </Button>
          }
        />
      ) : addresses.length === 0 ? (
        <EmptyState
          icon={MapPin}
          title="No saved addresses yet"
          description="Add your home or office address so checkout takes seconds next time."
          action={
            <Button
              type="button"
              onClick={() => setFormMode({ kind: "create" })}
              data-ocid="addresses.empty_add_button"
              className="rounded-full font-semibold"
            >
              <Plus className="size-4" aria-hidden="true" />
              Add your first address
            </Button>
          }
        />
      ) : (
        <div data-ocid="addresses.list" className="space-y-3">
          {addresses.map((address, index) => (
            <AddressCard
              key={String(address.id)}
              address={address}
              index={index + 1}
              onEdit={(target) => {
                setFormError(undefined);
                setFormMode({ kind: "edit", address: target });
              }}
              onSetDefault={handleSetDefault}
              onDelete={handleDelete}
              isSettingDefault={
                setDefault.isPending && setDefault.variables === address.id
              }
              isDeleting={
                deleteAddress.isPending &&
                deleteAddress.variables === address.id
              }
            />
          ))}
        </div>
      )}
    </section>
  );
}
