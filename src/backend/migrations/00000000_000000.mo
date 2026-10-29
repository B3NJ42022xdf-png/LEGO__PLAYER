import AccessControl "mo:caffeineai-authorization/access-control";
import Map "mo:core/Map";

module {
  // Inlined stable types — migrations must be self-contained.
  type Timestamp = Int;
  type CustomerId = Nat;
  type PurchaseId = Nat;

  type Customer = {
    id : CustomerId;
    email : Text;
    passwordHash : Text;
    passwordSalt : Text;
    displayName : Text;
    createdAt : Timestamp;
    var failedAttempts : Nat;
    var lockedUntil : ?Timestamp;
  };

  type LoginResult = {
    #success;
    #invalidCredentials;
    #locked;
  };

  type LoginAttempt = {
    email : Text;
    timestamp : Timestamp;
    result : LoginResult;
  };

  type Purchase = {
    id : PurchaseId;
    customerId : CustomerId;
    productName : Text;
    theme : Text;
    quantity : Nat;
    totalCents : Nat;
    purchasedAt : Timestamp;
  };

  public type OldActor = {};

  public type NewActor = {
    accessControlState : AccessControl.AccessControlState;
    customers : Map.Map<Text, Customer>;
    sessions : Map.Map<Text, CustomerId>;
    sessionExpiry : Map.Map<Text, Timestamp>;
    loginLog : Map.Map<Nat, LoginAttempt>;
    nextCustomerId : { var next : Nat };
    nextLogId : { var next : Nat };
    purchases : Map.Map<PurchaseId, Purchase>;
  };

  public func migration(_ : OldActor) : NewActor {
    {
      accessControlState = AccessControl.initState();
      customers = Map.empty();
      sessions = Map.empty();
      sessionExpiry = Map.empty();
      loginLog = Map.empty();
      nextCustomerId = { var next = 0 };
      nextLogId = { var next = 0 };
      purchases = Map.empty();
    };
  };
};
