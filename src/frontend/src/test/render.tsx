import { CartProvider } from "@/context/CartContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  RouterProvider,
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  defaultStringifySearch,
} from "@tanstack/react-router";
import { type RenderResult, render } from "@testing-library/react";
import type { ReactNode } from "react";

/**
 * A fresh QueryClient with retries disabled so failures surface immediately.
 * `gcTime: 0` keeps cached data from leaking between tests.
 */
export function createTestQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0, staleTime: 0 },
      mutations: { retry: false },
    },
  });
}

interface RenderOptions {
  queryClient?: QueryClient;
  /** Wrap the tree in the cart provider (needed by cart-aware pages). */
  withCart?: boolean;
}

/** Render a component inside the providers the app supplies at runtime. */
export function renderWithProviders(
  ui: ReactNode,
  options: RenderOptions = {},
): RenderResult {
  const queryClient = options.queryClient ?? createTestQueryClient();
  const tree = options.withCart ? <CartProvider>{ui}</CartProvider> : ui;

  return render(
    <QueryClientProvider client={queryClient}>{tree}</QueryClientProvider>,
  );
}

interface RouteSpec {
  path: string;
  component: () => ReactNode;
  validateSearch?: (search: Record<string, unknown>) => Record<string, unknown>;
}

/**
 * Build a memory router over the given routes so navigation between pages can
 * be exercised without a browser. Routes are declared by the caller so each
 * test only wires the pages it needs. The root route always supplies the cart
 * provider, matching the app shell.
 *
 * Router content mounts asynchronously, so callers should use `findBy*`
 * queries for the first assertion.
 */
export function renderRouter(options: {
  routes: RouteSpec[];
  initialPath?: string;
  /**
   * Search params to seed the initial location with, serialized through the
   * router's own `defaultStringifySearch`. Prefer this over hand-writing a
   * query string in `initialPath`: the app writes filter values as strings and
   * the router JSON-encodes them, so a raw `?maxPrice=30000` parses back as a
   * number and is dropped by the route's string-only `validateSearch`. Going
   * through the serializer reproduces the exact URL shape the app produces.
   */
  initialSearch?: Record<string, unknown>;
  queryClient?: QueryClient;
}) {
  const queryClient = options.queryClient ?? createTestQueryClient();
  const initialPath =
    options.initialSearch === undefined
      ? (options.initialPath ?? "/")
      : `/?${defaultStringifySearch(options.initialSearch)}`;
  const rootRoute = createRootRoute({
    component: () => (
      <CartProvider>
        <Outlet />
      </CartProvider>
    ),
  });

  const childRoutes = options.routes.map((route) =>
    createRoute({
      getParentRoute: () => rootRoute,
      path: route.path,
      validateSearch: route.validateSearch,
      component: route.component,
    }),
  );

  const router = createRouter({
    routeTree: rootRoute.addChildren(childRoutes),
    history: createMemoryHistory({
      initialEntries: [initialPath],
    }),
  });

  const result = render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  );

  return { result, router };
}

/**
 * Render a component that uses router primitives (`Link`, `useNavigate`) but
 * is not itself a page. A catch-all route hosts the component so links resolve
 * against a real router without wiring the whole app.
 */
export function renderWithRouter(
  ui: ReactNode,
  options: RenderOptions & { initialPath?: string } = {},
): RenderResult {
  const queryClient = options.queryClient ?? createTestQueryClient();
  const rootRoute = createRootRoute({
    component: () => (
      <CartProvider>
        <Outlet />
      </CartProvider>
    ),
  });
  const indexRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/",
    component: () => <>{ui}</>,
  });
  const catchAllRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "$",
    component: () => <>{ui}</>,
  });
  const router = createRouter({
    routeTree: rootRoute.addChildren([indexRoute, catchAllRoute]),
    history: createMemoryHistory({
      initialEntries: [options.initialPath ?? "/"],
    }),
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  );
}
