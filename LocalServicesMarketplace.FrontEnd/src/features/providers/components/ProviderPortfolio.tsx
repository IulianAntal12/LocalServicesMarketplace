import { useState } from "react";
import { Image, X } from "lucide-react";
import type { PortfolioImageDto } from "../../../services/providerService";
import styles from "./ProviderPortfolio.module.css";

interface ProviderPortfolioProps {
  images: PortfolioImageDto[];
}

const API_BASE_URL =
  import.meta.env.VITE_API_URL?.replace("/api", "") || "https://localhost:5001";

export function ProviderPortfolio({ images }: ProviderPortfolioProps) {
  const [viewingImage, setViewingImage] = useState<PortfolioImageDto | null>(
    null
  );

  const getImageUrl = (imageUrl: string): string => {
    if (imageUrl.startsWith("http")) {
      return imageUrl;
    }
    const cleanPath = imageUrl.startsWith("/") ? imageUrl.slice(1) : imageUrl;
    return `${API_BASE_URL}/${cleanPath}`;
  };

  if (images.length === 0) {
    return (
      <div className={styles.emptyState}>
        <Image size={48} className={styles.emptyIcon} />
        <h3 className={styles.emptyTitle}>No portfolio images</h3>
        <p className={styles.emptyText}>
          This provider hasn't uploaded any portfolio images yet.
        </p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.grid}>
        {images.map((image) => (
          <div
            key={image.id}
            className={styles.imageCard}
            onClick={() => setViewingImage(image)}
          >
            <img
              src={getImageUrl(image.imageUrl)}
              alt={image.description || "Portfolio image"}
              className={styles.image}
              loading="lazy"
            />
            <div className={styles.imageOverlay}>
              <span className={styles.viewText}>Click to view</span>
            </div>
            {image.description && (
              <div className={styles.imageCaption}>
                <p className={styles.captionText}>{image.description}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Lightbox */}
      {viewingImage && (
        <div className={styles.lightbox} onClick={() => setViewingImage(null)}>
          <button
            className={styles.lightboxClose}
            onClick={() => setViewingImage(null)}
            aria-label="Close"
          >
            <X size={24} />
          </button>
          <img
            src={getImageUrl(viewingImage.imageUrl)}
            alt={viewingImage.description || "Portfolio image"}
            className={styles.lightboxImage}
            onClick={(e) => e.stopPropagation()}
          />
          {viewingImage.description && (
            <p className={styles.lightboxCaption}>{viewingImage.description}</p>
          )}
        </div>
      )}
    </div>
  );
}
