import Map "mo:core/Map";
import List "mo:core/List";
import Principal "mo:core/Principal";

import OrdersLib "../lib/orders";
import Types "../types/orders";
import CartTypes "../types/cart";
import AddressTypes "../types/addresses";
import RestaurantTypes "../types/restaurants";

mixin (
  orders : Map.Map<Types.OrderId, Types.Order>,
  orderOwners : Map.Map<Types.OrderId, Principal>,
  carts : Map.Map<Principal, CartTypes.Cart>,
  addresses : Map.Map<Principal, List.List<AddressTypes.Address>>,
  restaurants : Map.Map<RestaurantTypes.RestaurantId, RestaurantTypes.Restaurant>,
  counters : { var nextOrderId : Nat },
) {
  /// Place an order from the caller's current cart.
  public shared ({ caller }) func placeOrder(input : Types.PlaceOrderInput) : async Types.Order {
    OrdersLib.placeOrder(orders, orderOwners, carts, addresses, restaurants, counters, caller, input);
  };

  /// List the caller's past orders, newest first.
  public query ({ caller }) func listOrders() : async [Types.Order] {
    OrdersLib.listOrders(orders, orderOwners, caller);
  };

  /// Fetch one of the caller's orders by id.
  public query ({ caller }) func getOrder(id : Types.OrderId) : async ?Types.Order {
    OrdersLib.getOrder(orders, orderOwners, caller, id);
  };
};
