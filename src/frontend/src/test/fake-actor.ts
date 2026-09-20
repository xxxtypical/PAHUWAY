import type { backendInterface } from "@/backend";
import { vi } from "vitest";

/**
 * A typed stand-in for the generated backend actor. Every public method the
 * frontend calls is present, so a component that reaches for an unmocked
 * method fails loudly instead of silently returning `undefined`.
 *
 * This is a local mock: it proves the frontend's consumer contract, not the
 * canister's behavior. See the backend PocketIC lane for real canister calls.
 */
export type FakeActor = backendInterface;

export type FakeActorOverrides = {
  [K in keyof backendInterface]?: backendInterface[K];
};

export function createFakeActor(overrides: FakeActorOverrides = {}): FakeActor {
  const notImplemented = (method: string) =>
    vi.fn(async () => {
      throw new Error(`FakeActor.${method} was not stubbed for this test`);
    });

  const base: FakeActor = {
    _immutableObjectStorageBlobsAreLive: notImplemented(
      "_immutableObjectStorageBlobsAreLive",
    ),
    _immutableObjectStorageBlobsToDelete: notImplemented(
      "_immutableObjectStorageBlobsToDelete",
    ),
    _immutableObjectStorageConfirmBlobDeletion: notImplemented(
      "_immutableObjectStorageConfirmBlobDeletion",
    ),
    _immutableObjectStorageCreateCertificate: notImplemented(
      "_immutableObjectStorageCreateCertificate",
    ),
    _immutableObjectStorageRefillCashier: notImplemented(
      "_immutableObjectStorageRefillCashier",
    ),
    _immutableObjectStorageUpdateGatewayPrincipals: notImplemented(
      "_immutableObjectStorageUpdateGatewayPrincipals",
    ),
    _initialize_access_control: notImplemented("_initialize_access_control"),
    _internet_identity_sign_in_finish: notImplemented(
      "_internet_identity_sign_in_finish",
    ),
    _internet_identity_sign_in_start: notImplemented(
      "_internet_identity_sign_in_start",
    ),
    addAddress: notImplemented("addAddress"),
    addMenuItem: notImplemented("addMenuItem"),
    addToCart: notImplemented("addToCart"),
    advanceOrderStatus: notImplemented("advanceOrderStatus"),
    assignCallerUserRole: notImplemented("assignCallerUserRole"),
    clearCart: notImplemented("clearCart"),
    createRestaurant: notImplemented("createRestaurant"),
    deleteAddress: notImplemented("deleteAddress"),
    deleteRestaurant: notImplemented("deleteRestaurant"),
    execute: notImplemented("execute"),
    getApiDoc: notImplemented("getApiDoc"),
    getCallerUserRole: notImplemented("getCallerUserRole"),
    getCart: notImplemented("getCart"),
    getDashboardSummary: notImplemented("getDashboardSummary"),
    getMenuByCategory: notImplemented("getMenuByCategory"),
    getOrder: notImplemented("getOrder"),
    getRestaurant: notImplemented("getRestaurant"),
    isCallerAdmin: notImplemented("isCallerAdmin"),
    listAddresses: notImplemented("listAddresses"),
    listAllOrders: notImplemented("listAllOrders"),
    listOrders: notImplemented("listOrders"),
    listRestaurants: notImplemented("listRestaurants"),
    menuItemCount: notImplemented("menuItemCount"),
    ordersByStatus: notImplemented("ordersByStatus"),
    placeOrder: notImplemented("placeOrder"),
    removeCartItem: notImplemented("removeCartItem"),
    removeMenuItem: notImplemented("removeMenuItem"),
    restaurantCount: notImplemented("restaurantCount"),
    schema: notImplemented("schema"),
    searchRestaurants: notImplemented("searchRestaurants"),
    setDefaultAddress: notImplemented("setDefaultAddress"),
    updateAddress: notImplemented("updateAddress"),
    updateCartItem: notImplemented("updateCartItem"),
    updateMenuItem: notImplemented("updateMenuItem"),
    updateRestaurant: notImplemented("updateRestaurant"),
  };

  return { ...base, ...overrides };
}
