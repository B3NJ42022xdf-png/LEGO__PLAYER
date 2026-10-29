import Common "common";

module {
  public type Timestamp = Common.Timestamp;
  public type CustomerId = Common.CustomerId;
  public type PurchaseId = Common.PurchaseId;

  /// A single purchased line item belonging to a customer.
  public type Purchase = {
    id : PurchaseId;
    customerId : CustomerId;
    productName : Text;
    theme : Text;
    quantity : Nat;
    totalCents : Nat;
    purchasedAt : Timestamp;
  };
};
