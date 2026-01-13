import { useState, useEffect, useCallback } from "react";
import {
  Calendar,
  Clock,
  MapPin,
  User,
  Check,
  X,
  Play,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { Button } from "../../../components/common";
import {
  bookingService,
  type BookingListItem,
  type BookingStats,
  type BookingStatus,
} from "../../../services/bookingService";
import { BookingDetailsModal } from "./BookingDetailsModal";
import toast from "react-hot-toast";
import styles from "./BookingsTab.module.css";

const STATUS_CONFIG: Record<
  BookingStatus,
  { label: string; color: string; icon: React.ReactNode }
> = {
  Pending: {
    label: "Pending",
    color: "#F59E0B",
    icon: <Clock size={14} />,
  },
  Confirmed: {
    label: "Confirmed",
    color: "#3B82F6",
    icon: <Check size={14} />,
  },
  InProgress: {
    label: "In Progress",
    color: "#8B5CF6",
    icon: <Play size={14} />,
  },
  Completed: {
    label: "Completed",
    color: "#10B981",
    icon: <CheckCircle size={14} />,
  },
  Cancelled: { label: "Cancelled", color: "#EF4444", icon: <X size={14} /> },
  Rejected: { label: "Rejected", color: "#6B7280", icon: <X size={14} /> },
  NoShow: { label: "No Show", color: "#6B7280", icon: <User size={14} /> },
};

export function BookingsTab() {
  const [bookings, setBookings] = useState<BookingListItem[]>([]);
  const [stats, setStats] = useState<BookingStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<BookingStatus | "all">(
    "all"
  );
  const [selectedBooking, setSelectedBooking] = useState<number | null>(null);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true);
      const params: { role: "provider"; status?: BookingStatus } = {
        role: "provider",
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

  const handleConfirm = async (bookingId: number) => {
    try {
      setActionLoading(bookingId);
      await bookingService.updateStatus(bookingId, { newStatus: "Confirmed" });
      toast.success("Booking confirmed!");
      fetchBookings();
    } catch {
      toast.error("Error confirming booking");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (bookingId: number) => {
    try {
      setActionLoading(bookingId);
      await bookingService.updateStatus(bookingId, { newStatus: "Rejected" });
      toast.success("Booking rejected");
      fetchBookings();
    } catch {
      toast.error("Error rejecting booking");
    } finally {
      setActionLoading(null);
    }
  };

  const handleStartWork = async (bookingId: number) => {
    try {
      setActionLoading(bookingId);
      await bookingService.updateStatus(bookingId, { newStatus: "InProgress" });
      toast.success("Work started!");
      fetchBookings();
    } catch {
      toast.error("Error updating status");
    } finally {
      setActionLoading(null);
    }
  };

  const handleComplete = async (bookingId: number) => {
    try {
      setActionLoading(bookingId);
      await bookingService.updateStatus(bookingId, { newStatus: "Completed" });
      toast.success("Booking completed!");
      fetchBookings();
    } catch {
      toast.error("Error completing booking");
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("ro-RO", {
      weekday: "short",
      day: "numeric",
      month: "short",
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

  const renderActions = (booking: BookingListItem) => {
    const isLoading = actionLoading === booking.id;

    switch (booking.status) {
      case "Pending":
        return (
          <div className={styles.actions}>
            <Button
              size="sm"
              onClick={() => handleConfirm(booking.id)}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 size={14} className={styles.spinner} />
              ) : (
                <Check size={14} />
              )}
              Confirm
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleReject(booking.id)}
              disabled={isLoading}
            >
              <X size={14} />
              Reject
            </Button>
          </div>
        );
      case "Confirmed":
        return (
          <div className={styles.actions}>
            <Button
              size="sm"
              onClick={() => handleStartWork(booking.id)}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 size={14} className={styles.spinner} />
              ) : (
                <Play size={14} />
              )}
              Start work
            </Button>
          </div>
        );
      case "InProgress":
        return (
          <div className={styles.actions}>
            <Button
              size="sm"
              onClick={() => handleComplete(booking.id)}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 size={14} className={styles.spinner} />
              ) : (
                <CheckCircle size={14} />
              )}
              Complete
            </Button>
          </div>
        );
      default:
        return null;
    }
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
            <span className={styles.statValue}>{stats.confirmed}</span>
            <span className={styles.statLabel}>Confirmed</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statValue}>{stats.inProgress}</span>
            <span className={styles.statLabel}>In Progress</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statValue}>{stats.completed}</span>
            <span className={styles.statLabel}>Completed</span>
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
            activeFilter === "InProgress" ? styles.active : ""
          }`}
          onClick={() => setActiveFilter("InProgress")}
        >
          In Progress
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
              ? "You don't have any bookings yet."
              : `You have no bookings with status "${STATUS_CONFIG[activeFilter]?.label}".`}
          </p>
        </div>
      ) : (
        <div className={styles.bookingsList}>
          {bookings.map((booking) => {
            const statusConfig = STATUS_CONFIG[booking.status];
            return (
              <div key={booking.id} className={styles.bookingCard}>
                <div className={styles.bookingHeader}>
                  <div className={styles.customerInfo}>
                    <div className={styles.customerAvatar}>
                      {booking.customerName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 className={styles.customerName}>
                        {booking.customerName}
                      </h4>
                      <p className={styles.serviceName}>
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
                    {statusConfig.icon}
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
                  {renderActions(booking)}
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
          role="provider"
          onStatusChange={fetchBookings}
        />
      )}
    </div>
  );
}
