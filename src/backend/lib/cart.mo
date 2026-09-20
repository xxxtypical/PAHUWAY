import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Types "../types/cart";
import RestaurantTypes "../types/restaurants";

module {
  /// Return the caller's current cart, if any.
  public func getCart(
    carts : Map.Map<Principal, Types.Cart>,
    caller : Principal,
  ) : ?Types.Cart {
    carts.get(caller);
  };

  /// Add a dish to the caller's cart, or report a restaurant conflict.
  public func addToCart(
    carts : Map.Map<Principal, Types.Cart>,
    restaurants : Map.Map<RestaurantTypes.RestaurantId, RestaurantTypes.Restaurant>,
    menuItems : Map.Map<Types.MenuItemId, RestaurantTypes.MenuItem>,
    caller : Principal,
    restaurantId : Types.RestaurantId,
    menuItemId : Types.MenuItemId,
    quantity : Nat,
  ) : Types.AddToCartResult {
    let item = switch (menuItems.get(menuItemId)) {
      case (?found) { found };
      case null {
        return #differentRestaurant({
          currentRestaurantId = restaurantId;
          currentRestaurantName = "";
          requestedRestaurantId = restaurantId;
          requestedRestaurantName = "";
        });
      };
    };

    let restaurant = switch (restaurants.get(restaurantId)) {
      case (?found) { found };
      case null {
        return #differentRestaurant({
          currentRestaurantId = restaurantId;
          currentRestaurantName = "";
          requestedRestaurantId = restaurantId;
          requestedRestaurantName = item.name;
        });
      };
    };

    switch (carts.get(caller)) {
      case (?cart) {
        if (cart.restaurantId != restaurantId) {
          return #differentRestaurant({
            currentRestaurantId = cart.restaurantId;
            currentRestaurantName = cart.restaurantName;
            requestedRestaurantId = restaurantId;
            requestedRestaurantName = restaurant.name;
          });
        };
        let updatedItems = mergeItem(cart.items, item, quantity);
        let cart2 = recompute(cart, updatedItems);
        carts.add(caller, cart2);
        #added(cart2);
      };
      case null {
        let cart : Types.Cart = {
          restaurantId;
          restaurantName = restaurant.name;
          items = [{
            menuItemId;
            name = item.name;
            unitPrice = item.price;
            quantity;
            imageUrl = item.imageUrl;
          }];
          subtotal = item.price * quantity;
          deliveryFee = restaurant.deliveryFee;
          total = (item.price * quantity) + restaurant.deliveryFee;
        };
        carts.add(caller, cart);
        #added(cart);
      };
    };
  };

  /// Set the quantity of a cart line; zero removes it.
  public func updateCartItem(
    carts : Map.Map<Principal, Types.Cart>,
    caller : Principal,
    menuItemId : Types.MenuItemId,
    quantity : Nat,
  ) : ?Types.Cart {
    switch (carts.get(caller)) {
      case null { null };
      case (?cart) {
        let updatedItems = if (quantity == 0) {
          cart.items.filter(func(i) = i.menuItemId != menuItemId);
        } else {
          cart.items.map(
            func(i) {
              if (i.menuItemId == menuItemId) { { i with quantity } } else { i };
            }
          );
        };
        let cart2 = recompute(cart, updatedItems);
        carts.add(caller, cart2);
        ?cart2;
      };
    };
  };

  /// Remove a line from the caller's cart.
  public func removeCartItem(
    carts : Map.Map<Principal, Types.Cart>,
    caller : Principal,
    menuItemId : Types.MenuItemId,
  ) : ?Types.Cart {
    switch (carts.get(caller)) {
      case null { null };
      case (?cart) {
        let updatedItems = cart.items.filter(func(i) = i.menuItemId != menuItemId);
        let cart2 = recompute(cart, updatedItems);
        carts.add(caller, cart2);
        ?cart2;
      };
    };
  };

  /// Empty the caller's cart.
  public func clearCart(
    carts : Map.Map<Principal, Types.Cart>,
    caller : Principal,
  ) : () {
    carts.remove(caller);
  };

  func mergeItem(
    items : [Types.CartItem],
    item : RestaurantTypes.MenuItem,
    quantity : Nat,
  ) : [Types.CartItem] {
    var found = false;
    let merged = items.map(
      func(i) {
        if (i.menuItemId == item.id) {
          found := true;
          { i with quantity = i.quantity + quantity };
        } else {
          i;
        };
      }
    );
    if (found) {
      merged;
    } else {
      merged.concat([{
        menuItemId = item.id;
        name = item.name;
        unitPrice = item.price;
        quantity;
        imageUrl = item.imageUrl;
      }]);
    };
  };

  func recompute(cart : Types.Cart, items : [Types.CartItem]) : Types.Cart {
    let subtotal = items.foldLeft(0, func(acc, i) = acc + (i.unitPrice * i.quantity));
    {
      cart with
      items;
      subtotal;
      total = subtotal + cart.deliveryFee;
    };
  };
};
