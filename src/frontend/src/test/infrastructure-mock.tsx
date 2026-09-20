import type { backendInterface } from "@/backend";
import type { FakeActor } from "./fake-actor";

/**
 * Module-level state backing the mocked platform hooks. Tests configure it
 * with `setTestInfrastructure(...)` before rendering; the hooks below read it
 * on every render, so a test can change the actor or auth state between cases.
 *
 * This module is installed with `vi.mock("@caffeineai/core-infrastructure")`
 * from each test file, which is why it must not import anything that itself
 * imports the real package.
 */
export interface TestInfrastructureState {
  actor: FakeActor | null;
  isAuthenticated: boolean;
  isInitializing: boolean;
  isLoggingIn: boolean;
  login: () => void;
  clear: () => void;
}

const state: TestInfrastructureState = {
  actor: null,
  isAuthenticated: false,
  isInitializing: false,
  isLoggingIn: false,
  login: () => {},
  clear: () => {},
};

export function setTestInfrastructure(
  next: Partial<TestInfrastructureState>,
): void {
  Object.assign(state, next);
}

export function resetTestInfrastructure(): void {
  state.actor = null;
  state.isAuthenticated = false;
  state.isInitializing = false;
  state.isLoggingIn = false;
  state.login = () => {};
  state.clear = () => {};
}

export function useActor<T>(_createActor: unknown): {
  actor: T | null;
  isFetching: boolean;
} {
  return { actor: state.actor as T | null, isFetching: false };
}

export function useInternetIdentity() {
  return {
    identity: state.isAuthenticated ? {} : undefined,
    login: state.login,
    clear: state.clear,
    loginStatus: state.isAuthenticated ? "success" : "idle",
    isInitializing: state.isInitializing,
    isLoginIdle: !state.isAuthenticated,
    isLoggingIn: state.isLoggingIn,
    isLoginSuccess: state.isAuthenticated,
    isLoginError: false,
    isAuthenticated: state.isAuthenticated,
  };
}

// The real package also exports these; components under test do not use them,
// but a missing export would break any module that imports the package.
export const InternetIdentityProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => children;
export const createActorWithConfig = () => {
  throw new Error("createActorWithConfig is not available in tests");
};
export const loadConfig = () => {
  throw new Error("loadConfig is not available in tests");
};
export const loadMockBackendFromModules = () => {
  throw new Error("loadMockBackendFromModules is not available in tests");
};

export type { backendInterface };
