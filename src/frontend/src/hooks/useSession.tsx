import { createActor } from "@/backend";
import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  type ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const SESSION_STORAGE_KEY = "dayshop.session";
const IDLE_TIMEOUT_MS = 30 * 60 * 1000;

export interface StoredSession {
  token: string;
  email: string;
  expiresAt: number;
}

interface SessionContextValue {
  session: StoredSession | null;
  isAuthenticated: boolean;
  signIn: (session: StoredSession) => void;
  signOut: () => void;
}

const SessionContext = createContext<SessionContextValue | null>(null);

function readStoredSession(): StoredSession | null {
  try {
    const raw = window.localStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredSession;
    if (
      typeof parsed.token !== "string" ||
      typeof parsed.email !== "string" ||
      typeof parsed.expiresAt !== "number"
    ) {
      return null;
    }
    if (parsed.expiresAt <= Date.now()) {
      window.localStorage.removeItem(SESSION_STORAGE_KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function SessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<StoredSession | null>(() =>
    readStoredSession(),
  );

  const signIn = useCallback((next: StoredSession) => {
    window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(next));
    setSession(next);
  }, []);

  const signOut = useCallback(() => {
    window.localStorage.removeItem(SESSION_STORAGE_KEY);
    setSession(null);
  }, []);

  // Expire the session after 30 minutes of inactivity.
  useEffect(() => {
    if (!session) return;
    let timer = window.setTimeout(signOut, IDLE_TIMEOUT_MS);
    const reset = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(signOut, IDLE_TIMEOUT_MS);
    };
    const events: Array<keyof WindowEventMap> = [
      "mousemove",
      "keydown",
      "click",
      "scroll",
      "touchstart",
    ];
    for (const event of events) {
      window.addEventListener(event, reset, { passive: true });
    }
    return () => {
      window.clearTimeout(timer);
      for (const event of events) {
        window.removeEventListener(event, reset);
      }
    };
  }, [session, signOut]);

  const value = useMemo<SessionContextValue>(
    () => ({
      session,
      isAuthenticated: session !== null,
      signIn,
      signOut,
    }),
    [session, signIn, signOut],
  );

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
}

export function useSession(): SessionContextValue {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error("useSession debe usarse dentro de SessionProvider");
  }
  return context;
}

/** Register a new customer account. */
export function useRegisterCustomer() {
  const { actor } = useActor(createActor);
  return useMutation({
    mutationFn: async (input: {
      email: string;
      password: string;
      displayName: string;
    }) => {
      if (!actor) throw new Error("El backend no está disponible.");
      return actor.registerCustomer(
        input.email,
        input.password,
        input.displayName,
      );
    },
  });
}

/** Sign in with email and password, returning a session token. */
export function useSignIn() {
  const { actor } = useActor(createActor);
  return useMutation({
    mutationFn: async (input: { email: string; password: string }) => {
      if (!actor) throw new Error("El backend no está disponible.");
      return actor.signIn(input.email, input.password);
    },
  });
}

/** Sign out and invalidate the session token on the backend. */
export function useSignOut() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (token: string) => {
      if (!actor) return;
      await actor.signOut(token);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries();
    },
  });
}

/** Read the signed-in customer's own profile. */
export function useMyProfile(token: string | undefined) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["myProfile", token],
    queryFn: async () => {
      if (!actor || !token) return null;
      return actor.getMyProfile(token);
    },
    enabled: !!actor && !isFetching && !!token,
  });
}

/** List the signed-in customer's own purchase history. */
export function useMyPurchases(token: string | undefined) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery({
    queryKey: ["myPurchases", token],
    queryFn: async () => {
      if (!actor || !token) return null;
      return actor.getMyPurchases(token);
    },
    enabled: !!actor && !isFetching && !!token,
  });
}
