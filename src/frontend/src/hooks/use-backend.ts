import { createActor } from "@/backend";
import { UserRole } from "@/backend";
import { QUERY_KEYS } from "@/lib/constants";
import { useActor } from "@caffeineai/core-infrastructure";
import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import { useQuery } from "@tanstack/react-query";

/**
 * Shared access to the generated backend actor.
 * Always call at the top level of a hook — never inside a query callback.
 */
export function useBackend() {
  const { actor, isFetching } = useActor(createActor);
  return { actor, isFetching, isReady: !!actor && !isFetching };
}

/** The caller's role, used to gate the merchant dashboard. */
export function useCallerRole() {
  const { actor, isFetching } = useActor(createActor);
  const { isAuthenticated } = useInternetIdentity();

  const query = useQuery<UserRole>({
    queryKey: QUERY_KEYS.callerRole,
    queryFn: async () => {
      if (!actor) return UserRole.guest;
      return actor.getCallerUserRole();
    },
    enabled: !!actor && !isFetching && isAuthenticated,
    retry: false,
  });

  return {
    ...query,
    role: query.data ?? UserRole.guest,
    isAdmin: query.data === UserRole.admin,
    isLoading: isFetching || (isAuthenticated && query.isLoading),
  };
}
