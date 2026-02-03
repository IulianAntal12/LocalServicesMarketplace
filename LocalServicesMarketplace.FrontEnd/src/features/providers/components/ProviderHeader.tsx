import { useState } from "react";
import {
  Star,
  MapPin,
  DollarSign,
  Briefcase,
  Image,
  Mail,
  Phone,
  Lock,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { ProviderProfile } from "../../../services/providerService";
import { useAuth } from "../../../context";
import { Button } from "../../../components/common";
import styles from "./ProviderHeader.module.css";

interface ProviderHeaderProps {
  provider: ProviderProfile;
}

export function ProviderHeader({ provider }: ProviderHeaderProps) {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [showContactInfo, setShowContactInfo] = useState(false);

  const activeServicesCount = provider.services.filter(
    (s) => s.isActive,
  ).length;

  const handleContactClick = () => {
    if (!isAuthenticated) {
      return;
    }
    setShowContactInfo(!showContactInfo);
  };

  const handleLoginRedirect = () => {
    navigate("/login", { state: { from: `/providers/${provider.id}` } });
  };

  return (
    <div className={styles.header}>
      <div className={styles.headerContent}>
        {/* Avatar */}
        <div className={styles.avatar}>
          {provider.profilePictureUrl ? (
            <img
              src={provider.profilePictureUrl}
              alt={provider.businessName || provider.fullName}
              className={styles.avatarImage}
            />
          ) : (
            <span className={styles.avatarInitial}>
              {(provider.businessName || provider.fullName || "P")
                .charAt(0)
                .toUpperCase()}
            </span>
          )}
        </div>

        {/* Info */}
        <div className={styles.info}>
          <h1 className={styles.businessName}>
            {provider.businessName || provider.fullName}
          </h1>

          <div className={styles.meta}>
            {/* Rating */}
            {provider.rating !== null && provider.rating !== undefined ? (
              <div className={styles.rating}>
                <Star
                  size={18}
                  className={styles.starIcon}
                  fill="currentColor"
                />
                <span className={styles.ratingValue}>
                  {provider.rating.toFixed(1)}
                </span>
                <span className={styles.reviewCount}>
                  ({provider.totalReviews}{" "}
                  {provider.totalReviews === 1 ? "review" : "reviews"})
                </span>
              </div>
            ) : (
              <span className={styles.noRating}>No reviews yet</span>
            )}

            {/* Location */}
            {provider.city && (
              <div className={styles.metaItem}>
                <MapPin size={16} />
                <span>{provider.city}</span>
              </div>
            )}

            {/* Hourly Rate */}
            {provider.hourlyRate && (
              <div className={styles.metaItem}>
                <DollarSign size={16} />
                <span>{provider.hourlyRate.toFixed(2)} RON/hr</span>
              </div>
            )}
          </div>

          {/* Stats */}
          <div className={styles.stats}>
            <div className={styles.stat}>
              <Briefcase size={16} />
              <span>
                {activeServicesCount}{" "}
                {activeServicesCount === 1 ? "Service" : "Services"}
              </span>
            </div>
            <div className={styles.stat}>
              <Image size={16} />
              <span>{provider.portfolioImages.length} Photos</span>
            </div>
          </div>
        </div>

        {/* Contact Section */}
        <div className={styles.actions}>
          {isAuthenticated ? (
            <div className={styles.contactSection}>
              <Button onClick={handleContactClick} size="lg">
                <Mail size={18} />
                {showContactInfo ? "Hide Contact" : "Show Contact"}
              </Button>

              {showContactInfo && (
                <div className={styles.contactInfo}>
                  {provider.email && (
                    <a
                      href={`mailto:${provider.email}`}
                      className={styles.contactItem}
                    >
                      <Mail size={16} />
                      <span>{provider.email}</span>
                    </a>
                  )}
                  {provider.phoneNumber && (
                    <a
                      href={`tel:${provider.phoneNumber}`}
                      className={styles.contactItem}
                    >
                      <Phone size={16} />
                      <span>{provider.phoneNumber}</span>
                    </a>
                  )}
                  {!provider.email && !provider.phoneNumber && (
                    <p className={styles.noContact}>
                      No contact information available.
                    </p>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className={styles.loginPrompt}>
              <Button onClick={handleLoginRedirect} size="lg">
                <Lock size={18} />
                Contact Provider
              </Button>
              <p className={styles.loginMessage}>
                Log in to see contact information
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
