import {
  blobUrl,
  formatAddressFull,
  formatAddressShort,
  formatDeliveryMinutes,
  formatDeliveryTime,
  formatItemCount,
  formatPeso,
  formatPesoShort,
  formatQuantity,
  formatRating,
  hasImage,
  timestampToDate,
} from "@/lib/format";
import { ExternalBlob } from "@caffeineai/object-storage";
import { describe, expect, it } from "vitest";

/**
 * Pure formatting helpers. These are the peso/address/rating conversions the
 * whole marketplace renders through, so a regression here is visible on every
 * card, cart line, and order summary.
 */
describe("formatPeso", () => {
  it("renders integer centavos as Philippine pesos", () => {
    expect(formatPeso(4900n)).toBe("₱49.00");
    expect(formatPeso(18900n)).toBe("₱189.00");
    expect(formatPeso(0n)).toBe("₱0.00");
  });

  it("falls back to zero for missing values", () => {
    expect(formatPeso(undefined)).toBe("₱0.00");
    expect(formatPeso(null)).toBe("₱0.00");
  });
});

describe("formatPesoShort", () => {
  it("drops centavos for whole-peso amounts", () => {
    expect(formatPesoShort(4900n)).toBe("₱49");
    expect(formatPesoShort(100000n)).toBe("₱1,000");
  });

  it("keeps centavos when the amount is not whole", () => {
    expect(formatPesoShort(4950n)).toBe("₱49.50");
  });
});

describe("formatRating", () => {
  it("converts tenths to a one-decimal rating", () => {
    expect(formatRating(48n)).toBe("4.8");
    expect(formatRating(50n)).toBe("5.0");
  });

  it("labels a missing rating as New", () => {
    expect(formatRating(undefined)).toBe("New");
  });
});

describe("formatDeliveryTime", () => {
  it("renders a window around the estimate", () => {
    expect(formatDeliveryTime(30n)).toBe("25–35 min");
  });

  it("falls back to a default window when unset", () => {
    expect(formatDeliveryTime(undefined)).toBe("30–40 min");
    expect(formatDeliveryTime(0n)).toBe("30–40 min");
  });
});

describe("formatDeliveryMinutes", () => {
  it("renders a single value", () => {
    expect(formatDeliveryMinutes(30n)).toBe("30 min");
  });

  it("falls back when unset", () => {
    expect(formatDeliveryMinutes(undefined)).toBe("30 min");
  });
});

describe("address formatting", () => {
  const address = {
    id: 1n,
    addressLabel: "Home",
    street: "12 Mabini St.",
    barangay: "Poblacion",
    city: "Makati",
    landmark: "Blue gate",
    isDefault: true,
  };

  it("renders the short barangay/city line", () => {
    expect(formatAddressShort(address)).toBe("Brgy. Poblacion, Makati");
  });

  it("renders the full line including street and landmark", () => {
    expect(formatAddressFull(address)).toBe(
      "12 Mabini St., Brgy. Poblacion, Makati, Landmark: Blue gate",
    );
  });

  it("handles a missing address", () => {
    expect(formatAddressShort(undefined)).toBe("Set your delivery address");
    expect(formatAddressFull(null)).toBe("No address selected");
  });
});

describe("formatItemCount and formatQuantity", () => {
  it("pluralizes item counts", () => {
    expect(formatItemCount(1)).toBe("1 item");
    expect(formatItemCount(3)).toBe("3 items");
  });

  it("renders a quantity label", () => {
    expect(formatQuantity(2n)).toBe("×2");
  });
});

describe("timestampToDate", () => {
  it("converts nanoseconds to a Date", () => {
    const date = timestampToDate(1_700_000_000_000_000_000n);
    expect(date?.getTime()).toBe(1_700_000_000_000);
  });

  it("returns null for missing values", () => {
    expect(timestampToDate(undefined)).toBeNull();
    expect(timestampToDate(null)).toBeNull();
  });
});

describe("blobUrl", () => {
  it("resolves an ExternalBlob to its direct URL", () => {
    expect(
      blobUrl(ExternalBlob.fromURL("https://cdn.example.test/a.jpg")),
    ).toBe("https://cdn.example.test/a.jpg");
  });

  it("passes through a plain string and returns empty for missing values", () => {
    expect(blobUrl("https://cdn.example.test/b.jpg")).toBe(
      "https://cdn.example.test/b.jpg",
    );
    expect(blobUrl(undefined)).toBe("");
    expect(blobUrl(null)).toBe("");
  });

  it("returns empty for an empty blob instead of throwing", () => {
    // The seeded catalogue stores an empty Blob for every image field. The
    // generated bindings decode it to an ExternalBlob with no direct URL, so
    // the helper must resolve to "" rather than throw and blank the listing.
    expect(blobUrl(ExternalBlob.fromURL(""))).toBe("");
  });
});

describe("hasImage", () => {
  it("is true only when the field resolves to a usable URL", () => {
    expect(
      hasImage(ExternalBlob.fromURL("https://cdn.example.test/a.jpg")),
    ).toBe(true);
    expect(hasImage("https://cdn.example.test/b.jpg")).toBe(true);
  });

  it("is false for an empty blob and for missing values", () => {
    expect(hasImage(ExternalBlob.fromURL(""))).toBe(false);
    expect(hasImage(undefined)).toBe(false);
    expect(hasImage(null)).toBe(false);
  });
});
