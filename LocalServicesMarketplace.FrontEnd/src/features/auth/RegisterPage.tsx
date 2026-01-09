import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Wrench, Mail, ArrowLeft, MapPin, Phone } from "lucide-react";
import { Button, Input, Select } from "../../components/common";
import { useAuth } from "../../context";
import { getErrorMessage } from "../../utils";
import { countries, getCitiesByCounty } from "../../data/romania-locations";
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
  // Location fields (required for all)
  county: string;
  city: string;
  latitude: number;
  longitude: number;
  // Provider-only fields
  phoneNumber: string;
  businessName: string;
  businessDescription: string;
}

interface FormErrors {
  email?: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  role?: string;
  county?: string;
  city?: string;
  phoneNumber?: string;
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
    county: "",
    city: "",
    latitude: 0,
    longitude: 0,
    phoneNumber: "",
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

  // Get cities for selected county
  const availableCities = useMemo(() => {
    if (!formData.county) return [];
    return getCitiesByCounty(formData.county);
  }, [formData.county]);

  // County options for Select
  const countyOptions = useMemo(
    () => countries.map((c) => ({ value: c.name, label: c.name })),
    []
  );

  // City options for Select
  const cityOptions = useMemo(
    () => availableCities.map((c) => ({ value: c.name, label: c.name })),
    [availableCities]
  );

  const updateField = (field: keyof FormData, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  // Handle county change - reset city when county changes
  const handleCountyChange = (countyName: string) => {
    updateField("county", countyName);
    updateField("city", "");
    updateField("latitude", 0);
    updateField("longitude", 0);
  };

  // Handle city change - set coordinates
  const handleCityChange = (cityName: string) => {
    updateField("city", cityName);
    const city = availableCities.find((c) => c.name === cityName);
    if (city) {
      updateField("latitude", city.lat);
      updateField("longitude", city.lng);
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

    // Location validation (required for all users)
    if (!formData.county) {
      newErrors.county = "Please select your county";
    }

    if (!formData.city) {
      newErrors.city = "Please select your city";
    }

    // Provider-specific validation
    if (formData.role === "Provider") {
      if (!formData.phoneNumber) {
        newErrors.phoneNumber = "Phone number is required for providers";
      } else if (
        !/^(\+40|0)[0-9]{9}$/.test(formData.phoneNumber.replace(/\s/g, ""))
      ) {
        newErrors.phoneNumber =
          "Please enter a valid Romanian phone number (e.g., 0721234567)";
      }

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
        county: formData.county,
        city: formData.city,
        latitude: formData.latitude,
        longitude: formData.longitude,
        ...(formData.role === "Provider" && {
          phoneNumber: formData.phoneNumber.replace(/\s/g, ""),
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
              <button
                type="button"
                className={styles.backButton}
                onClick={() => setStep(1)}
              >
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

                {/* Location Section - Required for ALL users */}
                <div className={styles.sectionHeader}>
                  <MapPin size={18} />
                  <span>Your Location</span>
                </div>

                <div className={styles.nameFields}>
                  <Select
                    label="County (Județ) *"
                    options={countyOptions}
                    value={formData.county}
                    onChange={(e) => handleCountyChange(e.target.value)}
                    placeholder="Select your county"
                    error={errors.county}
                  />
                  <Select
                    label="City *"
                    options={cityOptions}
                    value={formData.city}
                    onChange={(e) => handleCityChange(e.target.value)}
                    placeholder={
                      formData.county
                        ? "Select your city"
                        : "Select county first"
                    }
                    disabled={!formData.county}
                    error={errors.city}
                  />
                </div>

                {formData.role === "Provider" && (
                  <>
                    {/* Phone Number - Required for Providers */}
                    <Input
                      label="Phone Number *"
                      type="tel"
                      placeholder="0721 234 567"
                      value={formData.phoneNumber}
                      onChange={(e) =>
                        updateField("phoneNumber", e.target.value)
                      }
                      leftIcon={<Phone size={18} />}
                      error={errors.phoneNumber}
                      helperText="Customers will contact you at this number"
                    />

                    {/* Business Info */}
                    <div className={styles.sectionHeader}>
                      <Wrench size={18} />
                      <span>Business Information</span>
                    </div>

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
