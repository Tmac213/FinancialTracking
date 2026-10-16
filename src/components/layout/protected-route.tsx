import { Navigate, Outlet, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/auth-context";

/** Renders the app only for signed-in users; visitors are sent to /auth. */
export const ProtectedRoute = () => {
  const { user, initializing } = useAuth();
  const location = useLocation();

  if (initializing) {
    return (
      <div className="flex h-full min-h-screen items-center justify-center bg-background">
        <Loader2
          className="size-6 animate-spin text-primary"
          aria-label="loading"
        />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
};
