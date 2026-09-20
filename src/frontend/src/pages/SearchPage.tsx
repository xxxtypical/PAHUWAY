import { EmptyState } from "@/components/common/EmptyState";
import { LoadingState } from "@/components/common/LoadingState";
import { RestaurantCard } from "@/components/restaurant/RestaurantCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSearchRestaurants } from "@/hooks/use-restaurants";
import { CUISINES } from "@/lib/constants";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { Search, SearchX } from "lucide-react";
import { type FormEvent, useState } from "react";

/**
 * Search results for restaurant and dish names. The query lives in the URL so
 * a refresh or a shared link reproduces the same results.
 */
export function SearchPage() {
  const navigate = useNavigate();
  const { q } = useSearch({ from: "/search" });
  const term = q ?? "";
  const [draft, setDraft] = useState(term);

  const {
    data: restaurants = [],
    isLoading,
    isError,
    refetch,
  } = useSearchRestaurants(term);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const next = draft.trim();
    void navigate({
      to: "/search",
      search: next.length > 0 ? { q: next } : {},
    });
  };

  const hasQuery = term.trim().length > 0;

  return (
    <div data-ocid="search.page" className="space-y-5">
      <section className="space-y-3">
        <h1 className="font-display text-2xl font-extrabold tracking-tight text-foreground">
          Search
        </h1>

        <form onSubmit={handleSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="Search restaurants or dishes"
              aria-label="Search restaurants or dishes"
              data-ocid="search.search_input"
              className="h-12 rounded-full border-border bg-card pl-9 pr-3 text-sm shadow-subtle"
            />
          </div>
          <Button
            type="submit"
            data-ocid="search.search_button"
            className="h-12 shrink-0 rounded-full px-5 font-bold"
          >
            Search
          </Button>
        </form>
      </section>

      {!hasQuery ? (
        <EmptyState
          data-ocid="search.empty_state"
          icon={Search}
          title="Search the whole marketplace"
          description="Look up a restaurant by name, or a dish like adobo, sisig, or milk tea."
          action={
            <div className="flex flex-wrap justify-center gap-2">
              {CUISINES.slice(0, 4).map((cuisine) => (
                <Button
                  key={cuisine}
                  type="button"
                  variant="outline"
                  size="sm"
                  data-ocid={`search.suggestion.${cuisine.toLowerCase().replace(/\s+/g, "_")}`}
                  onClick={() =>
                    void navigate({ to: "/search", search: { q: cuisine } })
                  }
                  className="rounded-full font-semibold"
                >
                  {cuisine}
                </Button>
              ))}
            </div>
          }
        />
      ) : isLoading ? (
        <LoadingState count={6} />
      ) : isError ? (
        <EmptyState
          data-ocid="search.error_state"
          icon={SearchX}
          title="Search is unavailable right now"
          description="We couldn't reach the marketplace. Check your connection and try again."
          action={
            <Button
              type="button"
              onClick={() => void refetch()}
              data-ocid="search.retry_button"
              className="rounded-full"
            >
              Try again
            </Button>
          }
        />
      ) : restaurants.length === 0 ? (
        <EmptyState
          data-ocid="search.no_results_state"
          icon={SearchX}
          title={`No results for “${term}”`}
          description="Check the spelling, or try a broader term like a cuisine or a restaurant name."
          action={
            <Button
              type="button"
              variant="outline"
              data-ocid="search.clear_button"
              onClick={() => {
                setDraft("");
                void navigate({ to: "/search", search: {} });
              }}
              className="rounded-full font-semibold"
            >
              Clear search
            </Button>
          }
        />
      ) : (
        <section className="space-y-3">
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">
              {restaurants.length}
            </span>{" "}
            {restaurants.length === 1 ? "result" : "results"} for{" "}
            <span className="font-semibold text-foreground">“{term}”</span>
          </p>
          <div
            data-ocid="search.results_list"
            className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4"
          >
            {restaurants.map((restaurant, index) => (
              <RestaurantCard
                key={String(restaurant.id)}
                restaurant={restaurant}
                index={index + 1}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
