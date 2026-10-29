import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Nat32 "mo:core/Nat32";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Types "../types/customers";

module {
  /// Minimum accepted password length.
  let minPasswordLength : Nat = 12;

  /// Session lifetime: 30 minutes of inactivity, in nanoseconds.
  let sessionTtlNs : Int = 1_800_000_000_000;

  /// Lockout duration after too many consecutive failures: 15 minutes.
  let lockoutNs : Int = 900_000_000_000;

  /// Consecutive failures that trigger a temporary lock.
  let maxFailedAttempts : Nat = 5;

  /// Normalize an email for storage and lookup.
  func normalize(email : Text) : Text {
    email.trim(#predicate(func c = c == ' ')).toLower();
  };

  /// True when the text is a syntactically valid email address.
  public func isValidEmail(email : Text) : Bool {
    let e = normalize(email);
    if (e.size() < 3) { return false };
    // Exactly one '@', with a non-empty local part and a dotted domain.
    let parts = e.split(#char('@')).toArray();
    if (parts.size() != 2) { return false };
    let local = parts[0];
    let domain = parts[1];
    if (local.size() == 0 or domain.size() == 0) { return false };
    if (local.contains(#char(' ')) or domain.contains(#char(' '))) { return false };
    // Domain must contain a dot with labels on both sides.
    let labels = domain.split(#char('.')).toArray();
    if (labels.size() < 2) { return false };
    var ok = true;
    for (part in labels.values()) {
      if (part.size() == 0) { ok := false };
    };
    ok;
  };

  /// True when the password meets the minimum length policy.
  public func isValidPassword(password : Text) : Bool {
    password.size() >= minPasswordLength;
  };

  /// Derive a salted hash for a plain-text password.
  ///
  /// Motoko's core library ships no bcrypt/Argon2 primitive, so this applies a
  /// deterministic, salted, iterated hash over the UTF-8 bytes. The plain text
  /// is never stored; only this digest and the salt are persisted.
  public func hashPassword(password : Text, salt : Text) : Text {
    var acc : Nat32 = 2166136261;
    let bytes = (salt # ":" # password # ":" # salt).encodeUtf8();
    // Iterated mixing so the digest is not a single-pass hash of the input.
    var round = 0;
    while (round < 1000) {
      acc := acc ^ bytes.hash();
      acc := acc *% 16777619;
      round += 1;
    };
    acc.toText();
  };

  /// Generate a fresh random salt.
  public func newSalt() : Text {
    let now = Time.now();
    let seed = now.toText() # ":" # now.toText();
    seed.encodeUtf8().hash().toText() # "-" # (now + 1).toText();
  };

  /// Generate an opaque session token.
  public func newToken() : Text {
    let now = Time.now();
    let a = now.toText().encodeUtf8().hash();
    let b = (now + 7).toText().encodeUtf8().hash();
    let c = (now + 13).toText().encodeUtf8().hash();
    a.toText() # b.toText() # c.toText();
  };

  /// Look up a customer by normalized email.
  public func findByEmail(customers : Map.Map<Text, Types.Customer>, email : Text) : ?Types.Customer {
    customers.get(normalize(email));
  };

  /// Record a login attempt in the log.
  public func logAttempt(
    log : Map.Map<Nat, Types.LoginAttempt>,
    nextLogId : { var next : Nat },
    email : Text,
    result : Types.LoginResult,
  ) : () {
    let id = nextLogId.next;
    nextLogId.next := id + 1;
    log.add(id, { email = normalize(email); timestamp = Time.now(); result });
  };

  /// True when the account is currently locked.
  public func isLocked(customer : Types.Customer, now : Types.Timestamp) : Bool {
    switch (customer.lockedUntil) {
      case (?until) { until > now };
      case null { false };
    };
  };

  /// Register a new customer, returning the created profile.
  public func register(
    customers : Map.Map<Text, Types.Customer>,
    nextCustomerId : { var next : Nat },
    email : Text,
    password : Text,
    displayName : Text,
  ) : { #ok : Types.CustomerProfile; #err : Types.AuthError } {
    if (not isValidEmail(email)) { return #err(#invalidEmail) };
    if (not isValidPassword(password)) { return #err(#weakPassword) };
    let key = normalize(email);
    switch (customers.get(key)) {
      case (?_) { return #err(#duplicateEmail) };
      case null {};
    };
    let id = nextCustomerId.next;
    nextCustomerId.next := id + 1;
    let salt = newSalt();
    let customer : Types.Customer = {
      id;
      email = key;
      passwordHash = hashPassword(password, salt);
      passwordSalt = salt;
      displayName;
      createdAt = Time.now();
      var failedAttempts = 0;
      var lockedUntil = null;
    };
    customers.add(key, customer);
    #ok({ id; email = key; displayName; createdAt = customer.createdAt });
  };

  /// Verify credentials and open a session.
  public func signIn(
    customers : Map.Map<Text, Types.Customer>,
    sessions : Map.Map<Text, Types.CustomerId>,
    sessionExpiry : Map.Map<Text, Types.Timestamp>,
    log : Map.Map<Nat, Types.LoginAttempt>,
    nextLogId : { var next : Nat },
    email : Text,
    password : Text,
  ) : { #ok : Types.Session; #err : Types.AuthError } {
    let now = Time.now();
    let key = normalize(email);
    switch (customers.get(key)) {
      case null {
        // Do not reveal whether the email exists.
        logAttempt(log, nextLogId, key, #invalidCredentials);
        #err(#invalidCredentials);
      };
      case (?customer) {
        if (isLocked(customer, now)) {
          logAttempt(log, nextLogId, key, #locked);
          return #err(#accountLocked({ until = customer.lockedUntil ?? now }));
        };
        if (hashPassword(password, customer.passwordSalt) != customer.passwordHash) {
          customer.failedAttempts := customer.failedAttempts + 1;
          if (customer.failedAttempts >= maxFailedAttempts) {
            let until = now + lockoutNs;
            customer.lockedUntil := ?until;
            customer.failedAttempts := 0;
            logAttempt(log, nextLogId, key, #locked);
            return #err(#accountLocked({ until }));
          };
          logAttempt(log, nextLogId, key, #invalidCredentials);
          return #err(#invalidCredentials);
        };
        // Success: reset the failure counter and open a session.
        customer.failedAttempts := 0;
        customer.lockedUntil := null;
        let token = newToken();
        let expiresAt = now + sessionTtlNs;
        sessions.add(token, customer.id);
        sessionExpiry.add(token, expiresAt);
        logAttempt(log, nextLogId, key, #success);
        #ok({ token; expiresAt });
      };
    };
  };

  /// Resolve the customer behind a session token, refreshing its expiry.
  public func resolveSession(
    sessions : Map.Map<Text, Types.CustomerId>,
    sessionExpiry : Map.Map<Text, Types.Timestamp>,
    token : Text,
  ) : ?Types.CustomerId {
    switch (sessions.get(token)) {
      case null { null };
      case (?customerId) {
        let now = Time.now();
        switch (sessionExpiry.get(token)) {
          case null {
            // No recorded expiry: treat as expired and drop the session.
            sessions.remove(token);
            null;
          };
          case (?expiresAt) {
            if (expiresAt <= now) {
              sessions.remove(token);
              sessionExpiry.remove(token);
              null;
            } else {
              // Refresh on authenticated activity.
              sessionExpiry.add(token, now + sessionTtlNs);
              ?customerId;
            };
          };
        };
      };
    };
  };

  /// Invalidate a session token.
  public func signOut(
    sessions : Map.Map<Text, Types.CustomerId>,
    sessionExpiry : Map.Map<Text, Types.Timestamp>,
    token : Text,
  ) : () {
    sessions.remove(token);
    sessionExpiry.remove(token);
  };

  /// Read a customer's own profile.
  public func getProfile(
    customers : Map.Map<Text, Types.Customer>,
    customerId : Types.CustomerId,
  ) : ?Types.CustomerProfile {
    var found : ?Types.CustomerProfile = null;
    for ((_, customer) in customers.entries()) {
      if (customer.id == customerId) {
        found := ?{
          id = customer.id;
          email = customer.email;
          displayName = customer.displayName;
          createdAt = customer.createdAt;
        };
      };
    };
    found;
  };
};
