import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context";
import { Layout } from "./components/layout";
import { HomePage } from "./features/home";
import { LoginPage, RegisterPage } from "./features/auth";
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
            {/* Auth routes - no layout */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Main routes with layout */}
            <Route
              path="/"
              element={
                <Layout>
                  <HomePage />
                </Layout>
              }
            />

            {/* Placeholder routes - to be implemented */}
            <Route
              path="/search"
              element={
                <Layout>
                  <PlaceholderPage title="Search Services" />
                </Layout>
              }
            />
            <Route
              path="/providers/:providerId"
              element={
                <Layout>
                  <PlaceholderPage title="Provider Profile" />
                </Layout>
              }
            />
            <Route
              path="/how-it-works"
              element={
                <Layout>
                  <PlaceholderPage title="How It Works" />
                </Layout>
              }
            />
            <Route
              path="/become-provider"
              element={
                <Layout>
                  <PlaceholderPage title="Become a Provider" />
                </Layout>
              }
            />
            <Route
              path="/dashboard"
              element={
                <Layout>
                  <PlaceholderPage title="Customer Dashboard" />
                </Layout>
              }
            />
            <Route
              path="/dashboard/provider"
              element={
                <Layout>
                  <PlaceholderPage title="Provider Dashboard" />
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

// Placeholder component for routes not yet implemented
function PlaceholderPage({ title }: { title: string }) {
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
          fontSize: "2rem",
          marginBottom: "16px",
          color: "var(--color-text)",
        }}
      >
        {title}
      </h1>
      <p style={{ color: "var(--color-text-muted)" }}>
        This page is coming soon. Check back later!
      </p>
    </div>
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
