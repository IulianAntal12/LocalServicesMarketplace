import api from "./api";

export interface ReviewDto {
  id: number;
  customerId: string;
  customerName: string;
  providerId: string;
  serviceId: number | null;
  serviceName: string | null;
  rating: number;
  title: string;
  comment: string;
  providerResponse: string | null;
  providerResponseAt: string | null;
  createdAt: string;
  isVerified: boolean;
}

export interface GetProviderReviewsResponse {
  reviews: ReviewDto[];
  totalCount: number;
  totalPages: number;
  averageRating: number;
  ratingDistribution: Record<number, number>;
}

export interface CreateReviewRequest {
  providerId: string;
  serviceId?: number;
  rating: number;
  title: string;
  comment: string;
}

export interface UpdateReviewRequest {
  rating?: number;
  title?: string;
  comment?: string;
}

export interface CreateReviewResponse {
  reviewId: number;
  message: string;
}

export interface UpdateReviewResponse {
  message: string;
}

export const reviewService = {
  // Get reviews for a provider (public)
  getProviderReviews: async (
    providerId: string,
    page: number = 1,
    pageSize: number = 10,
    sortBy: string = "recent"
  ): Promise<GetProviderReviewsResponse> => {
    const response = await api.get<GetProviderReviewsResponse>(
      `/reviews/provider/${providerId}`,
      { params: { page, pageSize, sortBy } }
    );
    return response.data;
  },

  // Create a review (Customer only)
  createReview: async (
    data: CreateReviewRequest
  ): Promise<CreateReviewResponse> => {
    const response = await api.post<CreateReviewResponse>("/reviews", data);
    return response.data;
  },

  // Update a review (Customer only)
  updateReview: async (
    reviewId: number,
    data: UpdateReviewRequest
  ): Promise<UpdateReviewResponse> => {
    const response = await api.put<UpdateReviewResponse>(
      `/reviews/${reviewId}`,
      data
    );
    return response.data;
  },

  // Delete a review
  deleteReview: async (reviewId: number): Promise<void> => {
    await api.delete(`/reviews/${reviewId}`);
  },

  // Get my reviews (Customer only)
  getMyReviews: async (): Promise<ReviewDto[]> => {
    const response = await api.get<ReviewDto[]>("/reviews/my");
    return response.data;
  },

  // Respond to a review (Provider only)
  respondToReview: async (
    reviewId: number,
    response: string
  ): Promise<void> => {
    await api.post(`/reviews/${reviewId}/respond`, { response });
  },

  // Get received reviews (Provider only)
  getReceivedReviews: async (
    page: number = 1,
    pageSize: number = 10,
    sortBy: string = "recent"
  ): Promise<GetProviderReviewsResponse> => {
    const response = await api.get<GetProviderReviewsResponse>(
      "/reviews/received",
      { params: { page, pageSize, sortBy } }
    );
    return response.data;
  },
};
