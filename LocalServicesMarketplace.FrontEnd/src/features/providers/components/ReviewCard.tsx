import { useState } from "react";
import {
  CheckCircle,
  MessageSquare,
  MoreVertical,
  Pencil,
  Trash2,
} from "lucide-react";
import type { ReviewDto } from "../../../services/reviewService";
import { StarRating } from "./StarRating";
import { useAuth } from "../../../context";
import styles from "./ReviewCard.module.css";

interface ReviewCardProps {
  review: ReviewDto;
  onEdit?: (review: ReviewDto) => void;
  onDelete?: (reviewId: number) => void;
}

export function ReviewCard({ review, onEdit, onDelete }: ReviewCardProps) {
  const { user } = useAuth();
  const [showMenu, setShowMenu] = useState(false);

  const isOwner = user?.id === review.customerId;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.userInfo}>
          <div className={styles.avatar}>
            <span>{getInitials(review.customerName)}</span>
          </div>
          <div className={styles.userDetails}>
            <div className={styles.userName}>
              {review.customerName}
              {review.isVerified && (
                <span
                  className={styles.verifiedBadge}
                  title="Verified Purchase"
                >
                  <CheckCircle size={14} />
                  Verified
                </span>
              )}
            </div>
            <div className={styles.meta}>
              <StarRating rating={review.rating} size={14} />
              <span className={styles.date}>
                {formatDate(review.createdAt)}
              </span>
            </div>
          </div>
        </div>

        {isOwner && (onEdit || onDelete) && (
          <div className={styles.menuWrapper}>
            <button
              className={styles.menuButton}
              onClick={() => setShowMenu(!showMenu)}
              aria-label="Review options"
            >
              <MoreVertical size={18} />
            </button>

            {showMenu && (
              <>
                <div
                  className={styles.menuBackdrop}
                  onClick={() => setShowMenu(false)}
                />
                <div className={styles.menu}>
                  {onEdit && (
                    <button
                      className={styles.menuItem}
                      onClick={() => {
                        onEdit(review);
                        setShowMenu(false);
                      }}
                    >
                      <Pencil size={14} />
                      Edit Review
                    </button>
                  )}
                  {onDelete && (
                    <button
                      className={`${styles.menuItem} ${styles.menuItemDanger}`}
                      onClick={() => {
                        onDelete(review.id);
                        setShowMenu(false);
                      }}
                    >
                      <Trash2 size={14} />
                      Delete Review
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {review.serviceName && (
        <div className={styles.serviceBadge}>Service: {review.serviceName}</div>
      )}

      <h4 className={styles.title}>{review.title}</h4>
      <p className={styles.comment}>{review.comment}</p>

      {review.providerResponse && (
        <div className={styles.providerResponse}>
          <div className={styles.responseHeader}>
            <MessageSquare size={16} />
            <span>Provider Response</span>
            {review.providerResponseAt && (
              <span className={styles.responseDate}>
                {formatDate(review.providerResponseAt)}
              </span>
            )}
          </div>
          <p className={styles.responseText}>{review.providerResponse}</p>
        </div>
      )}
    </div>
  );
}
