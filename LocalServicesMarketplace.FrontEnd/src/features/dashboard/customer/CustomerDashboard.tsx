import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Calendar, Star, User, Bell } from "lucide-react";
import { useAuth } from "../../../context";
import { CustomerBookingsTab } from "./components/CustomerBookingsTab";
import { CustomerReviewsTab } from "./components/CustomerReviewsTab";
import { CustomerProfileTab } from "./components/CustomerProfileTab";
import { NotificationsTab } from "../common/NotificationsTab";
import styles from "./CustomerDashboard.module.css";

type TabId = "bookings" | "reviews" | "profile" | "notifications";

interface Tab {
  id: TabId;
  label: string;
  icon: React.ComponentType<{ size?: number }>;
}

const tabs: Tab[] = [
  { id: "bookings", label: "Programări", icon: Calendar },
  { id: "reviews", label: "Recenzii", icon: Star },
  { id: "notifications", label: "Notificări", icon: Bell },
  { id: "profile", label: "Profil", icon: User },
];

const getInitialTab = (searchParams: URLSearchParams): TabId => {
  const tabFromUrl = searchParams.get("tab") as TabId | null;
  if (tabFromUrl && tabs.some((t) => t.id === tabFromUrl)) {
    return tabFromUrl;
  }
  return "bookings";
};

export function CustomerDashboard() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<TabId>(() =>
    getInitialTab(searchParams)
  );

  const renderContent = () => {
    switch (activeTab) {
      case "bookings":
        return <CustomerBookingsTab />;
      case "reviews":
        return <CustomerReviewsTab />;
      case "notifications":
        return <NotificationsTab />;
      case "profile":
        return <CustomerProfileTab />;
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
            {user?.fullName?.charAt(0).toUpperCase() || "U"}
          </div>
          <div className={styles.userDetails}>
            <h2 className={styles.userName}>{user?.fullName}</h2>
            <p className={styles.userRole}>Client</p>
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
