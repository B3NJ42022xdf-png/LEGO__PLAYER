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

describe("AccountPage", () => {
  it("blocks a signed-out visitor from the private account area", async () => {
    window.localStorage.clear();
    const getMyPurchases = vi.fn<backendInterface["getMyPurchases"]>();
    await renderAccountPage({
      getMyProfile: vi.fn<backendInterface["getMyProfile"]>(),
      getMyPurchases,
      signOut: vi.fn<backendInterface["signOut"]>(async () => undefined),
    });

    expect(screen.getByTestId("account.signed_out_state")).toBeInTheDocument();
    expect(getMyPurchases).not.toHaveBeenCalled();
  });

  it("shows only the signed-in customer's own purchases", async () => {
    window.localStorage.clear();
    seedSession("ana@correo.com");
    const getMyPurchases = vi.fn<backendInterface["getMyPurchases"]>(
      async () => ({
        __kind__: "ok",
        ok: [
          {
            id: 1n,
            theme: "ninjago",
            totalCents: 5999n,
            productName: "Dragón Ninjago",
            purchasedAt: BigInt(Date.now()) * 1_000_000n,
            quantity: 1n,
            customerId: 1n,
          },
        ],
      }),
    );
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
      getMyPurchases,
      signOut: vi.fn<backendInterface["signOut"]>(async () => undefined),
    });

    await waitFor(() => {
      expect(screen.getByTestId("account.purchases_list")).toBeInTheDocument();
    });
    expect(screen.getByText("Dragón Ninjago")).toBeInTheDocument();
    expect(getMyPurchases).toHaveBeenCalledWith("token-ana@correo.com");
  });
});
