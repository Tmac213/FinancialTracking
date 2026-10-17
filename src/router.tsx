import { Outlet, Navigate } from "react-router-dom";
import { AppLayout } from "./components/layout/app-layout";
import { ProtectedRoute } from "./components/layout/protected-route";
import { DocumentTitleSync } from "./components/document-title-sync";
import AuthPage from "./pages/auth";
import LandingPage from "./pages/landing";
import CategoriesPage from "./pages/categories";
import DashboardPage from "./pages/dashboard";
import NotFound from "./pages/NotFound";
import SettingsPage from "./pages/settings";
import ConversionRatePage from "./pages/settings/ConversionRatePage";
import TransactionsPage from "./pages/transactions";
import MoneyTrackerPage from "./pages/money-tracker";

const RootLayout = () => (
  <>
    <DocumentTitleSync />
    <Outlet />
  </>
);

export const routers = [
  {
    element: <RootLayout />,
    children: [
      {
        path: "/",
        name: "homepage",
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
                path: "money-tracker",
                name: "money-tracker",
                element: <MoneyTrackerPage />,
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
    ],
  },
];

declare global {
  interface Window {
    __routers__: typeof routers;
  }
}

window.__routers__ = routers;
