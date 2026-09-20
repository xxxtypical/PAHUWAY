import { createActor } from "@/backend";
import type { AddressId, AddressInput } from "@/backend";
import { QUERY_KEYS } from "@/lib/constants";
import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

/** The caller's saved addresses. */
export function useAddresses() {
  const { actor, isFetching } = useActor(createActor);

  return useQuery({
    queryKey: QUERY_KEYS.addresses,
    queryFn: async () => {
      if (!actor) return [];
      return actor.listAddresses();
    },
    enabled: !!actor && !isFetching,
  });
}

/** The caller's default address, falling back to the first saved one. */
export function useDefaultAddress() {
  const query = useAddresses();
  const addresses = query.data ?? [];
  const defaultAddress =
    addresses.find((address) => address.isDefault) ?? addresses[0] ?? null;
  return { ...query, defaultAddress };
}

export function useAddAddress() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: AddressInput) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.addAddress(input);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.addresses });
    },
  });
}

export function useUpdateAddress() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: { id: AddressId; values: AddressInput }) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.updateAddress(input.id, input.values);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.addresses });
    },
  });
}

export function useSetDefaultAddress() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: AddressId) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.setDefaultAddress(id);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.addresses });
    },
  });
}

export function useDeleteAddress() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: AddressId) => {
      if (!actor) throw new Error("Backend is not ready");
      return actor.deleteAddress(id);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.addresses });
    },
  });
}
