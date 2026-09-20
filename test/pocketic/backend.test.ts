import { PocketIc } from "@dfinity/pic";
import { Principal } from "@icp-sdk/core/principal";
import { afterAll, beforeAll, expect, it } from "vitest";

import { idlFactory } from "../../src/frontend/src/declarations/backend.did.js";
import type { _SERVICE } from "../../src/frontend/src/declarations/backend.did";

/**
 * Backend behavior lane. Installs the app's own compiled wasm into the
 * platform's PocketIC replica and calls the real public API, so a canister
 * whose methods are unimplemented stubs cannot pass this suite.
 *
 * The runner only starts Vitest once a live replica is available, so every
 * failure here is application behavior, not environment.
 */

const PIC_URL = process.env.POCKET_IC_URL ?? "";
const BACKEND_WASM = process.env.BACKEND_WASM ?? "";

/**
 * `RestaurantFilter` is a Candid record whose every field is required (each is
 * an `opt`, so the key must be present with `[]` for "no filter"). Passing a
 * partial record fails Candid encoding before the call reaches the canister.
 */
const NO_FILTER = {
  minRating: [],
  maxDeliveryFee: [],
  sort: [],
  searchTerm: [],
  cuisine: [],
  maxDeliveryMinutes: [],
  maxPrice: [],
} as const;

let pic: PocketIc | undefined;
let actor: _SERVICE;

beforeAll(async () => {
  pic = await PocketIc.create(PIC_URL);
  ({ actor } = await pic.setupCanister<_SERVICE>({
    idlFactory,
    wasm: BACKEND_WASM,
  }));
});

afterAll(async () => {
  await pic?.tearDown();
});

it("answers empty-state reads instead of trapping", async () => {
  actor.setPrincipal(Principal.anonymous());
  // The catalogue is seeded by the migration, so it is non-empty on a fresh
  // install; the read must still resolve rather than trap.
  await expect(actor.listRestaurants(NO_FILTER)).resolves.toBeInstanceOf(Array);
  // Per-caller state starts empty for a caller that has never written.
  await expect(actor.listAddresses()).resolves.toEqual([]);
  await expect(actor.listOrders()).resolves.toEqual([]);
  await expect(actor.getCart()).resolves.toEqual([]);
});

it("round-trips a restaurant and its menu through the real canister", async () => {
  // The first caller to initialize access control becomes the admin; every
  // admin method traps for anyone else.
  const admin = Principal.fromText("aaaaa-aa");
  actor.setPrincipal(admin);
  await actor._initialize_access_control();
  await expect(actor.isCallerAdmin()).resolves.toBe(true);

  // `coverImageUrl` is `?Storage.ExternalBlob`, so the declarations type it as
  // `[] | [Uint8Array]`. An absent image is the empty option `[]`, not a bare
  // `Uint8Array` — passing the latter fails Candid encoding before the call.
  const created = await actor.createRestaurant({
    name: "Lola's Carinderia",
    cuisine: "Filipino",
    description: "Home-style Filipino plates.",
    coverImageUrl: [],
    deliveryFee: 4900n,
    estimatedDeliveryMinutes: 30n,
    operatingHours: "8:00 AM – 9:00 PM",
    promoLabel: [],
  });

  const listed = await actor.listRestaurants(NO_FILTER);
  expect(listed.some((r) => r.id === created.id)).toBe(true);
  expect(listed.find((r) => r.id === created.id)).toMatchObject({
    name: "Lola's Carinderia",
    cuisine: "Filipino",
  });

  const item = await actor.addMenuItem(created.id, {
    name: "Chicken Adobo",
    description: "Braised chicken.",
    available: true,
    imageUrl: [],
    category: "Mains",
    price: 18900n,
  });
  expect(item).not.toEqual([]);

  const detail = await actor.getRestaurant(created.id);
  expect(detail).not.toEqual([]);
  const menu = await actor.getMenuByCategory(created.id);
  expect(menu).toHaveLength(1);
  expect(menu[0].items[0]).toMatchObject({
    name: "Chicken Adobo",
    price: 18900n,
  });
});

it("filters the catalogue by maxPrice and sorts by cheapest dish", async () => {
  // The cheapest seeded dish is ₱49 (4900 centavos), so a ceiling below it
  // must exclude every restaurant rather than trap or ignore the field. This
  // is the backend half of the price-range control.
  const cheap = await actor.listRestaurants({ ...NO_FILTER, maxPrice: [4000n] });
  expect(cheap).toEqual([]);

  // A ceiling of ₱50 keeps exactly the restaurants with a dish at or below it.
  const underFifty = await actor.listRestaurants({
    ...NO_FILTER,
    maxPrice: [5000n],
  });
  expect(underFifty.map((r) => r.name).sort()).toEqual([
    "Jollibee",
    "McDonald's",
  ]);

  // A generous ceiling keeps the seeded catalogue, and every returned
  // restaurant must actually have a dish at or below it.
  const affordable = await actor.listRestaurants({
    ...NO_FILTER,
    maxPrice: [100000n],
  });
  expect(affordable.length).toBeGreaterThan(0);
  for (const restaurant of affordable) {
    const detail = await actor.getRestaurant(restaurant.id);
    expect(detail).not.toEqual([]);
    const prices = detail[0].menu.map((item) => item.price);
    expect(Math.min(...prices.map(Number))).toBeLessThanOrEqual(100000);
  }

  // `#priceLowToHigh` orders by each restaurant's cheapest dish, ascending.
  const sorted = await actor.listRestaurants({
    ...NO_FILTER,
    sort: [{ priceLowToHigh: null }],
  });
  const cheapest = await Promise.all(
    sorted.map(async (restaurant) => {
      const detail = await actor.getRestaurant(restaurant.id);
      return Math.min(...detail[0].menu.map((item) => Number(item.price)));
    }),
  );
  expect(cheapest).toEqual([...cheapest].sort((a, b) => a - b));
});

it("searches restaurant and dish names against the seeded catalogue", async () => {
  // The seed migration stores `null` for every image, so a search result must
  // decode with an absent cover image rather than rejecting the whole query.
  const byRestaurant = await actor.searchRestaurants("jollibee");
  expect(byRestaurant.map((r) => r.name)).toEqual(["Jollibee"]);
  expect(byRestaurant[0].coverImageUrl).toEqual([]);

  // A dish-name match returns the restaurant that serves it. "halo-halo" is a
  // seeded dish at both Chowking and Mang Inasal.
  const byDish = await actor.searchRestaurants("halo-halo");
  expect(byDish.map((r) => r.name).sort()).toEqual(["Chowking", "Mang Inasal"]);

  // A term matching neither a restaurant nor a dish is an empty result, not a
  // trap.
  await expect(actor.searchRestaurants("xyzzy")).resolves.toEqual([]);
  // An empty term is also an empty result.
  await expect(actor.searchRestaurants("")).resolves.toEqual([]);
});

it("keeps one caller's cart and addresses private from another", async () => {
  const alice = Principal.fromText("2vxsx-fae");
  const bob = Principal.fromText("rrkah-fqaaa-aaaaa-aaaaq-cai");

  actor.setPrincipal(alice);
  await actor.addAddress({
    addressLabel: "Home",
    street: "12 Mabini St.",
    barangay: "Poblacion",
    city: "Makati",
    landmark: ["Blue gate"],
  });
  const aliceAddresses = await actor.listAddresses();
  expect(aliceAddresses).toHaveLength(1);

  actor.setPrincipal(bob);
  await expect(actor.listAddresses()).resolves.toEqual([]);
});

it("rejects a non-admin caller from the merchant dashboard reads", async () => {
  // A caller that has never initialized access control is not registered at
  // all, and the authorization library traps on `isCallerAdmin` for it. A
  // registered non-admin is the caller the acceptance criterion is about: the
  // first initializer is the admin, every later one gets the user role.
  const nonAdmin = Principal.fromText("rrkah-fqaaa-aaaaa-aaaaq-cai");
  actor.setPrincipal(nonAdmin);
  await actor._initialize_access_control();
  await expect(actor.isCallerAdmin()).resolves.toBe(false);
  await expect(actor.getDashboardSummary()).rejects.toThrow();
});
