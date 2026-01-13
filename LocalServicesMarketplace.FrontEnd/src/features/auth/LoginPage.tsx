import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Wrench, Mail } from "lucide-react";
import { Button, Input } from "../../components/common";
import { useAuth } from "../../context";
import { getErrorMessage } from "../../utils";
import styles from "./AuthPages.module.css";
import toast from "react-hot-toast";

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    general?: string;
  }>({});

  // Get the redirect path from location state
  const from = (location.state as { from?: string })?.from;

  const validateForm = () => {
    const newErrors: typeof errors = {};

    if (!email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Invalid email format";
    }

    if (!password) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});

    try {
      await login({ email, password });
      toast.success("Welcome back!");

      // Redirect based on user role if no specific redirect path
      if (from) {
        navigate(from, { replace: true });
      } else {
        // Get user from localStorage after login
        const storedUser = localStorage.getItem("user");
        const userData = storedUser ? JSON.parse(storedUser) : null;

        const isProvider = userData?.roles?.includes("Provider");
        const isCustomer = userData?.roles?.includes("Customer");

        if (isProvider) {
          navigate("/dashboard/provider", { replace: true });
        } else if (isCustomer) {
          navigate("/dashboard/customer", { replace: true });
        } else {
          navigate("/", { replace: true });
        }
      }
    } catch (error) {
      const message = getErrorMessage(error, "Invalid email or password");
      setErrors({ general: message });
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.authPage}>
      {/* Left Panel - Branding */}
      <div className={styles.brandPanel}>
        <div className={styles.brandBackground}>
          <div className={styles.brandCircle1} />
          <div className={styles.brandCircle2} />
        </div>

        <div className={styles.brandContent}>
          <Link to="/" className={styles.logo}>
            <div className={styles.logoIcon}>
              <Wrench size={26} color="white" />
            </div>
            <span className={styles.logoText}>LocalPro</span>
          </Link>
        </div>

        <div className={styles.brandMessage}>
          <h1 className={styles.brandTitle}>Welcome back!</h1>
          <p className={styles.brandSubtitle}>
            Sign in to manage your services, connect with customers,
            <br />
            and grow your local business.
          </p>
        </div>

        <div className={styles.brandStats}>
          <div className={styles.statCard}>
            <div className={styles.statValue}>500+</div>
            <div className={styles.statLabel}>Active Providers</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statValue}>2,000+</div>
            <div className={styles.statLabel}>Jobs Completed</div>
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className={styles.formPanel}>
        <div className={styles.formContainer}>
          <h2 className={styles.formTitle}>Sign in to your account</h2>
          <p className={styles.formSubtitle}>
            Don't have an account?{" "}
            <Link to="/register" className={styles.link}>
              Sign up
            </Link>
          </p>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className={styles.form}>
            {errors.general && (
              <div className={styles.errorBanner}>{errors.general}</div>
            )}

            <Input
              label="Email address"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              leftIcon={<Mail size={18} />}
              error={errors.email}
            />

            <Input
              label="Password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={errors.password}
            />

            <div className={styles.forgotPassword}>
              <Link to="/forgot-password" className={styles.link}>
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              variant="primary"
              fullWidth
              isLoading={isLoading}
            >
              Sign In
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
