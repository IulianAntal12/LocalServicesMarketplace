import { Star } from "lucide-react";
import styles from "./StarRating.module.css";

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: number;
  interactive?: boolean;
  onChange?: (rating: number) => void;
}

export function StarRating({
  rating,
  maxRating = 5,
  size = 20,
  interactive = false,
  onChange,
}: StarRatingProps) {
  const handleClick = (index: number) => {
    if (interactive && onChange) {
      onChange(index + 1);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (interactive && onChange && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      onChange(index + 1);
    }
  };

  return (
    <div className={styles.container}>
      {Array.from({ length: maxRating }, (_, index) => {
        const filled = index < rating;
        return (
          <button
            key={index}
            type="button"
            className={`${styles.star} ${
              filled ? styles.filled : styles.empty
            } ${interactive ? styles.interactive : ""}`}
            onClick={() => handleClick(index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            disabled={!interactive}
            tabIndex={interactive ? 0 : -1}
            aria-label={`${index + 1} star${index === 0 ? "" : "s"}`}
          >
            <Star
              size={size}
              fill={filled ? "currentColor" : "none"}
              strokeWidth={filled ? 0 : 1.5}
            />
          </button>
        );
      })}
    </div>
  );
}
