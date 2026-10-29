import { renderWithActor } from "@/__tests__/test-utils";
import type { backendInterface } from "@/backend";
import { SessionProvider } from "@/hooks/useSession";
import { RegisterPage } from "@/pages/RegisterPage";
import {
  Outlet,
  RouterProvider,
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

type RegisterActor = Pick<
  backendInterface,
  "registerCustomer" | "signIn" | "signOut"
>;

async function renderRegisterPage(actor: RegisterActor) {
  const rootRoute = createRootRoute({
    component: () => (
      <SessionProvider>
        <Outlet />
      </SessionProvider>
    ),
  });
  const registerRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/",
    component: RegisterPage,
  });
  const accountRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/cuenta",
    component: () => <div data-ocid="account.page">Mi cuenta</div>,
  });
  const router = createRouter({
    routeTree: rootRoute.addChildren([registerRoute, accountRoute]),
    history: createMemoryHistory({ initialEntries: ["/"] }),
  });
  await router.load();
  return renderWithActor(<RouterProvider router={router} />, actor);
}

function makeActor(
  registerCustomer: backendInterface["registerCustomer"],
  signIn: backendInterface["signIn"],
): RegisterActor {
  return {
    registerCustomer,
    signIn,
    signOut: vi.fn<backendInterface["signOut"]>(async () => undefined),
  };
}

const PROFILE = {
  id: 1n,
  displayName: "ana",
  createdAt: BigInt(Date.now()) * 1_000_000n,
  email: "ana@correo.com",
};

describe("RegisterPage", () => {
  it("rejects an invalid email and a short password without calling the backend", async () => {
    const user = userEvent.setup();
    const registerCustomer = vi.fn<backendInterface["registerCustomer"]>();
    await renderRegisterPage(
      makeActor(registerCustomer, vi.fn<backendInterface["signIn"]>()),
    );

    await user.type(screen.getByTestId("register.email_input"), "ana@correo");
    await user.type(screen.getByTestId("register.password_input"), "corta");
    await user.click(screen.getByTestId("register.submit_button"));

    expect(screen.getByTestId("register.email_error")).toHaveTextContent(
      "Ingresa un correo electrónico válido",
    );
    expect(screen.getByTestId("register.password_error")).toHaveTextContent(
      "La contraseña debe tener al menos 12 caracteres",
    );
    expect(registerCustomer).not.toHaveBeenCalled();
  });

  it("toggles password visibility", async () => {
    const user = userEvent.setup();
    await renderRegisterPage(
      makeActor(
        vi.fn<backendInterface["registerCustomer"]>(),
        vi.fn<backendInterface["signIn"]>(),
      ),
    );

    const password = screen.getByTestId("register.password_input");
    expect(password).toHaveAttribute("type", "password");

    await user.click(screen.getByTestId("register.password_toggle"));
    expect(password).toHaveAttribute("type", "text");
  });

  it("surfaces a duplicate-email error from the backend", async () => {
    const user = userEvent.setup();
    const registerCustomer = vi.fn<backendInterface["registerCustomer"]>(
      async () => ({
        __kind__: "err",
        err: { __kind__: "duplicateEmail", duplicateEmail: null },
      }),
    );
    await renderRegisterPage(
      makeActor(registerCustomer, vi.fn<backendInterface["signIn"]>()),
    );

    await user.type(
      screen.getByTestId("register.email_input"),
      "ana@correo.com",
    );
    await user.type(
      screen.getByTestId("register.password_input"),
      "contrasena-larga",
    );
    await user.click(screen.getByTestId("register.submit_button"));

    const alert = await screen.findByTestId("register.error_state");
    expect(alert).toHaveTextContent(/ya está registrado/i);
  });

  it("registers, signs in and redirects to the account page", async () => {
    const user = userEvent.setup();
    const registerCustomer = vi.fn<backendInterface["registerCustomer"]>(
      async () => ({ __kind__: "ok", ok: PROFILE }),
    );
    const signIn = vi.fn<backendInterface["signIn"]>(async () => ({
      __kind__: "ok",
      ok: {
        token: "token-123",
        expiresAt: BigInt(Date.now() + 30 * 60 * 1000) * 1_000_000n,
      },
    }));
    await renderRegisterPage(makeActor(registerCustomer, signIn));

    await user.type(
      screen.getByTestId("register.email_input"),
      "ana@correo.com",
    );
    await user.type(
      screen.getByTestId("register.password_input"),
      "contrasena-larga",
    );
    await user.click(screen.getByTestId("register.submit_button"));

    await waitFor(() => {
      expect(screen.getByTestId("account.page")).toBeInTheDocument();
    });
    expect(registerCustomer).toHaveBeenCalledWith(
      "ana@correo.com",
      "contrasena-larga",
      "ana",
    );
    expect(signIn).toHaveBeenCalledWith("ana@correo.com", "contrasena-larga");
  });
});
