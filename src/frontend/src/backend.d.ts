import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type AuthError = {
    __kind__: "invalidEmail";
    invalidEmail: null;
} | {
    __kind__: "duplicateEmail";
    duplicateEmail: null;
} | {
    __kind__: "accountLocked";
    accountLocked: {
        until: Timestamp;
    };
} | {
    __kind__: "notAuthenticated";
    notAuthenticated: null;
} | {
    __kind__: "weakPassword";
    weakPassword: null;
} | {
    __kind__: "invalidCredentials";
    invalidCredentials: null;
};
export interface Cell {
    value: Value;
    name: string;
}
export type CustomerId = bigint;
export interface CustomerProfile {
    id: CustomerId;
    displayName: string;
    createdAt: Timestamp;
    email: string;
}
export type Error_ = {
    __kind__: "FrontendOriginsNotConfigured";
    FrontendOriginsNotConfigured: null;
} | {
    __kind__: "MixedSsoSources";
    MixedSsoSources: {
        otherKeys: Array<string>;
        ssoKeys: Array<string>;
    };
} | {
    __kind__: "Stale";
    Stale: {
        ageNs: bigint;
    };
} | {
    __kind__: "MalformedCandid";
    MalformedCandid: null;
} | {
    __kind__: "AmbiguousAttribute";
    AmbiguousAttribute: {
        field: string;
        sources: Array<string>;
    };
} | {
    __kind__: "NoAttributes";
    NoAttributes: null;
} | {
    __kind__: "UnknownNonce";
    UnknownNonce: null;
} | {
    __kind__: "UntrustedSsoSource";
    UntrustedSsoSource: {
        domain: string;
    };
} | {
    __kind__: "MissingField";
    MissingField: string;
} | {
    __kind__: "FrontendOriginMismatch";
    FrontendOriginMismatch: {
        got: string;
        expected: Array<string>;
    };
};
export interface Purchase {
    id: PurchaseId;
    theme: string;
    totalCents: bigint;
    productName: string;
    purchasedAt: Timestamp;
    quantity: bigint;
    customerId: CustomerId;
}
export type PurchaseId = bigint;
export interface Result {
    hasMore: boolean;
    rows: Array<Array<Cell>>;
}
export type Result__1 = {
    __kind__: "ok";
    ok: null;
} | {
    __kind__: "err";
    err: Error_;
};
export interface Session {
    token: string;
    expiresAt: Timestamp;
}
export type Timestamp = bigint;
export type Value = {
    __kind__: "int";
    int: bigint;
} | {
    __kind__: "nat";
    nat: bigint;
} | {
    __kind__: "float";
    float: number;
} | {
    __kind__: "bool";
    bool: boolean;
} | {
    __kind__: "null";
    null: null;
} | {
    __kind__: "text";
    text: string;
};
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    execute(qJson: string): Promise<Result>;
    /**
     * / Static Markdown documentation of the DayShop backend API.
     */
    getApiDoc(): Promise<string>;
    getCallerUserRole(): Promise<UserRole>;
    /**
     * / Read the signed-in customer's own profile.
     * /
     * / An update (not a query) because resolving the token refreshes the
     * / session expiry, and a query's writes are discarded.
     */
    getMyProfile(token: string): Promise<{
        __kind__: "ok";
        ok: CustomerProfile;
    } | {
        __kind__: "err";
        err: AuthError;
    }>;
    /**
     * / List the signed-in customer's own purchase history.
     * /
     * / An update (not a query) because resolving the token refreshes the
     * / session expiry, and a query's writes are discarded.
     */
    getMyPurchases(token: string): Promise<{
        __kind__: "ok";
        ok: Array<Purchase>;
    } | {
        __kind__: "err";
        err: AuthError;
    }>;
    isCallerAdmin(): Promise<boolean>;
    /**
     * / Register a new customer account.
     */
    registerCustomer(email: string, password: string, displayName: string): Promise<{
        __kind__: "ok";
        ok: CustomerProfile;
    } | {
        __kind__: "err";
        err: AuthError;
    }>;
    schema(): Promise<string>;
    /**
     * / Sign in with email and password, returning a session token.
     */
    signIn(email: string, password: string): Promise<{
        __kind__: "ok";
        ok: Session;
    } | {
        __kind__: "err";
        err: AuthError;
    }>;
    /**
     * / Sign out and invalidate the session token.
     */
    signOut(token: string): Promise<void>;
}
