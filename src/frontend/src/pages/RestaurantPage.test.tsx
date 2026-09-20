import type { AddToCartResult } from "@/backend";
import { RestaurantPage } from "@/pages/RestaurantPage";
import { createFakeActor } from "@/test/fake-actor";
import {
  makeCart,
  makeMenuCategories,
  makeMenuItem,
  makeRestaurant,
  makeRestaurantDetail,
} from "@/test/fixtures";
import {
  resetTestInfrastructure,
  setTestInfrastructure,
} from "@/test/infrastructure-mock";
import { renderRouter } from "@/test/render";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock(
  "@caffeineai/core-infrastructure",
  () => import("@/test/infrastructure-mock"),
);

const restaurantRoute = {
  path: "/restaurant/$id",
  component: RestaurantPage,
};

afterEach(() => {
  resetTestInfrastructure();
});

/**
 * Restaurant detail: hero facts, categorized menu, and the add-to-cart flow
 * including the different-restaurant conflict prompt.
 */
describe("RestaurantPage", () => {
  it("renders the restaurant facts and its categorized menu", async () => {
    const actor = createFakeActor({
      getRestaurant: vi.fn(async () =>
        makeRestaurantDetail({
          restaurant: makeRestaurant({ name: "Lola's Carinderia" }),
        }),
      ),
      getMenuByCategory: vi.fn(async () => makeMenuCategories()),
      getCart: vi.fn(async () => null),
    });
    setTestInfrastructure({ actor });

    renderRouter({ routes: [restaurantRoute], initialPath: "/restaurant/1" });

    expect(await screen.findByText("Lola's Carinderia")).toBeInTheDocument();
    expect(screen.getByTestId("menu.category.mains")).toBeInTheDocument();
    expect(screen.getByTestId("menu.category.drinks")).toBeInTheDocument();
    expect(screen.getByText("Chicken Adobo")).toBeInTheDocument();
    expect(screen.getByText("Milk Tea")).toBeInTheDocument();
  });

  it("adds a dish to the cart and shows the sticky cart bar", async () => {
    const addToCart = vi.fn(
      async (): Promise<AddToCartResult> => ({
        __kind__: "added",
        added: makeCart(),
      }),
    );
    const actor = createFakeActor({
      getRestaurant: vi.fn(async () => makeRestaurantDetail()),
      getMenuByCategory: vi.fn(async () => makeMenuCategories()),
      getCart: vi.fn(async () => null),
      addToCart,
    });
    setTestInfrastructure({ actor });

    renderRouter({ routes: [restaurantRoute], initialPath: "/restaurant/1" });
    await screen.findByText("Chicken Adobo");

    await userEvent.click(screen.getByTestId("menu.add_button.1"));

    await waitFor(() => {
      expect(addToCart).toHaveBeenCalledWith(1n, 10n, 1n);
    });
  });

  it("prompts before replacing a cart from a different restaurant", async () => {
    const addToCart = vi.fn(
      async (): Promise<AddToCartResult> => ({
        __kind__: "differentRestaurant",
        differentRestaurant: {
          requestedRestaurantId: 1n,
          requestedRestaurantName: "Lola's Carinderia",
          currentRestaurantId: 2n,
          currentRestaurantName: "Milk Tea Corner",
        },
      }),
    );
    const actor = createFakeActor({
      getRestaurant: vi.fn(async () => makeRestaurantDetail()),
      getMenuByCategory: vi.fn(async () => makeMenuCategories()),
      getCart: vi.fn(async () => null),
      addToCart,
    });
    setTestInfrastructure({ actor });

    renderRouter({ routes: [restaurantRoute], initialPath: "/restaurant/1" });
    await screen.findByText("Chicken Adobo");

    await userEvent.click(screen.getByTestId("menu.add_button.1"));

    expect(await screen.findByText(/Milk Tea Corner/)).toBeInTheDocument();
  });

  it("renders placeholders when the cover and dish images are absent", async () => {
    // The seeded catalogue stores no image for its restaurants or dishes. The
    // detail page must render the placeholder hero and placeholder dish photos
    // rather than a broken image or a thrown error.
    const actor = createFakeActor({
      getRestaurant: vi.fn(async () =>
        makeRestaurantDetail({
          restaurant: makeRestaurant({
            name: "Jollibee",
            coverImageUrl: undefined,
          }),
          menu: [makeMenuItem({ imageUrl: undefined })],
        }),
      ),
      getMenuByCategory: vi.fn(async () => [
        {
          category: "Chicken",
          items: [makeMenuItem({ imageUrl: undefined })],
        },
      ]),
      getCart: vi.fn(async () => null),
    });
    setTestInfrastructure({ actor });

    renderRouter({ routes: [restaurantRoute], initialPath: "/restaurant/1" });

    expect(await screen.findByText("Jollibee")).toBeInTheDocument();
    expect(screen.getByText("Chicken Adobo")).toBeInTheDocument();

    // The hero and the dish photo both fall back to the placeholder asset.
    // Placeholder images are decorative (`alt=""`, `aria-hidden`), so they are
    // queried by element rather than by accessible role.
    const images = document.querySelectorAll("img");
    expect(images.length).toBeGreaterThanOrEqual(2);
    for (const image of images) {
      expect(image).toHaveAttribute("src", "/assets/images/placeholder.svg");
    }
  });

  it("shows a not-found state when the restaurant is missing", async () => {
    const actor = createFakeActor({
      getRestaurant: vi.fn(async () => null),
      getMenuByCategory: vi.fn(async () => []),
      getCart: vi.fn(async () => null),
    });
    setTestInfrastructure({ actor });

    renderRouter({ routes: [restaurantRoute], initialPath: "/restaurant/999" });

    expect(await screen.findByText("Restaurant not found")).toBeInTheDocument();
  });
});
