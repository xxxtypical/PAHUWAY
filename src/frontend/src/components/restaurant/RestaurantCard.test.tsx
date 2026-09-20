import { RestaurantCard } from "@/components/restaurant/RestaurantCard";
import { blob, makeRestaurant } from "@/test/fixtures";
import { renderWithRouter } from "@/test/render";
import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

// The router root mounts the cart provider, which reads the platform hooks.
vi.mock(
  "@caffeineai/core-infrastructure",
  () => import("@/test/infrastructure-mock"),
);

/**
 * Restaurant tile rendering. The card is the primary marketplace surface, so
 * its name, cuisine, rating, delivery estimate, fee, and promo badge are the
 * observable contract the home and search feeds depend on.
 */
describe("RestaurantCard", () => {
  it("shows name, cuisine, rating, delivery time, and fee", async () => {
    renderWithRouter(
      <RestaurantCard
        restaurant={makeRestaurant({
          name: "Lola's Carinderia",
          cuisine: "Filipino",
          rating: 48n,
          ratingCount: 120n,
          estimatedDeliveryMinutes: 30n,
          deliveryFee: 4900n,
        })}
      />,
    );

    expect(await screen.findByText("Lola's Carinderia")).toBeInTheDocument();
    expect(screen.getByText("Filipino")).toBeInTheDocument();
    expect(screen.getByText("4.8")).toBeInTheDocument();
    expect(screen.getByText("(120)")).toBeInTheDocument();
    expect(screen.getByText("30 min")).toBeInTheDocument();
    expect(screen.getByText("₱49")).toBeInTheDocument();
  });

  it("renders the promo badge when a promo label is set", async () => {
    renderWithRouter(
      <RestaurantCard restaurant={makeRestaurant({ promoLabel: "20% off" })} />,
    );
    expect(await screen.findByText("20% off")).toBeInTheDocument();
  });

  it("omits the promo badge when there is no promo label", async () => {
    renderWithRouter(<RestaurantCard restaurant={makeRestaurant()} />);
    await screen.findByText("Lola's Carinderia");
    expect(screen.queryByText("20% off")).not.toBeInTheDocument();
  });

  it("labels an unrated restaurant as New", async () => {
    renderWithRouter(
      <RestaurantCard
        restaurant={makeRestaurant({ rating: 0n, ratingCount: 0n })}
      />,
    );
    expect(await screen.findByText("New")).toBeInTheDocument();
  });

  it("links to the restaurant detail route", async () => {
    renderWithRouter(
      <RestaurantCard restaurant={makeRestaurant({ id: 42n })} />,
    );
    const link = await screen.findByRole("link");
    expect(link).toHaveAttribute("href", "/restaurant/42");
  });

  it("renders the cover image from a real blob reference", async () => {
    renderWithRouter(
      <RestaurantCard
        restaurant={makeRestaurant({
          name: "Lola's Carinderia",
          cuisine: "Filipino",
          coverImageUrl: blob("https://cdn.example.test/lola.jpg"),
        })}
      />,
    );

    const image = await screen.findByRole("img", {
      name: "Lola's Carinderia — Filipino",
    });
    expect(image).toHaveAttribute("src", "https://cdn.example.test/lola.jpg");
  });

  it("falls back to the placeholder for an empty image blob", async () => {
    // The seeded catalogue stores an empty Blob for cover images; the card must
    // render the placeholder rather than a broken image or a thrown error.
    renderWithRouter(
      <RestaurantCard
        restaurant={makeRestaurant({
          name: "Lola's Carinderia",
          cuisine: "Filipino",
          coverImageUrl: blob(""),
        })}
      />,
    );

    const image = await screen.findByRole("img", {
      name: "Lola's Carinderia — Filipino",
    });
    expect(image).toHaveAttribute("src", "/assets/images/placeholder.svg");
  });
});
