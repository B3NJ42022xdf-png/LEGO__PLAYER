import Common "common";

module {
  public type Timestamp = Common.Timestamp;
  public type CustomerId = Common.CustomerId;

  /// Stored customer account. The password is never stored in plain text.
  public type Customer = {
    id : CustomerId;
    email : Text;
    passwordHash : Text;
    passwordSalt : Text;
    displayName : Text;
    createdAt : Timestamp;
    var failedAttempts : Nat;
    var lockedUntil : ?Timestamp;
  };

  /// Public view of a customer, safe to return across the API boundary.
  public type CustomerProfile = {
    id : CustomerId;
    email : Text;
    displayName : Text;
    createdAt : Timestamp;
  };

  /// Outcome recorded for a single sign-in attempt.
  public type LoginResult = {
    #success;
    #invalidCredentials;
    #locked;
  };

  /// One entry in the login-attempt log.
  public type LoginAttempt = {
    email : Text;
    timestamp : Timestamp;
    result : LoginResult;
  };

  /// Errors a caller can act on when registering or signing in.
  public type AuthError = {
    #invalidEmail;
    #weakPassword;
    #duplicateEmail;
    #invalidCredentials;
    #accountLocked : { until : Timestamp };
    #notAuthenticated;
  };

  /// A signed-in session returned to the caller.
  public type Session = {
    token : Text;
    expiresAt : Timestamp;
  };
};
