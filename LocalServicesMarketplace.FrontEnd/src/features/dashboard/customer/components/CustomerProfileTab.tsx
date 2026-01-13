import { useState, useEffect } from "react";
import { User, MapPin, Loader2 } from "lucide-react";
import { useAuth } from "../../../../context";
import { Button } from "../../../../components/common/Button";
import { bookingService } from "../../../../services/bookingService";
import { reviewService } from "../../../../services/reviewService";
import toast from "react-hot-toast";
import styles from "./CustomerProfileTab.module.css";

export function CustomerProfileTab() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalBookings: 0,
    totalReviews: 0,
    providersContacted: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);

        // Fetch bookings stats
        const bookingsResponse = await bookingService.getMyBookings({
          role: "customer",
        });

        // Fetch reviews
        const reviews = await reviewService.getMyReviews();

        // Calculate unique providers contacted (from bookings)
        const uniqueProviders = new Set(
          bookingsResponse.bookings.map((b) => b.providerName)
        );

        setStats({
          totalBookings:
            bookingsResponse.stats?.total || bookingsResponse.bookings.length,
          totalReviews: reviews.length,
          providersContacted: uniqueProviders.size,
        });
      } catch (err) {
        console.error("Error fetching stats:", err);
        // Keep default values on error
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.avatarSection}>
          <div className={styles.avatar}>
            {user?.fullName?.charAt(0).toUpperCase() || "U"}
          </div>
          <div className={styles.userInfo}>
            <h2 className={styles.userName}>{user?.fullName}</h2>
            <p className={styles.userEmail}>{user?.email}</p>
          </div>
        </div>
      </div>

      <div className={styles.sections}>
        {/* Account Info */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>
            <User size={18} />
            Account Information
          </h3>
          <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Full Name</span>
              <span className={styles.infoValue}>{user?.fullName || "-"}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Email</span>
              <span className={styles.infoValue}>{user?.email || "-"}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Account Type</span>
              <span className={styles.infoValue}>Customer</span>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>
            <MapPin size={18} />
            Activity
          </h3>
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <span className={styles.statValue}>
                {loading ? (
                  <Loader2 size={20} className={styles.spinner} />
                ) : (
                  stats.totalBookings
                )}
              </span>
              <span className={styles.statLabel}>Total Bookings</span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statValue}>
                {loading ? (
                  <Loader2 size={20} className={styles.spinner} />
                ) : (
                  stats.totalReviews
                )}
              </span>
              <span className={styles.statLabel}>Reviews Written</span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statValue}>
                {loading ? (
                  <Loader2 size={20} className={styles.spinner} />
                ) : (
                  stats.providersContacted
                )}
              </span>
              <span className={styles.statLabel}>Providers Contacted</span>
            </div>
          </div>
        </div>

        {/* Account Actions */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Account Actions</h3>
          <div className={styles.actionsGrid}>
            <Button variant="outline" onClick={() => toast("Coming soon!")}>
              Change Password
            </Button>
            <Button variant="outline" onClick={() => toast("Coming soon!")}>
              Notification Settings
            </Button>
          </div>
        </div>
      </div>

      <div className={styles.footer}>
        <p className={styles.footerText}>
          Member since {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}
