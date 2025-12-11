import { Link } from "react-router-dom";
import { Wrench } from "lucide-react";
import styles from "./Footer.module.css";

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.content}>
          {/* Logo & Description */}
          <div className={styles.brand}>
            <Link to="/" className={styles.logo}>
              <div className={styles.logoIcon}>
                <Wrench size={18} color="white" />
              </div>
              <span className={styles.logoText}>LocalPro</span>
            </Link>
            <p className={styles.description}>
              Connecting communities with trusted local professionals. Quality
              work, fair prices, verified reviews.
            </p>
          </div>

          {/* Links */}
          <div className={styles.links}>
            <div className={styles.linkGroup}>
              <h4 className={styles.linkGroupTitle}>For Customers</h4>
              <Link to="/search" className={styles.link}>
                Find Services
              </Link>
              <Link to="/how-it-works" className={styles.link}>
                How It Works
              </Link>
              <Link to="/help" className={styles.link}>
                Help Center
              </Link>
            </div>

            <div className={styles.linkGroup}>
              <h4 className={styles.linkGroupTitle}>For Providers</h4>
              <Link to="/become-provider" className={styles.link}>
                Become a Provider
              </Link>
              <Link to="/provider-resources" className={styles.link}>
                Resources
              </Link>
              <Link to="/success-stories" className={styles.link}>
                Success Stories
              </Link>
            </div>

            <div className={styles.linkGroup}>
              <h4 className={styles.linkGroupTitle}>Company</h4>
              <Link to="/about" className={styles.link}>
                About Us
              </Link>
              <Link to="/contact" className={styles.link}>
                Contact
              </Link>
              <Link to="/careers" className={styles.link}>
                Careers
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className={styles.bottom}>
          <p className={styles.copyright}>
            © {new Date().getFullYear()} LocalPro. All rights reserved.
          </p>
          <div className={styles.legalLinks}>
            <Link to="/privacy" className={styles.legalLink}>
              Privacy Policy
            </Link>
            <Link to="/terms" className={styles.legalLink}>
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
