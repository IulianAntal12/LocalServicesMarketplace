import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Star,
  Calendar,
  ExternalLink,
  Loader2,
  MessageSquare,
} from "lucide-react";
import {
  reviewService,
  type ReviewDto,
} from "../../../../services/reviewService";
import { Button } from "../../../../components/common/Button";
import toast from "react-hot-toast";
import styles from "./CustomerReviewsTab.module.css";

export function CustomerReviewsTab() {
  const navigate = useNavigate();
  const [reviews, setReviews] = useState<ReviewDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const data = await reviewService.getMyReviews();
      setReviews(data);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      toast.error("Failed to load reviews");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("ro-RO", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const renderStars = (rating: number) => {
    return (
      <div className={styles.stars}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={16}
            className={star <= rating ? styles.starFilled : styles.starEmpty}
            fill={star <= rating ? "currentColor" : "none"}
          />
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className={styles.loadingState}>
        <Loader2 className={styles.spinner} size={32} />
        <p>Loading reviews...</p>
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className={styles.emptyState}>
        <Star size={48} />
        <h3>No reviews written</h3>
        <p>
          After completing a booking, you can leave a review to help other
          clients find trusted providers.
        </p>
        <Button onClick={() => navigate("/search")}>Search providers</Button>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Your Reviews</h2>
        <span className={styles.count}>{reviews.length} reviews</span>
      </div>

      <div className={styles.reviewsList}>
        {reviews.map((review) => (
          <div key={review.id} className={styles.reviewCard}>
            <div className={styles.reviewHeader}>
              <div className={styles.providerInfo}>
                <div className={styles.providerAvatar}>
                  {review.customerName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h4 className={styles.providerName}>{review.customerName}</h4>
                  {review.serviceName && (
                    <p className={styles.serviceName}>{review.serviceName}</p>
                  )}
                </div>
              </div>
              <div className={styles.ratingDate}>
                {renderStars(review.rating)}
                <span className={styles.date}>
                  <Calendar size={14} />
                  {formatDate(review.createdAt)}
                </span>
              </div>
            </div>

            <div className={styles.reviewContent}>
              <h5 className={styles.reviewTitle}>{review.title}</h5>
              <p className={styles.reviewComment}>{review.comment}</p>
            </div>

            {review.providerResponse && (
              <div className={styles.providerResponse}>
                <div className={styles.responseHeader}>
                  <MessageSquare size={16} />
                  <span>Provider Response</span>
                </div>
                <p className={styles.responseText}>{review.providerResponse}</p>
              </div>
            )}

            <div className={styles.reviewFooter}>
              <button
                className={styles.viewProviderBtn}
                onClick={() => navigate(`/providers/${review.providerId}`)}
              >
                <ExternalLink size={14} />
                View provider profile
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
