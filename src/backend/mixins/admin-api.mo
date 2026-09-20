import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import AccessControl "mo:caffeineai-authorization/access-control";
import AdminLib "../lib/admin";
import OrdersLib "../lib/orders";
import RestaurantsLib "../lib/restaurants";
import AdminTypes "../types/admin";
import OrderTypes "../types/orders";
import RestaurantTypes "../types/restaurants";

mixin (
  accessControlState : AccessControl.AccessControlState,
  restaurants : Map.Map<RestaurantTypes.RestaurantId, RestaurantTypes.Restaurant>,
  menuItems : Map.Map<RestaurantTypes.MenuItemId, RestaurantTypes.MenuItem>,
  orders : Map.Map<OrderTypes.OrderId, OrderTypes.Order>,
  counters : {
    var nextRestaurantId : Nat;
    var nextMenuItemId : Nat;
    var nextAddressId : Nat;
    var nextOrderId : Nat;
  },
) {
  func requireAdmin(caller : Principal) {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
  };

  /// Dashboard summary counts (admin only).
  public query ({ caller }) func getDashboardSummary() : async AdminTypes.DashboardSummary {
    requireAdmin(caller);
    AdminLib.getDashboardSummary(restaurants, menuItems, orders);
  };

  /// Create a restaurant (admin only).
  public shared ({ caller }) func createRestaurant(input : RestaurantTypes.RestaurantInput) : async RestaurantTypes.Restaurant {
    requireAdmin(caller);
    RestaurantsLib.createRestaurant(restaurants, counters, input);
  };

  /// Update a restaurant (admin only).
  public shared ({ caller }) func updateRestaurant(id : RestaurantTypes.RestaurantId, input : RestaurantTypes.RestaurantInput) : async ?RestaurantTypes.Restaurant {
    requireAdmin(caller);
    RestaurantsLib.updateRestaurant(restaurants, id, input);
  };

  /// Delete a restaurant and its menu items (admin only).
  public shared ({ caller }) func deleteRestaurant(id : RestaurantTypes.RestaurantId) : async Bool {
    requireAdmin(caller);
    RestaurantsLib.deleteRestaurant(restaurants, menuItems, id);
  };

  /// Add a menu item to a restaurant (admin only).
  public shared ({ caller }) func addMenuItem(restaurantId : RestaurantTypes.RestaurantId, input : RestaurantTypes.MenuItemInput) : async ?RestaurantTypes.MenuItem {
    requireAdmin(caller);
    RestaurantsLib.addMenuItem(restaurants, menuItems, counters, restaurantId, input);
  };

  /// Update a menu item (admin only).
  public shared ({ caller }) func updateMenuItem(itemId : RestaurantTypes.MenuItemId, input : RestaurantTypes.MenuItemInput) : async ?RestaurantTypes.MenuItem {
    requireAdmin(caller);
    RestaurantsLib.updateMenuItem(menuItems, itemId, input);
  };

  /// Remove a menu item (admin only).
  public shared ({ caller }) func removeMenuItem(itemId : RestaurantTypes.MenuItemId) : async Bool {
    requireAdmin(caller);
    RestaurantsLib.removeMenuItem(menuItems, itemId);
  };

  /// List all orders, optionally filtered by status (admin only).
  public query ({ caller }) func listAllOrders(status : ?OrderTypes.OrderStatus) : async [OrderTypes.Order] {
    requireAdmin(caller);
    OrdersLib.listAllOrders(orders, status);
  };

  /// Advance an order to the next status (admin only).
  public shared ({ caller }) func advanceOrderStatus(id : OrderTypes.OrderId) : async ?OrderTypes.Order {
    requireAdmin(caller);
    OrdersLib.advanceOrderStatus(orders, id);
  };

  /// Count of restaurants (admin only).
  public query ({ caller }) func restaurantCount() : async Nat {
    requireAdmin(caller);
    restaurants.size();
  };

  /// Count of menu items (admin only).
  public query ({ caller }) func menuItemCount() : async Nat {
    requireAdmin(caller);
    menuItems.size();
  };

  /// Count of orders grouped by status (admin only).
  public query ({ caller }) func ordersByStatus() : async OrderTypes.OrderStatusCounts {
    requireAdmin(caller);
    AdminLib.ordersByStatus(orders);
  };
};
