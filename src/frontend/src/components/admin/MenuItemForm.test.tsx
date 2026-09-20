import { MenuItemForm } from "@/components/admin/MenuItemForm";
import { blob, makeMenuItem } from "@/test/fixtures";
import { renderWithProviders } from "@/test/render";
import type { MenuItemInput } from "@/types";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

/**
 * The admin dish form is the write side of the nullable image repair. The
 * backend field is `?Storage.ExternalBlob`, so the form must submit:
 *
 * - `undefined` when an existing photo is cleared (store no photo),
 * - the untouched existing reference when nothing is changed,
 * - `undefined` for a brand-new dish with no photo chosen.
 *
 * A regression here either resurrects a deleted photo or drops a live one.
 */
describe("MenuItemForm", () => {
  it("submits undefined for a cleared dish photo", async () => {
    const onSubmit = vi.fn<(values: MenuItemInput) => void>();
    renderWithProviders(
      <MenuItemForm
        item={makeMenuItem({
          imageUrl: blob("https://cdn.example.test/adobo.jpg"),
        })}
        onSubmit={onSubmit}
        onCancel={vi.fn()}
        isPending={false}
      />,
    );

    await screen.findByAltText("Dish preview");
    await userEvent.click(
      screen.getByTestId("admin.menu_item_image_remove_button"),
    );

    await userEvent.click(screen.getByTestId("admin.menu_item_submit_button"));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledTimes(1);
    });
    const values = onSubmit.mock.calls[0][0];
    expect(values.imageUrl).toBeUndefined();
    expect(values.name).toBe("Chicken Adobo");
    // Price is entered in pesos and stored as centavos.
    expect(values.price).toBe(18900n);
  });

  it("re-wraps an untouched existing dish photo on submit", async () => {
    const onSubmit = vi.fn<(values: MenuItemInput) => void>();
    renderWithProviders(
      <MenuItemForm
        item={makeMenuItem({
          imageUrl: blob("https://cdn.example.test/adobo.jpg"),
        })}
        onSubmit={onSubmit}
        onCancel={vi.fn()}
        isPending={false}
      />,
    );

    await screen.findByAltText("Dish preview");
    await userEvent.click(screen.getByTestId("admin.menu_item_submit_button"));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledTimes(1);
    });
    const values = onSubmit.mock.calls[0][0];
    expect(values.imageUrl?.getDirectURL()).toBe(
      "https://cdn.example.test/adobo.jpg",
    );
  });

  it("submits undefined for a new dish with no photo chosen", async () => {
    const onSubmit = vi.fn<(values: MenuItemInput) => void>();
    renderWithProviders(
      <MenuItemForm onSubmit={onSubmit} onCancel={vi.fn()} isPending={false} />,
    );

    await userEvent.type(
      screen.getByTestId("admin.menu_item_name_input"),
      "Pork Sisig",
    );
    await userEvent.type(
      screen.getByTestId("admin.menu_item_price_input"),
      "219",
    );
    await userEvent.click(screen.getByTestId("admin.menu_item_submit_button"));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledTimes(1);
    });
    const values = onSubmit.mock.calls[0][0];
    expect(values.imageUrl).toBeUndefined();
    expect(values.name).toBe("Pork Sisig");
    expect(values.price).toBe(21900n);
  });
});
