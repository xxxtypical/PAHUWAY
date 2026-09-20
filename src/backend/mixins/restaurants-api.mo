import Map "mo:core/Map";

import RestaurantsLib "../lib/restaurants";
import Types "../types/restaurants";

mixin (
  restaurants : Map.Map<Types.RestaurantId, Types.Restaurant>,
  menuItems : Map.Map<Types.MenuItemId, Types.MenuItem>,
) {
  /// List restaurants matching the given filter, sorted accordingly.
  public query func listRestaurants(filter : Types.RestaurantFilter) : async [Types.Restaurant] {
    RestaurantsLib.listRestaurants(restaurants, menuItems, filter);
  };

  /// Fetch a restaurant with its full menu.
  public query func getRestaurant(id : Types.RestaurantId) : async ?Types.RestaurantDetail {
    RestaurantsLib.getRestaurant(restaurants, menuItems, id);
  };

  /// Search restaurant names and dish names.
  public query func searchRestaurants(term : Text) : async [Types.Restaurant] {
    RestaurantsLib.search(restaurants, menuItems, term);
  };

  /// Group a restaurant's menu items by category.
  public query func getMenuByCategory(id : Types.RestaurantId) : async [Types.MenuCategory] {
    RestaurantsLib.menuByCategory(menuItems, id);
  };
};
