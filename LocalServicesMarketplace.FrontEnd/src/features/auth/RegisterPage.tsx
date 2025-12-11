import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Wrench, Mail, ArrowLeft } from "lucide-react";
import { Button, Input } from "../../components/common";
import { useAuth } from "../../context";
import { getErrorMessage } from "../../utils";
import type { RegisterRequest } from "../../models";
import styles from "./AuthPages.module.css";
import toast from "react-hot-toast";

type UserRole = "Customer" | "Provider";

interface FormData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole | "";
  businessName: string;
  businessDescription: string;
}

interface FormErrors {
  email?: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  role?: string;
  businessName?: string;
  businessDescription?: string;
  general?: string;
}

export function RegisterPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { register } = useAuth();

  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    role: "",
    businessName: "",
    businessDescription: "",
  });

  // Pre-select role if passed in URL
  useEffect(() => {
    const roleParam = searchParams.get("role");
    if (roleParam === "provider") {
      setFormData((prev) => ({ ...prev, role: "Provider" }));
    }
  }, [searchParams]);

  const updateField = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validateStep1 = () => {
    const newErrors: FormErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    }

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    } else if (
      !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])/.test(
        formData.password
      )
    ) {
      newErrors.password =
        "Password must include uppercase, lowercase, number, and special character";
    }

    if (!formData.role) {
      newErrors.role = "Please select an option";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors: FormErrors = {};

    if (formData.role === "Provider") {
      if (!formData.businessName.trim()) {
        newErrors.businessName = "Business name is required";
      }

      if (!formData.businessDescription.trim()) {
        newErrors.businessDescription = "Business description is required";
      } else if (formData.businessDescription.length < 20) {
        newErrors.businessDescription =
          "Please provide a more detailed description (at least 20 characters)";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinue = () => {
    if (validateStep1()) {
      setStep(2);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateStep2()) return;

    setIsLoading(true);
    setErrors({});

    try {
      const registerData: RegisterRequest = {
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        role: formData.role as UserRole,
        ...(formData.role === "Provider" && {
          businessName: formData.businessName,
          businessDescription: formData.businessDescription,
        }),
      };

      await register(registerData);
      toast.success("Account created successfully!");

      // Navigate based on role
      if (formData.role === "Provider") {
        navigate("/dashboard/provider");
      } else {
        navigate("/");
      }
    } catch (error) {
      const message = getErrorMessage(
        error,
        "Registration failed. Please try again."
      );
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
          <h1 className={styles.brandTitle}>
            {step === 1 ? "Join LocalPro" : "Almost there!"}
          </h1>
          <p className={styles.brandSubtitle}>
            {step === 1
              ? "Create an account to start connecting with local professionals or showcase your services."
              : "Complete your profile to get started."}
          </p>
        </div>

        {/* Progress indicator */}
        <div className={styles.progressContainer}>
          <div className={styles.progressBar}>
            <div className={styles.progressStep} />
            <div
              className={`${styles.progressStep} ${
                step >= 2 ? styles.active : ""
              }`}
            />
          </div>
          <span className={styles.progressText}>Step {step} of 2</span>
        </div>
      </div>

      {/* Right Panel - Registration Form */}
      <div className={styles.formPanel}>
        <div className={styles.formContainer}>
          {step === 1 ? (
            <>
              <h2 className={styles.formTitle}>Create your account</h2>
              <p className={styles.formSubtitle}>
                Already have an account?{" "}
                <Link to="/login" className={styles.link}>
                  Sign in
                </Link>
              </p>

              {/* Google Sign Up Button 
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
              </div> */}

              <form className={styles.form}>
                {errors.general && (
                  <div className={styles.errorBanner}>{errors.general}</div>
                )}

                <div className={styles.nameFields}>
                  <Input
                    label="First name"
                    type="text"
                    placeholder="John"
                    value={formData.firstName}
                    onChange={(e) => updateField("firstName", e.target.value)}
                    error={errors.firstName}
                  />
                  <Input
                    label="Last name"
                    type="text"
                    placeholder="Doe"
                    value={formData.lastName}
                    onChange={(e) => updateField("lastName", e.target.value)}
                    error={errors.lastName}
                  />
                </div>

                <Input
                  label="Email address"
                  type="email"
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={(e) => updateField("email", e.target.value)}
                  leftIcon={<Mail size={18} />}
                  error={errors.email}
                />

                <Input
                  label="Password"
                  type="password"
                  placeholder="Create a strong password"
                  value={formData.password}
                  onChange={(e) => updateField("password", e.target.value)}
                  error={errors.password}
                  helperText="Must be at least 8 characters with uppercase, lowercase, number, and special character"
                />

                {/* Role Selection */}
                <div className={styles.roleSection}>
                  <label className={styles.roleLabel}>I want to...</label>
                  {errors.role && (
                    <span className={styles.roleError}>{errors.role}</span>
                  )}
                  <div className={styles.roleOptions}>
                    <div
                      className={`${styles.roleCard} ${
                        formData.role === "Customer" ? styles.selected : ""
                      }`}
                      onClick={() => updateField("role", "Customer")}
                    >
                      <span className={styles.roleIcon}>🔍</span>
                      <span className={styles.roleTitle}>Find services</span>
                      <span className={styles.roleDesc}>
                        I need help with tasks
                      </span>
                    </div>
                    <div
                      className={`${styles.roleCard} ${
                        formData.role === "Provider" ? styles.selected : ""
                      }`}
                      onClick={() => updateField("role", "Provider")}
                    >
                      <span className={styles.roleIcon}>💼</span>
                      <span className={styles.roleTitle}>Offer services</span>
                      <span className={styles.roleDesc}>
                        I'm a professional
                      </span>
                    </div>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="primary"
                  fullWidth
                  onClick={handleContinue}
                  disabled={!formData.role}
                >
                  Continue
                </Button>

                <p className={styles.terms}>
                  By signing up, you agree to our{" "}
                  <Link to="/terms" className={styles.link}>
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link to="/privacy" className={styles.link}>
                    Privacy Policy
                  </Link>
                </p>
              </form>
            </>
          ) : (
            <>
              <button className={styles.backButton} onClick={() => setStep(1)}>
                <ArrowLeft size={18} />
                Back
              </button>

              <h2 className={styles.formTitle}>
                {formData.role === "Provider"
                  ? "Tell us about your business"
                  : "Complete your profile"}
              </h2>
              <p className={styles.formSubtitle}>
                {formData.role === "Provider"
                  ? "This helps customers find and trust your services"
                  : "Help us personalize your experience"}
              </p>

              <form onSubmit={handleSubmit} className={styles.form}>
                {errors.general && (
                  <div className={styles.errorBanner}>{errors.general}</div>
                )}

                {formData.role === "Provider" && (
                  <>
                    <Input
                      label="Business name *"
                      type="text"
                      placeholder="e.g., John's Plumbing Services"
                      value={formData.businessName}
                      onChange={(e) =>
                        updateField("businessName", e.target.value)
                      }
                      error={errors.businessName}
                    />

                    <div className={styles.textareaWrapper}>
                      <label className={styles.textareaLabel}>
                        Describe your services *
                      </label>
                      <textarea
                        placeholder="Tell customers about your experience, specialties, and what makes you stand out..."
                        value={formData.businessDescription}
                        onChange={(e) =>
                          updateField("businessDescription", e.target.value)
                        }
                        rows={4}
                        className={`${styles.textarea} ${
                          errors.businessDescription ? styles.textareaError : ""
                        }`}
                      />
                      {errors.businessDescription && (
                        <span className={styles.fieldError}>
                          {errors.businessDescription}
                        </span>
                      )}
                    </div>
                  </>
                )}

                <div className={styles.checkboxWrapper}>
                  <input
                    type="checkbox"
                    id="terms"
                    required
                    className={styles.checkbox}
                  />
                  <label htmlFor="terms" className={styles.checkboxLabel}>
                    I agree to the Terms of Service and Privacy Policy, and
                    consent to receiving marketing communications
                  </label>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  fullWidth
                  isLoading={isLoading}
                >
                  Create Account
                </Button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
