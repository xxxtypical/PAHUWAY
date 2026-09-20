import { cn } from "@/lib/utils";
import { PaymentMethod } from "@/types";
import { Banknote, CreditCard } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface PaymentOption {
  value: PaymentMethod;
  label: string;
  description: string;
  icon: LucideIcon;
}

const PAYMENT_OPTIONS: PaymentOption[] = [
  {
    value: PaymentMethod.cashOnDelivery,
    label: "Cash on delivery",
    description: "Pay the rider in cash when your order arrives.",
    icon: Banknote,
  },
  {
    value: PaymentMethod.card,
    label: "Card payment",
    description: "Pay online with a credit or debit card.",
    icon: CreditCard,
  },
];

interface PaymentMethodSelectorProps {
  value: PaymentMethod;
  onChange: (method: PaymentMethod) => void;
  className?: string;
}

/** Radio group for choosing Cash on Delivery or card payment. */
export function PaymentMethodSelector({
  value,
  onChange,
  className,
}: PaymentMethodSelectorProps) {
  return (
    <fieldset
      data-ocid="checkout.payment_method"
      className={cn("space-y-2", className)}
    >
      <legend className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        Payment method
      </legend>

      {PAYMENT_OPTIONS.map((option) => {
        const selected = value === option.value;
        const Icon = option.icon;
        return (
          <label
            key={option.value}
            data-ocid={`checkout.payment_option.${option.value}`}
            className={cn(
              "flex cursor-pointer items-start gap-3 rounded-2xl border p-3 transition-smooth",
              selected
                ? "border-primary bg-primary/5 shadow-subtle"
                : "border-border bg-card hover:border-primary/40 hover:bg-secondary",
            )}
          >
            <input
              type="radio"
              name="payment-method"
              value={option.value}
              checked={selected}
              onChange={() => onChange(option.value)}
              data-ocid={`checkout.payment_radio.${option.value}`}
              className="sr-only"
            />
            <span
              className={cn(
                "flex size-10 shrink-0 items-center justify-center rounded-full",
                selected
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground",
              )}
            >
              <Icon className="size-5" aria-hidden="true" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-display text-sm font-bold text-foreground">
                {option.label}
              </span>
              <span className="block text-xs text-muted-foreground">
                {option.description}
              </span>
            </span>
            <span
              aria-hidden="true"
              className={cn(
                "mt-1 flex size-5 shrink-0 items-center justify-center rounded-full border-2",
                selected ? "border-primary" : "border-input",
              )}
            >
              {selected ? (
                <span className="size-2.5 rounded-full bg-primary" />
              ) : null}
            </span>
          </label>
        );
      })}
    </fieldset>
  );
}
