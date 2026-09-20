import { OrderStatus, PaymentMethod } from "@/backend";

export const APP_NAME = "Sagana";
export const APP_TAGLINE = "Filipino food, delivered fast";

/** Flat delivery fee applied when a restaurant does not specify one (₱49). */
export const DEFAULT_DELIVERY_FEE = 4900n;

/** Fallback delivery estimate when a restaurant has none (30 minutes). */
export const DEFAULT_DELIVERY_MINUTES = 30n;

export const CUISINES = [
  "Filipino",
  "Chicken",
  "Burgers",
  "Pizza",
  "Milk Tea",
  "Desserts",
  "Silog",
  "Seafood",
] as const;

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  [OrderStatus.placed]: "Order placed",
  [OrderStatus.confirmed]: "Confirmed",
  [OrderStatus.preparing]: "Preparing",
  [OrderStatus.outForDelivery]: "Out for delivery",
  [OrderStatus.delivered]: "Delivered",
};

/** Ordered pipeline used by the tracking timeline. */
export const ORDER_STATUS_FLOW: OrderStatus[] = [
  OrderStatus.placed,
  OrderStatus.confirmed,
  OrderStatus.preparing,
  OrderStatus.outForDelivery,
  OrderStatus.delivered,
];

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  [PaymentMethod.cashOnDelivery]: "Cash on delivery",
  [PaymentMethod.card]: "Card",
};

export const QUERY_KEYS = {
  restaurants: ["restaurants"] as const,
  restaurant: (id: string) => ["restaurant", id] as const,
  search: (term: string) => ["restaurants", "search", term] as const,
  menu: (id: string) => ["menu", id] as const,
  cart: ["cart"] as const,
  addresses: ["addresses"] as const,
  orders: ["orders"] as const,
  order: (id: string) => ["order", id] as const,
  adminSummary: ["admin", "summary"] as const,
  adminOrders: (status: string) => ["admin", "orders", status] as const,
  adminRestaurants: ["admin", "restaurants"] as const,
  callerRole: ["caller", "role"] as const,
} as const;
