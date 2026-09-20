import { createActor } from "@/backend";
import type { RestaurantFilter, RestaurantId } from "@/backend";
import { QUERY_KEYS } from "@/lib/constants";
import { useActor } from "@caffeineai/core-infrastructure";
import { useQuery } from "@tanstack/react-query";

/** List restaurants matching a filter (home feed, cuisine rails, sorting). */
export function useRestaurants(filter: RestaurantFilter = {}) {
  const { actor, isFetching } = useActor(createActor);
  const key = JSON.stringify(filter, (_k, v) =>
    typeof v === "bigint" ? v.toString() : v,
  );

  return useQuery({
    queryKey: [...QUERY_KEYS.restaurants, key],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listRestaurants(filter);
    },
    enabled: !!actor && !isFetching,
  });
}

/** Fetch a single restaurant with its full menu. */
export function useRestaurant(id: RestaurantId | undefined) {
  const { actor, isFetching } = useActor(createActor);

  return useQuery({
    queryKey: QUERY_KEYS.restaurant(String(id ?? "")),
    queryFn: async () => {
      if (!actor || id === undefined) return null;
      return actor.getRestaurant(id);
    },
    enabled: !!actor && !isFetching && id !== undefined,
  });
}

/** Group a restaurant's menu items by category. */
export function useMenuByCategory(id: RestaurantId | undefined) {
  const { actor, isFetching } = useActor(createActor);

  return useQuery({
    queryKey: QUERY_KEYS.menu(String(id ?? "")),
    queryFn: async () => {
      if (!actor || id === undefined) return [];
      return actor.getMenuByCategory(id);
    },
    enabled: !!actor && !isFetching && id !== undefined,
  });
}

/** Search restaurant and dish names. */
export function useSearchRestaurants(term: string) {
  const { actor, isFetching } = useActor(createActor);
  const trimmed = term.trim();

  return useQuery({
    queryKey: QUERY_KEYS.search(trimmed),
    queryFn: async () => {
      if (!actor || trimmed.length === 0) return [];
      return actor.searchRestaurants(trimmed);
    },
    enabled: !!actor && !isFetching && trimmed.length > 0,
  });
}
