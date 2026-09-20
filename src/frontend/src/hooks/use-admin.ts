import { createActor } from "@/backend";
import type {
  MenuItemId,
  MenuItemInput,
  OrderId,
  OrderStatus,
  RestaurantId,
  RestaurantInput,
} from "@/backend";
import { QUERY_KEYS } from "@/lib/constants";
import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

/** Dashboard summary counts (admin only). */
export function useDashboardSummary() {
  const { actor, isFetching } = useActor(createActor);

  return useQuery({
    queryKey: QUERY_KEYS.adminSummary,
    queryFn: async () => {
      if (!actor) return null;
      return actor.getDashboardSummary();
    },
    enabled: !!actor && !isFetching,
  });
}

/** All orders, optionally filtered by status (admin only). */
export function useAllOrders(status: OrderStatus | null = null) {
  const { actor, isFetching } = useActor(createActor);

  return useQuery({
    queryKey: QUERY_KEYS.adminOrders(status ?? "all"),
    queryFn: async () => {
      if (!actor) return [];
      return actor.listAllOrders(status);
    },
    enabled: !!actor && !isFetching,
  });
}

/** Every restaurant for the merchant dashboard. */
export function useAdminRestaurants() {
  const { actor, isFetching } = useActor(createActor);

  return useQuery({
    queryKey: QUERY_KEYS.adminRestaurants,
    queryFn: async () => {
      if (!actor) return [];
      return actor.listRestaurants({});
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateRestaurant() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: RestaurantInput) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.createRestaurant(input);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.adminRestaurants,
      });
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.restaurants });
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.adminSummary });
    },
  });
}

export function useUpdateRestaurant() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: {
      id: RestaurantId;
      values: RestaurantInput;
    }) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.updateRestaurant(input.id, input.values);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.adminRestaurants,
      });
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.restaurants });
    },
  });
}

export function useDeleteRestaurant() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: RestaurantId) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.deleteRestaurant(id);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.adminRestaurants,
      });
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.restaurants });
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.adminSummary });
    },
  });
}

export function useAddMenuItem() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: {
      restaurantId: RestaurantId;
      values: MenuItemInput;
    }) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.addMenuItem(input.restaurantId, input.values);
    },
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.adminRestaurants,
      });
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.adminSummary });
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.restaurant(String(variables.restaurantId)),
      });
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.menu(String(variables.restaurantId)),
      });
    },
  });
}

export function useUpdateMenuItem() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: {
      itemId: MenuItemId;
      values: MenuItemInput;
    }) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.updateMenuItem(input.itemId, input.values);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.adminRestaurants,
      });
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.adminSummary });
      void queryClient.invalidateQueries({ queryKey: ["restaurant"] });
      void queryClient.invalidateQueries({ queryKey: ["menu"] });
    },
  });
}

export function useRemoveMenuItem() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (itemId: MenuItemId) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.removeMenuItem(itemId);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.adminRestaurants,
      });
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.adminSummary });
      void queryClient.invalidateQueries({ queryKey: ["restaurant"] });
      void queryClient.invalidateQueries({ queryKey: ["menu"] });
    },
  });
}

/** Advance an order to its next status (admin only). */
export function useAdvanceOrderStatus() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: OrderId) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.advanceOrderStatus(id);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin", "orders"] });
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.adminSummary });
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.orders });
    },
  });
}
