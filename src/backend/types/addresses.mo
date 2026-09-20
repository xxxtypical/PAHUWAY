import Common "common";

module {
  public type AddressId = Common.AddressId;

  /// A saved delivery address using Philippine address conventions.
  public type Address = {
    id : AddressId;
    addressLabel : Text;
    street : Text;
    barangay : Text;
    city : Text;
    landmark : ?Text;
    isDefault : Bool;
  };

  /// Input for creating or updating a saved address.
  public type AddressInput = {
    addressLabel : Text;
    street : Text;
    barangay : Text;
    city : Text;
    landmark : ?Text;
  };
};
