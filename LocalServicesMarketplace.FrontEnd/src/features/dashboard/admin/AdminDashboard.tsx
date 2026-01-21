import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { BarChart3, XCircle, Shield } from "lucide-react";
import { useAuth } from "../../../context";
import { StatsTab } from "./components/StatsTab";
import { RejectedServicesTab } from "./components/RejectedServicesTab";
import styles from "./AdminDashboard.module.css";

type TabId = "stats" | "rejected";

interface Tab {
  id: TabId;
  label: string;
  icon: React.ComponentType<{ size?: number }>;
}

const tabs: Tab[] = [
  { id: "stats", label: "Overview", icon: BarChart3 },
  { id: "rejected", label: "Moderation Queue", icon: XCircle },
];

const getInitialTab = (searchParams: URLSearchParams): TabId => {
  const tabFromUrl = searchParams.get("tab") as TabId | null;
  if (tabFromUrl && tabs.some((t) => t.id === tabFromUrl)) {
    return tabFromUrl;
  }
  return "stats";
};

export function AdminDashboard() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<TabId>(() =>
    getInitialTab(searchParams),
  );

  const renderContent = () => {
    switch (activeTab) {
      case "stats":
        return <StatsTab />;
      case "rejected":
        return <RejectedServicesTab />;
      default:
        return null;
    }
  };

  return (
    <div className={styles.dashboard}>
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.userInfo}>
          <div className={styles.avatar}>
            <Shield size={24} />
          </div>
          <div className={styles.userDetails}>
            <h2 className={styles.userName}>{user?.fullName || "Admin"}</h2>
            <p className={styles.userRole}>Administrator</p>
          </div>
        </div>

        <nav className={styles.nav}>
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                className={`${styles.navItem} ${
                  activeTab === tab.id ? styles.active : ""
                }`}
                onClick={() => setActiveTab(tab.id)}
              >
                <Icon size={20} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <main className={styles.content}>
        <header className={styles.header}>
          <h1 className={styles.pageTitle}>
            {tabs.find((t) => t.id === activeTab)?.label}
          </h1>
        </header>

        <div className={styles.contentBody}>{renderContent()}</div>
      </main>
    </div>
  );
}
