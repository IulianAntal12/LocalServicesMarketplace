import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  BellOff,
  Calendar,
  CheckCircle,
  X,
  Play,
  Check,
  Loader2,
  ExternalLink,
} from "lucide-react";
import { Button } from "../../../components/common";
import {
  notificationService,
  type NotificationDto,
  type NotificationSummary,
} from "../../../services/notificationService";
import toast from "react-hot-toast";
import styles from "./NotificationsTab.module.css";

type FilterType = "all" | "unread" | "read";

const TYPE_CONFIG: Record<string, { icon: React.ReactNode; color: string }> = {
  BookingCreated: { icon: <Calendar size={16} />, color: "#3B82F6" },
  BookingConfirmed: { icon: <Check size={16} />, color: "#10B981" },
  BookingRejected: { icon: <X size={16} />, color: "#EF4444" },
  BookingStarted: { icon: <Play size={16} />, color: "#8B5CF6" },
  BookingCompleted: { icon: <CheckCircle size={16} />, color: "#10B981" },
  BookingCancelled: { icon: <X size={16} />, color: "#EF4444" },
  NewReview: { icon: <Bell size={16} />, color: "#F59E0B" },
  General: { icon: <Bell size={16} />, color: "#6B7280" },
};

export function NotificationsTab() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<NotificationDto[]>([]);
  const [summary, setSummary] = useState<NotificationSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [markingAll, setMarkingAll] = useState(false);

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const isRead =
        activeFilter === "all"
          ? undefined
          : activeFilter === "read"
          ? true
          : false;

      const response = await notificationService.getMyNotifications({
        isRead,
        pageSize: 50,
      });
      setNotifications(response.notifications);
      setSummary(response.summary);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      toast.error("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  }, [activeFilter]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleMarkAsRead = async (notification: NotificationDto) => {
    if (notification.isRead) return;

    try {
      await notificationService.markAsRead(notification.id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notification.id ? { ...n, isRead: true } : n))
      );
      setSummary((prev) =>
        prev
          ? { ...prev, unreadCount: Math.max(0, prev.unreadCount - 1) }
          : null
      );
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!summary?.unreadCount) return;

    try {
      setMarkingAll(true);
      await notificationService.markAllAsRead();
      toast.success("All notifications marked as read");
      fetchNotifications();
    } catch (error) {
      console.error("Error marking all as read:", error);
      toast.error("Error marking notifications");
    } finally {
      setMarkingAll(false);
    }
  };

  const handleNotificationClick = (notification: NotificationDto) => {
    handleMarkAsRead(notification);

    if (notification.bookingId) {
      // Navigate to booking details - could open a modal or go to bookings tab
      navigate(`?tab=bookings`);
    }
  };

  const getTypeConfig = (type: string) => {
    return TYPE_CONFIG[type] || TYPE_CONFIG.General;
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h2 className={styles.title}>
            <Bell size={24} />
            Notifications
          </h2>
          {summary && summary.unreadCount > 0 && (
            <span className={styles.unreadBadge}>
              {summary.unreadCount} unread
            </span>
          )}
        </div>
        {summary && summary.unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleMarkAllAsRead}
            disabled={markingAll}
          >
            {markingAll ? (
              <Loader2 size={14} className={styles.spinner} />
            ) : (
              <CheckCircle size={14} />
            )}
            Mark all as read
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className={styles.filters}>
        <button
          className={`${styles.filterChip} ${
            activeFilter === "all" ? styles.active : ""
          }`}
          onClick={() => setActiveFilter("all")}
        >
          All ({summary?.totalCount || 0})
        </button>
        <button
          className={`${styles.filterChip} ${
            activeFilter === "unread" ? styles.active : ""
          }`}
          onClick={() => setActiveFilter("unread")}
        >
          Unread ({summary?.unreadCount || 0})
        </button>
        <button
          className={`${styles.filterChip} ${
            activeFilter === "read" ? styles.active : ""
          }`}
          onClick={() => setActiveFilter("read")}
        >
          Read ({(summary?.totalCount || 0) - (summary?.unreadCount || 0)})
        </button>
      </div>

      {/* Notifications List */}
      {loading ? (
        <div className={styles.loadingState}>
          <Loader2 className={styles.spinner} size={32} />
          <p>Loading notifications...</p>
        </div>
      ) : notifications.length === 0 ? (
        <div className={styles.emptyState}>
          <BellOff size={48} />
          <h3>No notifications</h3>
          <p>
            {activeFilter === "all"
              ? "You haven't received any notifications yet."
              : activeFilter === "unread"
              ? "You have no unread notifications."
              : "You have no read notifications."}
          </p>
        </div>
      ) : (
        <div className={styles.notificationsList}>
          {notifications.map((notification) => {
            const typeConfig = getTypeConfig(notification.type);
            return (
              <div
                key={notification.id}
                className={`${styles.notificationCard} ${
                  !notification.isRead ? styles.unread : ""
                }`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div
                  className={styles.iconWrapper}
                  style={{ backgroundColor: `${typeConfig.color}15` }}
                >
                  <span style={{ color: typeConfig.color }}>
                    {typeConfig.icon}
                  </span>
                </div>
                <div className={styles.content}>
                  <div className={styles.titleRow}>
                    <h4 className={styles.notificationTitle}>
                      {notification.title}
                    </h4>
                    {!notification.isRead && (
                      <span className={styles.unreadDot}></span>
                    )}
                  </div>
                  <p className={styles.message}>{notification.message}</p>
                  <span className={styles.timeAgo}>{notification.timeAgo}</span>
                </div>
                {notification.bookingId && (
                  <div className={styles.actionHint}>
                    <ExternalLink size={14} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
