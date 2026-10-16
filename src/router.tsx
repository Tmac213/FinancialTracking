import { Navigate } from "react-router-dom";
import { AppLayout } from "./components/layout/app-layout";
import { ProtectedRoute } from "./components/layout/protected-route";
import AuthPage from "./pages/auth";
import LandingPage from "./pages/landing";
import CategoriesPage from "./pages/categories";
import DashboardPage from "./pages/dashboard";
import NotFound from "./pages/NotFound";
// Import ConversionRatePage (will be created) and SettingsPage
import SettingsPage from "./pages/settings";
import ConversionRatePage from "./pages/settings/ConversionRatePage";
import TransactionsPage from "./pages/transactions";

export const routers = [
  {
    path: "/",
    name: "landing",
    element: <LandingPage />,
  },
  {
    path: "/auth",
    name: "auth",
    element: <AuthPage />,
  },
  {
    path: "/app",
    name: "app",
    element: <ProtectedRoute />,
    children: [
      {
        path: "",
        element: <AppLayout />,
        children: [
          {
            index: true,
            element: <Navigate to="/dashboard" replace />,
          },
        ],
      },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          {
            path: "dashboard",
            name: "dashboard",
            element: <DashboardPage />,
          },
          {
            path: "transactions",
            name: "transactions",
            element: <TransactionsPage />,
          },
          {
            path: "categories",
            name: "categories",
            element: <CategoriesPage />,
          },
          {
            path: "settings",
            name: "settings",
            element: <SettingsPage />,
          },
          {
            path: "settings/conversion-rate",
            name: "conversion-rate",
            element: <ConversionRatePage />,
          },
        ],
      },
    ],
  },
  /* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */
  {
    path: "*",
    name: "404",
    element: <NotFound />,
  },
];

declare global {
  interface Window {
    __routers__: typeof routers;
  }
}

window.__routers__ = routers;
