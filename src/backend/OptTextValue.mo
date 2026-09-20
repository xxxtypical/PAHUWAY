/// OQL value conversion for `?Text` fields: an absent option becomes the empty
/// string sentinel so the column stays queryable and its schema type is stable.
module {
  public func _toRow(self : ?Text) : { #null_; #bool : Bool; #nat : Nat; #int : Int; #float : Float; #text : Text } {
    #text(self ?? "");
  };
};
