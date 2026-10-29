import { renderWithActor } from "@/__tests__/test-utils";
import type { backendInterface } from "@/backend";
import { SessionProvider } from "@/hooks/useSession";
import { AccountPage } from "@/pages/AccountPage";
import {
  Outlet,
  RouterProvider,
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

const SESSION_KEY = "dayshop.session";

function seedSession(email: string) {
  window.localStorage.setItem(
    SESSION_KEY,
    JSON.stringify({
      token: `token-${email}`,
      email,
      expiresAt: Date.now() + 30 * 60 * 1000,
    }),
  );
}

async function renderAccountPage(
  actor: Pick<backendInterface, "getMyProfile" | "getMyPurchases" | "signOut">,
) {
  const rootRoute = createRootRoute({
    component: () => (
      <SessionProvider>
        <Outlet />
      </SessionProvider>
    ),
  });
  const accountRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/",
    component: AccountPage,
  });
  const router = createRouter({
    routeTree: rootRoute.addChildren([accountRoute]),
    history: createMemoryHistory({ initialEntries: ["/"] }),
  });
  await router.load();
  return renderWithActor(<RouterProvider router={router} />, actor);
}

describe("AccountPage empty and error states", () => {
  it("shows the empty state when the customer has no purchases", async () => {
    window.localStorage.clear();
    seedSession("ana@correo.com");
    await renderAccountPage({
      getMyProfile: vi.fn<backendInterface["getMyProfile"]>(async () => ({
        __kind__: "ok",
        ok: {
          id: 1n,
          displayName: "Ana",
          createdAt: BigInt(Date.now()) * 1_000_000n,
          email: "ana@correo.com",
        },
      })),
      getMyPurchases: vi.fn<backendInterface["getMyPurchases"]>(async () => ({
        __kind__: "ok",
        ok: [],
      })),
      signOut: vi.fn<backendInterface["signOut"]>(async () => undefined),
    });

    await waitFor(() => {
      expect(screen.getByTestId("account.empty_state")).toBeInTheDocument();
    });
    expect(screen.queryByTestId("account.purchases_list")).toBeNull();
  });

  it("shows a session-expired message when the token is rejected", async () => {
    window.localStorage.clear();
    seedSession("ana@correo.com");
    await renderAccountPage({
      getMyProfile: vi.fn<backendInterface["getMyProfile"]>(async () => ({
        __kind__: "err",
        err: { __kind__: "notAuthenticated", notAuthenticated: null },
      })),
      getMyPurchases: vi.fn<backendInterface["getMyPurchases"]>(async () => ({
        __kind__: "err",
        err: { __kind__: "notAuthenticated", notAuthenticated: null },
      })),
      signOut: vi.fn<backendInterface["signOut"]>(async () => undefined),
    });

    const alert = await screen.findByTestId("account.error_state");
    expect(alert).toHaveTextContent(/sesión ha caducado/i);
  });
});
