import Map "mo:core/Map";
import Types "../types/purchases";

module {
  /// List every purchase belonging to a customer, newest first.
  public func listForCustomer(
    purchases : Map.Map<Types.PurchaseId, Types.Purchase>,
    customerId : Types.CustomerId,
  ) : [Types.Purchase] {
    let owned = purchases.values().filter(func p = p.customerId == customerId).toArray();
    owned.sort(func(a, b) = if (a.purchasedAt > b.purchasedAt) { #less } else if (a.purchasedAt < b.purchasedAt) { #greater } else { #equal });
  };
};
