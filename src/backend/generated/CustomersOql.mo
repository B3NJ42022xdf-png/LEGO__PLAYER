import Map "mo:core/Map";
import Entity "mo:caffeineai-oql/Entity";
import MapEntity "mo:caffeineai-oql/MapEntity";
import NatValue "mo:caffeineai-oql/NatValue";
import IntValue "mo:caffeineai-oql/IntValue";
import TextValue "mo:caffeineai-oql/TextValue";
import Types "../types/customers";

module {
  /// Build the queryable `customer` entity over the customer store.
  ///
  /// The stored record carries `var` fields, so the entity is declared in
  /// manual mode and exposes only the non-sensitive columns. The password
  /// digest and salt are never projected.
  public func entity(customers : Map.Map<Text, Types.Customer>) : Entity.Builder<Types.Customer> {
    customers.toEntityManual("customer", "Customer", "id")
      .sample({
        id = 0;
        email = "";
        passwordHash = "";
        passwordSalt = "";
        displayName = "";
        createdAt = 0;
        var failedAttempts = 0;
        var lockedUntil = (null : ?Types.Timestamp);
      })
      .payload("id", func c = c.id)
      .payload("email", func c = c.email)
      .payload("displayName", func c = c.displayName)
      .payload("createdAt", func c = c.createdAt)
      .controllerOnly();
  };
};
