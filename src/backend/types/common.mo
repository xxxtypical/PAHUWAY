module {
  /// Unique identifier for a restaurant.
  public type RestaurantId = Nat;

  /// Unique identifier for a menu item.
  public type MenuItemId = Nat;

  /// Unique identifier for a saved delivery address.
  public type AddressId = Nat;

  /// Unique identifier for an order.
  public type OrderId = Nat;

  /// Monetary amount in integer centavos of Philippine pesos (₱1.00 = 100).
  public type Centavos = Nat;

  /// Unix timestamp in nanoseconds.
  public type Timestamp = Int;

  /// Estimated delivery time in minutes.
  public type DeliveryMinutes = Nat;

  /// Payment method chosen at checkout.
  public type PaymentMethod = {
    #cashOnDelivery;
    #card;
  };

  /// Lifecycle status of an order.
  public type OrderStatus = {
    #placed;
    #confirmed;
    #preparing;
    #outForDelivery;
    #delivered;
  };

  /// A single line item within a cart or order.
  public type OrderLine = {
    menuItemId : MenuItemId;
    name : Text;
    unitPrice : Centavos;
    quantity : Nat;
  };
};
