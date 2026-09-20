import type {
  AddToCartResult,
  Address,
  AddressId,
  AddressInput,
  Cart,
  CartItem,
  Centavos,
  DashboardSummary,
  DeliveryMinutes,
  MenuCategory,
  MenuItem,
  MenuItemId,
  MenuItemInput,
  Order,
  OrderId,
  OrderLine,
  OrderStatusCounts,
  PlaceOrderInput,
  Restaurant,
  RestaurantDetail,
  RestaurantFilter,
  RestaurantId,
  RestaurantInput,
  Timestamp,
} from "@/backend";

export type {
  Address,
  AddressId,
  AddressInput,
  AddToCartResult,
  Cart,
  CartItem,
  Centavos,
  DashboardSummary,
  DeliveryMinutes,
  MenuCategory,
  MenuItem,
  MenuItemId,
  MenuItemInput,
  Order,
  OrderId,
  OrderLine,
  OrderStatusCounts,
  PlaceOrderInput,
  Restaurant,
  RestaurantDetail,
  RestaurantFilter,
  RestaurantId,
  RestaurantInput,
  Timestamp,
};

export {
  OrderStatus,
  PaymentMethod,
  RestaurantSort,
  UserRole,
} from "@/backend";

/** A single line in the cart with its computed line total. */
export interface CartLine extends CartItem {
  lineTotal: Centavos;
}

/** Restaurant list filter as used by the UI (all fields optional). */
export type RestaurantQuery = RestaurantFilter;

/** A saved address plus a single-line display string. */
export interface AddressSummary {
  address: Address;
  formatted: string;
}
