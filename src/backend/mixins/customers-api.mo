import Map "mo:core/Map";
import Types "../types/customers";
import CustomersLib "../lib/customers";

mixin (
  customers : Map.Map<Text, Types.Customer>,
  sessions : Map.Map<Text, Types.CustomerId>,
  sessionExpiry : Map.Map<Text, Types.Timestamp>,
  loginLog : Map.Map<Nat, Types.LoginAttempt>,
  nextCustomerId : { var next : Nat },
  nextLogId : { var next : Nat },
) {
  /// Register a new customer account.
  public shared func registerCustomer(
    email : Text,
    password : Text,
    displayName : Text,
  ) : async { #ok : Types.CustomerProfile; #err : Types.AuthError } {
    CustomersLib.register(customers, nextCustomerId, email, password, displayName);
  };

  /// Sign in with email and password, returning a session token.
  public shared func signIn(
    email : Text,
    password : Text,
  ) : async { #ok : Types.Session; #err : Types.AuthError } {
    CustomersLib.signIn(customers, sessions, sessionExpiry, loginLog, nextLogId, email, password);
  };

  /// Read the signed-in customer's own profile.
  ///
  /// An update (not a query) because resolving the token refreshes the
  /// session expiry, and a query's writes are discarded.
  public shared func getMyProfile(token : Text) : async { #ok : Types.CustomerProfile; #err : Types.AuthError } {
    switch (CustomersLib.resolveSession(sessions, sessionExpiry, token)) {
      case null { #err(#notAuthenticated) };
      case (?customerId) {
        switch (CustomersLib.getProfile(customers, customerId)) {
          case null { #err(#notAuthenticated) };
          case (?profile) { #ok(profile) };
        };
      };
    };
  };

  /// Sign out and invalidate the session token.
  public shared func signOut(token : Text) : async () {
    CustomersLib.signOut(sessions, sessionExpiry, token);
  };
};
