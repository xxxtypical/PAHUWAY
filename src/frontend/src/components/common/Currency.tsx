import type { Centavos } from "@/backend";
import { formatPeso, formatPesoShort } from "@/lib/format";
import { cn } from "@/lib/utils";

interface CurrencyProps {
  value: Centavos | number | undefined | null;
  className?: string;
  /** Render without centavos for dense card layouts. */
  short?: boolean;
  /** Muted styling for secondary amounts such as delivery fees. */
  muted?: boolean;
}

/** Philippine peso price with tabular figures for aligned columns. */
export function Currency({ value, className, short, muted }: CurrencyProps) {
  return (
    <span
      className={cn(
        "price",
        muted ? "text-muted-foreground" : "text-foreground",
        className,
      )}
    >
      {short ? formatPesoShort(value) : formatPeso(value)}
    </span>
  );
}
