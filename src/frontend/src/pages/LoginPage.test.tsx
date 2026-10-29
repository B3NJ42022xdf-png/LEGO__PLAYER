import { renderWithActor } from "@/__tests__/test-utils";
import type { backendInterface } from "@/backend";
import { SessionProvider } from "@/hooks/useSession";
import { LoginPage } from "@/pages/LoginPage";
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

const GENERIC_ERROR = "Correo o contraseña incorrectos";

async function renderLoginPage(
  actor: Pick<backendInterface, "signIn" | "signOut">,
) {
  const rootRoute = createRootRoute({
    component: () => (
      <SessionProvider>
        <Outlet />
      </SessionProvider>
    ),
  });
  const loginRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/",
    component: LoginPage,
  });
  const accountRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/cuenta",
    component: () => <div data-ocid="account.page">Mi cuenta</div>,
  });
  const router = createRouter({
    routeTree: rootRoute.addChildren([loginRoute, accountRoute]),
    history: createMemoryHistory({ initialEntries: ["/"] }),
  });
  await router.load();
  return renderWithActor(<RouterProvider router={router} />, actor);
}

function makeActor(
  signIn: backendInterface["signIn"],
): Pick<backendInterface, "signIn" | "signOut"> {
  return { signIn, signOut: vi.fn(async () => undefined) };
}

describe("LoginPage", () => {
  it("does not submit and marks fields required when empty", async () => {
    const user = userEvent.setup();
    const signIn = vi.fn<backendInterface["signIn"]>();
    await renderLoginPage(makeActor(signIn));

    await user.click(screen.getByTestId("login.submit_button"));

    expect(signIn).not.toHaveBeenCalled();
    expect(screen.getByTestId("login.email_input")).toBeRequired();
    expect(screen.getByTestId("login.password_input")).toBeRequired();
  });

  it("shows an email format error for an invalid address", async () => {
    const user = userEvent.setup();
    const signIn = vi.fn<backendInterface["signIn"]>();
    await renderLoginPage(makeActor(signIn));

    const email = screen.getByTestId("login.email_input");
    await user.type(email, "cliente@correo");
    await user.tab();

    expect(screen.getByTestId("login.email_error")).toHaveTextContent(
      "Ingresa un correo electrónico válido",
    );
    expect(signIn).not.toHaveBeenCalled();
  });

  it("shows a password length error for a short password", async () => {
    const user = userEvent.setup();
    const signIn = vi.fn<backendInterface["signIn"]>();
    await renderLoginPage(makeActor(signIn));

    await user.type(
      screen.getByTestId("login.email_input"),
      "cliente@correo.com",
    );
    await user.type(screen.getByTestId("login.password_input"), "corta");
    await user.click(screen.getByTestId("login.submit_button"));

    expect(screen.getByTestId("login.password_error")).toHaveTextContent(
      "La contraseña debe tener al menos 12 caracteres",
    );
    expect(signIn).not.toHaveBeenCalled();
  });

  it("toggles password visibility", async () => {
    const user = userEvent.setup();
    const signIn = vi.fn<backendInterface["signIn"]>();
    await renderLoginPage(makeActor(signIn));

    const password = screen.getByTestId("login.password_input");
    expect(password).toHaveAttribute("type", "password");

    await user.click(screen.getByTestId("login.toggle_password"));
    expect(password).toHaveAttribute("type", "text");

    await user.click(screen.getByTestId("login.toggle_password"));
    expect(password).toHaveAttribute("type", "password");
  });

  it("shows a generic error for wrong credentials without revealing the email", async () => {
    const user = userEvent.setup();
    const signIn = vi.fn<backendInterface["signIn"]>(async () => ({
      __kind__: "err",
      err: { __kind__: "invalidCredentials", invalidCredentials: null },
    }));
    await renderLoginPage(makeActor(signIn));

    await user.type(
      screen.getByTestId("login.email_input"),
      "cliente@correo.com",
    );
    await user.type(
      screen.getByTestId("login.password_input"),
      "contrasena-larga",
    );
    await user.click(screen.getByTestId("login.submit_button"));

    const alert = await screen.findByTestId("login.error_state");
    expect(alert).toHaveTextContent(GENERIC_ERROR);
    expect(alert).not.toHaveTextContent(/existe|registrad/i);
  });

  it("informs the customer when the account is temporarily locked", async () => {
    const user = userEvent.setup();
    const until = BigInt(Date.now() + 15 * 60 * 1000) * 1_000_000n;
    const signIn = vi.fn<backendInterface["signIn"]>(async () => ({
      __kind__: "err",
      err: { __kind__: "accountLocked", accountLocked: { until } },
    }));
    await renderLoginPage(makeActor(signIn));

    await user.type(
      screen.getByTestId("login.email_input"),
      "cliente@correo.com",
    );
    await user.type(
      screen.getByTestId("login.password_input"),
      "contrasena-larga",
    );
    await user.click(screen.getByTestId("login.submit_button"));

    const alert = await screen.findByTestId("login.error_state");
    expect(alert).toHaveTextContent(/bloqueada temporalmente por 15 minutos/i);
  });

  it("redirects to the account page after a successful sign-in", async () => {
    const user = userEvent.setup();
    const signIn = vi.fn<backendInterface["signIn"]>(async () => ({
      __kind__: "ok",
      ok: {
        token: "token-123",
        expiresAt: BigInt(Date.now() + 30 * 60 * 1000) * 1_000_000n,
      },
    }));
    await renderLoginPage(makeActor(signIn));

    await user.type(
      screen.getByTestId("login.email_input"),
      "cliente@correo.com",
    );
    await user.type(
      screen.getByTestId("login.password_input"),
      "contrasena-larga",
    );
    await user.click(screen.getByTestId("login.submit_button"));

    await waitFor(() => {
      expect(screen.getByTestId("account.page")).toBeInTheDocument();
    });
    expect(signIn).toHaveBeenCalledWith(
      "cliente@correo.com",
      "contrasena-larga",
    );
  });
});
