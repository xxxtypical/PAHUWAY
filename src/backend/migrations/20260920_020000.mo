import Map "mo:core/Map";
import List "mo:core/List";
import Principal "mo:core/Principal";
import AccessControl "mo:caffeineai-authorization/access-control";

module {
  // Old stable state: the deployed canister exposes no stable fields at all
  // (its stable signature is `actor { }`), so the chain starts from empty.
  type OldActor = {};

  // New stable state: authorization state, the marketplace domain state, and
  // per-order ownership. Seeded with a starter set of Philippine restaurants.
  //
  // Image fields are OPTIONAL blob references (`?Blob`). The generated frontend
  // bindings decode every non-null Blob image field as a platform object-storage
  // hash (`!caf!sha256:<64 hex>`); an absent image is `null` and is never
  // decoded, so a catalogue row without an uploaded image cannot make the
  // listing query reject. Admin-uploaded images (real storage references) are
  // carried through as `?Blob` and render normally.
  type NewActor = {
    var accessControlState : {
      var adminAssigned : Bool;
      userRoles : Map.Map<Principal, { #admin; #user; #guest }>;
    };
    restaurants : Map.Map<Nat, {
      id : Nat;
      name : Text;
      cuisine : Text;
      description : Text;
      coverImageUrl : ?Blob;
      deliveryFee : Nat;
      estimatedDeliveryMinutes : Nat;
      rating : Nat;
      ratingCount : Nat;
      promoLabel : ?Text;
      operatingHours : Text;
      active : Bool;
    }>;
    menuItems : Map.Map<Nat, {
      id : Nat;
      restaurantId : Nat;
      name : Text;
      description : Text;
      price : Nat;
      category : Text;
      imageUrl : ?Blob;
      available : Bool;
    }>;
    addresses : Map.Map<Principal, List.List<{
      id : Nat;
      addressLabel : Text;
      street : Text;
      barangay : Text;
      city : Text;
      landmark : ?Text;
      isDefault : Bool;
    }>>;
    carts : Map.Map<Principal, {
      restaurantId : Nat;
      restaurantName : Text;
      items : [{
        menuItemId : Nat;
        name : Text;
        unitPrice : Nat;
        quantity : Nat;
        imageUrl : ?Blob;
      }];
      subtotal : Nat;
      deliveryFee : Nat;
      total : Nat;
    }>;
    orders : Map.Map<Nat, {
      id : Nat;
      orderNumber : Text;
      restaurantId : Nat;
      restaurantName : Text;
      items : [{
        menuItemId : Nat;
        name : Text;
        unitPrice : Nat;
        quantity : Nat;
      }];
      subtotal : Nat;
      deliveryFee : Nat;
      total : Nat;
      paymentMethod : { #cashOnDelivery; #card };
      status : { #placed; #confirmed; #preparing; #outForDelivery; #delivered };
      address : {
        id : Nat;
        addressLabel : Text;
        street : Text;
        barangay : Text;
        city : Text;
        landmark : ?Text;
        isDefault : Bool;
      };
      deliveryNotes : ?Text;
      estimatedDeliveryMinutes : Nat;
      createdAt : Int;
      updatedAt : Int;
    }>;
    orderOwners : Map.Map<Nat, Principal>;
    counters : {
      var nextRestaurantId : Nat;
      var nextMenuItemId : Nat;
      var nextAddressId : Nat;
      var nextOrderId : Nat;
    };
  };

  // A persisted image blob is only decodable by the generated bindings when it
  // is a platform object-storage hash (`!caf!sha256:<64 hex>`). Anything else —
  // an empty blob, or legacy URL text — must be dropped to `null` so the
  // listing query never tries to decode it.
  func normalizeImage(blob : ?Blob) : ?Blob {
    switch (blob) {
      case null { null };
      case (?bytes) {
        let text = switch (bytes.decodeUtf8()) {
          case (?t) { t };
          case null { return null };
        };
        if (isStorageHash(text)) { ?bytes } else { null };
      };
    };
  };

  func isStorageHash(text : Text) : Bool {
    let prefix = "!caf!sha256:";
    if (not text.startsWith(#text prefix)) { return false };
    let hex = text.trimStart(#text prefix);
    if (hex.size() != 64) { return false };
    hex.toIter().all(func(c) = isHexDigit(c));
  };

  func isHexDigit(c : Char) : Bool {
    (c >= '0' and c <= '9') or (c >= 'a' and c <= 'f') or (c >= 'A' and c <= 'F');
  };

  public func migration(_old : OldActor) : NewActor {
    let restaurants = Map.empty<Nat, {
      id : Nat;
      name : Text;
      cuisine : Text;
      description : Text;
      coverImageUrl : ?Blob;
      deliveryFee : Nat;
      estimatedDeliveryMinutes : Nat;
      rating : Nat;
      ratingCount : Nat;
      promoLabel : ?Text;
      operatingHours : Text;
      active : Bool;
    }>();
    let menuItems = Map.empty<Nat, {
      id : Nat;
      restaurantId : Nat;
      name : Text;
      description : Text;
      price : Nat;
      category : Text;
      imageUrl : ?Blob;
      available : Bool;
    }>();

    var seedRestaurantId = 0;
    var seedMenuItemId = 0;

    func addRestaurant(
      name : Text,
      cuisine : Text,
      description : Text,
      deliveryFee : Nat,
      estimatedDeliveryMinutes : Nat,
      rating : Nat,
      ratingCount : Nat,
      promoLabel : ?Text,
      operatingHours : Text,
    ) : Nat {
      let id = seedRestaurantId;
      seedRestaurantId := id + 1;
      restaurants.add(id, {
        id;
        name;
        cuisine;
        description;
        coverImageUrl = null;
        deliveryFee;
        estimatedDeliveryMinutes;
        rating;
        ratingCount;
        promoLabel;
        operatingHours;
        active = true;
      });
      id;
    };

    func addMenuItem(
      restaurantId : Nat,
      name : Text,
      description : Text,
      price : Nat,
      category : Text,
    ) {
      let id = seedMenuItemId;
      seedMenuItemId := id + 1;
      menuItems.add(id, {
        id;
        restaurantId;
        name;
        description;
        price;
        category;
        imageUrl = null;
        available = true;
      });
    };

    // Jollibee
    let jollibee = addRestaurant(
      "Jollibee",
      "Filipino",
      "The Philippines' most loved fast-food chain, home of Chickenjoy and Jolly Spaghetti.",
      4900,
      30,
      48,
      1240,
      ?"20% OFF",
      "6:00 AM - 11:00 PM",
    );
    addMenuItem(jollibee, "Chickenjoy 1pc", "Crispylicious, juicylicious fried chicken with rice.", 9900, "Chicken");
    addMenuItem(jollibee, "Chickenjoy 2pc", "Two pieces of signature fried chicken with rice.", 17900, "Chicken");
    addMenuItem(jollibee, "Jolly Spaghetti", "Sweet-style Filipino spaghetti with hotdog slices.", 8900, "Pasta");
    addMenuItem(jollibee, "Yumburger", "Juicy beef patty with special dressing.", 5900, "Burgers");
    addMenuItem(jollibee, "Palabok Fiesta", "Rice noodles with shrimp sauce, chicharon and egg.", 10900, "Pasta");
    addMenuItem(jollibee, "Peach Mango Pie", "Crispy turnover filled with peach mango.", 4900, "Desserts");

    // McDonald's
    let mcdo = addRestaurant(
      "McDonald's",
      "Burgers",
      "World-famous burgers, fries and McFloat — always within reach.",
      4500,
      25,
      46,
      980,
      ?"Buy 1 Take 1",
      "24 Hours",
    );
    addMenuItem(mcdo, "Big Mac", "Two beef patties, special sauce, lettuce and cheese.", 13900, "Burgers");
    addMenuItem(mcdo, "McChicken", "Crispy chicken fillet with lettuce and mayo.", 9900, "Chicken");
    addMenuItem(mcdo, "Cheeseburger", "Classic beef patty with melted cheese.", 6900, "Burgers");
    addMenuItem(mcdo, "French Fries", "Golden, crispy fries with a sprinkle of salt.", 5900, "Sides");
    addMenuItem(mcdo, "McFloat Coke", "Coke with a scoop of vanilla soft serve.", 4900, "Drinks");
    addMenuItem(mcdo, "Hot Fudge Sundae", "Creamy vanilla sundae with chocolate fudge.", 5500, "Desserts");

    // Chowking
    let chowking = addRestaurant(
      "Chowking",
      "Chinese",
      "Chinese-Filipino favorites from lauriat to halo-halo.",
      4900,
      35,
      44,
      760,
      null,
      "7:00 AM - 10:00 PM",
    );
    addMenuItem(chowking, "Chao Fan", "Savory fried rice with your choice of topping.", 8900, "Rice");
    addMenuItem(chowking, "Siomai Rice", "Steamed pork siomai with fried rice.", 9900, "Rice");
    addMenuItem(chowking, "Wonton Mami", "Noodle soup with pork wonton and egg.", 10900, "Noodles");
    addMenuItem(chowking, "Halo-Halo", "Shaved ice dessert with mixed fruits and leche flan.", 9900, "Desserts");
    addMenuItem(chowking, "Sweet and Sour Pork", "Crispy pork with sweet and sour sauce.", 12900, "Rice");

    // Mang Inasal
    let inasal = addRestaurant(
      "Mang Inasal",
      "Filipino",
      "Unlimited rice and charcoal-grilled chicken inasal.",
      4900,
      35,
      47,
      890,
      ?"Unli-Rice",
      "10:00 AM - 9:00 PM",
    );
    addMenuItem(inasal, "Paa Large", "Grilled chicken leg quarter with unlimited rice.", 13900, "Chicken");
    addMenuItem(inasal, "Pecho Large", "Grilled chicken breast with unlimited rice.", 14900, "Chicken");
    addMenuItem(inasal, "Pork BBQ", "Sweet grilled pork skewers.", 7900, "Pork");
    addMenuItem(inasal, "Halo-Halo", "Mang Inasal's creamy shaved ice dessert.", 8900, "Desserts");

    // KFC
    let kfc = addRestaurant(
      "KFC",
      "Chicken",
      "Finger Lickin' Good fried chicken and famous gravy.",
      5500,
      30,
      45,
      720,
      null,
      "9:00 AM - 11:00 PM",
    );
    addMenuItem(kfc, "1pc Chicken with Rice", "Original recipe fried chicken with rice and gravy.", 10500, "Chicken");
    addMenuItem(kfc, "2pc Chicken Meal", "Two pieces of fried chicken with rice and gravy.", 18900, "Chicken");
    addMenuItem(kfc, "Zinger Burger", "Spicy crispy chicken fillet burger.", 11900, "Burgers");
    addMenuItem(kfc, "Famous Bowl", "Mashed potato, corn, chicken and gravy.", 9900, "Rice");

    // Greenwich
    let greenwich = addRestaurant(
      "Greenwich",
      "Pizza",
      "Pizza and pasta made for sharing, barkada-style.",
      5900,
      35,
      43,
      610,
      ?"Pizza Bundle",
      "10:00 AM - 10:00 PM",
    );
    addMenuItem(greenwich, "Hawaiian Overload", "Ham and pineapple pizza on a crispy crust.", 25900, "Pizza");
    addMenuItem(greenwich, "Pepperoni Pizza", "Classic pepperoni with mozzarella.", 27900, "Pizza");
    addMenuItem(greenwich, "Carbonara", "Creamy pasta with bacon and mushroom.", 12900, "Pasta");
    addMenuItem(greenwich, "Lasagna", "Layered pasta with meat sauce and cheese.", 13900, "Pasta");

    // Milk tea shop
    let milktea = addRestaurant(
      "Chatime",
      "Milk Tea",
      "Freshly brewed tea with chewy pearls, made your way.",
      3900,
      20,
      46,
      540,
      ?"Free Topping",
      "10:00 AM - 10:00 PM",
    );
    addMenuItem(milktea, "Pearl Milk Tea", "Classic milk tea with tapioca pearls.", 8900, "Milk Tea");
    addMenuItem(milktea, "Brown Sugar Milk Tea", "Caramelized brown sugar with fresh milk.", 9900, "Milk Tea");
    addMenuItem(milktea, "Matcha Latte", "Stone-ground matcha with milk.", 10900, "Milk Tea");
    addMenuItem(milktea, "Wintermelon Tea", "Refreshing wintermelon with a hint of sweetness.", 7900, "Fruit Tea");

    // Normalize any image bytes that are not a valid platform storage hash to
    // `null`, so a legacy row holding an empty blob or URL text can never make
    // the listing query reject during binding decode.
    for ((id, r) in restaurants.entries()) {
      restaurants.add(id, { r with coverImageUrl = normalizeImage(r.coverImageUrl) });
    };
    for ((id, m) in menuItems.entries()) {
      menuItems.add(id, { m with imageUrl = normalizeImage(m.imageUrl) });
    };

    {
      var accessControlState = AccessControl.initState();
      restaurants;
      menuItems;
      addresses = Map.empty();
      carts = Map.empty();
      orders = Map.empty();
      orderOwners = Map.empty();
      counters = {
        var nextRestaurantId = seedRestaurantId;
        var nextMenuItemId = seedMenuItemId;
        var nextAddressId = 0;
        var nextOrderId = 0;
      };
    };
  };
};
