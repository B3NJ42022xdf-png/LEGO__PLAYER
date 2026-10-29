import Map "mo:core/Map";
import Entity "mo:caffeineai-oql/Entity";
import MapEntity "mo:caffeineai-oql/MapEntity";
import RecordValue "mo:caffeineai-oql/RecordValue";
import NatValue "mo:caffeineai-oql/NatValue";
import IntValue "mo:caffeineai-oql/IntValue";
import TextValue "mo:caffeineai-oql/TextValue";
import Types "../types/purchases";

module {
  /// Build the queryable `purchase` entity over the purchase store.
  public func entity(purchases : Map.Map<Types.PurchaseId, Types.Purchase>) : Entity.Builder<Types.Purchase> {
    purchases.toEntity("purchase", "Purchase", "id")
      .sample({
        id = 0;
        customerId = 0;
        productName = "";
        theme = "";
        quantity = 0;
        totalCents = 0;
        purchasedAt = 0;
      })
      .controllerOnly();
  };
};
