import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
import type { ExternalBlob } from "@caffeineai/object-storage";
export type { ExternalBlob } from "@caffeineai/object-storage";
export type AddToCartResult = {
    __kind__: "added";
    added: Cart;
} | {
    __kind__: "differentRestaurant";
    differentRestaurant: {
        requestedRestaurantId: RestaurantId;
        requestedRestaurantName: string;
        currentRestaurantName: string;
        currentRestaurantId: RestaurantId;
    };
};
export interface Address {
    id: AddressId;
    street: string;
    city: string;
    barangay: string;
    addressLabel: string;
    isDefault: boolean;
    landmark?: string;
}
export type AddressId = bigint;
export interface AddressInput {
    street: string;
    city: string;
    barangay: string;
    addressLabel: string;
    landmark?: string;
}
export interface Cart {
    total: Centavos;
    deliveryFee: Centavos;
    restaurantId: RestaurantId;
    restaurantName: string;
    items: Array<CartItem>;
    subtotal: Centavos;
}
export interface CartItem {
    name: string;
    imageUrl?: ExternalBlob;
    quantity: bigint;
    unitPrice: Centavos;
    menuItemId: MenuItemId;
}
export interface Cell {
    value: Value;
    name: string;
}
export type Centavos = bigint;
export interface DashboardSummary {
    ordersByStatus: OrderStatusCounts;
    restaurantCount: bigint;
    menuItemCount: bigint;
}
export type DeliveryMinutes = bigint;
export type Error_ = {
    __kind__: "FrontendOriginsNotConfigured";
    FrontendOriginsNotConfigured: null;
} | {
    __kind__: "MixedSsoSources";
    MixedSsoSources: {
        otherKeys: Array<string>;
        ssoKeys: Array<string>;
    };
} | {
    __kind__: "Stale";
    Stale: {
        ageNs: bigint;
    };
} | {
    __kind__: "MalformedCandid";
    MalformedCandid: null;
} | {
    __kind__: "AmbiguousAttribute";
    AmbiguousAttribute: {
        field: string;
        sources: Array<string>;
    };
} | {
    __kind__: "NoAttributes";
    NoAttributes: null;
} | {
    __kind__: "UnknownNonce";
    UnknownNonce: null;
} | {
    __kind__: "UntrustedSsoSource";
    UntrustedSsoSource: {
        domain: string;
    };
} | {
    __kind__: "MissingField";
    MissingField: string;
} | {
    __kind__: "FrontendOriginMismatch";
    FrontendOriginMismatch: {
        got: string;
        expected: Array<string>;
    };
};
export interface MenuCategory {
    category: string;
    items: Array<MenuItem>;
}
export interface MenuItem {
    id: MenuItemId;
    name: string;
    description: string;
    available: boolean;
    restaurantId: RestaurantId;
    imageUrl?: ExternalBlob;
    category: string;
    price: Centavos;
}
export type MenuItemId = bigint;
export interface MenuItemInput {
    name: string;
    description: string;
    available: boolean;
    imageUrl?: ExternalBlob;
    category: string;
    price: Centavos;
}
export interface Order {
    id: OrderId;
    status: OrderStatus;
    total: Centavos;
    paymentMethod: PaymentMethod;
    deliveryFee: Centavos;
    createdAt: Timestamp;
    deliveryNotes?: string;
    estimatedDeliveryMinutes: DeliveryMinutes;
    restaurantId: RestaurantId;
    updatedAt: Timestamp;
    restaurantName: string;
    address: Address;
    items: Array<OrderLine>;
    orderNumber: string;
    subtotal: Centavos;
}
export type OrderId = bigint;
export interface OrderLine {
    name: string;
    quantity: bigint;
    unitPrice: Centavos;
    menuItemId: MenuItemId;
}
export interface OrderStatusCounts {
    preparing: bigint;
    outForDelivery: bigint;
    placed: bigint;
    delivered: bigint;
    confirmed: bigint;
}
export interface PlaceOrderInput {
    paymentMethod: PaymentMethod;
    deliveryNotes?: string;
    restaurantId: RestaurantId;
    addressId: AddressId;
}
export interface Restaurant {
    id: RestaurantId;
    coverImageUrl?: ExternalBlob;
    active: boolean;
    deliveryFee: Centavos;
    ratingCount: bigint;
    name: string;
    estimatedDeliveryMinutes: DeliveryMinutes;
    description: string;
    cuisine: string;
    rating: bigint;
    operatingHours: string;
    promoLabel?: string;
}
export interface RestaurantDetail {
    menu: Array<MenuItem>;
    restaurant: Restaurant;
}
export interface RestaurantFilter {
    minRating?: bigint;
    maxDeliveryFee?: Centavos;
    sort?: RestaurantSort;
    maxPrice?: Centavos;
    searchTerm?: string;
    cuisine?: string;
    maxDeliveryMinutes?: DeliveryMinutes;
}
export type RestaurantId = bigint;
export interface RestaurantInput {
    coverImageUrl?: ExternalBlob;
    deliveryFee: Centavos;
    name: string;
    estimatedDeliveryMinutes: DeliveryMinutes;
    description: string;
    cuisine: string;
    operatingHours: string;
    promoLabel?: string;
}
export interface Result {
    hasMore: boolean;
    rows: Array<Array<Cell>>;
}
export type Result__1 = {
    __kind__: "ok";
    ok: null;
} | {
    __kind__: "err";
    err: Error_;
};
export type Timestamp = bigint;
export type Value = {
    __kind__: "int";
    int: bigint;
} | {
    __kind__: "nat";
    nat: bigint;
} | {
    __kind__: "float";
    float: number;
} | {
    __kind__: "bool";
    bool: boolean;
} | {
    __kind__: "null";
    null: null;
} | {
    __kind__: "text";
    text: string;
};
export enum OrderStatus {
    preparing = "preparing",
    outForDelivery = "outForDelivery",
    placed = "placed",
    delivered = "delivered",
    confirmed = "confirmed"
}
export enum PaymentMethod {
    cashOnDelivery = "cashOnDelivery",
    card = "card"
}
export enum RestaurantSort {
    deliveryFee = "deliveryFee",
    priceLowToHigh = "priceLowToHigh",
    deliveryTime = "deliveryTime",
    rating = "rating"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    /**
     * / Add a saved address for the caller.
     */
    addAddress(input: AddressInput): Promise<Address>;
    /**
     * / Add a menu item to a restaurant (admin only).
     */
    addMenuItem(restaurantId: RestaurantId, input: MenuItemInput): Promise<MenuItem | null>;
    /**
     * / Add a dish to the caller's cart, or report a restaurant conflict.
     */
    addToCart(restaurantId: RestaurantId, menuItemId: MenuItemId, quantity: bigint): Promise<AddToCartResult>;
    /**
     * / Advance an order to the next status (admin only).
     */
    advanceOrderStatus(id: OrderId): Promise<Order | null>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    /**
     * / Empty the caller's cart.
     */
    clearCart(): Promise<void>;
    /**
     * / Create a restaurant (admin only).
     */
    createRestaurant(input: RestaurantInput): Promise<Restaurant>;
    /**
     * / Delete one of the caller's saved addresses.
     */
    deleteAddress(id: AddressId): Promise<boolean>;
    /**
     * / Delete a restaurant and its menu items (admin only).
     */
    deleteRestaurant(id: RestaurantId): Promise<boolean>;
    execute(qJson: string): Promise<Result>;
    /**
     * / Return the backend's behavioral API documentation as Markdown.
     */
    getApiDoc(): Promise<string>;
    getCallerUserRole(): Promise<UserRole>;
    /**
     * / Return the caller's current cart, if any.
     */
    getCart(): Promise<Cart | null>;
    /**
     * / Dashboard summary counts (admin only).
     */
    getDashboardSummary(): Promise<DashboardSummary>;
    /**
     * / Group a restaurant's menu items by category.
     */
    getMenuByCategory(id: RestaurantId): Promise<Array<MenuCategory>>;
    /**
     * / Fetch one of the caller's orders by id.
     */
    getOrder(id: OrderId): Promise<Order | null>;
    /**
     * / Fetch a restaurant with its full menu.
     */
    getRestaurant(id: RestaurantId): Promise<RestaurantDetail | null>;
    isCallerAdmin(): Promise<boolean>;
    /**
     * / List the caller's saved addresses.
     */
    listAddresses(): Promise<Array<Address>>;
    /**
     * / List all orders, optionally filtered by status (admin only).
     */
    listAllOrders(status: OrderStatus | null): Promise<Array<Order>>;
    /**
     * / List the caller's past orders, newest first.
     */
    listOrders(): Promise<Array<Order>>;
    /**
     * / List restaurants matching the given filter, sorted accordingly.
     */
    listRestaurants(filter: RestaurantFilter): Promise<Array<Restaurant>>;
    /**
     * / Count of menu items (admin only).
     */
    menuItemCount(): Promise<bigint>;
    /**
     * / Count of orders grouped by status (admin only).
     */
    ordersByStatus(): Promise<OrderStatusCounts>;
    /**
     * / Place an order from the caller's current cart.
     */
    placeOrder(input: PlaceOrderInput): Promise<Order>;
    /**
     * / Remove a line from the caller's cart.
     */
    removeCartItem(menuItemId: MenuItemId): Promise<Cart | null>;
    /**
     * / Remove a menu item (admin only).
     */
    removeMenuItem(itemId: MenuItemId): Promise<boolean>;
    /**
     * / Count of restaurants (admin only).
     */
    restaurantCount(): Promise<bigint>;
    schema(): Promise<string>;
    /**
     * / Search restaurant names and dish names.
     */
    searchRestaurants(term: string): Promise<Array<Restaurant>>;
    /**
     * / Mark one of the caller's addresses as the default.
     */
    setDefaultAddress(id: AddressId): Promise<Address | null>;
    /**
     * / Update one of the caller's saved addresses.
     */
    updateAddress(id: AddressId, input: AddressInput): Promise<Address | null>;
    /**
     * / Set the quantity of a cart line; zero removes it.
     */
    updateCartItem(menuItemId: MenuItemId, quantity: bigint): Promise<Cart | null>;
    /**
     * / Update a menu item (admin only).
     */
    updateMenuItem(itemId: MenuItemId, input: MenuItemInput): Promise<MenuItem | null>;
    /**
     * / Update a restaurant (admin only).
     */
    updateRestaurant(id: RestaurantId, input: RestaurantInput): Promise<Restaurant | null>;
}
