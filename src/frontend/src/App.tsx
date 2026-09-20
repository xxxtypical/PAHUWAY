import { EmptyState } from "@/components/common/EmptyState";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import { CartProvider } from "@/context/CartContext";
import { AddressesPage } from "@/pages/AddressesPage";
import { CartPage } from "@/pages/CartPage";
import { CheckoutPage } from "@/pages/CheckoutPage";
import { HomePage } from "@/pages/HomePage";
import { OrderConfirmationPage } from "@/pages/OrderConfirmationPage";
import { OrderHistoryPage } from "@/pages/OrderHistoryPage";
import { OrderTrackingPage } from "@/pages/OrderTrackingPage";
import { ProfilePage } from "@/pages/ProfilePage";
import { RestaurantPage } from "@/pages/RestaurantPage";
import { SearchPage } from "@/pages/SearchPage";
import { AdminDashboardPage } from "@/pages/admin/AdminDashboardPage";
import { AdminMenuPage } from "@/pages/admin/AdminMenuPage";
import { AdminOrdersPage } from "@/pages/admin/AdminOrdersPage";
import { AdminRestaurantsPage } from "@/pages/admin/AdminRestaurantsPage";
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { Store } from "lucide-react";

function NotFoundPage() {
  return (
    <section data-ocid="not_found.page" className="py-10">
      <EmptyState
        icon={Store}
        title="Page not found"
        description="The page you were looking for has moved or never existed."
        action={
          <Button asChild className="rounded-full">
            <Link to="/" data-ocid="not_found.home_link">
              Back to home
            </Link>
          </Button>
        }
      />
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Router                                                              */
/* ------------------------------------------------------------------ */

const rootRoute = createRootRoute({
  component: () => (
    <CartProvider>
      <AppLayout>
        <Outlet />
      </AppLayout>
      <Toaster position="top-center" richColors />
    </CartProvider>
  ),
  notFoundComponent: NotFoundPage,
});

const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  validateSearch: (
    search: Record<string, unknown>,
  ): {
    sort?: string;
    minRating?: string;
    maxDeliveryMinutes?: string;
    maxDeliveryFee?: string;
    maxPrice?: string;
    cuisine?: string;
  } => {
    const pick = (key: string): string | undefined =>
      typeof search[key] === "string" && (search[key] as string).length > 0
        ? (search[key] as string)
        : undefined;
    return {
      sort: pick("sort"),
      minRating: pick("minRating"),
      maxDeliveryMinutes: pick("maxDeliveryMinutes"),
      maxDeliveryFee: pick("maxDeliveryFee"),
      maxPrice: pick("maxPrice"),
      cuisine: pick("cuisine"),
    };
  },
  component: HomePage,
});
const searchRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/search",
  validateSearch: (search: Record<string, unknown>): { q?: string } => ({
    q:
      typeof search.q === "string" && search.q.length > 0
        ? search.q
        : undefined,
  }),
  component: SearchPage,
});
const restaurantRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/restaurant/$id",
  component: RestaurantPage,
});
const cartRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/cart",
  component: CartPage,
});
const checkoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/checkout",
  component: CheckoutPage,
});
const orderConfirmationRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/order/$id/confirmation",
  component: OrderConfirmationPage,
});
const orderTrackingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/order/$id",
  component: OrderTrackingPage,
});
const ordersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/orders",
  component: OrderHistoryPage,
});
const addressesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/addresses",
  component: AddressesPage,
});
const profileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/profile",
  component: ProfilePage,
});
const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin",
  component: AdminDashboardPage,
});
const adminRestaurantsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin/restaurants",
  component: AdminRestaurantsPage,
});
const adminMenuRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin/menu",
  component: AdminMenuPage,
});
const adminOrdersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin/orders",
  component: AdminOrdersPage,
});

const routeTree = rootRoute.addChildren([
  homeRoute,
  searchRoute,
  restaurantRoute,
  cartRoute,
  checkoutRoute,
  orderConfirmationRoute,
  orderTrackingRoute,
  ordersRoute,
  addressesRoute,
  profileRoute,
  adminRoute,
  adminRestaurantsRoute,
  adminMenuRoute,
  adminOrdersRoute,
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
