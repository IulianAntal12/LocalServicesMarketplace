import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { Loader2, ArrowLeft } from "lucide-react";
import {
  providerService,
  type ProviderProfile,
} from "../../services/providerService";
import { ProviderHeader } from "./components/ProviderHeader";
import { ProviderServices } from "./components/ProviderServices";
import { ProviderPortfolio } from "./components/ProviderPortfolio";
import { ProviderReviews } from "./components/ProviderReviews";
import { Button } from "../../components/common";
import styles from "./ProviderProfilePage.module.css";

export function ProviderProfilePage() {
  const { providerId } = useParams<{ providerId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [provider, setProvider] = useState<ProviderProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const initialTab = searchParams.get("tab") || "services";
  const [activeTab, setActiveTab] = useState(initialTab);

  const fetchProvider = useCallback(async () => {
    if (!providerId) {
      setError("Provider ID is required");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await providerService.getById(providerId);
      setProvider(data);
    } catch (err) {
      setError("Provider not found or an error occurred.");
      console.error("Error fetching provider:", err);
    } finally {
      setLoading(false);
    }
  }, [providerId]);

  useEffect(() => {
    const tabFromUrl = searchParams.get("tab");
    if (
      tabFromUrl &&
      ["services", "portfolio", "reviews", "about"].includes(tabFromUrl)
    ) {
      setActiveTab(tabFromUrl);
    }
  }, [searchParams]);

  useEffect(() => {
    fetchProvider();
  }, [fetchProvider]);

  const handleReviewChange = () => {
    // Refetch provider data to update rating/totalReviews in header
    fetchProvider();
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <Loader2 className={styles.spinner} size={40} />
        <p>Loading provider profile...</p>
      </div>
    );
  }

  if (error || !provider) {
    return (
      <div className={styles.errorContainer}>
        <h2 className={styles.errorTitle}>Oops!</h2>
        <p className={styles.errorText}>{error || "Provider not found"}</p>
        <Button onClick={() => navigate("/search")}>
          <ArrowLeft size={18} />
          Back to Search
        </Button>
      </div>
    );
  }

  const activeServices = provider.services.filter((s) => s.isActive);

  return (
    <div className={styles.container}>
      {/* Header Section */}
      <ProviderHeader provider={provider} />

      {/* Tabs Navigation */}
      <div className={styles.tabsContainer}>
        <div className={styles.tabsWrapper}>
          <button
            className={`${styles.tab} ${
              activeTab === "services" ? styles.tabActive : ""
            }`}
            onClick={() => setActiveTab("services")}
          >
            Services ({activeServices.length})
          </button>
          <button
            className={`${styles.tab} ${
              activeTab === "portfolio" ? styles.tabActive : ""
            }`}
            onClick={() => setActiveTab("portfolio")}
          >
            Portfolio ({provider.portfolioImages.length})
          </button>
          <button
            className={`${styles.tab} ${
              activeTab === "reviews" ? styles.tabActive : ""
            }`}
            onClick={() => setActiveTab("reviews")}
          >
            Reviews ({provider.totalReviews})
          </button>
          <button
            className={`${styles.tab} ${
              activeTab === "about" ? styles.tabActive : ""
            }`}
            onClick={() => setActiveTab("about")}
          >
            About
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className={styles.content}>
        {activeTab === "services" && (
          <ProviderServices
            services={activeServices}
            providerId={provider.id}
            providerName={provider.businessName || provider.fullName}
          />
        )}
        {activeTab === "portfolio" && (
          <ProviderPortfolio images={provider.portfolioImages} />
        )}
        {activeTab === "reviews" && (
          <ProviderReviews
            providerId={provider.id}
            providerName={provider.businessName || provider.fullName}
            services={provider.services}
            onReviewChange={handleReviewChange}
          />
        )}
        {activeTab === "about" && (
          <div className={styles.aboutSection}>
            <div className={styles.aboutCard}>
              <h3 className={styles.aboutTitle}>
                About {provider.businessName}
              </h3>
              <p className={styles.aboutDescription}>
                {provider.businessDescription || "No description provided."}
              </p>
            </div>

            <div className={styles.aboutCard}>
              <h3 className={styles.aboutTitle}>Service Areas</h3>
              {provider.serviceAreas && provider.serviceAreas.length > 0 ? (
                <div className={styles.serviceAreasTags}>
                  {provider.serviceAreas.map((area) => (
                    <span key={area} className={styles.serviceAreaTag}>
                      {area}
                    </span>
                  ))}
                </div>
              ) : (
                <p className={styles.noData}>No service areas specified.</p>
              )}
            </div>

            <div className={styles.aboutCard}>
              <h3 className={styles.aboutTitle}>Contact Information</h3>
              <div className={styles.contactInfo}>
                {provider.city && (
                  <div className={styles.contactRow}>
                    <span className={styles.contactLabel}>Location</span>
                    <span className={styles.contactValue}>{provider.city}</span>
                  </div>
                )}
                {provider.email && (
                  <div className={styles.contactRow}>
                    <span className={styles.contactLabel}>Email: </span>

                    <a
                      href={`mailto:${provider.email}`}
                      className={styles.contactLink}
                    >
                      {provider.email}
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
