import { Currency } from "@/components/common/Currency";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface CartSummaryProps {
  subtotal: bigint;
  deliveryFee: bigint;
  total: bigint;
  /** Optional primary action rendered under the totals. */
  action?: ReactNode;
  className?: string;
  "data-ocid"?: string;
}

/** Item subtotal, delivery fee, and grand total in Philippine pesos. */
export function CartSummary({
  subtotal,
  deliveryFee,
  total,
  action,
  className,
  "data-ocid": dataOcid = "cart.summary",
}: CartSummaryProps) {
  return (
    <section
      data-ocid={dataOcid}
      className={cn(
        "space-y-3 rounded-2xl border border-border bg-card p-4 shadow-card",
        className,
      )}
    >
      <h2 className="font-display text-base font-extrabold tracking-tight text-foreground">
        Order summary
      </h2>

      <dl className="space-y-2 text-sm">
        <div className="flex items-center justify-between gap-3">
          <dt className="text-muted-foreground">Item subtotal</dt>
          <dd>
            <Currency
              value={subtotal}
              data-ocid="cart.subtotal"
              className="font-semibold"
            />
          </dd>
        </div>
        <div className="flex items-center justify-between gap-3">
          <dt className="text-muted-foreground">Delivery fee</dt>
          <dd>
            <Currency
              value={deliveryFee}
              data-ocid="cart.delivery_fee"
              className="font-semibold"
            />
          </dd>
        </div>
        <div className="flex items-center justify-between gap-3 border-t border-border pt-3">
          <dt className="font-display text-base font-extrabold text-foreground">
            Total
          </dt>
          <dd>
            <Currency
              value={total}
              data-ocid="cart.total"
              className="text-lg font-extrabold text-primary"
            />
          </dd>
        </div>
      </dl>

      {action ? <div className="pt-1">{action}</div> : null}
    </section>
  );
}
