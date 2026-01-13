import { Search, Calendar, Star, Shield, Clock, ThumbsUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/common";
import styles from "./HowItWorksPage.module.css";

const steps = [
  {
    number: "01",
    icon: Search,
    title: "Caută serviciul dorit",
    description:
      "Folosește bara de căutare pentru a găsi exact ce ai nevoie. Filtrează după categorie, locație, preț sau rating pentru a găsi profesioniștii potriviți.",
  },
  {
    number: "02",
    icon: Calendar,
    title: "Alege și programează",
    description:
      "Compară profilurile, recenziile și portofoliile profesioniștilor. Când ai găsit persoana potrivită, programează-te direct din platformă la ora care ți se potrivește.",
  },
  {
    number: "03",
    icon: ThumbsUp,
    title: "Primește serviciul",
    description:
      "Profesionistul vine la tine sau te întâlnești la locația convenită. Comunică direct prin platformă pentru orice detalii suplimentare.",
  },
  {
    number: "04",
    icon: Star,
    title: "Lasă o recenzie",
    description:
      "După finalizarea serviciului, împărtășește experiența ta. Recenziile ajută alți clienți să aleagă și motivează profesioniștii să ofere servicii de calitate.",
  },
];

const benefits = [
  {
    icon: Shield,
    title: "Profesioniști verificați",
    description:
      "Toți furnizorii de servicii sunt verificați și au profiluri complete cu portofoliu și recenzii reale.",
  },
  {
    icon: Clock,
    title: "Economisești timp",
    description:
      "Nu mai pierde ore căutând recomandări. Găsește, compară și programează în câteva minute.",
  },
  {
    icon: Star,
    title: "Recenzii reale",
    description:
      "Citește experiențele altor clienți pentru a lua decizia corectă. Toate recenziile sunt de la utilizatori verificați.",
  },
];

export function HowItWorksPage() {
  const navigate = useNavigate();

  return (
    <div className={styles.page}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>Cum funcționează LocalPro?</h1>
          <p className={styles.heroSubtitle}>
            Găsește profesioniști locali de încredere în doar câțiva pași simpli.
            Fie că ai nevoie de un instalator, electrician sau orice alt
            serviciu, noi te conectăm cu cei mai buni din zona ta.
          </p>
        </div>
      </section>

      {/* Steps Section */}
      <section className={styles.stepsSection}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>4 pași simpli</h2>
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
          <h2 className={styles.sectionTitle}>De ce LocalPro?</h2>
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
          <h2 className={styles.sectionTitle}>Întrebări frecvente</h2>
          <div className={styles.faqGrid}>
            <div className={styles.faqItem}>
              <h4 className={styles.faqQuestion}>
                Cât costă să folosesc platforma?
              </h4>
              <p className={styles.faqAnswer}>
                Utilizarea platformei este gratuită pentru clienți. Plătești
                doar serviciul efectiv către profesionist, la prețul agreat.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h4 className={styles.faqQuestion}>
                Cum știu că profesionistul e de încredere?
              </h4>
              <p className={styles.faqAnswer}>
                Fiecare profesionist are un profil cu recenzii de la clienți
                anteriori, rating și portofoliu de lucrări. Poți vedea
                experiența lor înainte de a programa.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h4 className={styles.faqQuestion}>
                Pot anula o programare?
              </h4>
              <p className={styles.faqAnswer}>
                Da, poți anula o programare din dashboard-ul tău. Te rugăm să
                anulezi cu cel puțin 24 de ore înainte pentru a respecta timpul
                profesionistului.
              </p>
            </div>
            <div className={styles.faqItem}>
              <h4 className={styles.faqQuestion}>
                Ce fac dacă nu sunt mulțumit de serviciu?
              </h4>
              <p className={styles.faqAnswer}>
                Comunicarea e cheia! Discută mai întâi cu profesionistul.
                Recenzia ta sinceră ajută comunitatea și motivează calitatea
                serviciilor.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={styles.ctaSection}>
        <div className={styles.container}>
          <div className={styles.ctaContent}>
            <h2 className={styles.ctaTitle}>Gata să începi?</h2>
            <p className={styles.ctaSubtitle}>
              Găsește profesionistul potrivit pentru tine în câteva secunde.
            </p>
            <div className={styles.ctaButtons}>
              <Button
                variant="primary"
                size="lg"
                onClick={() => navigate("/search")}
              >
                Caută servicii
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => navigate("/become-provider")}
              >
                Devino profesionist
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
