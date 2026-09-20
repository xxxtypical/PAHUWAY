import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AlertTriangle } from "lucide-react";

export interface RestaurantConflict {
  requestedRestaurantId: bigint;
  requestedRestaurantName: string;
  currentRestaurantId: bigint;
  currentRestaurantName: string;
}

interface RestaurantConflictDialogProps {
  conflict: RestaurantConflict | null;
  onCancel: () => void;
  onConfirm: () => void;
  isPending?: boolean;
}

/**
 * Confirmation prompt shown when adding a dish would replace a cart that
 * already belongs to a different restaurant.
 */
export function RestaurantConflictDialog({
  conflict,
  onCancel,
  onConfirm,
  isPending = false,
}: RestaurantConflictDialogProps) {
  return (
    <Dialog
      open={conflict !== null}
      onOpenChange={(open) => {
        if (!open) onCancel();
      }}
    >
      <DialogContent
        data-ocid="restaurant_conflict.dialog"
        className="rounded-2xl sm:max-w-md"
      >
        <DialogHeader>
          <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-accent/20 text-accent-foreground sm:mx-0">
            <AlertTriangle className="size-6" aria-hidden="true" />
          </span>
          <DialogTitle className="font-display text-lg font-extrabold">
            Start a new cart?
          </DialogTitle>
          <DialogDescription>
            Your cart has dishes from{" "}
            <span className="font-semibold text-foreground">
              {conflict?.currentRestaurantName}
            </span>
            . Adding this dish from{" "}
            <span className="font-semibold text-foreground">
              {conflict?.requestedRestaurantName}
            </span>{" "}
            will clear your current cart.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="gap-2 sm:gap-2">
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
            disabled={isPending}
            data-ocid="restaurant_conflict.cancel_button"
            className="rounded-full font-semibold"
          >
            Keep current cart
          </Button>
          <Button
            type="button"
            onClick={onConfirm}
            disabled={isPending}
            data-ocid="restaurant_conflict.confirm_button"
            className="rounded-full font-semibold shadow-card"
          >
            {isPending ? "Replacing…" : "Replace cart"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
