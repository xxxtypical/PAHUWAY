import { SearchPage } from "@/pages/SearchPage";
import { createFakeActor } from "@/test/fake-actor";
import { makeRestaurant } from "@/test/fixtures";
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

const searchRoute = {
  path: "/search",
  component: SearchPage,
  validateSearch: (search: Record<string, unknown>) => search,
};

afterEach(() => {
  resetTestInfrastructure();
});

/**
 * Search results page. The query lives in the URL, so a shared link or a
 * refresh reproduces the same results.
 */
describe("SearchPage", () => {
  it("prompts for a query when none is present", async () => {
    const actor = createFakeActor({
      searchRestaurants: vi.fn(async () => []),
    });
    setTestInfrastructure({ actor });

    renderRouter({ routes: [searchRoute], initialPath: "/search" });

    expect(
      await screen.findByText("Search the whole marketplace"),
    ).toBeInTheDocument();
    expect(screen.getByTestId("search.empty_state")).toBeInTheDocument();
  });

  it("renders matching restaurants for the URL query", async () => {
    const searchRestaurants = vi.fn(async () => [
      makeRestaurant({ id: 1n, name: "Lola's Carinderia" }),
    ]);
    const actor = createFakeActor({ searchRestaurants });
    setTestInfrastructure({ actor });

    renderRouter({ routes: [searchRoute], initialPath: "/search?q=adobo" });

    expect(await screen.findByText("Lola's Carinderia")).toBeInTheDocument();
    expect(screen.getByTestId("search.results_list")).toBeInTheDocument();
    expect(searchRestaurants).toHaveBeenCalledWith("adobo");
  });

  it("shows a no-results state naming the query", async () => {
    const actor = createFakeActor({
      searchRestaurants: vi.fn(async () => []),
    });
    setTestInfrastructure({ actor });

    renderRouter({ routes: [searchRoute], initialPath: "/search?q=xyzzy" });

    expect(
      await screen.findByText("No results for “xyzzy”"),
    ).toBeInTheDocument();
    expect(screen.getByTestId("search.no_results_state")).toBeInTheDocument();
  });

  it("submits a new query and writes it to the URL", async () => {
    const searchRestaurants = vi.fn(async () => [makeRestaurant()]);
    const actor = createFakeActor({ searchRestaurants });
    setTestInfrastructure({ actor });

    const { router } = renderRouter({
      routes: [searchRoute],
      initialPath: "/search",
    });
    await screen.findByText("Search the whole marketplace");

    await userEvent.type(
      screen.getByLabelText("Search restaurants or dishes"),
      "sisig",
    );
    await userEvent.click(screen.getByTestId("search.search_button"));

    await waitFor(() => {
      expect(router.state.location.search).toMatchObject({ q: "sisig" });
    });
    await waitFor(() => {
      expect(searchRestaurants).toHaveBeenCalledWith("sisig");
    });
  });
});
