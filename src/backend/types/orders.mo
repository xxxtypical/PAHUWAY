import Common "common";
import Addresses "addresses";

module {
  public type OrderId = Common.OrderId;
  public type RestaurantId = Common.RestaurantId;
  public type Centavos = Common.Centavos;
  public type Timestamp = Common.Timestamp;
  public type PaymentMethod = Common.PaymentMethod;
  public type OrderStatus = Common.OrderStatus;
  public type OrderLine = Common.OrderLine;
  public type AddressId = Addresses.AddressId;

  /// A placed order as returned to the customer.
  public type Order = {
    id : OrderId;
    orderNumber : Text;
    restaurantId : RestaurantId;
    restaurantName : Text;
    items : [OrderLine];
    subtotal : Centavos;
    deliveryFee : Centavos;
    total : Centavos;
    paymentMethod : PaymentMethod;
    status : OrderStatus;
    address : Addresses.Address;
    deliveryNotes : ?Text;
    estimatedDeliveryMinutes : Common.DeliveryMinutes;
    createdAt : Timestamp;
    updatedAt : Timestamp;
  };

  /// Input for placing an order from the current cart.
  public type PlaceOrderInput = {
    restaurantId : RestaurantId;
    addressId : AddressId;
    deliveryNotes : ?Text;
    paymentMethod : PaymentMethod;
  };

  /// Counts of orders grouped by status, for the admin dashboard.
  public type OrderStatusCounts = {
    placed : Nat;
    confirmed : Nat;
    preparing : Nat;
    outForDelivery : Nat;
    delivered : Nat;
  };
};
