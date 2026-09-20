import Common "common";
import Restaurants "restaurants";
import Storage "mo:caffeineai-object-storage/Storage";

module {
  public type RestaurantId = Common.RestaurantId;
  public type MenuItemId = Common.MenuItemId;
  public type Centavos = Common.Centavos;

  /// A cart line as returned to the client.
  public type CartItem = {
    menuItemId : MenuItemId;
    name : Text;
    unitPrice : Centavos;
    quantity : Nat;
    imageUrl : ?Storage.ExternalBlob;
  };

  /// The caller's cart for a single restaurant.
  public type Cart = {
    restaurantId : RestaurantId;
    restaurantName : Text;
    items : [CartItem];
    subtotal : Centavos;
    deliveryFee : Centavos;
    total : Centavos;
  };

  /// Result of adding an item when the cart already holds another restaurant.
  public type AddToCartResult = {
    #added : Cart;
    #differentRestaurant : {
      currentRestaurantId : RestaurantId;
      currentRestaurantName : Text;
      requestedRestaurantId : RestaurantId;
      requestedRestaurantName : Text;
    };
  };
};
