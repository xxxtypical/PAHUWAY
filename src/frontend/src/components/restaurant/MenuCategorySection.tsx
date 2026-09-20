import { MenuItemCard } from "@/components/restaurant/MenuItemCard";
import type { MenuCategory } from "@/types";

interface MenuCategorySectionProps {
  category: MenuCategory;
  /** Called when a dish add reports a different-restaurant cart conflict. */
  onConflict: (
    info: {
      requestedRestaurantId: bigint;
      requestedRestaurantName: string;
      currentRestaurantId: bigint;
      currentRestaurantName: string;
    },
    requested: { menuItemId: bigint; quantity: bigint },
  ) => void;
  /** Stable offset so data-ocid item indices stay unique across sections. */
  startIndex?: number;
}

/** One menu category: a sticky heading and its dish cards. */
export function MenuCategorySection({
  category,
  onConflict,
  startIndex = 0,
}: MenuCategorySectionProps) {
  const slug = category.category.toLowerCase().replace(/[^a-z0-9]+/g, "-");

  return (
    <section
      id={`menu-${slug}`}
      data-ocid={`menu.category.${slug}`}
      className="scroll-mt-32 space-y-3"
    >
      <header className="flex items-baseline justify-between gap-3">
        <h2 className="font-display text-lg font-extrabold tracking-tight text-foreground sm:text-xl">
          {category.category}
        </h2>
        <span className="text-xs font-semibold text-muted-foreground">
          {category.items.length} dish{category.items.length === 1 ? "" : "es"}
        </span>
      </header>

      <div className="space-y-3">
        {category.items.map((item, index) => (
          <MenuItemCard
            key={String(item.id)}
            item={item}
            index={startIndex + index}
            onConflict={onConflict}
          />
        ))}
      </div>
    </section>
  );
}
