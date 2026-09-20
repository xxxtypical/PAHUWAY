import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatAddressFull } from "@/lib/format";
import type { Address } from "@/types";
import { MapPin, Pencil, Star, Trash2 } from "lucide-react";

interface AddressCardProps {
  address: Address;
  /** 1-based position, used for deterministic test markers. */
  index: number;
  onEdit: (address: Address) => void;
  onSetDefault: (address: Address) => void;
  onDelete: (address: Address) => void;
  isSettingDefault: boolean;
  isDeleting: boolean;
}

/** A saved delivery address with edit, set-default, and delete actions. */
export function AddressCard({
  address,
  index,
  onEdit,
  onSetDefault,
  onDelete,
  isSettingDefault,
  isDeleting,
}: AddressCardProps) {
  return (
    <article
      data-ocid={`addresses.item.${index}`}
      className="rounded-2xl border border-border bg-card p-4 shadow-subtle transition-smooth hover:border-primary/40"
    >
      <div className="flex items-start gap-3">
        <span
          aria-hidden="true"
          className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-secondary text-primary"
        >
          <MapPin className="size-5" />
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="min-w-0 truncate font-display text-base font-bold text-foreground">
              {address.addressLabel}
            </h3>
            {address.isDefault ? (
              <Badge
                data-ocid={`addresses.default_badge.${index}`}
                className="rounded-full border-0 bg-accent px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-accent-foreground"
              >
                Default
              </Badge>
            ) : null}
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {formatAddressFull(address)}
          </p>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-border pt-3">
        {address.isDefault ? null : (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onSetDefault(address)}
            disabled={isSettingDefault}
            data-ocid={`addresses.set_default_button.${index}`}
            className="rounded-full font-semibold"
          >
            <Star className="size-4" aria-hidden="true" />
            {isSettingDefault ? "Setting…" : "Set as default"}
          </Button>
        )}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => onEdit(address)}
          data-ocid={`addresses.edit_button.${index}`}
          className="rounded-full font-semibold"
        >
          <Pencil className="size-4" aria-hidden="true" />
          Edit
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => onDelete(address)}
          disabled={isDeleting}
          data-ocid={`addresses.delete_button.${index}`}
          className="ml-auto rounded-full font-semibold text-destructive hover:bg-destructive/10 hover:text-destructive"
        >
          <Trash2 className="size-4" aria-hidden="true" />
          Delete
        </Button>
      </div>
    </article>
  );
}
