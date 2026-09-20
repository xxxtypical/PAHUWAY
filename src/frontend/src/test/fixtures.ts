import type {
  Address,
  Cart,
  MenuCategory,
  MenuItem,
  Order,
  OrderStatusCounts,
  Restaurant,
  RestaurantDetail,
} from "@/backend";
import { OrderStatus, PaymentMethod } from "@/backend";
import { ExternalBlob } from "@caffeineai/object-storage";

/**
 * Typed fixtures for the marketplace. Values are integer centavos of PHP and
 * nanosecond timestamps, matching the generated backend bindings.
 */

export function blob(url: string): ExternalBlob {
  return ExternalBlob.fromURL(url);
}

export function makeRestaurant(
  overrides: Partial<Restaurant> = {},
): Restaurant {
  return {
    id: 1n,
    name: "Lola's Carinderia",
    cuisine: "Filipino",
    description: "Home-style Filipino plates cooked fresh every morning.",
    coverImageUrl: blob("https://cdn.example.test/lola.jpg"),
    active: true,
    deliveryFee: 4900n,
    estimatedDeliveryMinutes: 30n,
    operatingHours: "8:00 AM – 9:00 PM",
    rating: 48n,
    ratingCount: 120n,
    promoLabel: undefined,
    ...overrides,
  };
}

export function makeMenuItem(overrides: Partial<MenuItem> = {}): MenuItem {
  return {
    id: 10n,
    name: "Chicken Adobo",
    description: "Braised chicken in soy, vinegar, and garlic.",
    available: true,
    restaurantId: 1n,
    imageUrl: blob("https://cdn.example.test/adobo.jpg"),
    category: "Mains",
    price: 18900n,
    ...overrides,
  };
}

export function makeRestaurantDetail(
  overrides: Partial<RestaurantDetail> = {},
): RestaurantDetail {
  return {
    restaurant: makeRestaurant(),
    menu: [makeMenuItem()],
    ...overrides,
  };
}

export function makeMenuCategories(): MenuCategory[] {
  return [
    {
      category: "Mains",
      items: [
        makeMenuItem({ id: 10n, name: "Chicken Adobo", price: 18900n }),
        makeMenuItem({
          id: 11n,
          name: "Pork Sisig",
          price: 21900n,
          category: "Mains",
        }),
      ],
    },
    {
      category: "Drinks",
      items: [
        makeMenuItem({
          id: 12n,
          name: "Milk Tea",
          price: 9900n,
          category: "Drinks",
        }),
      ],
    },
  ];
}

export function makeAddress(overrides: Partial<Address> = {}): Address {
  return {
    id: 1n,
    addressLabel: "Home",
    street: "12 Mabini St.",
    barangay: "Poblacion",
    city: "Makati",
    landmark: "Blue gate beside the sari-sari store",
    isDefault: true,
    ...overrides,
  };
}

export function makeCart(overrides: Partial<Cart> = {}): Cart {
  return {
    restaurantId: 1n,
    restaurantName: "Lola's Carinderia",
    items: [
      {
        menuItemId: 10n,
        name: "Chicken Adobo",
        imageUrl: blob("https://cdn.example.test/adobo.jpg"),
        quantity: 2n,
        unitPrice: 18900n,
      },
    ],
    subtotal: 37800n,
    deliveryFee: 4900n,
    total: 42700n,
    ...overrides,
  };
}

export function makeOrder(overrides: Partial<Order> = {}): Order {
  return {
    id: 100n,
    orderNumber: "SGN-1001",
    status: OrderStatus.preparing,
    restaurantId: 1n,
    restaurantName: "Lola's Carinderia",
    items: [
      {
        menuItemId: 10n,
        name: "Chicken Adobo",
        quantity: 2n,
        unitPrice: 18900n,
      },
    ],
    subtotal: 37800n,
    deliveryFee: 4900n,
    total: 42700n,
    paymentMethod: PaymentMethod.cashOnDelivery,
    address: makeAddress(),
    deliveryNotes: "Leave at the guardhouse.",
    estimatedDeliveryMinutes: 30n,
    createdAt: 1_700_000_000_000_000_000n,
    updatedAt: 1_700_000_000_000_000_000n,
    ...overrides,
  };
}

export function makeStatusCounts(
  overrides: Partial<OrderStatusCounts> = {},
): OrderStatusCounts {
  return {
    placed: 2n,
    confirmed: 1n,
    preparing: 3n,
    outForDelivery: 1n,
    delivered: 5n,
    ...overrides,
  };
}
