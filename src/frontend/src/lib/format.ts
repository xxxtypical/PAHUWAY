import type { Address, Centavos, DeliveryMinutes, Timestamp } from "@/backend";
import type { ExternalBlob } from "@caffeineai/object-storage";

/**
 * Resolve an image field to a displayable URL.
 *
 * Backend image fields are `Storage.ExternalBlob`, which the generated bindings
 * surface as `ExternalBlob`. Older bindings typed them as `string`, so this
 * helper accepts both shapes and returns "" when no image is set.
 *
 * A blob with no bytes (the seeded demo catalogue) or a malformed reference
 * resolves to "" so callers can render a placeholder instead of an image.
 */
export function blobUrl(
  value: ExternalBlob | string | undefined | null,
): string {
  if (value === undefined || value === null) return "";
  if (typeof value === "string") return value;
  try {
    const url = value.getDirectURL();
    return typeof url === "string" ? url : "";
  } catch {
    return "";
  }
}

/** True when an image field resolves to a usable display URL. */
export function hasImage(
  value: ExternalBlob | string | undefined | null,
): boolean {
  return blobUrl(value) !== "";
}

/**
 * Format an integer centavo amount as Philippine pesos.
 * `formatPeso(4900n)` -> "₱49.00"
 */
export function formatPeso(
  centavos: Centavos | number | undefined | null,
): string {
  const value = toNumber(centavos);
  if (value === null) return "₱0.00";
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value / 100);
}

/** Compact peso for dense cards: `formatPesoShort(4900n)` -> "₱49" */
export function formatPesoShort(
  centavos: Centavos | number | undefined | null,
): string {
  const value = toNumber(centavos);
  if (value === null) return "₱0";
  const pesos = value / 100;
  const hasCentavos = value % 100 !== 0;
  return `₱${pesos.toLocaleString("en-PH", {
    minimumFractionDigits: hasCentavos ? 2 : 0,
    maximumFractionDigits: 2,
  })}`;
}

/** Convert a backend nanosecond timestamp into a Date, or null when invalid. */
export function timestampToDate(
  timestamp: Timestamp | undefined | null,
): Date | null {
  if (timestamp === undefined || timestamp === null) return null;
  const date = new Date(Number(timestamp / 1_000_000n));
  return Number.isNaN(date.getTime()) ? null : date;
}

/** "25–35 min" style delivery estimate. */
export function formatDeliveryTime(
  minutes: DeliveryMinutes | undefined | null,
): string {
  const value = toNumber(minutes);
  if (value === null || value <= 0) return "30–40 min";
  const low = Math.max(5, value - 5);
  const high = value + 5;
  return `${low}–${high} min`;
}

/** "25 min" single-value estimate for compact rows. */
export function formatDeliveryMinutes(
  minutes: DeliveryMinutes | undefined | null,
): string {
  const value = toNumber(minutes);
  if (value === null || value <= 0) return "30 min";
  return `${value} min`;
}

/** "Sep 20, 2026" */
export function formatDate(timestamp: Timestamp | undefined | null): string {
  const date = timestampToDate(timestamp);
  if (!date) return "—";
  return date.toLocaleDateString("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/** "Sep 20, 2026, 3:42 PM" */
export function formatDateTime(
  timestamp: Timestamp | undefined | null,
): string {
  const date = timestampToDate(timestamp);
  if (!date) return "—";
  return date.toLocaleString("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

/** "3:42 PM" */
export function formatTime(timestamp: Timestamp | undefined | null): string {
  const date = timestampToDate(timestamp);
  if (!date) return "—";
  return date.toLocaleTimeString("en-PH", {
    hour: "numeric",
    minute: "2-digit",
  });
}

/** "2 hrs ago" / "just now" relative to now. */
export function formatRelative(
  timestamp: Timestamp | undefined | null,
): string {
  const date = timestampToDate(timestamp);
  if (!date) return "—";
  const diffMs = Date.now() - date.getTime();
  const minutes = Math.round(diffMs / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} hr${hours === 1 ? "" : "s"} ago`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days} day${days === 1 ? "" : "s"} ago`;
  return formatDate(timestamp);
}

/** Backend rating is stored as tenths (48 -> 4.8). */
export function formatRating(
  rating: bigint | number | undefined | null,
): string {
  const value = toNumber(rating);
  if (value === null) return "New";
  return (value / 10).toFixed(1);
}

/** "Brgy. Poblacion, Makati" — the header delivery-address line. */
export function formatAddressShort(
  address: Address | undefined | null,
): string {
  if (!address) return "Set your delivery address";
  return `Brgy. ${address.barangay}, ${address.city}`;
}

/** Full single-line address including street and landmark. */
export function formatAddressFull(address: Address | undefined | null): string {
  if (!address) return "No address selected";
  const parts = [address.street, `Brgy. ${address.barangay}`, address.city];
  if (address.landmark) parts.push(`Landmark: ${address.landmark}`);
  return parts.join(", ");
}

/** "1 item" / "3 items" */
export function formatItemCount(count: number): string {
  return `${count} item${count === 1 ? "" : "s"}`;
}

/** "×2" quantity label. */
export function formatQuantity(quantity: bigint | number): string {
  return `×${toNumber(quantity) ?? 0}`;
}

function toNumber(value: bigint | number | undefined | null): number | null {
  if (value === undefined || value === null) return null;
  const num = typeof value === "bigint" ? Number(value) : value;
  return Number.isFinite(num) ? num : null;
}
