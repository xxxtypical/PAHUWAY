import Common "common";
import Storage "mo:caffeineai-object-storage/Storage";

module {
  public type RestaurantId = Common.RestaurantId;
  public type MenuItemId = Common.MenuItemId;
  public type Centavos = Common.Centavos;
  public type DeliveryMinutes = Common.DeliveryMinutes;

  /// A dish offered by a restaurant.
  public type MenuItem = {
    id : MenuItemId;
    restaurantId : RestaurantId;
    name : Text;
    description : Text;
    price : Centavos;
    category : Text;
    imageUrl : ?Storage.ExternalBlob;
    available : Bool;
  };

  /// A restaurant as shown in listing cards and the detail page.
  public type Restaurant = {
    id : RestaurantId;
    name : Text;
    cuisine : Text;
    description : Text;
    coverImageUrl : ?Storage.ExternalBlob;
    deliveryFee : Centavos;
    estimatedDeliveryMinutes : DeliveryMinutes;
    rating : Nat;
    ratingCount : Nat;
    promoLabel : ?Text;
    operatingHours : Text;
    active : Bool;
  };

  /// A restaurant together with its full menu.
  public type RestaurantDetail = {
    restaurant : Restaurant;
    menu : [MenuItem];
  };

  /// A menu category with its dishes, used to render the detail page.
  public type MenuCategory = {
    category : Text;
    items : [MenuItem];
  };

  /// Sort order for restaurant listings.
  public type RestaurantSort = {
    #rating;
    #deliveryTime;
    #deliveryFee;
    #priceLowToHigh;
  };

  /// Filter and sort controls for the restaurant listing.
  public type RestaurantFilter = {
    searchTerm : ?Text;
    cuisine : ?Text;
    minRating : ?Nat;
    maxDeliveryFee : ?Centavos;
    maxDeliveryMinutes : ?DeliveryMinutes;
    maxPrice : ?Centavos;
    sort : ?RestaurantSort;
  };

  /// Input for creating a restaurant (admin only).
  public type RestaurantInput = {
    name : Text;
    cuisine : Text;
    description : Text;
    coverImageUrl : ?Storage.ExternalBlob;
    deliveryFee : Centavos;
    estimatedDeliveryMinutes : DeliveryMinutes;
    operatingHours : Text;
    promoLabel : ?Text;
  };

  /// Input for creating a menu item (admin only).
  public type MenuItemInput = {
    name : Text;
    description : Text;
    price : Centavos;
    category : Text;
    imageUrl : ?Storage.ExternalBlob;
    available : Bool;
  };
};
