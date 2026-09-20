/// Behavioral API documentation for the marketplace backend.
///
/// This mixin exposes a single static query, `getApiDoc`, that returns a
/// Markdown description of the backend's public API. The document is authored
/// from the current source and reads no runtime state, so it is safe to call
/// anonymously and cheap to serve.
mixin () {
  /// Return the backend's behavioral API documentation as Markdown.
  public query func getApiDoc() : async Text {
    "# Marketplace Backend API\n" #
    "\n" #
    "A foodpanda-style marketplace for the Philippine market. It serves both the\n" #
    "customer app (browse restaurants, manage a cart, save addresses, place and\n" #
    "track orders) and the merchant/admin dashboard (manage the catalogue and\n" #
    "advance order status).\n" #
    "\n" #
    "## Authentication and identity\n" #
    "\n" #
    "The app's frontend pins an Internet Identity derivation origin, published at\n" #
    "`/.well-known/ii-derivation-origin` when available. An agent already holding\n" #
    "the user's Internet Identity authorization derives the correct per-app\n" #
    "principal against that origin (for example\n" #
    "`icp identity link web <name> --app <host>`). Such a delegation acts with the\n" #
    "user's full authority in this app until it expires.\n" #
    "\n" #
    "Methods that read or write caller-owned data require a signed (non-anonymous)\n" #
    "caller: `getCart`, `addToCart`, `updateCartItem`, `removeCartItem`,\n" #
    "`clearCart`, `listAddresses`, `addAddress`, `updateAddress`,\n" #
    "`setDefaultAddress`, `deleteAddress`, `placeOrder`, `listOrders`, `getOrder`,\n" #
    "and every admin method. The public catalogue reads (`listRestaurants`,\n" #
    "`getRestaurant`, `searchRestaurants`, `getMenuByCategory`) and `getApiDoc`\n" #
    "are open to anonymous callers.\n" #
    "\n" #
    "Registration is not required to browse. A caller becomes known to the app\n" #
    "only by signing in through the app's own frontend; a principal that never did\n" #
    "so is unregistered even when it belongs to the app's owner, and a signed-in\n" #
    "caller derived against a different origin is a different principal than the\n" #
    "one the frontend registered. Unregistered callers still receive empty\n" #
    "per-caller results (an empty cart, no addresses, no orders) rather than an\n" #
    "error.\n" #
    "\n" #
    "## Authorization\n" #
    "\n" #
    "Two boundaries exist:\n" #
    "\n" #
    "- **Caller ownership.** Cart, address, and order methods operate only on the\n" #
    "  caller's own data. `getOrder` returns `null` for an order the caller does\n" #
    "  not own; `updateAddress`, `setDefaultAddress`, and `deleteAddress` return\n" #
    "  `null`/`false` for an address the caller does not own.\n" #
    "- **Admin.** Every method in the admin surface (`getDashboardSummary`,\n" #
    "  `createRestaurant`, `updateRestaurant`, `deleteRestaurant`, `addMenuItem`,\n" #
    "  `updateMenuItem`, `removeMenuItem`, `listAllOrders`, `advanceOrderStatus`,\n" #
    "  `restaurantCount`, `menuItemCount`, `ordersByStatus`) checks\n" #
    "  `isCallerAdmin` and traps with\n" #
    "  `Unauthorized: Only admins can perform this action` for a non-admin caller.\n" #
    "  The first caller to initialize access control becomes the admin; subsequent\n" #
    "  callers receive the user role.\n" #
    "\n" #
    "## Units and encodings\n" #
    "\n" #
    "- **Money** is an integer number of centavos of Philippine pesos\n" #
    "  (`Centavos`): `₱1.00` is `100`. Never send or expect a decimal amount.\n" #
    "- **Timestamps** (`createdAt`, `updatedAt`) are Unix nanoseconds as `Int`.\n" #
    "- **Identifiers** (`RestaurantId`, `MenuItemId`, `AddressId`, `OrderId`) are\n" #
    "  `Nat` values assigned by the backend; do not construct them client-side.\n" #
    "- **Optional values** (`promoLabel`, `landmark`, `deliveryNotes`) are Candid\n" #
    "  `opt`; absent means `null`.\n" #
    "- **Variants** cross the boundary as Candid variants:\n" #
    "  `PaymentMethod` is `#cashOnDelivery` or `#card`; `OrderStatus` is one of\n" #
    "  `#placed`, `#confirmed`, `#preparing`, `#outForDelivery`, `#delivered`.\n" #
    "\n" #
    "## Public methods\n" #
    "\n" #
    "### Catalogue (anonymous)\n" #
    "\n" #
    "- `listRestaurants(filter : RestaurantFilter) : [Restaurant]` — filter by\n" #
    "  `searchTerm`, `cuisine`, `minRating`, `maxDeliveryFee`,\n" #
    "  `maxDeliveryMinutes`, `maxPrice` (a restaurant matches when it has at\n" #
    "  least one menu item priced at or below it), and sort by `#rating`,\n" #
    "  `#deliveryTime`,\n" #
    "  `#deliveryFee`, or `#priceLowToHigh`.\n" #
    "- `getRestaurant(id) : ?RestaurantDetail` — a restaurant with its full menu.\n" #
    "- `searchRestaurants(term) : [Restaurant]` — matches restaurant and dish\n" #
    "  names.\n" #
    "- `getMenuByCategory(id) : [MenuCategory]` — the menu grouped by category.\n" #
    "\n" #
    "### Cart (signed-in)\n" #
    "\n" #
    "- `getCart() : ?Cart` — the caller's current cart, or `null`.\n" #
    "- `addToCart(restaurantId, menuItemId, quantity) : AddToCartResult` — returns\n" #
    "  `#added(cart)` on success, or `#differentRestaurant({...})` when the cart\n" #
    "  already holds items from another restaurant. A cart holds one restaurant at\n" #
    "  a time; clear it before switching.\n" #
    "- `updateCartItem(menuItemId, quantity) : ?Cart` — sets a line's quantity;\n" #
    "  `quantity = 0` removes the line.\n" #
    "- `removeCartItem(menuItemId) : ?Cart` — removes a line.\n" #
    "- `clearCart() : ()` — empties the cart.\n" #
    "\n" #
    "### Addresses (signed-in)\n" #
    "\n" #
    "- `listAddresses() : [Address]` — the caller's saved addresses.\n" #
    "- `addAddress(input) : Address` — saves a new address.\n" #
    "- `updateAddress(id, input) : ?Address` — updates one of the caller's\n" #
    "  addresses.\n" #
    "- `setDefaultAddress(id) : ?Address` — marks one address as default.\n" #
    "- `deleteAddress(id) : Bool` — deletes one of the caller's addresses.\n" #
    "\n" #
    "### Orders (signed-in)\n" #
    "\n" #
    "- `placeOrder(input) : Order` — places an order from the caller's current\n" #
    "  cart. The cart is consumed by a successful placement.\n" #
    "- `listOrders() : [Order]` — the caller's orders, newest first.\n" #
    "- `getOrder(id) : ?Order` — one of the caller's orders.\n" #
    "\n" #
    "### Admin\n" #
    "\n" #
    "- `getDashboardSummary() : DashboardSummary` — catalogue and order counts.\n" #
    "- `createRestaurant(input) : Restaurant`,\n" #
    "  `updateRestaurant(id, input) : ?Restaurant`,\n" #
    "  `deleteRestaurant(id) : Bool` (also removes its menu items).\n" #
    "- `addMenuItem(restaurantId, input) : ?MenuItem`,\n" #
    "  `updateMenuItem(itemId, input) : ?MenuItem`,\n" #
    "  `removeMenuItem(itemId) : Bool`.\n" #
    "- `listAllOrders(status : ?OrderStatus) : [Order]` — all orders, optionally\n" #
    "  filtered by status.\n" #
    "- `advanceOrderStatus(id) : ?Order` — moves an order to the next status.\n" #
    "- `restaurantCount() : Nat`, `menuItemCount() : Nat`,\n" #
    "  `ordersByStatus() : OrderStatusCounts`.\n" #
    "\n" #
    "## Lifecycle and polling\n" #
    "\n" #
    "An order moves forward through `#placed` -> `#confirmed` -> `#preparing` ->\n" #
    "`#outForDelivery` -> `#delivered`. Only an admin advances status, and\n" #
    "`advanceOrderStatus` is idempotent at the end of the chain: once an order is\n" #
    "`#delivered` it stays there. Poll `getOrder(id)` (or `listOrders()`) to\n" #
    "observe progress; there is no push notification. `updatedAt` changes on every\n" #
    "status transition, so it is the field to compare between polls.\n" #
    "\n" #
    "## Mutation retry safety\n" #
    "\n" #
    "- `addToCart`, `updateCartItem`, `removeCartItem`, and `clearCart` are\n" #
    "  idempotent in effect: re-sending the same call leaves the cart in the same\n" #
    "  state.\n" #
    "- `addAddress` and `placeOrder` are **not** idempotent. Each successful call\n" #
    "  creates a new record with a fresh id, so a retried `placeOrder` after a\n" #
    "  timeout can create a duplicate order. Confirm the result before retrying.\n" #
    "- `deleteAddress`, `deleteRestaurant`, and `removeMenuItem` are destructive\n" #
    "  and return `false` when the target no longer exists.\n" #
    "\n" #
    "## Errors and gotchas\n" #
    "\n" #
    "- Admin methods trap (reject) for non-admin callers with\n" #
    "  `Unauthorized: Only admins can perform this action`.\n" #
    "- `placeOrder` traps when the caller has no cart or the referenced address is\n" #
    "  not the caller's.\n" #
    "- The saved-address field is named `addressLabel`, not `label`; `label` is a\n" #
    "  reserved word in Motoko and is never a valid field name here.\n" #
    "- `addToCart` returns the `AddToCartResult` variant, not a `Cart` directly:\n" #
    "  handle `#differentRestaurant` explicitly instead of assuming success.\n" #
    "- `getOrder` returns `null` (not an error) for an order the caller does not\n" #
    "  own, so a missing order and an unauthorized order are indistinguishable by\n" #
    "  design.\n" #
    "- All money values are integer centavos; format them for display only in the\n" #
    "  frontend.\n";
  };
};
