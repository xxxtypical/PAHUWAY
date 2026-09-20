import Orders "orders";

module {
  /// Summary counts for the merchant/admin dashboard.
  public type DashboardSummary = {
    restaurantCount : Nat;
    menuItemCount : Nat;
    ordersByStatus : Orders.OrderStatusCounts;
  };
};
