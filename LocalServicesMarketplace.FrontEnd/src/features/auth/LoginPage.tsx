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

  const from =
    (location.state as { from?: { pathname: string } })?.from?.pathname || "/";

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
      navigate(from, { replace: true });
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

          {/* Google Sign In Button 
          <button className={styles.socialButton}>
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continue with Google
          </button>

          <div className={styles.divider}>
            <span>or</span>
          </div>*/}

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
