import api from "./api";

// ============= TYPES =============

export type ModerationStatus =
  | "Pending"
  | "Approved"
  | "AiRejected"
  | "AdminRejected";

export interface ServiceModerationDto {
  id: number;
  name: string;
  description: string;
  basePrice: number;
  priceType: string;
  category: string;
  providerId: string;
  providerName: string;
  providerBusinessName?: string;
  providerEmail: string;
  moderationStatus: ModerationStatus;
  moderationReason?: string;
  moderatedAt?: string;
  moderatedBy?: string;
  createdAt: string;
}

export interface GetRejectedServicesResponse {
  services: ServiceModerationDto[];
  totalCount: number;
  totalPages: number;
}

export interface ModerateServiceRequest {
  action: "approve" | "reject";
  reason?: string;
}

export interface ModerateServiceResponse {
  serviceId: number;
  newStatus: string;
  message: string;
}

export interface DashboardStats {
  totalUsers: number;
  totalProviders: number;
  totalCustomers: number;
  totalServices: number;
  pendingServices: number;
  aiRejectedServices: number;
  approvedServices: number;
  adminRejectedServices: number;
  totalBookings: number;
  completedBookings: number;
  totalReviews: number;
  averageRating: number;
}

export interface GetRejectedServicesParams {
  page?: number;
  pageSize?: number;
  status?: "AiRejected" | "AdminRejected" | "all";
  sortBy?: "newest" | "oldest";
}

// ============= SERVICE =============

export const adminService = {
  // Get dashboard statistics
  getDashboardStats: async (): Promise<DashboardStats> => {
    const response = await api.get<DashboardStats>("/admin/stats");
    return response.data;
  },

  // Get rejected services (AI rejected or Admin rejected)
  getRejectedServices: async (
    params?: GetRejectedServicesParams,
  ): Promise<GetRejectedServicesResponse> => {
    const queryParams = new URLSearchParams();
    queryParams.append("page", String(params?.page || 1));
    queryParams.append("pageSize", String(params?.pageSize || 20));

    // Map status to onlyAiRejected parameter for backend
    if (params?.status === "AiRejected") {
      queryParams.append("onlyAiRejected", "true");
    } else if (params?.status === "AdminRejected") {
      queryParams.append("onlyAiRejected", "false");
    }
    // For "all", don't add the parameter - backend will return all rejected

    if (params?.sortBy) {
      queryParams.append("sortBy", params.sortBy);
    }

    const response = await api.get<GetRejectedServicesResponse>(
      `/admin/services/rejected?${queryParams.toString()}`,
    );
    return response.data;
  },

  // Moderate a service (approve or reject)
  moderateService: async (
    serviceId: number,
    request: ModerateServiceRequest,
  ): Promise<ModerateServiceResponse> => {
    const response = await api.post<ModerateServiceResponse>(
      `/admin/services/${serviceId}/moderate`,
      request,
    );
    return response.data;
  },
};
