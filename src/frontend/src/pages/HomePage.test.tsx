import { renderWithActor } from "@/__tests__/test-utils";
import { HomePage } from "@/pages/HomePage";
import {
  Outlet,
  RouterProvider,
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

async function renderHomePage() {
  const rootRoute = createRootRoute({ component: () => <Outlet /> });
  const homeRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/",
    component: HomePage,
  });
  const router = createRouter({
    routeTree: rootRoute.addChildren([homeRoute]),
    history: createMemoryHistory({ initialEntries: ["/"] }),
  });
  await router.load();
  return renderWithActor(<RouterProvider router={router} />, {});
}

describe("HomePage", () => {
  it("renders the five LEGO theme sections with products", async () => {
    await renderHomePage();

    for (const theme of [
      "Ninjago",
      "Star Wars",
      "Chima",
      "Scooby-Doo",
      "Variado",
    ]) {
      expect(
        screen.getAllByRole("heading", { name: theme }).length,
      ).toBeGreaterThan(0);
    }

    expect(screen.getAllByTestId("product.card").length).toBeGreaterThan(0);
    expect(
      screen.getByRole("heading", { name: "Sets destacados" }),
    ).toBeInTheDocument();
  });
});
