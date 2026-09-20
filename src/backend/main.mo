import AccessControl "mo:caffeineai-authorization/access-control";
import MixinAuthorization "mo:caffeineai-authorization/MixinAuthorization";
import MixinObjectStorage "mo:caffeineai-object-storage/Mixin";
import OQL "mo:caffeineai-oql";
import Expose "mo:caffeineai-oql/Expose";
import Entity "mo:caffeineai-oql/Entity";
import MapEntity "mo:caffeineai-oql/MapEntity";
import RecordValue "mo:caffeineai-oql/RecordValue";
import NatValue "mo:caffeineai-oql/NatValue";
import IntValue "mo:caffeineai-oql/IntValue";
import TextValue "mo:caffeineai-oql/TextValue";
import BoolValue "mo:caffeineai-oql/BoolValue";
import PrincipalValue "mo:caffeineai-oql/PrincipalValue";
import OptTextValue "OptTextValue";
import OptExternalBlobValue "OptExternalBlobValue";
import Map "mo:core/Map";
import List "mo:core/List";
import Iter "mo:core/Iter";
import Principal "mo:core/Principal";

import CommonTypes "types/common";
import RestaurantTypes "types/restaurants";
import CartTypes "types/cart";
import AddressTypes "types/addresses";
import OrderTypes "types/orders";

import RestaurantsApi "mixins/restaurants-api";
import CartApi "mixins/cart-api";
import AddressesApi "mixins/addresses-api";
import OrdersApi "mixins/orders-api";
import AdminApi "mixins/admin-api";
import ApiDocMixin "mixins/api-doc";

actor {
  // Stable authorization state. Initial value comes from the migration chain.
  let accessControlState : AccessControl.AccessControlState;
  include MixinAuthorization(accessControlState, null);

  // Off-chain object storage: provides the platform upload/download proxy that
  // the ExternalBlob references stored in the catalogue point at.
  include MixinObjectStorage();

  // Stable domain state. Initial values come from the migration chain.
  let restaurants : Map.Map<CommonTypes.RestaurantId, RestaurantTypes.Restaurant>;
  let menuItems : Map.Map<CommonTypes.MenuItemId, RestaurantTypes.MenuItem>;
  let addresses : Map.Map<Principal, List.List<AddressTypes.Address>>;
  let carts : Map.Map<Principal, CartTypes.Cart>;
  let orders : Map.Map<CommonTypes.OrderId, OrderTypes.Order>;
  let orderOwners : Map.Map<CommonTypes.OrderId, Principal>;
  let counters : {
    var nextRestaurantId : Nat;
    var nextMenuItemId : Nat;
    var nextAddressId : Nat;
    var nextOrderId : Nat;
  };

  include RestaurantsApi(restaurants, menuItems);
  include CartApi(carts, restaurants, menuItems);
  include AddressesApi(addresses, counters);
  include OrdersApi(orders, orderOwners, carts, addresses, restaurants, counters);
  include AdminApi(accessControlState, restaurants, menuItems, orders, counters);
  include ApiDocMixin();

  // Sample principals used only to seed OQL schema discovery; values are ignored.
  transient let samplePrincipal = Principal.fromText("aaaaa-aa");

  // Flatten the per-caller address map into (owner, address) rows so the owner
  // principal (which lives in the map key, not the record) becomes a column.
  func addressRows() : Iter.Iter<(Principal, AddressTypes.Address)> {
    let out = List.empty<(Principal, AddressTypes.Address)>();
    for ((owner, list) in addresses.entries()) {
      for (address in list.values()) {
        out.add((owner, address));
      };
    };
    out.values();
  };

  // Flatten orders together with their owner from the side map.
  func orderRows() : Iter.Iter<(Principal, OrderTypes.Order)> {
    let out = List.empty<(Principal, OrderTypes.Order)>();
    for ((id, order) in orders.entries()) {
      let owner = orderOwners.get(id) ?? samplePrincipal;
      out.add((owner, order));
    };
    out.values();
  };

  include Expose({
    entities = [
      // Public catalogue: anyone, including anonymous visitors, may read.
      restaurants.toEntity("restaurant", "Restaurant", "id")
        .sample({
          id = 0;
          name = "";
          cuisine = "";
          description = "";
          coverImageUrl = null;
          deliveryFee = 0;
          estimatedDeliveryMinutes = 0;
          rating = 0;
          ratingCount = 0;
          promoLabel = null;
          operatingHours = "";
          active = false;
        })
        .public_()
        .build(),
      menuItems.toEntity("menuItem", "MenuItem", "id")
        .sample({
          id = 0;
          restaurantId = 0;
          name = "";
          description = "";
          price = 0;
          category = "";
          imageUrl = null;
          available = false;
        })
        .edge("restaurantId", "restaurant")
        .public_()
        .build(),
      // Saved addresses are per-caller: the owner is the map key, promoted to a
      // column so scoped reads return only the caller's own rows.
      OQL.Entity.manual<(Principal, AddressTypes.Address)>("address", addressRows, "Address", "id")
        .sample((samplePrincipal, {
          id = 0;
          addressLabel = "";
          street = "";
          barangay = "";
          city = "";
          landmark = null;
          isDefault = false;
        }))
        .payload("owner", func ((owner, _)) = owner)
        .payload("id", func ((_, a)) = a.id)
        .payload("addressLabel", func ((_, a)) = a.addressLabel)
        .payload("street", func ((_, a)) = a.street)
        .payload("barangay", func ((_, a)) = a.barangay)
        .payload("city", func ((_, a)) = a.city)
        .payload("landmark", func ((_, a)) = a.landmark ?? "")
        .payload("isDefault", func ((_, a)) = a.isDefault)
        .ownedBy("owner")
        .controllerOrScoped()
        .build(),
      // Orders are per-caller; the owner lives in the orderOwners side map and
      // is promoted to a column. The agent (controller) reads all rows.
      OQL.Entity.manual<(Principal, OrderTypes.Order)>("order", orderRows, "Order", "id")
        .sample((samplePrincipal, {
          id = 0;
          orderNumber = "";
          restaurantId = 0;
          restaurantName = "";
          items = [];
          subtotal = 0;
          deliveryFee = 0;
          total = 0;
          paymentMethod = #cashOnDelivery;
          status = #placed;
          address = {
            id = 0;
            addressLabel = "";
            street = "";
            barangay = "";
            city = "";
            landmark = null;
            isDefault = false;
          };
          deliveryNotes = null;
          estimatedDeliveryMinutes = 0;
          createdAt = 0;
          updatedAt = 0;
        }))
        .payload("owner", func ((owner, _)) = owner)
        .payload("id", func ((_, o)) = o.id)
        .payload("orderNumber", func ((_, o)) = o.orderNumber)
        .payload("restaurantId", func ((_, o)) = o.restaurantId)
        .payload("restaurantName", func ((_, o)) = o.restaurantName)
        .payload("subtotal", func ((_, o)) = o.subtotal)
        .payload("deliveryFee", func ((_, o)) = o.deliveryFee)
        .payload("total", func ((_, o)) = o.total)
        .payload("paymentMethod", func ((_, o)) = switch (o.paymentMethod) {
          case (#cashOnDelivery) "cashOnDelivery";
          case (#card) "card";
        })
        .payload("status", func ((_, o)) = switch (o.status) {
          case (#placed) "placed";
          case (#confirmed) "confirmed";
          case (#preparing) "preparing";
          case (#outForDelivery) "outForDelivery";
          case (#delivered) "delivered";
        })
        .payload("deliveryNotes", func ((_, o)) = o.deliveryNotes ?? "")
        .payload("estimatedDeliveryMinutes", func ((_, o)) = o.estimatedDeliveryMinutes)
        .payload("createdAt", func ((_, o)) = o.createdAt)
        .payload("updatedAt", func ((_, o)) = o.updatedAt)
        .ownedBy("owner")
        .controllerOrScoped()
        .build(),
    ];
  });
};
