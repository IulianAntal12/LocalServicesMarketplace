import { useState, useEffect, useCallback } from "react";
import {
  Calendar,
  Clock,
  MapPin,
  Phone,
  Loader2,
  Check,
  X,
  Play,
  CheckCircle,
} from "lucide-react";
import { Modal } from "../../../components/common/Modal";
import { Button } from "../../../components/common/Button";
import {
  bookingService,
  type BookingDto,
  type BookingStatus,
} from "../../../services/bookingService";
import toast from "react-hot-toast";
import styles from "./BookingDetailsModal.module.css";

interface BookingDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingId: number;
  role: "customer" | "provider";
  onStatusChange?: () => void;
}

const STATUS_CONFIG: Record<BookingStatus, { label: string; color: string }> = {
  Pending: { label: "Pending", color: "#F59E0B" },
  Confirmed: { label: "Confirmed", color: "#3B82F6" },
  InProgress: { label: "In Progress", color: "#8B5CF6" },
  Completed: { label: "Completed", color: "#10B981" },
  Cancelled: { label: "Cancelled", color: "#EF4444" },
  Rejected: { label: "Rejected", color: "#6B7280" },
  NoShow: { label: "No Show", color: "#6B7280" },
};

export function BookingDetailsModal({
  isOpen,
  onClose,
  bookingId,
  role,
  onStatusChange,
}: BookingDetailsModalProps) {
  const [booking, setBooking] = useState<BookingDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showCancelForm, setShowCancelForm] = useState(false);
  const [cancelReason, setCancelReason] = useState("");

  const fetchBooking = useCallback(async () => {
    try {
      setLoading(true);
      const data = await bookingService.getById(bookingId);
      setBooking(data);
    } catch {
      toast.error("Failed to load details");
      onClose();
    } finally {
      setLoading(false);
    }
  }, [bookingId, onClose]);

  useEffect(() => {
    if (isOpen && bookingId) {
      fetchBooking();
    }
  }, [isOpen, bookingId, fetchBooking]);

  const handleStatusUpdate = async (
    newStatus: "Confirmed" | "InProgress" | "Completed" | "Rejected"
  ) => {
    try {
      setActionLoading(true);
      await bookingService.updateStatus(bookingId, { newStatus });
      toast.success(
        newStatus === "Confirmed"
          ? "Booking confirmed!"
          : newStatus === "InProgress"
          ? "Work started!"
          : newStatus === "Completed"
          ? "Booking completed!"
          : "Booking rejected"
      );
      onStatusChange?.();
      onClose();
    } catch {
      toast.error("Error updating status");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async () => {
    try {
      setActionLoading(true);
      await bookingService.cancel(bookingId, {
        cancellationReason: cancelReason || undefined,
      });
      toast.success("Booking cancelled");
      onStatusChange?.();
      onClose();
    } catch {
      toast.error("Error cancelling booking");
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("ro-RO", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
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

  if (loading) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="Booking details">
        <div className={styles.loadingState}>
          <Loader2 className={styles.spinner} size={32} />
          <p>Loading...</p>
        </div>
      </Modal>
    );
  }

  if (!booking) return null;

  const statusConfig = STATUS_CONFIG[booking.status as BookingStatus];
  const canCancel = ["Pending", "Confirmed"].includes(booking.status);
  const isProvider = role === "provider";

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Booking details"
      size="medium"
    >
      <div className={styles.container}>
        {/* Status Badge */}
        <div
          className={styles.statusBadge}
          style={{
            backgroundColor: `${statusConfig.color}15`,
            color: statusConfig.color,
          }}
        >
          {statusConfig.label}
        </div>

        {/* Service Info */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Service</h3>
          <div className={styles.serviceCard}>
            <h4 className={styles.serviceName}>{booking.serviceName}</h4>
            <span className={styles.serviceCategory}>
              {booking.serviceCategory}
            </span>
          </div>
        </div>

        {/* Date & Time */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Date & Time</h3>
          <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
              <Calendar size={18} />
              <span>{formatDate(booking.scheduledDate)}</span>
            </div>
            <div className={styles.infoItem}>
              <Clock size={18} />
              <span>{formatTime(booking.scheduledTime)}</span>
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>
            {isProvider ? "Customer" : "Provider"}
          </h3>
          <div className={styles.contactCard}>
            <div className={styles.contactAvatar}>
              {isProvider
                ? booking.customerName.charAt(0).toUpperCase()
                : (booking.providerBusinessName || booking.providerName)
                    .charAt(0)
                    .toUpperCase()}
            </div>
            <div className={styles.contactInfo}>
              <h4 className={styles.contactName}>
                {isProvider
                  ? booking.customerName
                  : booking.providerBusinessName || booking.providerName}
              </h4>
              {(isProvider ? booking.customerPhone : booking.providerPhone) && (
                <div className={styles.contactDetail}>
                  <Phone size={14} />
                  <span>
                    {isProvider ? booking.customerPhone : booking.providerPhone}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Location */}
        {(booking.address || booking.city) && (
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Location</h3>
            <div className={styles.infoItem}>
              <MapPin size={18} />
              <span>
                {[booking.address, booking.city, booking.postalCode]
                  .filter(Boolean)
                  .join(", ")}
              </span>
            </div>
          </div>
        )}

        {/* Pricing */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Price</h3>
          <div className={styles.priceCard}>
            <div className={styles.priceRow}>
              <span>Estimated price:</span>
              <span className={styles.priceValue}>
                {formatPrice(booking.quotedPrice)}
              </span>
            </div>
            {booking.finalPrice && (
              <div className={styles.priceRow}>
                <span>Final price:</span>
                <span className={styles.priceValue}>
                  {formatPrice(booking.finalPrice)}
                </span>
              </div>
            )}
            <span className={styles.priceType}>{booking.priceType}</span>
          </div>
        </div>

        {/* Notes */}
        {(booking.customerNotes || booking.providerNotes) && (
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Notes</h3>
            {booking.customerNotes && (
              <div className={styles.noteCard}>
                <span className={styles.noteLabel}>From customer:</span>
                <p className={styles.noteText}>{booking.customerNotes}</p>
              </div>
            )}
            {booking.providerNotes && (
              <div className={styles.noteCard}>
                <span className={styles.noteLabel}>From provider:</span>
                <p className={styles.noteText}>{booking.providerNotes}</p>
              </div>
            )}
          </div>
        )}

        {/* Cancellation Info */}
        {booking.status === "Cancelled" && booking.cancellationReason && (
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Cancellation reason</h3>
            <p className={styles.cancellationReason}>
              {booking.cancellationReason}
            </p>
          </div>
        )}

        {/* Cancel Form */}
        {showCancelForm && (
          <div className={styles.cancelForm}>
            <h3 className={styles.sectionTitle}>Cancel booking</h3>
            <textarea
              className={styles.textarea}
              placeholder="Cancellation reason (optional)"
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              rows={3}
            />
            <div className={styles.cancelActions}>
              <Button
                variant="outline"
                onClick={() => setShowCancelForm(false)}
              >
                Back
              </Button>
              <Button
                variant="danger"
                onClick={handleCancel}
                disabled={actionLoading}
              >
                {actionLoading ? (
                  <Loader2 size={16} className={styles.spinner} />
                ) : null}
                Confirm cancellation
              </Button>
            </div>
          </div>
        )}

        {/* Actions */}
        {!showCancelForm && (
          <div className={styles.actions}>
            {isProvider && booking.status === "Pending" && (
              <>
                <Button
                  onClick={() => handleStatusUpdate("Confirmed")}
                  disabled={actionLoading}
                >
                  <Check size={16} />
                  Confirm
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleStatusUpdate("Rejected")}
                  disabled={actionLoading}
                >
                  <X size={16} />
                  Reject
                </Button>
              </>
            )}

            {isProvider && booking.status === "Confirmed" && (
              <Button
                onClick={() => handleStatusUpdate("InProgress")}
                disabled={actionLoading}
              >
                <Play size={16} />
                Start work
              </Button>
            )}

            {isProvider && booking.status === "InProgress" && (
              <Button
                onClick={() => handleStatusUpdate("Completed")}
                disabled={actionLoading}
              >
                <CheckCircle size={16} />
                Complete
              </Button>
            )}

            {canCancel && (
              <Button variant="danger" onClick={() => setShowCancelForm(true)}>
                Cancel
              </Button>
            )}

            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        )}
      </div>
    </Modal>
  );
}
