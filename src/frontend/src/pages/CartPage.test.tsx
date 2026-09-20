import { CartPage } from "@/pages/CartPage";
import { createFakeActor } from "@/test/fake-actor";
import { makeCart } from "@/test/fixtures";
import {
  resetTestInfrastructure,
  setTestInfrastructure,
} from "@/test/infrastructure-mock";
import { renderRouter } from "@/test/render";
import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock(
  "@caffeineai/core-infrastructure",
  () => import("@/test/infrastructure-mock"),
);

const cartRoute = { path: "/cart", component: CartPage };

afterEach(() => {
  resetTestInfrastructure();
});

/**
 * Read a summary amount by its visible label. `CartSummary` renders each
 * amount as the `<dd>` sibling of its `<dt>` label inside the `cart.summary`
 * section; the `Currency` span does not forward a `data-ocid`, so the label
 * pairing is the stable observable seam.
 */
function summaryAmount(label: string): HTMLElement {
  const summary = screen.getByTestId("cart.summary");
  const term = within(summary).getByText(label);
  const value = term.parentElement?.querySelector("dd");
  if (!value) {
    throw new Error(`No summary amount rendered for "${label}"`);
  }
  return value;
}

/**
 * Cart review: line items, peso totals, quantity controls, and clearing.
 * Prices are integer centavos, so ₱378.00 is 37800n.
 */
describe("CartPage", () => {
  it("shows an empty state when the cart has no items", async () => {
    const actor = createFakeActor({
      getCart: vi.fn(async () => null),
    });
    setTestInfrastructure({ actor });

    renderRouter({ routes: [cartRoute], initialPath: "/cart" });

    expect(await screen.findByText("Your cart is empty")).toBeInTheDocument();
  });

  it("renders line items and the peso subtotal, fee, and total", async () => {
    const actor = createFakeActor({
      getCart: vi.fn(async () => makeCart()),
    });
    setTestInfrastructure({ actor });

    renderRouter({ routes: [cartRoute], initialPath: "/cart" });

    expect(await screen.findByText("Chicken Adobo")).toBeInTheDocument();
    expect(summaryAmount("Item subtotal")).toHaveTextContent("₱378.00");
    expect(summaryAmount("Delivery fee")).toHaveTextContent("₱49.00");
    expect(summaryAmount("Total")).toHaveTextContent("₱427.00");
    expect(screen.getByTestId("cart.line_total.1")).toHaveTextContent(
      "₱378.00",
    );
  });

  it("increments a line quantity through the backend", async () => {
    const updateCartItem = vi.fn(async () => makeCart());
    const actor = createFakeActor({
      getCart: vi.fn(async () => makeCart()),
      updateCartItem,
    });
    setTestInfrastructure({ actor });

    renderRouter({ routes: [cartRoute], initialPath: "/cart" });
    await screen.findByText("Chicken Adobo");

    await userEvent.click(screen.getByTestId("cart.increment_button.1"));

    await waitFor(() => {
      expect(updateCartItem).toHaveBeenCalledWith(10n, 3n);
    });
  });

  it("clears the cart through the backend", async () => {
    const clearCart = vi.fn(async () => undefined);
    const actor = createFakeActor({
      getCart: vi.fn(async () => makeCart()),
      clearCart,
    });
    setTestInfrastructure({ actor });

    renderRouter({ routes: [cartRoute], initialPath: "/cart" });
    await screen.findByText("Chicken Adobo");

    await userEvent.click(screen.getByTestId("cart.clear_button"));

    await waitFor(() => {
      expect(clearCart).toHaveBeenCalled();
    });
  });
});
