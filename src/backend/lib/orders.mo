import Map "mo:core/Map";
import List "mo:core/List";
import Principal "mo:core/Principal";
import Nat "mo:core/Nat";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";

import Types "../types/orders";
import CartTypes "../types/cart";
import AddressTypes "../types/addresses";
import RestaurantTypes "../types/restaurants";

module {
  /// Place an order from the caller's current cart.
  public func placeOrder(
    orders : Map.Map<Types.OrderId, Types.Order>,
    orderOwners : Map.Map<Types.OrderId, Principal>,
    carts : Map.Map<Principal, CartTypes.Cart>,
    addresses : Map.Map<Principal, List.List<AddressTypes.Address>>,
    restaurants : Map.Map<RestaurantTypes.RestaurantId, RestaurantTypes.Restaurant>,
    counters : { var nextOrderId : Nat },
    caller : Principal,
    input : Types.PlaceOrderInput,
  ) : Types.Order {
    let cart = carts.get(caller)
      ?? Runtime.trap("Cart is empty");

    let address = findAddress(addresses, caller, input.addressId)
      ?? Runtime.trap("Address not found");

    let restaurant = restaurants.get(cart.restaurantId);
    let restaurantName = switch (restaurant) {
      case (?r) { r.name };
      case null { cart.restaurantName };
    };
    let estimatedDeliveryMinutes = switch (restaurant) {
      case (?r) { r.estimatedDeliveryMinutes };
      case null { 30 };
    };

    let id = counters.nextOrderId;
    counters.nextOrderId := id + 1;
    let now = Time.now();

    let order : Types.Order = {
      id;
      orderNumber = generateOrderNumber(id, now);
      restaurantId = cart.restaurantId;
      restaurantName;
      items = cart.items.map(func(i) {
        {
          menuItemId = i.menuItemId;
          name = i.name;
          unitPrice = i.unitPrice;
          quantity = i.quantity;
        };
      });
      subtotal = cart.subtotal;
      deliveryFee = cart.deliveryFee;
      total = cart.total;
      paymentMethod = input.paymentMethod;
      status = #placed;
      address;
      deliveryNotes = input.deliveryNotes;
      estimatedDeliveryMinutes;
      createdAt = now;
      updatedAt = now;
    };
    orders.add(id, order);
    orderOwners.add(id, caller);
    carts.remove(caller);
    order;
  };

  /// List the caller's past orders, newest first.
  public func listOrders(
    orders : Map.Map<Types.OrderId, Types.Order>,
    orderOwners : Map.Map<Types.OrderId, Principal>,
    caller : Principal,
  ) : [Types.Order] {
    orders.values()
      .filter(func(o) = isOwned(orderOwners, o.id, caller))
      .toArray()
      .sort(func(a, b) = Nat.compare(b.id, a.id));
  };

  /// Fetch one of the caller's orders by id.
  public func getOrder(
    orders : Map.Map<Types.OrderId, Types.Order>,
    orderOwners : Map.Map<Types.OrderId, Principal>,
    caller : Principal,
    id : Types.OrderId,
  ) : ?Types.Order {
    switch (orders.get(id)) {
      case (?order) {
        if (isOwned(orderOwners, id, caller)) { ?order } else { null };
      };
      case null { null };
    };
  };

  /// Advance an order to the next status (admin only).
  public func advanceOrderStatus(
    orders : Map.Map<Types.OrderId, Types.Order>,
    id : Types.OrderId,
  ) : ?Types.Order {
    switch (orders.get(id)) {
      case (?order) {
        let next : Types.OrderStatus = switch (order.status) {
          case (#placed) { #confirmed };
          case (#confirmed) { #preparing };
          case (#preparing) { #outForDelivery };
          case (#outForDelivery) { #delivered };
          case (#delivered) { #delivered };
        };
        let updated : Types.Order = {
          order with
          status = next;
          updatedAt = Time.now();
        };
        orders.add(id, updated);
        ?updated;
      };
      case null { null };
    };
  };

  /// List all orders, optionally filtered by status (admin only).
  public func listAllOrders(
    orders : Map.Map<Types.OrderId, Types.Order>,
    status : ?Types.OrderStatus,
  ) : [Types.Order] {
    orders.values()
      .filter(func(o) {
        switch (status) {
          case (?s) { statusEquals(o.status, s) };
          case null { true };
        };
      })
      .toArray()
      .sort(func(a, b) = Nat.compare(b.id, a.id));
  };

  // --- helpers ---

  func findAddress(
    addresses : Map.Map<Principal, List.List<AddressTypes.Address>>,
    caller : Principal,
    id : Types.AddressId,
  ) : ?AddressTypes.Address {
    switch (addresses.get(caller)) {
      case (?list) { list.find(func(a) = a.id == id) };
      case null { null };
    };
  };

  func isOwned(
    orderOwners : Map.Map<Types.OrderId, Principal>,
    id : Types.OrderId,
    caller : Principal,
  ) : Bool {
    switch (orderOwners.get(id)) {
      case (?owner) { Principal.equal(owner, caller) };
      case null { false };
    };
  };

  func statusEquals(a : Types.OrderStatus, b : Types.OrderStatus) : Bool {
    switch (a, b) {
      case (#placed, #placed) { true };
      case (#confirmed, #confirmed) { true };
      case (#preparing, #preparing) { true };
      case (#outForDelivery, #outForDelivery) { true };
      case (#delivered, #delivered) { true };
      case _ { false };
    };
  };

  func generateOrderNumber(id : Types.OrderId, now : Int) : Text {
    let suffix = id + 1000;
    let stamp = (now / 1_000_000_000).toNat();
    "FP-" # stamp.toText() # "-" # suffix.toText();
  };
};
