import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { BadgePercent, ChevronRight, Clock3 } from "lucide-react";

/**
 * Brand promo strip above the feed. The headline offer is a static
 * marketplace message; the live promo labels live on each restaurant card.
 */
export function PromoBanner() {
  return (
    <section
      data-ocid="home.promo_banner"
      className="relative overflow-hidden rounded-2xl bg-gradient-promo p-4 text-primary-foreground shadow-card sm:p-5"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-10 -top-12 size-40 rounded-full bg-white/15 blur-2xl"
      />
      <div className="relative flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 space-y-1">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-black/20 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider">
            <BadgePercent className="size-3.5" aria-hidden="true" />
            Today&apos;s deal
          </span>
          <h2 className="font-display text-lg font-extrabold leading-tight sm:text-xl">
            Free delivery on your first order
          </h2>
          <p className="flex items-center gap-1.5 text-xs font-medium text-primary-foreground/90 sm:text-sm">
            <Clock3 className="size-3.5" aria-hidden="true" />
            Order before 9 PM and get it hot at your door.
          </p>
        </div>

        <Button
          asChild
          size="sm"
          className="shrink-0 rounded-full bg-card font-bold text-primary shadow-subtle hover:bg-card/90"
        >
          <Link to="/search" data-ocid="home.promo_cta_button">
            Browse deals
            <ChevronRight className="size-4" aria-hidden="true" />
          </Link>
        </Button>
      </div>
    </section>
  );
}
