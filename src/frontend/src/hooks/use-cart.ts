import { createActor } from "@/backend";
import type { MenuItemId, RestaurantId } from "@/backend";
import { QUERY_KEYS } from "@/lib/constants";
import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

/** The caller's current cart, or null when empty. */
export function useCart() {
  const { actor, isFetching } = useActor(createActor);

  return useQuery({
    queryKey: QUERY_KEYS.cart,
    queryFn: async () => {
      if (!actor) return null;
      return actor.getCart();
    },
    enabled: !!actor && !isFetching,
  });
}

/** Add a dish to the cart; may report a different-restaurant conflict. */
export function useAddToCart() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: {
      restaurantId: RestaurantId;
      menuItemId: MenuItemId;
      quantity: bigint;
    }) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.addToCart(
        input.restaurantId,
        input.menuItemId,
        input.quantity,
      );
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.cart });
    },
  });
}

/** Set a cart line quantity; zero removes the line. */
export function useUpdateCartItem() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: { menuItemId: MenuItemId; quantity: bigint }) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.updateCartItem(input.menuItemId, input.quantity);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.cart });
    },
  });
}

/** Remove a line from the cart. */
export function useRemoveCartItem() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (menuItemId: MenuItemId) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.removeCartItem(menuItemId);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.cart });
    },
  });
}

/** Empty the cart. */
export function useClearCart() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.clearCart();
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.cart });
    },
  });
}
