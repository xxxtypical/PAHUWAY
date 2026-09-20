import { HomePage } from "@/pages/HomePage";
import { createFakeActor } from "@/test/fake-actor";
import { blob, makeRestaurant } from "@/test/fixtures";
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

/**
 * Mirrors the app's own home-route `validateSearch`: every filter param is
 * coerced to a non-empty string (or dropped). The real route does this, and the
 * price slider compares its band values as strings, so a test route that passed
 * raw numbers through would not exercise the production path.
 */
const homeRoute = {
  path: "/",
  component: HomePage,
  validateSearch: (search: Record<string, unknown>) => {
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
};

afterEach(() => {
  resetTestInfrastructure();
});

/**
 * Home feed: search entry, cuisine rail, filter/sort controls, and the
 * restaurant grid. Filter and cuisine selections are written to the URL, which
 * is what makes them survive a refresh.
 */
describe("HomePage", () => {
  it("renders the search bar, address selector, cuisine chips, and restaurant grid", async () => {
    const actor = createFakeActor({
      listRestaurants: vi.fn(async () => [
        makeRestaurant({ id: 1n, name: "Lola's Carinderia" }),
        makeRestaurant({
          id: 2n,
          name: "Milk Tea Corner",
          cuisine: "Milk Tea",
        }),
      ]),
      listOrders: vi.fn(async () => []),
      listAddresses: vi.fn(async () => []),
      getCart: vi.fn(async () => null),
    });
    setTestInfrastructure({ actor });

    renderRouter({ routes: [homeRoute] });

    expect(
      await screen.findByLabelText("Search restaurants or dishes"),
    ).toBeInTheDocument();
    expect(screen.getByTestId("home.cuisine_rail")).toBeInTheDocument();
    expect(screen.getByTestId("home.filters_panel")).toBeInTheDocument();
    expect(await screen.findByText("Lola's Carinderia")).toBeInTheDocument();
    expect(screen.getByText("Milk Tea Corner")).toBeInTheDocument();
  });

  it("decodes the restaurant list and renders a card per restaurant", async () => {
    // The seeded catalogue stores empty image blobs. The listing query must
    // resolve and every card must render with the placeholder image rather than
    // rejecting the whole feed.
    const actor = createFakeActor({
      listRestaurants: vi.fn(async () => [
        makeRestaurant({
          id: 1n,
          name: "Jollibee",
          cuisine: "Filipino",
          coverImageUrl: blob(""),
        }),
        makeRestaurant({
          id: 2n,
          name: "Chatime",
          cuisine: "Milk Tea",
          coverImageUrl: blob(""),
        }),
      ]),
      listOrders: vi.fn(async () => []),
      listAddresses: vi.fn(async () => []),
      getCart: vi.fn(async () => null),
    });
    setTestInfrastructure({ actor });

    renderRouter({ routes: [homeRoute] });

    expect(
      await screen.findByTestId("home.restaurant_list"),
    ).toBeInTheDocument();
    expect(screen.getByTestId("restaurant.item.1")).toBeInTheDocument();
    expect(screen.getByTestId("restaurant.item.2")).toBeInTheDocument();
    expect(screen.getByText("Jollibee")).toBeInTheDocument();
    expect(screen.getByText("Chatime")).toBeInTheDocument();

    const images = screen.getAllByRole("img");
    expect(images).toHaveLength(2);
    for (const image of images) {
      expect(image).toHaveAttribute("src", "/assets/images/placeholder.svg");
    }
  });

  it("shows an empty state when no restaurants match", async () => {
    const actor = createFakeActor({
      listRestaurants: vi.fn(async () => []),
      listOrders: vi.fn(async () => []),
      listAddresses: vi.fn(async () => []),
      getCart: vi.fn(async () => null),
    });
    setTestInfrastructure({ actor });

    renderRouter({ routes: [homeRoute] });

    expect(
      await screen.findByText("No restaurants match these filters"),
    ).toBeInTheDocument();
  });

  it("writes a cuisine selection to the URL and refetches with that filter", async () => {
    const listRestaurants = vi.fn(async () => [makeRestaurant()]);
    const actor = createFakeActor({
      listRestaurants,
      listOrders: vi.fn(async () => []),
      listAddresses: vi.fn(async () => []),
      getCart: vi.fn(async () => null),
    });
    setTestInfrastructure({ actor });

    const { router } = renderRouter({ routes: [homeRoute] });
    await screen.findByText("Lola's Carinderia");

    await userEvent.click(screen.getByTestId("home.cuisine_chip.filipino"));

    await waitFor(() => {
      expect(router.state.location.search).toMatchObject({
        cuisine: "Filipino",
      });
    });
    await waitFor(() => {
      expect(listRestaurants).toHaveBeenCalledWith(
        expect.objectContaining({ cuisine: "Filipino" }),
      );
    });
  });

  it("restores filter state from the URL on load", async () => {
    const listRestaurants = vi.fn(async () => [makeRestaurant()]);
    const actor = createFakeActor({
      listRestaurants,
      listOrders: vi.fn(async () => []),
      listAddresses: vi.fn(async () => []),
      getCart: vi.fn(async () => null),
    });
    setTestInfrastructure({ actor });

    renderRouter({
      routes: [homeRoute],
      initialSearch: { sort: "rating", minRating: "45" },
    });

    await screen.findByText("Lola's Carinderia");
    await waitFor(() => {
      expect(listRestaurants).toHaveBeenCalledWith(
        expect.objectContaining({ sort: "rating", minRating: 45n }),
      );
    });
  });

  it("writes a price-range selection to the URL and refetches with maxPrice", async () => {
    // The price slider is the newest filter control. Moving it must persist the
    // band in the URL (so a refresh reproduces it) and pass the matching
    // centavo ceiling to the backend filter.
    const listRestaurants = vi.fn(async () => [makeRestaurant()]);
    const actor = createFakeActor({
      listRestaurants,
      listOrders: vi.fn(async () => []),
      listAddresses: vi.fn(async () => []),
      getCart: vi.fn(async () => null),
    });
    setTestInfrastructure({ actor });

    const { router } = renderRouter({ routes: [homeRoute] });
    await screen.findByText("Lola's Carinderia");

    // The slider starts at index 0 ("Any price"); one ArrowRight moves it to
    // the "Under ₱150" band (15000 centavos).
    const slider = screen.getByTestId("home.price_slider");
    const thumb = slider.querySelector<HTMLElement>(
      '[data-slot="slider-thumb"]',
    );
    expect(thumb).not.toBeNull();
    thumb?.focus();
    await userEvent.keyboard("{ArrowRight}");

    await waitFor(() => {
      expect(router.state.location.search).toMatchObject({ maxPrice: "15000" });
    });
    await waitFor(() => {
      expect(listRestaurants).toHaveBeenCalledWith(
        expect.objectContaining({ maxPrice: 15000n }),
      );
    });
  });

  it("restores the price-range filter from the URL on load", async () => {
    const listRestaurants = vi.fn(async () => [makeRestaurant()]);
    const actor = createFakeActor({
      listRestaurants,
      listOrders: vi.fn(async () => []),
      listAddresses: vi.fn(async () => []),
      getCart: vi.fn(async () => null),
    });
    setTestInfrastructure({ actor });

    renderRouter({
      routes: [homeRoute],
      initialSearch: { maxPrice: "30000" },
    });

    await screen.findByText("Lola's Carinderia");
    await waitFor(() => {
      expect(listRestaurants).toHaveBeenCalledWith(
        expect.objectContaining({ maxPrice: 30000n }),
      );
    });
    // The slider reflects the restored band rather than resetting to "Any".
    expect(screen.getByTestId("home.price_slider")).toHaveAttribute(
      "aria-valuetext",
      "Under ₱300",
    );
  });

  it("navigates to the search route with the typed query", async () => {
    const actor = createFakeActor({
      listRestaurants: vi.fn(async () => [makeRestaurant()]),
      listOrders: vi.fn(async () => []),
      listAddresses: vi.fn(async () => []),
      getCart: vi.fn(async () => null),
    });
    setTestInfrastructure({ actor });

    const { router } = renderRouter({
      routes: [
        homeRoute,
        {
          path: "/search",
          component: () => <div>Search results page</div>,
          validateSearch: (search: Record<string, unknown>) => search,
        },
      ],
    });

    await screen.findByText("Lola's Carinderia");
    await userEvent.type(
      screen.getByLabelText("Search restaurants or dishes"),
      "adobo",
    );
    await userEvent.click(screen.getByTestId("home.search_button"));

    await waitFor(() => {
      expect(router.state.location.pathname).toBe("/search");
      expect(router.state.location.search).toMatchObject({ q: "adobo" });
    });
  });
});
