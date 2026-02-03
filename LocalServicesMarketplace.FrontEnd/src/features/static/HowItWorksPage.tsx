import { Search, Calendar, Star, Shield, Clock, ThumbsUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/common";
import styles from "./HowItWorksPage.module.css";

const steps = [
  {
    number: "01",
    icon: Search,
    title: "Search for the service you need",
    description:
      "Use the search bar to find exactly what you need. Filter by category, location, price or rating to find the right professionals.",
  },
  {
    number: "02",
    icon: Calendar,
    title: "Choose and book",
    description:
      "Compare profiles, reviews and portfolios of professionals. When you find the right person, book directly from the platform at a time that suits you.",
  },
  {
    number: "03",
    icon: ThumbsUp,
    title: "Receive the service",
    description:
      "The professional comes to you or you meet at the agreed location. Communicate directly through the platform for any additional details.",
  },
  {
    number: "04",
    icon: Star,
    title: "Leave a review",
    description:
      "After completing the service, share your experience. Reviews help other customers choose and motivate professionals to provide quality services.",
  },
];

const benefits = [
  {
    icon: Shield,
    title: "Verified professionals",
    description:
      "All service providers are verified and have complete profiles with portfolio and real reviews.",
  },
  {
    icon: Clock,
    title: "Save time",
    description:
      "Don't waste hours looking for recommendations. Find, compare and book in minutes.",
  },
  {
    icon: Star,
    title: "Real reviews",
    description:
      "Read other customers' experiences to make the right decision. All reviews are from verified users.",
  },
];

export function HowItWorksPage() {
  const navigate = useNavigate();

  return (
    <div className={styles.page}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>How does LocalPro work?</h1>
          <p className={styles.heroSubtitle}>
            Find trusted local professionals in just a few simple steps. Whether
            you need a plumber, electrician or any other service, we connect you
            with the best in your area.
          </p>
        </div>
      </section>

      {/* Steps Section */}
      <section className={styles.stepsSection}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>4 simple steps</h2>
          <div className={styles.stepsGrid}>
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={index} className={styles.stepCard}>
                  <div className={styles.stepNumber}>{step.number}</div>
                  <div className={styles.stepIconWrapper}>
                    <Icon size={32} />
                  </div>
                  <h3 className={styles.stepTitle}>{step.title}</h3>
                  <p className={styles.stepDescription}>{step.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className={styles.benefitsSection}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>Why LocalPro?</h2>
          <div className={styles.benefitsGrid}>
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <div key={index} className={styles.benefitCard}>
                  <div className={styles.benefitIcon}>
                    <Icon size={28} />
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

      {/* FAQ Section */}
      <section className={styles.faqSection}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>Frequently asked questions</h2>
          <div className={styles.faqGrid}>
            <div className={styles.faqItem}>
              <h4 className={styles.faqQuestion}>
                How much does it cost to use the platform?
              </h4>
              <p className={styles.faqAnswer}>
                Using the platform is free for customers. You only pay for the
                actual service to the professional, at the agreed price.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h4 className={styles.faqQuestion}>
                How do I know the professional is trustworthy?
              </h4>
              <p className={styles.faqAnswer}>
                Each professional has a profile with reviews from previous
                customers, rating and work portfolio. You can see their
                experience before booking.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h4 className={styles.faqQuestion}>Can I cancel a booking?</h4>
              <p className={styles.faqAnswer}>
                Yes, you can cancel a booking from your dashboard. Please cancel
                at least 24 hours in advance to respect the professional's time.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h4 className={styles.faqQuestion}>
                What do I do if I'm not satisfied with the service?
              </h4>
              <p className={styles.faqAnswer}>
                Communication is key! Discuss with the professional first. Your
                honest review helps the community and motivates service quality.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={styles.ctaSection}>
        <div className={styles.container}>
          <div className={styles.ctaContent}>
            <h2 className={styles.ctaTitle}>Ready to start?</h2>
            <p className={styles.ctaSubtitle}>
              Find the right professional for you in seconds.
            </p>
            <div className={styles.ctaButtons}>
              <Button
                variant="primary"
                size="lg"
                onClick={() => navigate("/search")}
              >
                Search services
              </Button>
              <Button
                variant="secondary"
                size="lg"
                onClick={() => navigate("/become-provider")}
              >
                Become a professional
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
