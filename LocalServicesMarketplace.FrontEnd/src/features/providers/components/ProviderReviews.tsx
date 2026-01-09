import { useState, useEffect, useCallback } from "react";
import { Star, MessageSquareMore, Loader2, PenLine } from "lucide-react";
import {
  reviewService,
  type ReviewDto,
  type GetProviderReviewsResponse,
} from "../../../services/reviewService";
import type { ServiceDto } from "../../../services/providerService";
import { ReviewCard } from "./ReviewCard";
import { ReviewForm } from "./ReviewForm";
import { StarRating } from "./StarRating";
import { Button } from "../../../components/common/Button";
import { useAuth } from "../../../context";
import toast from "react-hot-toast";
import styles from "./ProviderReviews.module.css";

interface ProviderReviewsProps {
  providerId: string;
  providerName: string;
  services: ServiceDto[];
  onReviewChange?: () => void;
}

const SORT_OPTIONS = [
  { value: "recent", label: "Most Recent" },
  { value: "rating-high", label: "Highest Rating" },
  { value: "rating-low", label: "Lowest Rating" },
];

export function ProviderReviews({
  providerId,
  providerName,
  services,
  onReviewChange,
}: ProviderReviewsProps) {
  const { isAuthenticated, user } = useAuth();
  const isCustomer = user?.roles?.includes("Customer");

  const [reviewsData, setReviewsData] =
    useState<GetProviderReviewsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState("recent");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingReview, setEditingReview] = useState<ReviewDto | null>(null);

  // Check if current user already has a review
  const userReview = reviewsData?.reviews.find(
    (r) => r.customerId === user?.id
  );

  const fetchReviews = useCallback(async () => {
    try {
      setLoading(true);
      const data = await reviewService.getProviderReviews(
        providerId,
        page,
        10,
        sortBy
      );
      setReviewsData(data);
    } catch (err) {
      console.error("Error fetching reviews:", err);
      toast.error("Failed to load reviews");
    } finally {
      setLoading(false);
    }
  }, [providerId, page, sortBy]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleWriteReview = () => {
    setEditingReview(null);
    setIsFormOpen(true);
  };

  const handleEditReview = (review: ReviewDto) => {
    setEditingReview(review);
    setIsFormOpen(true);
  };

  const handleDeleteReview = async (reviewId: number) => {
    if (!confirm("Are you sure you want to delete this review?")) {
      return;
    }

    try {
      await reviewService.deleteReview(reviewId);
      toast.success("Review deleted successfully");
      fetchReviews();
      onReviewChange?.();
    } catch (err) {
      toast.error("Failed to delete review");
      console.error("Error deleting review:", err);
    }
  };

  const handleFormSuccess = () => {
    fetchReviews();
    onReviewChange?.();
  };

  const getRatingPercentage = (rating: number): number => {
    if (!reviewsData || reviewsData.totalCount === 0) return 0;
    const count = reviewsData.ratingDistribution[rating] || 0;
    return (count / reviewsData.totalCount) * 100;
  };

  if (loading && !reviewsData) {
    return (
      <div className={styles.loadingContainer}>
        <Loader2 className={styles.spinner} size={32} />
        <p>Loading reviews...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Reviews Summary */}
      <div className={styles.summary}>
        <div className={styles.overallRating}>
          <span className={styles.ratingNumber}>
            {reviewsData?.averageRating.toFixed(1) || "0.0"}
          </span>
          <StarRating
            rating={Math.round(reviewsData?.averageRating || 0)}
            size={24}
          />
          <span className={styles.totalReviews}>
            {reviewsData?.totalCount || 0}{" "}
            {reviewsData?.totalCount === 1 ? "review" : "reviews"}
          </span>
        </div>

        <div className={styles.ratingBars}>
          {[5, 4, 3, 2, 1].map((rating) => (
            <div key={rating} className={styles.ratingBar}>
              <span className={styles.ratingLabel}>{rating}</span>
              <Star size={14} fill="#f59e0b" color="#f59e0b" />
              <div className={styles.barTrack}>
                <div
                  className={styles.barFill}
                  style={{ width: `${getRatingPercentage(rating)}%` }}
                />
              </div>
              <span className={styles.ratingCount}>
                {reviewsData?.ratingDistribution[rating] || 0}
              </span>
            </div>
          ))}
        </div>

        {/* Write Review Button */}
        {isAuthenticated && isCustomer && !userReview && (
          <Button onClick={handleWriteReview} className={styles.writeReviewBtn}>
            <PenLine size={18} />
            Write a Review
          </Button>
        )}

        {!isAuthenticated && (
          <p className={styles.loginPrompt}>
            <a href="/login">Log in</a> to write a review
          </p>
        )}

        {userReview && (
          <p className={styles.alreadyReviewed}>
            You've already reviewed this provider
          </p>
        )}
      </div>

      {/* Reviews List */}
      <div className={styles.reviewsList}>
        <div className={styles.listHeader}>
          <h3 className={styles.listTitle}>
            <MessageSquareMore size={20} />
            Customer Reviews
          </h3>

          <select
            value={sortBy}
            onChange={(e) => {
              setSortBy(e.target.value);
              setPage(1);
            }}
            className={styles.sortSelect}
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className={styles.loadingContainer}>
            <Loader2 className={styles.spinner} size={24} />
          </div>
        ) : reviewsData && reviewsData.reviews.length > 0 ? (
          <>
            <div className={styles.reviewsGrid}>
              {reviewsData.reviews.map((review) => (
                <ReviewCard
                  key={review.id}
                  review={review}
                  onEdit={
                    review.customerId === user?.id
                      ? handleEditReview
                      : undefined
                  }
                  onDelete={
                    review.customerId === user?.id
                      ? handleDeleteReview
                      : undefined
                  }
                />
              ))}
            </div>

            {/* Pagination */}
            {reviewsData.totalPages > 1 && (
              <div className={styles.pagination}>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <span className={styles.pageInfo}>
                  Page {page} of {reviewsData.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setPage((p) => Math.min(reviewsData.totalPages, p + 1))
                  }
                  disabled={page === reviewsData.totalPages}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className={styles.emptyState}>
            <MessageSquareMore size={48} className={styles.emptyIcon} />
            <h4 className={styles.emptyTitle}>No reviews yet</h4>
            <p className={styles.emptyText}>
              Be the first to share your experience with {providerName}
            </p>
            {isAuthenticated && isCustomer && (
              <Button onClick={handleWriteReview}>
                <PenLine size={18} />
                Write the First Review
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Review Form Modal */}
      <ReviewForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingReview(null);
        }}
        onSuccess={handleFormSuccess}
        providerId={providerId}
        providerName={providerName}
        services={services}
        existingReview={editingReview}
      />
    </div>
  );
}
