import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Text "mo:core/Text";
import Types "../types/restaurants";

module {
  /// List restaurants matching the given filter, sorted accordingly.
  public func listRestaurants(
    restaurants : Map.Map<Types.RestaurantId, Types.Restaurant>,
    menuItems : Map.Map<Types.MenuItemId, Types.MenuItem>,
    filter : Types.RestaurantFilter,
  ) : [Types.Restaurant] {
    let term = switch (filter.searchTerm) {
      case (?t) { ?t.toLower() };
      case null { null };
    };
    let cuisine = switch (filter.cuisine) {
      case (?c) { ?c.toLower() };
      case null { null };
    };

    let matched = restaurants.values().filter(
      func(r) {
        if (not r.active) { return false };
        switch (term) {
          case (?t) {
            if (not matchesTerm(r, menuItems, t)) { return false };
          };
          case null {};
        };
        switch (cuisine) {
          case (?c) {
            if (r.cuisine.toLower() != c) { return false };
          };
          case null {};
        };
        switch (filter.minRating) {
          case (?m) {
            if (r.rating < m) { return false };
          };
          case null {};
        };
        switch (filter.maxDeliveryFee) {
          case (?m) {
            if (r.deliveryFee > m) { return false };
          };
          case null {};
        };
        switch (filter.maxDeliveryMinutes) {
          case (?m) {
            if (r.estimatedDeliveryMinutes > m) { return false };
          };
          case null {};
        };
        switch (filter.maxPrice) {
          case (?m) {
            if (not hasItemAtOrBelow(r.id, menuItems, m)) { return false };
          };
          case null {};
        };
        true;
      }
    ).toArray();

    switch (filter.sort) {
      case (?#rating) {
        matched.sort(func(a, b) = Nat.compare(b.rating, a.rating));
      };
      case (?#deliveryTime) {
        matched.sort(func(a, b) = Nat.compare(a.estimatedDeliveryMinutes, b.estimatedDeliveryMinutes));
      };
      case (?#deliveryFee) {
        matched.sort(func(a, b) = Nat.compare(a.deliveryFee, b.deliveryFee));
      };
      case (?#priceLowToHigh) {
        matched.sort(func(a, b) = Nat.compare(cheapestPrice(a.id, menuItems), cheapestPrice(b.id, menuItems)));
      };
      case null { matched };
    };
  };

  /// Fetch a restaurant with its full menu.
  public func getRestaurant(
    restaurants : Map.Map<Types.RestaurantId, Types.Restaurant>,
    menuItems : Map.Map<Types.MenuItemId, Types.MenuItem>,
    id : Types.RestaurantId,
  ) : ?Types.RestaurantDetail {
    switch (restaurants.get(id)) {
      case (?restaurant) {
        let menu = menuItems.values().filter(
          func(item) = item.restaurantId == id
        ).toArray();
        ?{ restaurant; menu };
      };
      case null { null };
    };
  };

  /// Search restaurant names and dish names.
  public func search(
    restaurants : Map.Map<Types.RestaurantId, Types.Restaurant>,
    menuItems : Map.Map<Types.MenuItemId, Types.MenuItem>,
    term : Text,
  ) : [Types.Restaurant] {
    let needle = term.toLower();
    if (needle.size() == 0) { return [] };
    restaurants.values().filter(
      func(r) = r.active and matchesTerm(r, menuItems, needle)
    ).toArray();
  };

  /// Group a restaurant's menu items by category.
  public func menuByCategory(
    menuItems : Map.Map<Types.MenuItemId, Types.MenuItem>,
    id : Types.RestaurantId,
  ) : [Types.MenuCategory] {
    let items = menuItems.values().filter(
      func(item) = item.restaurantId == id
    ).toArray();

    let categories = items.map(func(item) = item.category).sort();
    let seen = Map.empty<Text, Bool>();
    let unique = categories.filter(
      func(category) {
        if (seen.containsKey(category)) { return false };
        seen.add(category, true);
        true;
      }
    );

    unique.map(
      func(category) {
        {
          category;
          items = items.filter(func(item) = item.category == category);
        };
      }
    );
  };

  /// Create a restaurant (admin only).
  public func createRestaurant(
    restaurants : Map.Map<Types.RestaurantId, Types.Restaurant>,
    counters : { var nextRestaurantId : Nat },
    input : Types.RestaurantInput,
  ) : Types.Restaurant {
    let id = counters.nextRestaurantId;
    counters.nextRestaurantId := id + 1;
    let restaurant : Types.Restaurant = {
      id;
      name = input.name;
      cuisine = input.cuisine;
      description = input.description;
      coverImageUrl = input.coverImageUrl;
      deliveryFee = input.deliveryFee;
      estimatedDeliveryMinutes = input.estimatedDeliveryMinutes;
      rating = 0;
      ratingCount = 0;
      promoLabel = input.promoLabel;
      operatingHours = input.operatingHours;
      active = true;
    };
    restaurants.add(id, restaurant);
    restaurant;
  };

  /// Update a restaurant (admin only).
  public func updateRestaurant(
    restaurants : Map.Map<Types.RestaurantId, Types.Restaurant>,
    id : Types.RestaurantId,
    input : Types.RestaurantInput,
  ) : ?Types.Restaurant {
    switch (restaurants.get(id)) {
      case (?existing) {
        let updated : Types.Restaurant = {
          id = existing.id;
          name = input.name;
          cuisine = input.cuisine;
          description = input.description;
          coverImageUrl = input.coverImageUrl;
          deliveryFee = input.deliveryFee;
          estimatedDeliveryMinutes = input.estimatedDeliveryMinutes;
          rating = existing.rating;
          ratingCount = existing.ratingCount;
          promoLabel = input.promoLabel;
          operatingHours = input.operatingHours;
          active = existing.active;
        };
        restaurants.add(id, updated);
        ?updated;
      };
      case null { null };
    };
  };

  /// Delete a restaurant and its menu items (admin only).
  public func deleteRestaurant(
    restaurants : Map.Map<Types.RestaurantId, Types.Restaurant>,
    menuItems : Map.Map<Types.MenuItemId, Types.MenuItem>,
    id : Types.RestaurantId,
  ) : Bool {
    switch (restaurants.get(id)) {
      case null { false };
      case (?_) {
        restaurants.remove(id);
        let orphaned = menuItems.values().filter(
          func(item) = item.restaurantId == id
        ).map(func(item) = item.id).toArray();
        for (itemId in orphaned.values()) {
          menuItems.remove(itemId);
        };
        true;
      };
    };
  };

  /// Add a menu item to a restaurant (admin only).
  public func addMenuItem(
    restaurants : Map.Map<Types.RestaurantId, Types.Restaurant>,
    menuItems : Map.Map<Types.MenuItemId, Types.MenuItem>,
    counters : { var nextMenuItemId : Nat },
    restaurantId : Types.RestaurantId,
    input : Types.MenuItemInput,
  ) : ?Types.MenuItem {
    switch (restaurants.get(restaurantId)) {
      case null { null };
      case (?_) {
        let id = counters.nextMenuItemId;
        counters.nextMenuItemId := id + 1;
        let item : Types.MenuItem = {
          id;
          restaurantId;
          name = input.name;
          description = input.description;
          price = input.price;
          category = input.category;
          imageUrl = input.imageUrl;
          available = input.available;
        };
        menuItems.add(id, item);
        ?item;
      };
    };
  };

  /// Update a menu item (admin only).
  public func updateMenuItem(
    menuItems : Map.Map<Types.MenuItemId, Types.MenuItem>,
    itemId : Types.MenuItemId,
    input : Types.MenuItemInput,
  ) : ?Types.MenuItem {
    switch (menuItems.get(itemId)) {
      case (?existing) {
        let updated : Types.MenuItem = {
          id = existing.id;
          restaurantId = existing.restaurantId;
          name = input.name;
          description = input.description;
          price = input.price;
          category = input.category;
          imageUrl = input.imageUrl;
          available = input.available;
        };
        menuItems.add(itemId, updated);
        ?updated;
      };
      case null { null };
    };
  };

  /// Remove a menu item (admin only).
  public func removeMenuItem(
    menuItems : Map.Map<Types.MenuItemId, Types.MenuItem>,
    itemId : Types.MenuItemId,
  ) : Bool {
    if (not menuItems.containsKey(itemId)) { return false };
    menuItems.remove(itemId);
    true;
  };

  // --- helpers ---

  func matchesTerm(
    restaurant : Types.Restaurant,
    menuItems : Map.Map<Types.MenuItemId, Types.MenuItem>,
    needle : Text,
  ) : Bool {
    if (restaurant.name.toLower().contains(#text needle)) { return true };
    if (restaurant.cuisine.toLower().contains(#text needle)) { return true };
    menuItems.values().any(
      func(item) {
        item.restaurantId == restaurant.id and item.name.toLower().contains(#text needle);
      }
    );
  };

  func hasItemAtOrBelow(
    restaurantId : Types.RestaurantId,
    menuItems : Map.Map<Types.MenuItemId, Types.MenuItem>,
    maxPrice : Nat,
  ) : Bool {
    menuItems.values().any(
      func(item) {
        item.restaurantId == restaurantId and item.price <= maxPrice;
      }
    );
  };

  func cheapestPrice(
    restaurantId : Types.RestaurantId,
    menuItems : Map.Map<Types.MenuItemId, Types.MenuItem>,
  ) : Nat {
    var cheapest : ?Nat = null;
    for (item in menuItems.values()) {
      if (item.restaurantId == restaurantId) {
        switch (cheapest) {
          case (?current) {
            if (item.price < current) { cheapest := ?item.price };
          };
          case null { cheapest := ?item.price };
        };
      };
    };
    cheapest ?? 0;
  };
};
