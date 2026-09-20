import Map "mo:core/Map";
import List "mo:core/List";
import Principal "mo:core/Principal";

import AddressesLib "../lib/addresses";
import Types "../types/addresses";

mixin (
  addresses : Map.Map<Principal, List.List<Types.Address>>,
  counters : { var nextAddressId : Nat },
) {
  /// List the caller's saved addresses.
  public query ({ caller }) func listAddresses() : async [Types.Address] {
    AddressesLib.listAddresses(addresses, caller);
  };

  /// Add a saved address for the caller.
  public shared ({ caller }) func addAddress(input : Types.AddressInput) : async Types.Address {
    AddressesLib.addAddress(addresses, counters, caller, input);
  };

  /// Update one of the caller's saved addresses.
  public shared ({ caller }) func updateAddress(id : Types.AddressId, input : Types.AddressInput) : async ?Types.Address {
    AddressesLib.updateAddress(addresses, caller, id, input);
  };

  /// Mark one of the caller's addresses as the default.
  public shared ({ caller }) func setDefaultAddress(id : Types.AddressId) : async ?Types.Address {
    AddressesLib.setDefaultAddress(addresses, caller, id);
  };

  /// Delete one of the caller's saved addresses.
  public shared ({ caller }) func deleteAddress(id : Types.AddressId) : async Bool {
    AddressesLib.deleteAddress(addresses, caller, id);
  };
};
