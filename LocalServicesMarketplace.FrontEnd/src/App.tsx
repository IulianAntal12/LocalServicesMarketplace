import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context";
import { Layout } from "./components/layout";
import { ProtectedRoute, RedirectIfAuthenticated } from "./components/common";
import { HomePage } from "./features/home";
import { LoginPage, RegisterPage } from "./features/auth";
import {
  ProviderDashboard,
  CustomerDashboard,
  AdminDashboard,
} from "./features/dashboard";
import { ProviderProfilePage } from "./features/providers";
import { SearchPage } from "./features/search";
import { HowItWorksPage, BecomeProviderPage } from "./features/static";
import "./styles/globals.css";

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: "#1F2937",
                color: "#fff",
                borderRadius: "10px",
              },
              success: {
                iconTheme: {
                  primary: "#10B981",
                  secondary: "#fff",
                },
              },
              error: {
                iconTheme: {
                  primary: "#EF4444",
                  secondary: "#fff",
                },
              },
            }}
          />
          <Routes>
            {/* Auth routes - redirect if already logged in */}
            <Route
              path="/login"
              element={
                <RedirectIfAuthenticated>
                  <LoginPage />
                </RedirectIfAuthenticated>
              }
            />
            <Route
              path="/register"
              element={
                <RedirectIfAuthenticated>
                  <RegisterPage />
                </RedirectIfAuthenticated>
              }
            />

            {/* Public routes */}
            <Route
              path="/"
              element={
                <Layout>
                  <HomePage />
                </Layout>
              }
            />

            <Route
              path="/search"
              element={
                <Layout>
                  <SearchPage />
                </Layout>
              }
            />

            <Route
              path="/providers/:providerId"
              element={
                <Layout>
                  <ProviderProfilePage />
                </Layout>
              }
            />

            <Route
              path="/how-it-works"
              element={
                <Layout>
                  <HowItWorksPage />
                </Layout>
              }
            />

            <Route
              path="/become-provider"
              element={
                <Layout>
                  <BecomeProviderPage />
                </Layout>
              }
            />

            {/* Protected routes - Customer only */}
            <Route
              path="/dashboard"
              element={
                <Layout>
                  <ProtectedRoute allowedRoles={["Customer"]}>
                    <CustomerDashboard />
                  </ProtectedRoute>
                </Layout>
              }
            />

            <Route
              path="/dashboard/customer"
              element={
                <Layout>
                  <ProtectedRoute allowedRoles={["Customer"]}>
                    <CustomerDashboard />
                  </ProtectedRoute>
                </Layout>
              }
            />

            {/* Protected routes - Provider only */}
            <Route
              path="/dashboard/provider"
              element={
                <Layout>
                  <ProtectedRoute allowedRoles={["Provider"]}>
                    <ProviderDashboard />
                  </ProtectedRoute>
                </Layout>
              }
            />

            {/* Protected routes - Admin only */}
            <Route
              path="/dashboard/admin"
              element={
                <Layout>
                  <ProtectedRoute allowedRoles={["Admin"]}>
                    <AdminDashboard />
                  </ProtectedRoute>
                </Layout>
              }
            />

            {/* 404 */}
            <Route
              path="*"
              element={
                <Layout>
                  <NotFoundPage />
                </Layout>
              }
            />
          </Routes>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

// 404 Page
function NotFoundPage() {
  return (
    <div
      style={{
        padding: "80px 24px",
        textAlign: "center",
        minHeight: "60vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <h1
        style={{
          fontSize: "6rem",
          marginBottom: "16px",
          color: "var(--color-primary)",
          fontWeight: 800,
        }}
      >
        404
      </h1>
      <h2
        style={{
          fontSize: "1.5rem",
          marginBottom: "8px",
          color: "var(--color-text)",
        }}
      >
        Page Not Found
      </h2>
      <p style={{ color: "var(--color-text-muted)", marginBottom: "24px" }}>
        The page you're looking for doesn't exist or has been moved.
      </p>

      <a
        href="/"
        style={{
          color: "var(--color-secondary)",
          fontWeight: 600,
          textDecoration: "none",
        }}
      >
        ← Back to Home
      </a>
    </div>
  );
}

export default App;
