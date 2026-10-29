import Map "mo:core/Map";
import Types "../types/purchases";
import CustomerTypes "../types/customers";
import CustomersLib "../lib/customers";
import PurchasesLib "../lib/purchases";

mixin (
  purchases : Map.Map<Types.PurchaseId, Types.Purchase>,
  sessions : Map.Map<Text, CustomerTypes.CustomerId>,
  sessionExpiry : Map.Map<Text, CustomerTypes.Timestamp>,
) {
  /// List the signed-in customer's own purchase history.
  ///
  /// An update (not a query) because resolving the token refreshes the
  /// session expiry, and a query's writes are discarded.
  public shared func getMyPurchases(token : Text) : async { #ok : [Types.Purchase]; #err : CustomerTypes.AuthError } {
    switch (CustomersLib.resolveSession(sessions, sessionExpiry, token)) {
      case null { #err(#notAuthenticated) };
      case (?customerId) { #ok(PurchasesLib.listForCustomer(purchases, customerId)) };
    };
  };
};
