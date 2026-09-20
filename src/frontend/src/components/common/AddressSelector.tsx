import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAddresses, useSetDefaultAddress } from "@/hooks/use-addresses";
import { formatAddressShort } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Link } from "@tanstack/react-router";
import { ChevronDown, MapPin, Plus } from "lucide-react";

interface AddressSelectorProps {
  className?: string;
  /** Compact variant for the sticky header. */
  compact?: boolean;
}

/**
 * Delivery-address picker. Shows the default address and lets the caller
 * switch between saved addresses without leaving the current page.
 */
export function AddressSelector({ className, compact }: AddressSelectorProps) {
  const { data: addresses = [], isLoading } = useAddresses();
  const setDefault = useSetDefaultAddress();
  const current =
    addresses.find((address) => address.isDefault) ?? addresses[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          data-ocid="address_selector.open_button"
          aria-label="Change delivery address"
          className={cn(
            "group flex min-w-0 items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-left transition-smooth hover:border-primary/40 hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            className,
          )}
        >
          <MapPin className="size-4 shrink-0 text-primary" aria-hidden="true" />
          <span className="min-w-0">
            {compact ? null : (
              <span className="block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Delivering to
              </span>
            )}
            <span className="block truncate text-xs font-semibold text-foreground">
              {isLoading
                ? "Loading address…"
                : current
                  ? formatAddressShort(current)
                  : "Set your address"}
            </span>
          </span>
          <ChevronDown
            className="size-3.5 shrink-0 text-muted-foreground transition-transform group-data-[state=open]:rotate-180"
            aria-hidden="true"
          />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="w-72"
        data-ocid="address_selector.dropdown_menu"
      >
        <DropdownMenuLabel>Deliver to</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {addresses.length === 0 ? (
          <div className="px-2 py-3 text-sm text-muted-foreground">
            No saved addresses yet.
          </div>
        ) : (
          addresses.map((address, index) => (
            <DropdownMenuItem
              key={String(address.id)}
              data-ocid={`address_selector.item.${index + 1}`}
              onSelect={() => setDefault.mutate(address.id)}
              className="flex items-start gap-2"
            >
              <MapPin
                className="mt-0.5 size-4 shrink-0 text-primary"
                aria-hidden="true"
              />
              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold text-foreground">
                  {address.addressLabel}
                </span>
                <span className="block truncate text-xs text-muted-foreground">
                  {formatAddressShort(address)}
                </span>
              </span>
            </DropdownMenuItem>
          ))
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link
            to="/addresses"
            data-ocid="address_selector.manage_link"
            className="flex items-center gap-2 text-sm font-semibold text-primary"
          >
            <Plus className="size-4" aria-hidden="true" />
            Manage addresses
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/** Inline prompt shown when the caller has no saved address yet. */
export function AddressPrompt({ className }: { className?: string }) {
  return (
    <div
      data-ocid="address_selector.empty_state"
      className={cn(
        "flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-dashed border-border bg-card px-4 py-3",
        className,
      )}
    >
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <MapPin className="size-4 text-primary" aria-hidden="true" />
        Add a delivery address to check out faster.
      </div>
      <Button asChild size="sm" className="rounded-full">
        <Link to="/addresses" data-ocid="address_selector.add_button">
          Add address
        </Link>
      </Button>
    </div>
  );
}
