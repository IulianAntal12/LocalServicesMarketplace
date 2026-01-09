import { Star, MapPin, Briefcase, Image } from "lucide-react";
import type { ProviderListItem } from "../../../services/providerService";
import styles from "./ProviderCard.module.css";

interface ProviderCardProps {
  provider: ProviderListItem;
  onClick: () => void;
}

export function ProviderCard({ provider, onClick }: ProviderCardProps) {
  return (
    <div className={styles.card} onClick={onClick}>
      <div className={styles.cardHeader}>
        <div className={styles.avatar}>
          <span className={styles.avatarInitial}>
            {provider.businessName.charAt(0).toUpperCase()}
          </span>
        </div>
        <div className={styles.headerInfo}>
          <h3 className={styles.businessName}>{provider.businessName}</h3>
          {provider.city && (
            <p className={styles.location}>
              <MapPin size={14} />
              {provider.city}
            </p>
          )}
        </div>
      </div>

      {provider.businessDescription && (
        <p className={styles.description}>{provider.businessDescription}</p>
      )}

      <div className={styles.stats}>
        <div className={styles.stat}>
          <Briefcase size={14} />
          <span>
            {provider.serviceCount}{" "}
            {provider.serviceCount === 1 ? "service" : "services"}
          </span>
        </div>
        <div className={styles.stat}>
          <Image size={14} />
          <span>
            {provider.portfolioImageCount}{" "}
            {provider.portfolioImageCount === 1 ? "photo" : "photos"}
          </span>
        </div>
      </div>

      <div className={styles.cardFooter}>
        <div className={styles.rating}>
          {provider.rating !== null ? (
            <>
              <Star size={16} fill="#f59e0b" color="#f59e0b" />
              <span className={styles.ratingValue}>
                {provider.rating.toFixed(1)}
              </span>
              <span className={styles.reviewCount}>
                ({provider.totalReviews}{" "}
                {provider.totalReviews === 1 ? "review" : "reviews"})
              </span>
            </>
          ) : (
            <span className={styles.newBadge}>New Provider</span>
          )}
        </div>

        {provider.serviceAreas && provider.serviceAreas.length > 0 && (
          <div className={styles.serviceAreas}>
            {provider.serviceAreas.slice(0, 2).map((area) => (
              <span key={area} className={styles.serviceAreaTag}>
                {area}
              </span>
            ))}
            {provider.serviceAreas.length > 2 && (
              <span className={styles.moreAreas}>
                +{provider.serviceAreas.length - 2}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
