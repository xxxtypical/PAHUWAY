import Map "mo:core/Map";
import Principal "mo:core/Principal";

import CartLib "../lib/cart";
import Types "../types/cart";
import RestaurantTypes "../types/restaurants";

mixin (
  carts : Map.Map<Principal, Types.Cart>,
  restaurants : Map.Map<RestaurantTypes.RestaurantId, RestaurantTypes.Restaurant>,
  menuItems : Map.Map<RestaurantTypes.MenuItemId, RestaurantTypes.MenuItem>,
) {
  /// Return the caller's current cart, if any.
  public query ({ caller }) func getCart() : async ?Types.Cart {
    CartLib.getCart(carts, caller);
  };

  /// Add a dish to the caller's cart, or report a restaurant conflict.
  public shared ({ caller }) func addToCart(restaurantId : Types.RestaurantId, menuItemId : Types.MenuItemId, quantity : Nat) : async Types.AddToCartResult {
    CartLib.addToCart(carts, restaurants, menuItems, caller, restaurantId, menuItemId, quantity);
  };

  /// Set the quantity of a cart line; zero removes it.
  public shared ({ caller }) func updateCartItem(menuItemId : Types.MenuItemId, quantity : Nat) : async ?Types.Cart {
    CartLib.updateCartItem(carts, caller, menuItemId, quantity);
  };

  /// Remove a line from the caller's cart.
  public shared ({ caller }) func removeCartItem(menuItemId : Types.MenuItemId) : async ?Types.Cart {
    CartLib.removeCartItem(carts, caller, menuItemId);
  };

  /// Empty the caller's cart.
  public shared ({ caller }) func clearCart() : async () {
    CartLib.clearCart(carts, caller);
  };
};
