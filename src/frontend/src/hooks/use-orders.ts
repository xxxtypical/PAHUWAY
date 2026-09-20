import { createActor } from "@/backend";
import type { OrderId, PlaceOrderInput } from "@/backend";
import { QUERY_KEYS } from "@/lib/constants";
import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

/** The caller's past orders, newest first. */
export function useOrders() {
  const { actor, isFetching } = useActor(createActor);

  return useQuery({
    queryKey: QUERY_KEYS.orders,
    queryFn: async () => {
      if (!actor) return [];
      return actor.listOrders();
    },
    enabled: !!actor && !isFetching,
  });
}

/** A single order by id, polled while it is still in transit. */
export function useOrder(id: OrderId | undefined) {
  const { actor, isFetching } = useActor(createActor);

  return useQuery({
    queryKey: QUERY_KEYS.order(String(id ?? "")),
    queryFn: async () => {
      if (!actor || id === undefined) return null;
      return actor.getOrder(id);
    },
    enabled: !!actor && !isFetching && id !== undefined,
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return status === "delivered" ? false : 15_000;
    },
  });
}

/** Place an order from the caller's current cart. */
export function usePlaceOrder() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: PlaceOrderInput) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.placeOrder(input);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.cart });
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.orders });
    },
  });
}
