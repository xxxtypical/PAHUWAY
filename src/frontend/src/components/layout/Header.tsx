import { AddressSelector } from "@/components/common/AddressSelector";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCartContext } from "@/context/CartContext";
import { useCallerRole } from "@/hooks/use-backend";
import { APP_NAME } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import { useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  LayoutDashboard,
  LogOut,
  Search,
  ShoppingBag,
  User,
} from "lucide-react";

const NAV_LINKS = [
  { to: "/", label: "Home" },
  { to: "/search", label: "Search" },
  { to: "/orders", label: "Orders" },
  { to: "/addresses", label: "Addresses" },
] as const;

/** Sticky marketplace header: wordmark, address, search, cart, account. */
export function Header() {
  const { itemCount } = useCartContext();
  const { isAuthenticated, isInitializing, isLoggingIn, login, clear } =
    useInternetIdentity();
  const { isAdmin } = useCallerRole();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const handleAuth = () => {
    if (isAuthenticated) {
      clear();
      queryClient.clear();
      void navigate({ to: "/" });
    } else {
      login();
    }
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-card/95 shadow-sticky backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4 sm:gap-4">
        <Link
          to="/"
          data-ocid="header.home_link"
          className="flex shrink-0 items-baseline gap-0.5 font-display text-xl font-extrabold tracking-tight text-foreground"
        >
          {APP_NAME}
          <span className="text-primary">.</span>
        </Link>

        <AddressSelector className="hidden sm:flex" />

        <nav className="ml-auto hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              data-ocid={`header.nav.${link.label.toLowerCase()}_link`}
              activeProps={{ className: "text-primary bg-secondary" }}
              className="rounded-full px-3 py-2 text-sm font-semibold text-muted-foreground transition-smooth hover:bg-secondary hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
          {isAdmin ? (
            <Link
              to="/admin"
              data-ocid="header.admin_link"
              activeProps={{ className: "text-primary bg-secondary" }}
              className="flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-semibold text-muted-foreground transition-smooth hover:bg-secondary hover:text-foreground"
            >
              <LayoutDashboard className="size-4" aria-hidden="true" />
              Dashboard
            </Link>
          ) : null}
        </nav>

        <div className="ml-auto flex items-center gap-1.5 md:ml-0">
          <Button
            asChild
            variant="ghost"
            size="icon"
            className="rounded-full md:hidden"
          >
            <Link
              to="/search"
              aria-label="Search"
              data-ocid="header.search_link"
            >
              <Search className="size-5" aria-hidden="true" />
            </Link>
          </Button>

          <Button
            asChild
            variant="ghost"
            size="icon"
            className="relative rounded-full"
          >
            <Link to="/cart" aria-label="Cart" data-ocid="header.cart_link">
              <ShoppingBag className="size-5" aria-hidden="true" />
              {itemCount > 0 ? (
                <span
                  data-ocid="header.cart_badge"
                  className="absolute -right-0.5 -top-0.5 flex min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold leading-5 text-primary-foreground"
                >
                  {itemCount > 99 ? "99+" : itemCount}
                </span>
              ) : null}
            </Link>
          </Button>

          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label="Account menu"
                  data-ocid="header.account_button"
                  className="rounded-full"
                >
                  <User className="size-5" aria-hidden="true" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-52"
                data-ocid="header.account_dropdown_menu"
              >
                <DropdownMenuLabel>My account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/profile" data-ocid="header.profile_link">
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/orders" data-ocid="header.orders_link">
                    My orders
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/addresses" data-ocid="header.addresses_link">
                    Saved addresses
                  </Link>
                </DropdownMenuItem>
                {isAdmin ? (
                  <DropdownMenuItem asChild>
                    <Link to="/admin" data-ocid="header.admin_menu_link">
                      Merchant dashboard
                    </Link>
                  </DropdownMenuItem>
                ) : null}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  data-ocid="header.sign_out_button"
                  onSelect={handleAuth}
                  className="text-destructive"
                >
                  <LogOut className="size-4" aria-hidden="true" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              type="button"
              size="sm"
              onClick={handleAuth}
              disabled={isInitializing || isLoggingIn}
              data-ocid="header.sign_in_button"
              className={cn("rounded-full font-semibold")}
            >
              {isInitializing
                ? "Loading…"
                : isLoggingIn
                  ? "Signing in…"
                  : "Sign in"}
            </Button>
          )}
        </div>
      </div>

      <div className="border-t border-border px-4 py-2 sm:hidden">
        <AddressSelector compact className="w-full" />
      </div>
    </header>
  );
}
