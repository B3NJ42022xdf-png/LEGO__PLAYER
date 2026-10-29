import Text "mo:core/Text";

mixin () {
  /// Static Markdown documentation of the DayShop backend API.
  public query func getApiDoc() : async Text {
    "# DayShop Backend API\n\n" #
    "## Purpose\n\n" #
    "DayShop is a LEGO-themed storefront (Ninjago, Star Wars, Chima, Scooby-Doo and a varied section).\n" #
    "This backend implements the customer account system: registration, sign-in, reading the\n" #
    "signed-in customer's own profile and purchase history, and sign-out. Product browsing,\n" #
    "cart and checkout are not part of this canister.\n\n" #
    "## Authentication and authorization\n\n" #
    "- `registerCustomer(email, password, displayName)` and `signIn(email, password)` are open to any caller.\n" #
    "- `getMyProfile(token)` and `getMyPurchases(token)` require a valid session token obtained from `signIn`.\n" #
    "- `signOut(token)` invalidates a session token.\n" #
    "- There is no Internet Identity gate on these methods: the session token is the credential.\n" #
    "  The app's frontend pins an Internet Identity derivation origin, published at\n" #
    "  `/.well-known/ii-derivation-origin` when available; an agent already holding the user's\n" #
    "  Internet Identity authorization derives the correct per-app principal against that origin\n" #
    "  (for example `icp identity link web <name> --app <host>`). Such a delegation acts with the\n" #
    "  user's full authority in this app until it expires.\n" #
    "- A caller that never signed in through the app's own frontend is unregistered; the account\n" #
    "  methods above do not depend on that registration.\n\n" #
    "## Units and encoding\n\n" #
    "- Timestamps are signed nanoseconds since the Unix epoch (`Time.now()`), encoded as Candid `int`.\n" #
    "- `totalCents` is an integer amount in cents (Candid `nat`).\n" #
    "- `CustomerId`, `PurchaseId` and log ids are `nat` counters.\n" #
    "- `token` is an opaque text session token; treat it as a bearer secret.\n" #
    "- `AuthError` is a variant: `#invalidEmail`, `#weakPassword`, `#duplicateEmail`,\n" #
    "  `#invalidCredentials`, `#accountLocked({ until })`, `#notAuthenticated`.\n\n" #
    "## Lifecycle and polling\n\n" #
    "- A session token expires after 30 minutes of inactivity. Each authenticated call that resolves\n" #
    "  the token refreshes its expiry, so an active client stays signed in.\n" #
    "- After 5 consecutive failed sign-in attempts the account is locked for 15 minutes; the lock is\n" #
    "  reported as `#accountLocked({ until })` with the unlock timestamp in nanoseconds.\n" #
    "- A successful sign-in resets the failure counter and clears any lock.\n" #
    "- Polling is not required; call `getMyProfile` / `getMyPurchases` on demand.\n\n" #
    "## Mutation retry safety\n\n" #
    "- `registerCustomer` is not idempotent: a repeated call with the same email returns `#duplicateEmail`.\n" #
    "- `signIn` is safe to retry, but each failed attempt counts toward the lockout threshold.\n" #
    "- `signOut` is idempotent: signing out an unknown or already-invalidated token is a no-op.\n" #
    "- Every sign-in attempt is recorded with its timestamp and result.\n\n" #
    "## Errors and gotchas\n\n" #
    "- Incorrect credentials always return the single generic `#invalidCredentials`; the response never\n" #
    "  reveals whether the email exists.\n" #
    "- Passwords must be at least 12 characters; shorter passwords are rejected with `#weakPassword`.\n" #
    "- Emails are normalized (trimmed and lower-cased) before storage and lookup.\n" #
    "- Passwords are stored only as a salted digest; the plain text is never persisted.\n" #
    "- An expired or unknown token yields `#notAuthenticated` on guarded methods.\n";
  };
};
