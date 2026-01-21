import { useState, useEffect } from "react";
import {
  Users,
  Briefcase,
  ShoppingCart,
  Star,
  Clock,
  CheckCircle,
  Loader2,
  AlertCircle,
  TrendingUp,
  UserX,
} from "lucide-react";
import {
  adminService,
  type DashboardStats,
} from "../../../../services/adminService";
import toast from "react-hot-toast";
import styles from "./StatsTab.module.css";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  subtitle?: string;
}

function StatCard({ title, value, icon, color, subtitle }: StatCardProps) {
  return (
    <div className={styles.statCard}>
      <div
        className={styles.statIcon}
        style={{ background: `${color}15`, color }}
      >
        {icon}
      </div>
      <div className={styles.statContent}>
        <span className={styles.statValue}>{value}</span>
        <span className={styles.statTitle}>{title}</span>
        {subtitle && <span className={styles.statSubtitle}>{subtitle}</span>}
      </div>
    </div>
  );
}

export function StatsTab() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminService.getDashboardStats();
      setStats(data);
    } catch (err) {
      console.error("Error fetching stats:", err);
      setError("Failed to load statistics");
      toast.error("Failed to load dashboard statistics");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingState}>
        <Loader2 className={styles.spinner} size={32} />
        <p>Loading statistics...</p>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className={styles.errorState}>
        <AlertCircle size={48} />
        <h3>Failed to load statistics</h3>
        <p>{error || "An error occurred"}</p>
        <button className={styles.retryButton} onClick={fetchStats}>
          Try Again
        </button>
      </div>
    );
  }

  const completionRate =
    stats.totalBookings > 0
      ? Math.round((stats.completedBookings / stats.totalBookings) * 100)
      : 0;

  return (
    <div className={styles.container}>
      {/* Users Section */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>
          <Users size={20} />
          Users
        </h2>
        <div className={styles.statsGrid}>
          <StatCard
            title="Total Users"
            value={stats.totalUsers}
            icon={<Users size={24} />}
            color="#3B82F6"
          />
          <StatCard
            title="Providers"
            value={stats.totalProviders}
            icon={<Briefcase size={24} />}
            color="#10B981"
          />
          <StatCard
            title="Customers"
            value={stats.totalCustomers}
            icon={<Users size={24} />}
            color="#8B5CF6"
          />
        </div>
      </section>

      {/* Services Section */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>
          <Briefcase size={20} />
          Services & Moderation
        </h2>
        <div className={styles.statsGrid}>
          <StatCard
            title="Total Services"
            value={stats.totalServices}
            icon={<Briefcase size={24} />}
            color="#3B82F6"
          />
          <StatCard
            title="Approved"
            value={stats.approvedServices}
            icon={<CheckCircle size={24} />}
            color="#10B981"
          />
          <StatCard
            title="AI Rejected"
            value={stats.aiRejectedServices}
            icon={<Clock size={24} />}
            color="#F59E0B"
            subtitle="Needs review"
          />
          <StatCard
            title="Admin Rejected"
            value={stats.adminRejectedServices}
            icon={<UserX size={24} />}
            color="#EF4444"
          />
        </div>
      </section>

      {/* Bookings Section */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>
          <ShoppingCart size={20} />
          Bookings
        </h2>
        <div className={styles.statsGrid}>
          <StatCard
            title="Total Bookings"
            value={stats.totalBookings}
            icon={<ShoppingCart size={24} />}
            color="#3B82F6"
          />
          <StatCard
            title="Completed"
            value={stats.completedBookings}
            icon={<CheckCircle size={24} />}
            color="#10B981"
            subtitle={`${completionRate}% completion rate`}
          />
        </div>
      </section>

      {/* Reviews Section */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>
          <Star size={20} />
          Reviews & Ratings
        </h2>
        <div className={styles.statsGrid}>
          <StatCard
            title="Total Reviews"
            value={stats.totalReviews}
            icon={<Star size={24} />}
            color="#F59E0B"
          />
          <StatCard
            title="Average Rating"
            value={
              stats.averageRating > 0 ? stats.averageRating.toFixed(1) : "—"
            }
            icon={<TrendingUp size={24} />}
            color="#10B981"
            subtitle="Platform average"
          />
        </div>
      </section>
    </div>
  );
}
