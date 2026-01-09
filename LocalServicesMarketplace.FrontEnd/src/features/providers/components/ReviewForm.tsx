import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { Modal } from "../../../components/common/Modal";
import { Button } from "../../../components/common/Button";
import { Input } from "../../../components/common/Input";
import { StarRating } from "./StarRating";
import {
  reviewService,
  type ReviewDto,
  type CreateReviewRequest,
} from "../../../services/reviewService";
import type { ServiceDto } from "../../../services/providerService";
import toast from "react-hot-toast";
import styles from "./ReviewForm.module.css";

interface ReviewFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  providerId: string;
  providerName: string;
  services: ServiceDto[];
  existingReview?: ReviewDto | null;
}

export function ReviewForm({
  isOpen,
  onClose,
  onSuccess,
  providerId,
  providerName,
  services,
  existingReview,
}: ReviewFormProps) {
  const [loading, setLoading] = useState(false);
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [serviceId, setServiceId] = useState<number | "">("");

  const isEditing = !!existingReview;

  useEffect(() => {
    if (existingReview) {
      setRating(existingReview.rating);
      setTitle(existingReview.title);
      setComment(existingReview.comment);
      setServiceId(existingReview.serviceId || "");
    } else {
      setRating(5);
      setTitle("");
      setComment("");
      setServiceId("");
    }
  }, [existingReview, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rating < 1 || rating > 5) {
      toast.error("Please select a rating between 1 and 5 stars");
      return;
    }

    if (!title.trim()) {
      toast.error("Please enter a review title");
      return;
    }

    if (comment.trim().length < 10) {
      toast.error("Review must be at least 10 characters");
      return;
    }

    try {
      setLoading(true);

      if (isEditing && existingReview) {
        await reviewService.updateReview(existingReview.id, {
          rating,
          title: title.trim(),
          comment: comment.trim(),
        });
        toast.success("Review updated successfully!");
      } else {
        const request: CreateReviewRequest = {
          providerId,
          rating,
          title: title.trim(),
          comment: comment.trim(),
        };

        if (serviceId) {
          request.serviceId = Number(serviceId);
        }

        await reviewService.createReview(request);
        toast.success("Review submitted successfully!");
      }

      onSuccess();
      onClose();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      const message =
        error.response?.data?.error ||
        (isEditing ? "Failed to update review" : "Failed to submit review");
      toast.error(message);
      console.error("Error submitting review:", err);
    } finally {
      setLoading(false);
    }
  };

  const activeServices = services.filter((s) => s.isActive);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? "Edit Your Review" : `Review ${providerName}`}
      size="medium"
    >
      <form onSubmit={handleSubmit} className={styles.form}>
        {/* Rating */}
        <div className={styles.ratingSection}>
          <label className={styles.label}>Your Rating</label>
          <div className={styles.ratingWrapper}>
            <StarRating
              rating={rating}
              size={32}
              interactive
              onChange={setRating}
            />
            <span className={styles.ratingText}>
              {rating === 1 && "Poor"}
              {rating === 2 && "Fair"}
              {rating === 3 && "Good"}
              {rating === 4 && "Very Good"}
              {rating === 5 && "Excellent"}
            </span>
          </div>
        </div>

        {/* Service Selection (only for new reviews) */}
        {!isEditing && activeServices.length > 0 && (
          <div className={styles.formGroup}>
            <label htmlFor="service" className={styles.label}>
              Service Used <span className={styles.optional}>(optional)</span>
            </label>
            <select
              id="service"
              value={serviceId}
              onChange={(e) =>
                setServiceId(e.target.value ? Number(e.target.value) : "")
              }
              className={styles.select}
            >
              <option value="">Select a service...</option>
              {activeServices.map((service) => (
                <option key={service.id} value={service.id}>
                  {service.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Title */}
        <div className={styles.formGroup}>
          <label htmlFor="title" className={styles.label}>
            Review Title
          </label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Summarize your experience"
            maxLength={100}
          />
          <span className={styles.charCount}>{title.length}/100</span>
        </div>

        {/* Comment */}
        <div className={styles.formGroup}>
          <label htmlFor="comment" className={styles.label}>
            Your Review
          </label>
          <textarea
            id="comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share details about your experience with this provider..."
            className={styles.textarea}
            rows={5}
            maxLength={1000}
          />
          <span className={styles.charCount}>{comment.length}/1000</span>
        </div>

        {/* Actions */}
        <div className={styles.actions}>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? (
              <>
                <Loader2 size={18} className={styles.spinner} />
                {isEditing ? "Updating..." : "Submitting..."}
              </>
            ) : isEditing ? (
              "Update Review"
            ) : (
              "Submit Review"
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
