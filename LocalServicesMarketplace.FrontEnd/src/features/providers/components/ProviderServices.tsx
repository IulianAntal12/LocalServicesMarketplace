import { Clock, DollarSign, Tag } from "lucide-react";
import type { ServiceDto } from "../../../services/providerService";
import styles from "./ProviderServices.module.css";

interface ProviderServicesProps {
  services: ServiceDto[];
}

const PRICE_TYPE_LABELS: Record<string, string> = {
  Hourly: "Per Hour",
  Fixed: "Fixed Price",
  Quote: "Request Quote",
};

export function ProviderServices({ services }: ProviderServicesProps) {
  const formatDuration = (minutes: number): string => {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (remainingMinutes === 0) {
      return `${hours}h`;
    }
    return `${hours}h ${remainingMinutes}min`;
  };

  const formatPrice = (price: number, priceType: string): string => {
    if (priceType === "Quote") {
      return "Request Quote";
    }
    const suffix = priceType === "Hourly" ? "/hr" : "";
    return `${price.toFixed(2)} RON${suffix}`;
  };

  if (services.length === 0) {
    return (
      <div className={styles.emptyState}>
        <Tag size={48} className={styles.emptyIcon} />
        <h3 className={styles.emptyTitle}>No services listed</h3>
        <p className={styles.emptyText}>
          This provider hasn't added any services yet.
        </p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.grid}>
        {services.map((service) => (
          <div key={service.id} className={styles.serviceCard}>
            <div className={styles.cardHeader}>
              <h3 className={styles.serviceName}>{service.name}</h3>
              <span className={styles.category}>{service.category}</span>
            </div>

            <p className={styles.description}>{service.description}</p>

            <div className={styles.cardFooter}>
              <div className={styles.metaInfo}>
                <span className={styles.metaItem}>
                  <DollarSign size={14} />
                  {formatPrice(service.basePrice, service.priceType)}
                </span>
                <span className={styles.metaItem}>
                  <Clock size={14} />
                  {formatDuration(service.estimatedDurationMinutes)}
                </span>
              </div>
              <span className={styles.priceType}>
                {PRICE_TYPE_LABELS[service.priceType] || service.priceType}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
