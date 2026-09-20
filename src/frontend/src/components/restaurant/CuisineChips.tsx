import { cn } from "@/lib/utils";
import { LayoutGrid } from "lucide-react";

interface CuisineChipsProps {
  cuisines: readonly string[];
  /** Currently selected cuisine, or undefined for "All". */
  selected?: string;
  onSelect: (cuisine: string | undefined) => void;
  className?: string;
}

/**
 * Horizontally scrollable cuisine rail. Selecting a chip filters the feed;
 * selecting the active chip again clears the filter.
 */
export function CuisineChips({
  cuisines,
  selected,
  onSelect,
  className,
}: CuisineChipsProps) {
  return (
    <div
      data-ocid="home.cuisine_rail"
      className={cn("chip-rail -mx-4 flex gap-2 px-4 py-1", className)}
    >
      <button
        type="button"
        data-ocid="home.cuisine_chip.all"
        aria-pressed={selected === undefined}
        onClick={() => onSelect(undefined)}
        className={cn(
          "flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-sm font-semibold transition-smooth focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          selected === undefined
            ? "border-primary bg-primary text-primary-foreground shadow-subtle"
            : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground",
        )}
      >
        <LayoutGrid className="size-4" aria-hidden="true" />
        All
      </button>

      {cuisines.map((cuisine) => {
        const isActive = selected === cuisine;
        return (
          <button
            key={cuisine}
            type="button"
            data-ocid={`home.cuisine_chip.${cuisine.toLowerCase().replace(/\s+/g, "_")}`}
            aria-pressed={isActive}
            onClick={() => onSelect(isActive ? undefined : cuisine)}
            className={cn(
              "rounded-full border px-3.5 py-2 text-sm font-semibold transition-smooth focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              isActive
                ? "border-primary bg-primary text-primary-foreground shadow-subtle"
                : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground",
            )}
          >
            {cuisine}
          </button>
        );
      })}
    </div>
  );
}
