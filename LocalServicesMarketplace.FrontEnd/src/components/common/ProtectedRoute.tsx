import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: ("Customer" | "Provider" | "Admin")[];
}

export function ProtectedRoute({
  children,
  allowedRoles,
}: ProtectedRouteProps) {
  const { isAuthenticated, user, isProvider, isCustomer } = useAuth();
  const location = useLocation();

  // Not authenticated - redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // If no specific roles required, just need to be authenticated
  if (!allowedRoles || allowedRoles.length === 0) {
    return <>{children}</>;
  }

  // Check if user has required role
  const hasRequiredRole = allowedRoles.some((role) =>
    user?.roles?.includes(role)
  );

  if (!hasRequiredRole) {
    // Redirect to appropriate dashboard based on actual role
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
