import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Address, AddressInput } from "@/types";
import { useEffect, useState } from "react";

interface AddressFormProps {
  /** Existing address when editing; omitted when creating. */
  address?: Address;
  onSubmit: (values: AddressInput) => void;
  onCancel: () => void;
  isPending: boolean;
  errorMessage?: string;
}

interface DraftState {
  addressLabel: string;
  street: string;
  barangay: string;
  city: string;
  landmark: string;
}

const EMPTY_DRAFT: DraftState = {
  addressLabel: "",
  street: "",
  barangay: "",
  city: "",
  landmark: "",
};

function draftFromAddress(address?: Address): DraftState {
  if (!address) return EMPTY_DRAFT;
  return {
    addressLabel: address.addressLabel,
    street: address.street,
    barangay: address.barangay,
    city: address.city,
    landmark: address.landmark ?? "",
  };
}

/** Add or edit a saved delivery address. */
export function AddressForm({
  address,
  onSubmit,
  onCancel,
  isPending,
  errorMessage,
}: AddressFormProps) {
  const [draft, setDraft] = useState<DraftState>(() =>
    draftFromAddress(address),
  );

  // Re-seed the draft only when the form switches to a different record.
  useEffect(() => {
    setDraft(draftFromAddress(address));
  }, [address]);

  const isValid =
    draft.addressLabel.trim().length > 0 &&
    draft.street.trim().length > 0 &&
    draft.barangay.trim().length > 0 &&
    draft.city.trim().length > 0;

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isValid) return;
    onSubmit({
      addressLabel: draft.addressLabel.trim(),
      street: draft.street.trim(),
      barangay: draft.barangay.trim(),
      city: draft.city.trim(),
      landmark: draft.landmark.trim() || undefined,
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      data-ocid="address_form"
      className="space-y-4 rounded-2xl border border-border bg-card p-4 shadow-subtle sm:p-5"
    >
      <h3 className="font-display text-base font-bold text-foreground">
        {address ? "Edit address" : "Add a new address"}
      </h3>

      <div className="space-y-1.5">
        <Label htmlFor="address-label">Label</Label>
        <Input
          id="address-label"
          data-ocid="address_form.label_input"
          value={draft.addressLabel}
          onChange={(event) =>
            setDraft((prev) => ({ ...prev, addressLabel: event.target.value }))
          }
          placeholder="Home, Office, Lola's house"
          autoComplete="off"
          required
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="address-street">Street / building / unit</Label>
        <Input
          id="address-street"
          data-ocid="address_form.street_input"
          value={draft.street}
          onChange={(event) =>
            setDraft((prev) => ({ ...prev, street: event.target.value }))
          }
          placeholder="12F One Ayala Tower, Ayala Ave"
          autoComplete="street-address"
          required
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="address-barangay">Barangay</Label>
          <Input
            id="address-barangay"
            data-ocid="address_form.barangay_input"
            value={draft.barangay}
            onChange={(event) =>
              setDraft((prev) => ({ ...prev, barangay: event.target.value }))
            }
            placeholder="Bel-Air"
            autoComplete="address-level3"
            required
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="address-city">City</Label>
          <Input
            id="address-city"
            data-ocid="address_form.city_input"
            value={draft.city}
            onChange={(event) =>
              setDraft((prev) => ({ ...prev, city: event.target.value }))
            }
            placeholder="Makati"
            autoComplete="address-level2"
            required
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="address-landmark">
          Landmark{" "}
          <span className="font-normal text-muted-foreground">(optional)</span>
        </Label>
        <Input
          id="address-landmark"
          data-ocid="address_form.landmark_input"
          value={draft.landmark}
          onChange={(event) =>
            setDraft((prev) => ({ ...prev, landmark: event.target.value }))
          }
          placeholder="Beside Mercury Drug, across the barangay hall"
          autoComplete="off"
        />
      </div>

      {errorMessage ? (
        <p
          data-ocid="address_form.error_state"
          className="rounded-xl bg-destructive/10 px-3 py-2 text-sm font-medium text-destructive"
        >
          {errorMessage}
        </p>
      ) : null}

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          data-ocid="address_form.cancel_button"
          className="rounded-full font-semibold"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isPending || !isValid}
          data-ocid="address_form.submit_button"
          className="rounded-full font-semibold"
        >
          {isPending ? "Saving…" : address ? "Save changes" : "Save address"}
        </Button>
      </div>
    </form>
  );
}
