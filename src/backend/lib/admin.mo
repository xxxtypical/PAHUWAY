import Map "mo:core/Map";
import Types "../types/admin";
import OrderTypes "../types/orders";
import RestaurantTypes "../types/restaurants";

module {
  /// Dashboard summary counts (admin only).
  public func getDashboardSummary(
    restaurants : Map.Map<RestaurantTypes.RestaurantId, RestaurantTypes.Restaurant>,
    menuItems : Map.Map<RestaurantTypes.MenuItemId, RestaurantTypes.MenuItem>,
    orders : Map.Map<OrderTypes.OrderId, OrderTypes.Order>,
  ) : Types.DashboardSummary {
    {
      restaurantCount = restaurants.size();
      menuItemCount = menuItems.size();
      ordersByStatus = ordersByStatus(orders);
    };
  };

  /// Count orders grouped by status.
  public func ordersByStatus(
    orders : Map.Map<OrderTypes.OrderId, OrderTypes.Order>,
  ) : OrderTypes.OrderStatusCounts {
    var placed = 0;
    var confirmed = 0;
    var preparing = 0;
    var outForDelivery = 0;
    var delivered = 0;
    for (order in orders.values()) {
      switch (order.status) {
        case (#placed) { placed += 1 };
        case (#confirmed) { confirmed += 1 };
        case (#preparing) { preparing += 1 };
        case (#outForDelivery) { outForDelivery += 1 };
        case (#delivered) { delivered += 1 };
      };
    };
    { placed; confirmed; preparing; outForDelivery; delivered };
  };
};
