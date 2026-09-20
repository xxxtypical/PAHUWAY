import { RestaurantForm } from "@/components/admin/RestaurantForm";
import { blob, makeRestaurant } from "@/test/fixtures";
import { renderWithProviders } from "@/test/render";
import type { RestaurantInput } from "@/types";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

/**
 * The admin restaurant form is the write side of the nullable image repair.
 * The backend field is `?Storage.ExternalBlob`, so the form must submit:
 *
 * - `undefined` when an existing cover is cleared (store no cover),
 * - the untouched existing reference when nothing is changed,
 * - the newly uploaded blob when a file is chosen.
 *
 * A regression here either resurrects a deleted image or drops a live one.
 */
describe("RestaurantForm", () => {
  it("submits undefined for a cleared cover image", async () => {
    const onSubmit = vi.fn<(values: RestaurantInput) => void>();
    renderWithProviders(
      <RestaurantForm
        restaurant={makeRestaurant({
          coverImageUrl: blob("https://cdn.example.test/lola.jpg"),
        })}
        onSubmit={onSubmit}
        onCancel={vi.fn()}
        isPending={false}
      />,
    );

    // The existing cover renders as a preview with a Remove control.
    await screen.findByAltText("Restaurant cover preview");
    await userEvent.click(
      screen.getByTestId("admin.restaurant_cover_remove_button"),
    );

    await userEvent.click(screen.getByTestId("admin.restaurant_submit_button"));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledTimes(1);
    });
    const values = onSubmit.mock.calls[0][0];
    expect(values.coverImageUrl).toBeUndefined();
    expect(values.name).toBe("Lola's Carinderia");
  });

  it("re-wraps an untouched existing cover image on submit", async () => {
    const onSubmit = vi.fn<(values: RestaurantInput) => void>();
    renderWithProviders(
      <RestaurantForm
        restaurant={makeRestaurant({
          coverImageUrl: blob("https://cdn.example.test/lola.jpg"),
        })}
        onSubmit={onSubmit}
        onCancel={vi.fn()}
        isPending={false}
      />,
    );

    await screen.findByAltText("Restaurant cover preview");
    await userEvent.click(screen.getByTestId("admin.restaurant_submit_button"));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledTimes(1);
    });
    const values = onSubmit.mock.calls[0][0];
    expect(values.coverImageUrl?.getDirectURL()).toBe(
      "https://cdn.example.test/lola.jpg",
    );
  });

  it("submits undefined for a new restaurant with no cover chosen", async () => {
    const onSubmit = vi.fn<(values: RestaurantInput) => void>();
    renderWithProviders(
      <RestaurantForm
        onSubmit={onSubmit}
        onCancel={vi.fn()}
        isPending={false}
      />,
    );

    await userEvent.type(
      screen.getByTestId("admin.restaurant_name_input"),
      "Aling Nena's",
    );
    await userEvent.click(screen.getByTestId("admin.restaurant_submit_button"));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledTimes(1);
    });
    const values = onSubmit.mock.calls[0][0];
    expect(values.coverImageUrl).toBeUndefined();
    expect(values.name).toBe("Aling Nena's");
    // Delivery fee is entered in pesos and stored as centavos.
    expect(values.deliveryFee).toBe(4900n);
  });
});
