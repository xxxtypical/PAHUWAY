import { RestaurantConflictDialog } from "@/components/cart/RestaurantConflictDialog";
import type { RestaurantConflict } from "@/components/cart/RestaurantConflictDialog";
import { Currency } from "@/components/common/Currency";
import { EmptyState } from "@/components/common/EmptyState";
import { LoadingRows } from "@/components/common/LoadingState";
import { MenuCategorySection } from "@/components/restaurant/MenuCategorySection";
import { Button } from "@/components/ui/button";
import { useCartContext } from "@/context/CartContext";
import { useAddToCart } from "@/hooks/use-cart";
import { useMenuByCategory, useRestaurant } from "@/hooks/use-restaurants";
import {
  blobUrl,
  formatDeliveryTime,
  formatPeso,
  formatRating,
  hasImage,
} from "@/lib/format";
import { cn } from "@/lib/utils";
import { Link, useParams } from "@tanstack/react-router";
import {
  ArrowLeft,
  Clock,
  ShoppingBag,
  Star,
  Store,
  Truck,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

/** Restaurant detail: hero cover, key facts, and the categorized menu. */
export function RestaurantPage() {
  const { id } = useParams({ from: "/restaurant/$id" });
  const restaurantId = BigInt(id);

  const { data: detail, isLoading, isError } = useRestaurant(restaurantId);
  const { data: categories = [], isLoading: menuLoading } =
    useMenuByCategory(restaurantId);
  const { itemCount, total } = useCartContext();
  const addToCart = useAddToCart();

  const [conflict, setConflict] = useState<RestaurantConflict | null>(null);
  const [pendingItem, setPendingItem] = useState<{
    menuItemId: bigint;
    quantity: bigint;
  } | null>(null);

  const restaurant = detail?.restaurant;

  const handleConflict = (
    info: RestaurantConflict,
    requested: { menuItemId: bigint; quantity: bigint },
  ) => {
    setConflict(info);
    setPendingItem(requested);
  };

  const handleConfirmReplace = () => {
    if (!conflict || pendingItem === null) {
      setConflict(null);
      return;
    }
    addToCart.mutate(
      {
        restaurantId: conflict.requestedRestaurantId,
        menuItemId: pendingItem.menuItemId,
        quantity: pendingItem.quantity,
      },
      {
        onSuccess: (result) => {
          if (result.__kind__ === "differentRestaurant") {
            toast.error("Could not start a new cart. Please try again.");
            return;
          }
          toast.success("New cart started");
          setConflict(null);
          setPendingItem(null);
        },
        onError: () => toast.error("Could not start a new cart."),
      },
    );
  };

  if (isLoading) {
    return (
      <section data-ocid="restaurant.page" className="space-y-4">
        <div className="h-44 animate-pulse rounded-2xl bg-muted sm:h-60" />
        <LoadingRows count={4} />
      </section>
    );
  }

  if (isError || !restaurant) {
    return (
      <section data-ocid="restaurant.page" className="py-6">
        <EmptyState
          icon={Store}
          title="Restaurant not found"
          description="This restaurant may have closed or is no longer on Sagana."
          action={
            <Button asChild className="rounded-full">
              <Link to="/" data-ocid="restaurant.back_home_link">
                Browse restaurants
              </Link>
            </Button>
          }
        />
      </section>
    );
  }

  return (
    <section data-ocid="restaurant.page" className="animate-fade-in space-y-5">
      <Button
        asChild
        variant="ghost"
        size="sm"
        className="-ml-2 rounded-full text-muted-foreground"
      >
        <Link to="/" data-ocid="restaurant.back_link">
          <ArrowLeft className="size-4" aria-hidden="true" />
          Back to restaurants
        </Link>
      </Button>

      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl bg-muted shadow-card">
        {hasImage(restaurant.coverImageUrl) ? (
          <img
            src={blobUrl(restaurant.coverImageUrl)}
            alt={`${restaurant.name} cover`}
            className="h-44 w-full object-cover sm:h-60"
          />
        ) : (
          <img
            src="/assets/images/placeholder.svg"
            alt=""
            aria-hidden="true"
            className="h-44 w-full object-cover sm:h-60"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/75 via-foreground/10 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 space-y-1.5 p-4">
          {restaurant.promoLabel ? (
            <span className="inline-block rounded-full bg-accent px-2.5 py-1 text-xs font-bold text-accent-foreground">
              {restaurant.promoLabel}
            </span>
          ) : null}
          <h1 className="font-display text-2xl font-extrabold tracking-tight text-background sm:text-3xl">
            {restaurant.name}
          </h1>
          <p className="text-sm font-semibold text-background/85">
            {restaurant.cuisine}
          </p>
        </div>
      </div>

      {/* Key facts */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Fact
          icon={Star}
          label="Rating"
          value={
            restaurant.ratingCount > 0n
              ? `${formatRating(restaurant.rating)} (${restaurant.ratingCount})`
              : "New"
          }
          accent
        />
        <Fact
          icon={Clock}
          label="Delivery"
          value={formatDeliveryTime(restaurant.estimatedDeliveryMinutes)}
        />
        <Fact
          icon={Truck}
          label="Delivery fee"
          value={formatPeso(restaurant.deliveryFee)}
        />
        <Fact
          icon={Store}
          label="Hours"
          value={restaurant.operatingHours || "Open daily"}
        />
      </div>

      {restaurant.description ? (
        <p className="text-sm leading-relaxed text-muted-foreground">
          {restaurant.description}
        </p>
      ) : null}

      {/* Menu */}
      <div className="space-y-6 pt-2">
        <h2 className="font-display text-xl font-extrabold tracking-tight text-foreground">
          Menu
        </h2>

        {menuLoading ? (
          <LoadingRows count={4} />
        ) : categories.length === 0 ? (
          <EmptyState
            icon={Store}
            title="Menu coming soon"
            description="This restaurant has not published any dishes yet."
          />
        ) : (
          categories.map((category, index) => (
            <MenuCategorySection
              key={category.category}
              category={category}
              onConflict={handleConflict}
              startIndex={categories
                .slice(0, index)
                .reduce((sum, c) => sum + c.items.length, 0)}
            />
          ))
        )}
      </div>

      {/* Sticky cart bar */}
      {itemCount > 0 ? (
        <div className="safe-bottom fixed inset-x-0 bottom-16 z-30 px-4 md:bottom-4">
          <Button
            asChild
            size="lg"
            data-ocid="restaurant.view_cart_button"
            className="mx-auto flex w-full max-w-md items-center justify-between rounded-full font-semibold shadow-card-hover"
          >
            <Link to="/cart">
              <span className="flex items-center gap-2">
                <ShoppingBag className="size-5" aria-hidden="true" />
                View cart · {itemCount} item{itemCount === 1 ? "" : "s"}
              </span>
              <span className="price">₱{(Number(total) / 100).toFixed(2)}</span>
            </Link>
          </Button>
        </div>
      ) : null}

      <RestaurantConflictDialog
        conflict={conflict}
        isPending={addToCart.isPending}
        onCancel={() => {
          setConflict(null);
          setPendingItem(null);
        }}
        onConfirm={handleConfirmReplace}
      />
    </section>
  );
}

function Fact({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: typeof Star;
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-3 shadow-subtle">
      <div className="flex items-center gap-1.5">
        <Icon
          className={cn("size-4", accent ? "text-accent" : "text-primary")}
          aria-hidden="true"
        />
        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
      </div>
      <p className="mt-1 truncate font-display text-sm font-bold text-foreground">
        {value}
      </p>
    </div>
  );
}
