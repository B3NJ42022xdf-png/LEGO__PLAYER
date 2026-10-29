import App from "@/App";
import { renderWithActor } from "@/__tests__/test-utils";
import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

describe("App default route", () => {
  it("renders the home page without a blank screen", async () => {
    window.localStorage.clear();
    renderWithActor(<App />, {});

    // The app shell and the default route's content both render.
    expect(await screen.findByTestId("home.hero_section")).toBeInTheDocument();
    expect(screen.getAllByTestId("nav.link").length).toBeGreaterThan(0);
    expect(
      screen.getByRole("heading", { name: "Construye tu próxima aventura" }),
    ).toBeInTheDocument();
  });
});
