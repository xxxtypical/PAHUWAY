import type { RestaurantFilter, RestaurantSort } from "@/backend";
import { EmptyState } from "@/components/common/EmptyState";
import { LoadingState } from "@/components/common/LoadingState";
import { ActiveOrderBanner } from "@/components/home/ActiveOrderBanner";
import { PromoBanner } from "@/components/home/PromoBanner";
import { CuisineChips } from "@/components/restaurant/CuisineChips";
import { RestaurantCard } from "@/components/restaurant/RestaurantCard";
import {
  ANY_VALUE,
  DEFAULT_FILTER_STATE,
  type RestaurantFilterState,
  RestaurantFilters,
} from "@/components/restaurant/RestaurantFilters";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRestaurants } from "@/hooks/use-restaurants";
import { CUISINES } from "@/lib/constants";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { Search, Store } from "lucide-react";
import { type FormEvent, useCallback, useState } from "react";

const SORT_VALUES: readonly string[] = [
  "rating",
  "deliveryTime",
  "deliveryFee",
  "priceLowToHigh",
];

function toSort(value: string): RestaurantSort | undefined {
  return SORT_VALUES.includes(value) ? (value as RestaurantSort) : undefined;
}

function toBigInt(value: string): bigint | undefined {
  if (value === ANY_VALUE) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? BigInt(Math.trunc(parsed)) : undefined;
}

function toFilter(state: RestaurantFilterState): RestaurantFilter {
  return {
    sort: toSort(state.sort),
    minRating: toBigInt(state.minRating),
    maxDeliveryMinutes: toBigInt(state.maxDeliveryMinutes),
    maxDeliveryFee: toBigInt(state.maxDeliveryFee),
    maxPrice: toBigInt(state.maxPrice),
  };
}

/**
 * Customer home feed: search entry, delivery address, cuisine rail, promo
 * strip, live order banner, filters, and the restaurant grid. Filter, sort,
 * and cuisine selections live in the URL so they survive a refresh.
 */
export function HomePage() {
  const navigate = useNavigate();
  const search = useSearch({ from: "/" });
  const [searchTerm, setSearchTerm] = useState("");

  const cuisine = search.cuisine;
  const filters: RestaurantFilterState = {
    sort: search.sort ?? DEFAULT_FILTER_STATE.sort,
    minRating: search.minRating ?? DEFAULT_FILTER_STATE.minRating,
    maxDeliveryMinutes:
      search.maxDeliveryMinutes ?? DEFAULT_FILTER_STATE.maxDeliveryMinutes,
    maxDeliveryFee:
      search.maxDeliveryFee ?? DEFAULT_FILTER_STATE.maxDeliveryFee,
    maxPrice: search.maxPrice ?? DEFAULT_FILTER_STATE.maxPrice,
  };

  const writeSearch = useCallback(
    (next: {
      sort?: string;
      minRating?: string;
      maxDeliveryMinutes?: string;
      maxDeliveryFee?: string;
      maxPrice?: string;
      cuisine?: string;
    }) => {
      void navigate({
        to: "/",
        search: (prev) => ({ ...prev, ...next }),
        replace: true,
      });
    },
    [navigate],
  );

  const setFilters = useCallback(
    (next: RestaurantFilterState) => {
      writeSearch({
        sort: next.sort === ANY_VALUE ? undefined : next.sort,
        minRating: next.minRating === ANY_VALUE ? undefined : next.minRating,
        maxDeliveryMinutes:
          next.maxDeliveryMinutes === ANY_VALUE
            ? undefined
            : next.maxDeliveryMinutes,
        maxDeliveryFee:
          next.maxDeliveryFee === ANY_VALUE ? undefined : next.maxDeliveryFee,
        maxPrice: next.maxPrice === ANY_VALUE ? undefined : next.maxPrice,
      });
    },
    [writeSearch],
  );

  const setCuisine = useCallback(
    (next: string | undefined) => {
      writeSearch({ cuisine: next });
    },
    [writeSearch],
  );

  const {
    data: restaurants = [],
    isLoading,
    isError,
    refetch,
  } = useRestaurants({ ...toFilter(filters), cuisine });

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const term = searchTerm.trim();
    void navigate({
      to: "/search",
      search: term.length > 0 ? { q: term } : {},
    });
  };

  return (
    <div data-ocid="home.page" className="space-y-5">
      <section className="space-y-3">
        <div className="space-y-1">
          <h1 className="font-display text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
            What are you craving today?
          </h1>
          <p className="text-sm text-muted-foreground">
            Filipino favorites, milk tea, and late-night silog — delivered to
            your barangay.
          </p>
        </div>

        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search restaurants or dishes"
              aria-label="Search restaurants or dishes"
              data-ocid="home.search_input"
              className="h-12 rounded-full border-border bg-card pl-9 pr-3 text-sm shadow-subtle"
            />
          </div>
          <Button
            type="submit"
            data-ocid="home.search_button"
            className="h-12 shrink-0 rounded-full px-5 font-bold"
          >
            Search
          </Button>
        </form>
      </section>

      <CuisineChips
        cuisines={CUISINES}
        selected={cuisine}
        onSelect={setCuisine}
      />

      <PromoBanner />

      <ActiveOrderBanner />

      <RestaurantFilters value={filters} onChange={setFilters} />

      <section className="space-y-3">
        <div className="flex items-baseline justify-between gap-2">
          <h2 className="font-display text-lg font-extrabold text-foreground">
            {cuisine ? `${cuisine} near you` : "Popular near you"}
          </h2>
          {!isLoading && !isError ? (
            <span className="text-xs font-semibold text-muted-foreground">
              {restaurants.length}{" "}
              {restaurants.length === 1 ? "place" : "places"}
            </span>
          ) : null}
        </div>

        {isLoading ? (
          <LoadingState count={6} />
        ) : isError ? (
          <EmptyState
            data-ocid="home.error_state"
            icon={Store}
            title="We couldn't load restaurants"
            description="Something went wrong while fetching the marketplace. Check your connection and try again."
            action={
              <Button
                type="button"
                onClick={() => void refetch()}
                data-ocid="home.retry_button"
                className="rounded-full"
              >
                Try again
              </Button>
            }
          />
        ) : restaurants.length === 0 ? (
          <EmptyState
            data-ocid="home.empty_state"
            icon={Store}
            title="No restaurants match these filters"
            description="Try widening your price range, delivery time, or clearing the cuisine filter."
            action={
              <Button
                type="button"
                onClick={() => {
                  setFilters(DEFAULT_FILTER_STATE);
                  setCuisine(undefined);
                }}
                data-ocid="home.reset_filters_button"
                className="rounded-full"
              >
                Reset filters
              </Button>
            }
          />
        ) : (
          <div
            data-ocid="home.restaurant_list"
            className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4"
          >
            {restaurants.map((restaurant, index) => (
              <RestaurantCard
                key={String(restaurant.id)}
                restaurant={restaurant}
                index={index + 1}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
