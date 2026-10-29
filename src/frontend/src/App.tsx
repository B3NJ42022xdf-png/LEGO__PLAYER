import { Layout } from "@/components/Layout";
import { SessionProvider } from "@/hooks/useSession";
import { AccountPage } from "@/pages/AccountPage";
import { HomePage } from "@/pages/HomePage";
import { LoginPage } from "@/pages/LoginPage";
import { ProductDetailPage } from "@/pages/ProductDetailPage";
import { RegisterPage } from "@/pages/RegisterPage";
import { ThemePage } from "@/pages/ThemePage";
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";

const rootRoute = createRootRoute({
  component: () => (
    <SessionProvider>
      <Layout>
        <Outlet />
      </Layout>
    </SessionProvider>
  ),
});

const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: HomePage,
});

const themeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/tema/$themeId",
  component: ThemePage,
});

const productRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/producto/$productId",
  component: ProductDetailPage,
});

const registerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/registro",
  component: RegisterPage,
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/iniciar-sesion",
  component: LoginPage,
});

const accountRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/cuenta",
  component: AccountPage,
});

const routeTree = rootRoute.addChildren([
  homeRoute,
  themeRoute,
  productRoute,
  registerRoute,
  loginRoute,
  accountRoute,
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
