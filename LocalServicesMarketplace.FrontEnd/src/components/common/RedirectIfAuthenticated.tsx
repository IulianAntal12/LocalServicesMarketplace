import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context";

interface RedirectIfAuthenticatedProps {
  children: React.ReactNode;
}

export function RedirectIfAuthenticated({
  children,
}: RedirectIfAuthenticatedProps) {
  const { isAuthenticated, isProvider, isCustomer } = useAuth();
  const location = useLocation();

  // Get redirect path from state or determine by role
  const from = (location.state as { from?: string })?.from;

  if (isAuthenticated) {
    if (from) {
      return <Navigate to={from} replace />;
    }

    // Redirect to appropriate dashboard
    if (isProvider) {
      return <Navigate to="/dashboard/provider" replace />;
    }
    if (isCustomer) {
      return <Navigate to="/dashboard/customer" replace />;
    }
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
