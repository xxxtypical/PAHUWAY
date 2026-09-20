import type { Restaurant } from "@/backend";
import { Currency } from "@/components/common/Currency";
import { Badge } from "@/components/ui/badge";
import {
  blobUrl,
  formatDeliveryMinutes,
  formatRating,
  hasImage,
} from "@/lib/format";
import { cn } from "@/lib/utils";
import { Link } from "@tanstack/react-router";
import { Bike, Clock, Star } from "lucide-react";

interface RestaurantCardProps {
  restaurant: Restaurant;
  /** 1-based position, used for deterministic test markers. */
  index?: number;
  className?: string;
}

/**
 * Marketplace restaurant tile: food photography hero with an optional promo
 * badge, then name, cuisine, rating, delivery estimate, and fee.
 */
export function RestaurantCard({
  restaurant,
  index,
  className,
}: RestaurantCardProps) {
  const {
    id,
    name,
    cuisine,
    coverImageUrl,
    rating,
    ratingCount,
    estimatedDeliveryMinutes,
    deliveryFee,
    promoLabel,
  } = restaurant;

  const hasRating = ratingCount > 0n;

  return (
    <Link
      to="/restaurant/$id"
      params={{ id: String(id) }}
      data-ocid={
        index === undefined ? "restaurant.card" : `restaurant.item.${index}`
      }
      className={cn(
        "group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-subtle transition-smooth hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        className,
      )}
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-secondary">
        <img
          src={
            hasImage(coverImageUrl)
              ? blobUrl(coverImageUrl)
              : "/assets/images/placeholder.svg"
          }
          alt={`${name} — ${cuisine}`}
          loading="lazy"
          className="size-full object-cover transition-smooth group-hover:scale-[1.04]"
        />
        {promoLabel ? (
          <Badge
            data-ocid={
              index === undefined
                ? "restaurant.promo_badge"
                : `restaurant.promo_badge.${index}`
            }
            className="absolute left-2 top-2 rounded-full border-0 bg-accent px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-accent-foreground shadow-subtle"
          >
            {promoLabel}
          </Badge>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-3">
        <div className="min-w-0">
          <h3 className="truncate font-display text-sm font-bold text-foreground sm:text-base">
            {name}
          </h3>
          <p className="truncate text-xs text-muted-foreground">{cuisine}</p>
        </div>

        <div className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Star
              className="size-3.5 fill-accent text-accent"
              aria-hidden="true"
            />
            <span className="font-semibold text-foreground">
              {hasRating ? formatRating(rating) : "New"}
            </span>
            {hasRating ? (
              <span className="text-muted-foreground">
                ({Number(ratingCount)})
              </span>
            ) : null}
          </span>

          <span className="flex items-center gap-1">
            <Clock className="size-3.5" aria-hidden="true" />
            {formatDeliveryMinutes(estimatedDeliveryMinutes)}
          </span>

          <span className="flex items-center gap-1">
            <Bike className="size-3.5" aria-hidden="true" />
            <Currency value={deliveryFee} short muted className="text-xs" />
          </span>
        </div>
      </div>
    </Link>
  );
}
