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
    title: "Clienți noi",
    description:
      "Ajungi la mii de clienți din zona ta care caută activ serviciile tale.",
  },
  {
    icon: Calendar,
    title: "Program flexibil",
    description:
      "Tu decizi când și cât lucrezi. Acceptă programări când îți convine.",
  },
  {
    icon: DollarSign,
    title: "Venituri suplimentare",
    description:
      "Stabilește-ți propriile prețuri și crește-ți veniturile constant.",
  },
  {
    icon: Star,
    title: "Construiește-ți reputația",
    description:
      "Recenziile pozitive îți cresc vizibilitatea și atrag mai mulți clienți.",
  },
  {
    icon: Shield,
    title: "Zero riscuri",
    description:
      "Înscrierea e gratuită. Plătești doar un comision mic la finalizarea serviciului.",
  },
  {
    icon: Clock,
    title: "Gestionare simplă",
    description: "Dashboard intuitiv pentru programări, clienți și statistici.",
  },
];

const steps = [
  {
    number: "1",
    title: "Creează un cont",
    description:
      "Înregistrează-te gratuit și selectează categoria ta de servicii.",
  },
  {
    number: "2",
    title: "Completează profilul",
    description:
      "Adaugă descrierea serviciilor, prețuri, zone de acoperire și portofoliu.",
  },
  {
    number: "3",
    title: "Primește programări",
    description:
      "Clienții te găsesc și îți trimit cereri. Tu alegi pe care le accepți.",
  },
  {
    number: "4",
    title: "Crește-ți afacerea",
    description:
      "Oferă servicii de calitate, primește recenzii și atrage mai mulți clienți.",
  },
];

const stats = [
  { value: "500+", label: "Profesioniști activi" },
  { value: "10,000+", label: "Clienți mulțumiți" },
  { value: "4.8", label: "Rating mediu" },
  { value: "10+", label: "Categorii de servicii" },
];

const testimonials = [
  {
    quote:
      "De când sunt pe LocalPro, am dublat numărul de clienți. Platforma e super ușor de folosit și clienții vin pregătiți.",
    author: "Andrei M.",
    role: "Instalator, București",
    rating: 5,
  },
  {
    quote:
      "Programările vin constant și pot să-mi gestionez singur timpul. Cel mai bun lucru e că nu trebuie să mai fac reclamă.",
    author: "Maria P.",
    role: "Designer interior, Cluj",
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
            Crește-ți afacerea
          </span>
          <h1 className={styles.heroTitle}>Devino profesionist pe LocalPro</h1>
          <p className={styles.heroSubtitle}>
            Conectează-te cu clienți din zona ta care au nevoie de serviciile
            tale. Înscrierea e gratuită și poți începe să primești programări
            chiar azi.
          </p>
          <div className={styles.heroButtons}>
            <Button variant="secondary" size="lg" onClick={handleGetStarted}>
              Începe acum
              <ArrowRight size={20} />
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate("/how-it-works")}
              className={styles.outlineBtn}
            >
              Cum funcționează
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
          <h2 className={styles.sectionTitle}>De ce să te alături LocalPro?</h2>
          <p className={styles.sectionSubtitle}>
            Totul de ce ai nevoie pentru a-ți crește afacerea într-un singur
            loc.
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
          <h2 className={styles.sectionTitle}>Cum începi?</h2>
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
          <h2 className={styles.sectionTitle}>Ce spun profesioniștii noștri</h2>
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
                Tot ce primești ca profesionist LocalPro
              </h2>
              <ul className={styles.checklist}>
                <li>
                  <CheckCircle size={20} />
                  Profil profesional personalizat
                </li>
                <li>
                  <CheckCircle size={20} />
                  Galerie portofoliu pentru lucrări
                </li>
                <li>
                  <CheckCircle size={20} />
                  Sistem de programări integrat
                </li>
                <li>
                  <CheckCircle size={20} />
                  Notificări instant pentru cereri noi
                </li>
                <li>
                  <CheckCircle size={20} />
                  Dashboard cu statistici și analize
                </li>
                <li>
                  <CheckCircle size={20} />
                  Sistem de recenzii verificate
                </li>
                <li>
                  <CheckCircle size={20} />
                  Vizibilitate în căutări locale
                </li>
                <li>
                  <CheckCircle size={20} />
                  Suport dedicat pentru profesioniști
                </li>
              </ul>
            </div>
            <div className={styles.checklistCta}>
              <div className={styles.ctaCard}>
                <h3>Gata să începi?</h3>
                <p>
                  Înscrierea durează mai puțin de 5 minute și poți începe să
                  primești clienți imediat.
                </p>
                <Button
                  variant="primary"
                  size="lg"
                  fullWidth
                  onClick={handleGetStarted}
                >
                  Creează cont gratuit
                </Button>
                <span className={styles.ctaNote}>
                  Fără costuri ascunse • Anulezi oricând
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className={styles.finalCta}>
        <div className={styles.container}>
          <h2 className={styles.finalCtaTitle}>
            Alătură-te comunității LocalPro
          </h2>
          <p className={styles.finalCtaSubtitle}>
            Sute de profesioniști își cresc deja afacerea cu noi. Tu când
            începi?
          </p>
          <Button variant="secondary" size="lg" onClick={handleGetStarted}>
            Începe gratuit acum
            <ArrowRight size={20} />
          </Button>
        </div>
      </section>
    </div>
  );
}
