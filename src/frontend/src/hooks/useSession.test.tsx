import { renderWithActor } from "@/__tests__/test-utils";
import { SessionProvider, useSession } from "@/hooks/useSession";
import { act, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

const SESSION_KEY = "dayshop.session";
const IDLE_TIMEOUT_MS = 30 * 60 * 1000;

function SessionProbe() {
  const { isAuthenticated, session, signIn } = useSession();
  return (
    <div>
      <span data-ocid="probe.auth">{isAuthenticated ? "yes" : "no"}</span>
      <span data-ocid="probe.email">{session?.email ?? ""}</span>
      <button
        type="button"
        data-ocid="probe.signin"
        onClick={() =>
          signIn({
            token: "token-1",
            email: "ana@correo.com",
            expiresAt: Date.now() + IDLE_TIMEOUT_MS,
          })
        }
      >
        sign in
      </button>
    </div>
  );
}

describe("SessionProvider idle expiry", () => {
  afterEach(() => {
    window.localStorage.clear();
    vi.useRealTimers();
  });

  it("expires the session after 30 minutes of inactivity", async () => {
    vi.useFakeTimers({ toFake: ["Date", "setTimeout", "clearTimeout"] });
    window.localStorage.clear();
    renderWithActor(
      <SessionProvider>
        <SessionProbe />
      </SessionProvider>,
      {},
    );

    act(() => {
      screen.getByTestId("probe.signin").click();
    });
    expect(screen.getByTestId("probe.auth")).toHaveTextContent("yes");

    act(() => {
      vi.advanceTimersByTime(IDLE_TIMEOUT_MS + 1);
    });

    expect(screen.getByTestId("probe.auth")).toHaveTextContent("no");
    expect(window.localStorage.getItem(SESSION_KEY)).toBeNull();
  });

  it("keeps the session alive when activity resets the idle timer", async () => {
    vi.useFakeTimers({ toFake: ["Date", "setTimeout", "clearTimeout"] });
    window.localStorage.clear();
    renderWithActor(
      <SessionProvider>
        <SessionProbe />
      </SessionProvider>,
      {},
    );

    act(() => {
      screen.getByTestId("probe.signin").click();
    });

    // Activity just before the deadline resets the 30-minute window.
    act(() => {
      vi.advanceTimersByTime(IDLE_TIMEOUT_MS - 60_000);
    });
    act(() => {
      window.dispatchEvent(new Event("mousemove"));
    });
    act(() => {
      vi.advanceTimersByTime(IDLE_TIMEOUT_MS - 60_000);
    });

    expect(screen.getByTestId("probe.auth")).toHaveTextContent("yes");
  });
});
