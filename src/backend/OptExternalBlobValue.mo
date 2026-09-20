/// OQL value conversion for `?ExternalBlob` fields: an absent option becomes the
/// empty string sentinel so the column stays queryable and its schema type is
/// stable. A present blob renders through `Text` exactly like `BlobValue` — an
/// ExternalBlob object-storage reference is UTF-8 ("!caf!sha256:…"), so it stays
/// queryable and returnable as text.
module {
  public func _toRow(self : ?Blob) : { #null_; #bool : Bool; #nat : Nat; #int : Int; #float : Float; #text : Text } {
    switch (self) {
      case null { #text("") };
      case (?bytes) {
        switch (bytes.decodeUtf8()) {
          case (?t) { #text(t) };
          case null { #text("<blob:" # bytes.size().toText() # " bytes>") };
        };
      };
    };
  };
};
