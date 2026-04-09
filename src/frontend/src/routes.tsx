import {
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { Layout } from "./components/Layout";
import DashboardPage from "./pages/DashboardPage";
import FeedPage from "./pages/FeedPage";
import GraphPage from "./pages/GraphPage";
import IntegrationPage from "./pages/IntegrationPage";
import InvestigationPage from "./pages/InvestigationPage";

const rootRoute = createRootRoute({
  component: Layout,
});

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: DashboardPage,
});

const graphRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/graph",
  component: GraphPage,
});

const investigationRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/investigation",
  component: InvestigationPage,
});

const feedRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/feed",
  component: FeedPage,
});

const integrationRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/integration",
  component: IntegrationPage,
});

const routeTree = rootRoute.addChildren([
  dashboardRoute,
  graphRoute,
  investigationRoute,
  feedRoute,
  integrationRoute,
]);

export const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
