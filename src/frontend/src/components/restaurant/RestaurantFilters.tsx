import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { formatPesoShort } from "@/lib/format";
import { cn } from "@/lib/utils";
import { SlidersHorizontal, X } from "lucide-react";

/** Sentinel used by the Select primitives for "no constraint". */
export const ANY_VALUE = "any";

export interface RestaurantFilterState {
  sort: string;
  minRating: string;
  maxDeliveryMinutes: string;
  maxDeliveryFee: string;
  maxPrice: string;
}

export const DEFAULT_FILTER_STATE: RestaurantFilterState = {
  sort: ANY_VALUE,
  minRating: ANY_VALUE,
  maxDeliveryMinutes: ANY_VALUE,
  maxDeliveryFee: ANY_VALUE,
  maxPrice: ANY_VALUE,
};

const SORT_OPTIONS = [
  { value: "rating", label: "Top rated" },
  { value: "deliveryTime", label: "Fastest delivery" },
  { value: "deliveryFee", label: "Lowest delivery fee" },
  { value: "priceLowToHigh", label: "Price: low to high" },
] as const;

const RATING_OPTIONS = [
  { value: "40", label: "4.0 and up" },
  { value: "45", label: "4.5 and up" },
] as const;

const DELIVERY_TIME_OPTIONS = [
  { value: "20", label: "Under 20 min" },
  { value: "30", label: "Under 30 min" },
  { value: "45", label: "Under 45 min" },
] as const;

const DELIVERY_FEE_OPTIONS = [
  { value: "2900", label: "Under ₱29" },
  { value: "4900", label: "Under ₱49" },
  { value: "7900", label: "Under ₱79" },
] as const;

/** Price bands in centavos; the slider index maps into this table. */
const PRICE_BANDS = [
  { value: ANY_VALUE, label: "Any price" },
  { value: "15000", label: "Under ₱150" },
  { value: "30000", label: "Under ₱300" },
  { value: "50000", label: "Under ₱500" },
  { value: "100000", label: "Under ₱1,000" },
] as const;

const MAX_PRICE_INDEX = PRICE_BANDS.length - 1;

interface RestaurantFiltersProps {
  value: RestaurantFilterState;
  onChange: (next: RestaurantFilterState) => void;
  className?: string;
}

/**
 * Sort and filter controls for the restaurant feed. Every change is written
 * straight back to the URL search params by the owning page.
 */
export function RestaurantFilters({
  value,
  onChange,
  className,
}: RestaurantFiltersProps) {
  const priceIndex = Math.max(
    0,
    PRICE_BANDS.findIndex((band) => band.value === value.maxPrice),
  );

  const isFiltered =
    value.minRating !== ANY_VALUE ||
    value.maxDeliveryMinutes !== ANY_VALUE ||
    value.maxDeliveryFee !== ANY_VALUE ||
    value.maxPrice !== ANY_VALUE;

  const patch = (partial: Partial<RestaurantFilterState>) =>
    onChange({ ...value, ...partial });

  return (
    <section
      data-ocid="home.filters_panel"
      aria-label="Filter and sort restaurants"
      className={cn(
        "rounded-2xl border border-border bg-card p-3 shadow-subtle sm:p-4",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 font-display text-sm font-bold text-foreground">
          <SlidersHorizontal
            className="size-4 text-primary"
            aria-hidden="true"
          />
          Filter &amp; sort
        </h2>
        {isFiltered ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            data-ocid="home.clear_filters_button"
            onClick={() =>
              onChange({ ...DEFAULT_FILTER_STATE, sort: value.sort })
            }
            className="h-8 rounded-full px-2.5 text-xs font-semibold text-primary"
          >
            <X className="size-3.5" aria-hidden="true" />
            Clear
          </Button>
        ) : null}
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className="col-span-2 space-y-1.5 lg:col-span-1">
          <Label
            htmlFor="filter-sort"
            className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground"
          >
            Sort by
          </Label>
          <Select
            value={value.sort}
            onValueChange={(next) => patch({ sort: next })}
          >
            <SelectTrigger
              id="filter-sort"
              data-ocid="home.sort_select"
              className="h-10 rounded-xl"
            >
              <SelectValue placeholder="Recommended" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ANY_VALUE}>Recommended</SelectItem>
              {SORT_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label
            htmlFor="filter-rating"
            className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground"
          >
            Rating
          </Label>
          <Select
            value={value.minRating}
            onValueChange={(next) => patch({ minRating: next })}
          >
            <SelectTrigger
              id="filter-rating"
              data-ocid="home.rating_select"
              className="h-10 rounded-xl"
            >
              <SelectValue placeholder="Any rating" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ANY_VALUE}>Any rating</SelectItem>
              {RATING_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label
            htmlFor="filter-delivery-time"
            className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground"
          >
            Delivery time
          </Label>
          <Select
            value={value.maxDeliveryMinutes}
            onValueChange={(next) => patch({ maxDeliveryMinutes: next })}
          >
            <SelectTrigger
              id="filter-delivery-time"
              data-ocid="home.delivery_time_select"
              className="h-10 rounded-xl"
            >
              <SelectValue placeholder="Any time" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ANY_VALUE}>Any time</SelectItem>
              {DELIVERY_TIME_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label
            htmlFor="filter-delivery-fee"
            className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground"
          >
            Delivery fee
          </Label>
          <Select
            value={value.maxDeliveryFee}
            onValueChange={(next) => patch({ maxDeliveryFee: next })}
          >
            <SelectTrigger
              id="filter-delivery-fee"
              data-ocid="home.delivery_fee_select"
              className="h-10 rounded-xl"
            >
              <SelectValue placeholder="Any fee" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ANY_VALUE}>Any fee</SelectItem>
              {DELIVERY_FEE_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="col-span-2 space-y-2 lg:col-span-4">
          <div className="flex items-center justify-between">
            <Label
              id="filter-price-label"
              className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground"
            >
              Price range
            </Label>
            <span
              id="filter-price-value"
              className="price text-xs font-semibold text-foreground"
            >
              {PRICE_BANDS[priceIndex].label}
            </span>
          </div>
          <Slider
            data-ocid="home.price_slider"
            aria-labelledby="filter-price-label filter-price-value"
            aria-valuetext={PRICE_BANDS[priceIndex].label}
            min={0}
            max={MAX_PRICE_INDEX}
            step={1}
            value={[priceIndex]}
            onValueChange={([next]) =>
              patch({ maxPrice: PRICE_BANDS[next]?.value ?? ANY_VALUE })
            }
            className="py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          />
          <div className="flex justify-between text-[10px] text-muted-foreground">
            <span>Any</span>
            <span>{formatPesoShort(100000n)}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
