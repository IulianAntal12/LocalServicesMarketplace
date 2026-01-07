import { useState, useEffect } from "react";
import { User, Briefcase, Image, Loader2 } from "lucide-react";
import { useAuth } from "../../../context";
import {
  providerService,
  type ProviderProfile,
} from "../../../services/providerService";
import { ProfileTab } from "./components/ProfileTab";
import { ServicesTab } from "./components/ServicesTab";
import { PortfolioTab } from "./components/PortfolioTab";
import styles from "./ProviderDashboard.module.css";

type TabId = "profile" | "services" | "portfolio";

interface Tab {
  id: TabId;
  label: string;
  icon: React.ComponentType<{ size?: number }>;
}

const tabs: Tab[] = [
  { id: "profile", label: "Profile", icon: User },
  { id: "services", label: "Services", icon: Briefcase },
  { id: "portfolio", label: "Portfolio", icon: Image },
];

export function ProviderDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabId>("profile");
  const [profile, setProfile] = useState<ProviderProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await providerService.getMyProfile();
      setProfile(data);
    } catch (err) {
      setError("Failed to load profile. Please try again.");
      console.error("Error fetching profile:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleProfileUpdate = () => {
    fetchProfile();
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <Loader2 className={styles.spinner} size={40} />
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <p className={styles.errorText}>{error}</p>
        <button className={styles.retryButton} onClick={fetchProfile}>
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>Provider Dashboard</h1>
          <p className={styles.subtitle}>
            Welcome back, {profile?.businessName || user?.fullName}
          </p>
        </div>

        {/* Stats */}
        <div className={styles.stats}>
          <div className={styles.statCard}>
            <span className={styles.statValue}>
              {profile?.rating?.toFixed(1) || "—"}
            </span>
            <span className={styles.statLabel}>Rating</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statValue}>
              {profile?.totalReviews || 0}
            </span>
            <span className={styles.statLabel}>Reviews</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statValue}>
              {profile?.services.length || 0}
            </span>
            <span className={styles.statLabel}>Services</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statValue}>
              {profile?.portfolioImages.length || 0}
            </span>
            <span className={styles.statLabel}>Photos</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className={styles.tabsContainer}>
        <div className={styles.tabs}>
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                className={`${styles.tab} ${
                  activeTab === tab.id ? styles.tabActive : ""
                }`}
                onClick={() => setActiveTab(tab.id)}
              >
                <Icon size={18} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className={styles.content}>
        {activeTab === "profile" && profile && (
          <ProfileTab profile={profile} onUpdate={handleProfileUpdate} />
        )}
        {activeTab === "services" && profile && (
          <ServicesTab
            services={profile.services}
            onUpdate={handleProfileUpdate}
          />
        )}
        {activeTab === "portfolio" && profile && (
          <PortfolioTab
            images={profile.portfolioImages}
            onUpdate={handleProfileUpdate}
          />
        )}
      </div>
    </div>
  );
}
