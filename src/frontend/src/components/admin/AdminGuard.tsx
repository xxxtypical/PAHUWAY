import { EmptyState } from "@/components/common/EmptyState";
import { LoadingState } from "@/components/common/LoadingState";
import { Button } from "@/components/ui/button";
import { useCallerRole } from "@/hooks/use-backend";
import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import { Link } from "@tanstack/react-router";
import { Lock, LogIn } from "lucide-react";
import type { ReactNode } from "react";

interface AdminGuardProps {
  children: ReactNode;
}

/**
 * Gates the merchant dashboard. Signed-out visitors get a sign-in prompt;
 * signed-in non-admins get a clear access-denied state. The backend also
 * enforces `isCallerAdmin` on every mutation, so this is a UX gate only.
 */
export function AdminGuard({ children }: AdminGuardProps) {
  const { isAdmin, isLoading } = useCallerRole();
  const { isAuthenticated, isInitializing, isLoggingIn, login } =
    useInternetIdentity();

  if (isLoading || isInitializing) {
    return (
      <section data-ocid="admin.loading_state" className="space-y-4">
        <LoadingState count={3} />
      </section>
    );
  }

  if (!isAuthenticated) {
    return (
      <section data-ocid="admin.sign_in_required" className="py-6">
        <EmptyState
          icon={LogIn}
          title="Sign in to the merchant dashboard"
          description="The merchant dashboard is only available to signed-in merchant accounts. Sign in to manage restaurants, menus, and incoming orders."
          action={
            <Button
              type="button"
              onClick={() => login()}
              disabled={isLoggingIn}
              data-ocid="admin.sign_in_button"
              className="rounded-full font-semibold shadow-card"
            >
              {isLoggingIn ? "Signing in…" : "Sign in"}
            </Button>
          }
        />
      </section>
    );
  }

  if (!isAdmin) {
    return (
      <section data-ocid="admin.access_denied" className="py-6">
        <EmptyState
          icon={Lock}
          title="Merchant access required"
          description="This account does not have merchant permissions. Ask an administrator to grant your account the admin role, then reload this page."
          action={
            <Button asChild className="rounded-full font-semibold shadow-card">
              <Link to="/" data-ocid="admin.back_home_link">
                Back to home
              </Link>
            </Button>
          }
        />
      </section>
    );
  }

  return <>{children}</>;
}
