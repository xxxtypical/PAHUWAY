import { useCallerRole } from "@/hooks/use-backend";
import { cn } from "@/lib/utils";
import { Link } from "@tanstack/react-router";
import { Home, LayoutDashboard, MapPin, Receipt, Search } from "lucide-react";

const BASE_ITEMS = [
  { to: "/", label: "Home", icon: Home },
  { to: "/search", label: "Search", icon: Search },
  { to: "/orders", label: "Orders", icon: Receipt },
  { to: "/addresses", label: "Addresses", icon: MapPin },
] as const;

/** Mobile bottom navigation; hidden from md upward. */
export function BottomNav() {
  const { isAdmin } = useCallerRole();

  const items = isAdmin
    ? [
        ...BASE_ITEMS,
        { to: "/admin", label: "Dashboard", icon: LayoutDashboard },
      ]
    : BASE_ITEMS;

  return (
    <nav
      data-ocid="bottom_nav"
      aria-label="Primary"
      className="safe-bottom fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 shadow-sticky backdrop-blur md:hidden"
    >
      <ul className="mx-auto flex max-w-md items-stretch justify-around">
        {items.map((item) => (
          <li key={item.to} className="flex-1">
            <Link
              to={item.to}
              data-ocid={`bottom_nav.${item.label.toLowerCase()}_link`}
              activeProps={{ className: "text-primary" }}
              inactiveProps={{ className: "text-muted-foreground" }}
              className={cn(
                "flex min-h-[56px] flex-col items-center justify-center gap-1 px-1 py-2 text-[11px] font-semibold transition-smooth",
              )}
            >
              <item.icon className="size-5" aria-hidden="true" />
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
