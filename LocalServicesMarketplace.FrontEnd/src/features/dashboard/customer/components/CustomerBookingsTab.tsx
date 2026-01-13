import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Calendar,
  Clock,
  MapPin,
  Briefcase,
  Star,
  Loader2,
  X,
} from "lucide-react";
import { Button } from "../../../../components/common/Button";
import {
  bookingService,
  type BookingListItem,
  type BookingStats,
  type BookingStatus,
} from "../../../../services/bookingService";
import { BookingDetailsModal } from "../../../providers/components/BookingDetailsModal";
import toast from "react-hot-toast";
import styles from "./CustomerBookingsTab.module.css";

const STATUS_CONFIG: Record<BookingStatus, { label: string; color: string }> = {
  Pending: { label: "Pending", color: "#F59E0B" },
  Confirmed: { label: "Confirmed", color: "#3B82F6" },
  InProgress: { label: "In Progress", color: "#8B5CF6" },
  Completed: { label: "Completed", color: "#10B981" },
  Cancelled: { label: "Cancelled", color: "#EF4444" },
  Rejected: { label: "Rejected", color: "#6B7280" },
  NoShow: { label: "No Show", color: "#6B7280" },
};

export function CustomerBookingsTab() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<BookingListItem[]>([]);
  const [stats, setStats] = useState<BookingStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<BookingStatus | "all">(
    "all"
  );
  const [selectedBooking, setSelectedBooking] = useState<number | null>(null);

  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true);
      const params: { role: "customer"; status?: BookingStatus } = {
        role: "customer",
      };
      if (activeFilter !== "all") {
        params.status = activeFilter;
      }
      const response = await bookingService.getMyBookings(params);
      setBookings(response.bookings);
      setStats(response.stats);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      toast.error("Failed to load bookings");
    } finally {
      setLoading(false);
    }
  }, [activeFilter]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const handleCancelBooking = async (bookingId: number) => {
    if (!confirm("Are you sure you want to cancel this booking?")) return;

    try {
      await bookingService.cancel(bookingId);
      toast.success("Booking cancelled");
      fetchBookings();
    } catch {
      toast.error("Error cancelling booking");
    }
  };

  const handleWriteReview = (providerId: string) => {
    navigate(`/providers/${providerId}?tab=reviews`);
  };

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("ro-RO", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = (timeStr: string): string => {
    const parts = timeStr.split(":");
    return `${parts[0]}:${parts[1]}`;
  };

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat("ro-RO", {
      style: "currency",
      currency: "RON",
    }).format(price);
  };

  return (
    <div className={styles.container}>
      {/* Stats Cards */}
      {stats && (
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <span className={styles.statValue}>{stats.pending}</span>
            <span className={styles.statLabel}>Pending</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statValue}>
              {stats.confirmed + stats.inProgress}
            </span>
            <span className={styles.statLabel}>Active</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statValue}>{stats.completed}</span>
            <span className={styles.statLabel}>Completed</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statValue}>{stats.total}</span>
            <span className={styles.statLabel}>Total</span>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className={styles.filters}>
        <button
          className={`${styles.filterChip} ${
            activeFilter === "all" ? styles.active : ""
          }`}
          onClick={() => setActiveFilter("all")}
        >
          All
        </button>
        <button
          className={`${styles.filterChip} ${
            activeFilter === "Pending" ? styles.active : ""
          }`}
          onClick={() => setActiveFilter("Pending")}
        >
          Pending
        </button>
        <button
          className={`${styles.filterChip} ${
            activeFilter === "Confirmed" ? styles.active : ""
          }`}
          onClick={() => setActiveFilter("Confirmed")}
        >
          Confirmed
        </button>
        <button
          className={`${styles.filterChip} ${
            activeFilter === "Completed" ? styles.active : ""
          }`}
          onClick={() => setActiveFilter("Completed")}
        >
          Completed
        </button>
      </div>

      {/* Bookings List */}
      {loading ? (
        <div className={styles.loadingState}>
          <Loader2 className={styles.spinner} size={32} />
          <p>Loading bookings...</p>
        </div>
      ) : bookings.length === 0 ? (
        <div className={styles.emptyState}>
          <Calendar size={48} />
          <h3>No bookings</h3>
          <p>
            {activeFilter === "all"
              ? "You don't have any bookings yet. Search for a provider and book a service!"
              : `You have no bookings with status "${STATUS_CONFIG[activeFilter]?.label}".`}
          </p>
          <Button onClick={() => navigate("/search")}>Search providers</Button>
        </div>
      ) : (
        <div className={styles.bookingsList}>
          {bookings.map((booking) => {
            const statusConfig = STATUS_CONFIG[booking.status];
            const canCancel = ["Pending", "Confirmed"].includes(booking.status);

            return (
              <div key={booking.id} className={styles.bookingCard}>
                <div className={styles.bookingHeader}>
                  <div className={styles.providerInfo}>
                    <div className={styles.providerAvatar}>
                      {(booking.providerBusinessName || booking.providerName)
                        .charAt(0)
                        .toUpperCase()}
                    </div>
                    <div>
                      <h4 className={styles.providerName}>
                        {booking.providerBusinessName || booking.providerName}
                      </h4>
                      <p className={styles.serviceName}>
                        <Briefcase size={14} />
                        {booking.serviceName}
                      </p>
                    </div>
                  </div>
                  <div
                    className={styles.statusBadge}
                    style={{
                      backgroundColor: `${statusConfig.color}15`,
                      color: statusConfig.color,
                    }}
                  >
                    {statusConfig.label}
                  </div>
                </div>

                <div className={styles.bookingDetails}>
                  <div className={styles.detailItem}>
                    <Calendar size={16} />
                    <span>{formatDate(booking.scheduledDate)}</span>
                  </div>
                  <div className={styles.detailItem}>
                    <Clock size={16} />
                    <span>{formatTime(booking.scheduledTime)}</span>
                  </div>
                  {booking.city && (
                    <div className={styles.detailItem}>
                      <MapPin size={16} />
                      <span>{booking.city}</span>
                    </div>
                  )}
                  <div className={styles.price}>
                    {formatPrice(booking.quotedPrice)}
                  </div>
                </div>

                <div className={styles.bookingFooter}>
                  <button
                    className={styles.viewDetailsBtn}
                    onClick={() => setSelectedBooking(booking.id)}
                  >
                    View details
                  </button>
                  <div className={styles.actions}>
                    {booking.canReview && (
                      <Button
                        size="sm"
                        onClick={() => handleWriteReview(booking.providerId)}
                      >
                        <Star size={14} />
                        Write review
                      </Button>
                    )}
                    {canCancel && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleCancelBooking(booking.id)}
                      >
                        <X size={14} />
                        Cancel
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Booking Details Modal */}
      {selectedBooking && (
        <BookingDetailsModal
          isOpen={!!selectedBooking}
          onClose={() => setSelectedBooking(null)}
          bookingId={selectedBooking}
          role="customer"
          onStatusChange={fetchBookings}
        />
      )}
    </div>
  );
}
