import Map "mo:core/Map";
import List "mo:core/List";
import Principal "mo:core/Principal";
import Types "../types/addresses";

module {
  /// List the caller's saved addresses.
  public func listAddresses(
    addresses : Map.Map<Principal, List.List<Types.Address>>,
    caller : Principal,
  ) : [Types.Address] {
    switch (addresses.get(caller)) {
      case (?list) { list.toArray() };
      case null { [] };
    };
  };

  /// Add a saved address for the caller.
  public func addAddress(
    addresses : Map.Map<Principal, List.List<Types.Address>>,
    counters : { var nextAddressId : Nat },
    caller : Principal,
    input : Types.AddressInput,
  ) : Types.Address {
    let id = counters.nextAddressId;
    counters.nextAddressId := id + 1;
    let list = switch (addresses.get(caller)) {
      case (?existing) { existing };
      case null {
        let fresh = List.empty<Types.Address>();
        addresses.add(caller, fresh);
        fresh;
      };
    };
    let isFirst = list.size() == 0;
    let address : Types.Address = {
      id;
      addressLabel = input.addressLabel;
      street = input.street;
      barangay = input.barangay;
      city = input.city;
      landmark = input.landmark;
      isDefault = isFirst;
    };
    list.add(address);
    address;
  };

  /// Update one of the caller's saved addresses.
  public func updateAddress(
    addresses : Map.Map<Principal, List.List<Types.Address>>,
    caller : Principal,
    id : Types.AddressId,
    input : Types.AddressInput,
  ) : ?Types.Address {
    switch (addresses.get(caller)) {
      case null { null };
      case (?list) {
        var updated : ?Types.Address = null;
        list.mapInPlace(
          func(address) {
            if (address.id == id) {
              let next : Types.Address = {
                id = address.id;
                addressLabel = input.addressLabel;
                street = input.street;
                barangay = input.barangay;
                city = input.city;
                landmark = input.landmark;
                isDefault = address.isDefault;
              };
              updated := ?next;
              next;
            } else {
              address;
            };
          }
        );
        updated;
      };
    };
  };

  /// Mark one of the caller's addresses as the default.
  public func setDefaultAddress(
    addresses : Map.Map<Principal, List.List<Types.Address>>,
    caller : Principal,
    id : Types.AddressId,
  ) : ?Types.Address {
    switch (addresses.get(caller)) {
      case null { null };
      case (?list) {
        var target : ?Types.Address = null;
        list.mapInPlace(
          func(address) {
            if (address.id == id) {
              let next = { address with isDefault = true };
              target := ?next;
              next;
            } else {
              { address with isDefault = false };
            };
          }
        );
        target;
      };
    };
  };

  /// Delete one of the caller's saved addresses.
  public func deleteAddress(
    addresses : Map.Map<Principal, List.List<Types.Address>>,
    caller : Principal,
    id : Types.AddressId,
  ) : Bool {
    switch (addresses.get(caller)) {
      case null { false };
      case (?list) {
        var removedDefault = false;
        var removed = false;
        let snapshot = list.toArray();
        list.clear();
        for (address in snapshot.values()) {
          if (address.id == id) {
            removed := true;
            removedDefault := address.isDefault;
          } else {
            list.add(address);
          };
        };
        if (removed and removedDefault and list.size() > 0) {
          let first = list.at(0);
          list.mapInPlace(
            func(address) {
              { address with isDefault = address.id == first.id };
            }
          );
        };
        removed;
      };
    };
  };
};
