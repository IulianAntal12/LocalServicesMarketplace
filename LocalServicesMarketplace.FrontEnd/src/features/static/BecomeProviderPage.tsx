import {
  TrendingUp,
  Users,
  Calendar,
  DollarSign,
  Star,
  Shield,
  Clock,
  CheckCircle,
  ArrowRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/common";
import { useAuth } from "../../context";
import styles from "./BecomeProviderPage.module.css";

const benefits = [
  {
    icon: Users,
    title: "New customers",
    description:
      "Reach thousands of customers in your area actively looking for your services.",
  },
  {
    icon: Calendar,
    title: "Flexible schedule",
    description:
      "You decide when and how much you work. Accept bookings when it suits you.",
  },
  {
    icon: DollarSign,
    title: "Additional income",
    description: "Set your own prices and grow your income consistently.",
  },
  {
    icon: Star,
    title: "Build your reputation",
    description:
      "Positive reviews increase your visibility and attract more customers.",
  },
  {
    icon: Shield,
    title: "Zero risks",
    description:
      "Registration is free. You only pay a small commission upon service completion.",
  },
  {
    icon: Clock,
    title: "Simple management",
    description: "Intuitive dashboard for bookings, customers, and statistics.",
  },
];

const steps = [
  {
    number: "1",
    title: "Create an account",
    description: "Register for free and select your service category.",
  },
  {
    number: "2",
    title: "Complete your profile",
    description:
      "Add service descriptions, prices, coverage areas, and portfolio.",
  },
  {
    number: "3",
    title: "Receive bookings",
    description:
      "Customers find you and send requests. You choose which ones to accept.",
  },
  {
    number: "4",
    title: "Grow your business",
    description:
      "Provide quality services, receive reviews, and attract more customers.",
  },
];

const stats = [
  { value: "500+", label: "Active professionals" },
  { value: "10,000+", label: "Satisfied customers" },
  { value: "4.8", label: "Average rating" },
  { value: "10+", label: "Service categories" },
];

const testimonials = [
  {
    quote:
      "Since joining LocalPro, I've doubled my number of customers. The platform is super easy to use and customers come prepared.",
    author: "Andrei M.",
    role: "Plumber, Bucharest",
    rating: 5,
  },
  {
    quote:
      "Bookings come in constantly and I can manage my time myself. The best part is I don't have to advertise anymore.",
    author: "Maria P.",
    role: "Painter, Cluj",
    rating: 5,
  },
];

export function BecomeProviderPage() {
  const navigate = useNavigate();
  const { isAuthenticated, isProvider } = useAuth();

  const handleGetStarted = () => {
    if (isAuthenticated && isProvider) {
      navigate("/dashboard/provider");
    } else if (isAuthenticated) {
      // Already logged in as customer - could show a message or different flow
      navigate("/register?role=provider");
    } else {
      navigate("/register?role=provider");
    }
  };

  return (
    <div className={styles.page}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <span className={styles.heroBadge}>
            <TrendingUp size={16} />
            Grow your business
          </span>
          <h1 className={styles.heroTitle}>
            Become a professional on LocalPro
          </h1>
          <p className={styles.heroSubtitle}>
            Connect with customers in your area who need your services.
            Registration is free and you can start receiving bookings today.
          </p>
          <div className={styles.heroButtons}>
            <Button variant="secondary" size="lg" onClick={handleGetStarted}>
              Start now
              <ArrowRight size={20} />
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate("/how-it-works")}
              className={styles.outlineBtn}
            >
              How it works
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className={styles.statsSection}>
        <div className={styles.container}>
          <div className={styles.statsGrid}>
            {stats.map((stat, index) => (
              <div key={index} className={styles.statItem}>
                <span className={styles.statValue}>{stat.value}</span>
                <span className={styles.statLabel}>{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className={styles.benefitsSection}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>Why join LocalPro?</h2>
          <p className={styles.sectionSubtitle}>
            Everything you need to grow your business in one place.
          </p>
          <div className={styles.benefitsGrid}>
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <div key={index} className={styles.benefitCard}>
                  <div className={styles.benefitIcon}>
                    <Icon size={24} />
                  </div>
                  <h3 className={styles.benefitTitle}>{benefit.title}</h3>
                  <p className={styles.benefitDescription}>
                    {benefit.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className={styles.stepsSection}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>How to get started?</h2>
          <div className={styles.stepsGrid}>
            {steps.map((step, index) => (
              <div key={index} className={styles.stepCard}>
                <div className={styles.stepNumber}>{step.number}</div>
                <h3 className={styles.stepTitle}>{step.title}</h3>
                <p className={styles.stepDescription}>{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className={styles.testimonialsSection}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>What our professionals say</h2>
          <div className={styles.testimonialsGrid}>
            {testimonials.map((testimonial, index) => (
              <div key={index} className={styles.testimonialCard}>
                <div className={styles.testimonialStars}>
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} size={18} fill="#F59E0B" color="#F59E0B" />
                  ))}
                </div>
                <p className={styles.testimonialQuote}>"{testimonial.quote}"</p>
                <div className={styles.testimonialAuthor}>
                  <span className={styles.authorName}>
                    {testimonial.author}
                  </span>
                  <span className={styles.authorRole}>{testimonial.role}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Checklist */}
      <section className={styles.checklistSection}>
        <div className={styles.container}>
          <div className={styles.checklistContent}>
            <div className={styles.checklistText}>
              <h2 className={styles.checklistTitle}>
                Everything you get as a LocalPro professional
              </h2>
              <ul className={styles.checklist}>
                <li>
                  <CheckCircle size={20} />
                  Personalized professional profile
                </li>
                <li>
                  <CheckCircle size={20} />
                  Portfolio gallery for your work
                </li>
                <li>
                  <CheckCircle size={20} />
                  Integrated booking system
                </li>
                <li>
                  <CheckCircle size={20} />
                  Instant notifications for new requests
                </li>
                <li>
                  <CheckCircle size={20} />
                  Dashboard with statistics and analytics
                </li>
                <li>
                  <CheckCircle size={20} />
                  Verified review system
                </li>
                <li>
                  <CheckCircle size={20} />
                  Visibility in local searches
                </li>
                <li>
                  <CheckCircle size={20} />
                  Dedicated support for professionals
                </li>
              </ul>
            </div>
            <div className={styles.checklistCta}>
              <div className={styles.ctaCard}>
                <h3>Ready to start?</h3>
                <p>
                  Registration takes less than 5 minutes and you can start
                  receiving customers immediately.
                </p>
                <Button
                  variant="primary"
                  size="lg"
                  fullWidth
                  onClick={handleGetStarted}
                >
                  Create free account
                </Button>
                <span className={styles.ctaNote}>
                  No hidden costs • Cancel anytime
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className={styles.finalCta}>
        <div className={styles.container}>
          <h2 className={styles.finalCtaTitle}>Join the LocalPro community</h2>
          <p className={styles.finalCtaSubtitle}>
            Hundreds of professionals are already growing their business with
            us. When will you start?
          </p>
          <Button variant="secondary" size="lg" onClick={handleGetStarted}>
            Start free now
            <ArrowRight size={20} />
          </Button>
        </div>
      </section>
    </div>
  );
}
