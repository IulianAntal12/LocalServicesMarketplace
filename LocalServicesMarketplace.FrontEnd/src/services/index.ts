export { default as api } from "./api";
export { authService } from "./authService";
export { providerService } from "./providerService";
export { categoryService } from "./categoryService";
export { portfolioService } from "./portfolioService";
export { reviewService } from "./reviewService";
export { bookingService } from "./bookingService";
export { notificationService } from "./notificationService";

// Re-export types
export type { Category } from "./categoryService";
export type { PortfolioImage, UploadImageResponse } from "./portfolioService";
export type {
  ReviewDto,
  GetProviderReviewsResponse,
  CreateReviewRequest,
  UpdateReviewRequest,
} from "./reviewService";
export type {
  NotificationDto,
  NotificationSummary,
  GetNotificationsResponse,
} from "./notificationService";
