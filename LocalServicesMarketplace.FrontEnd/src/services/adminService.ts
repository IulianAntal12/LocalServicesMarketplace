import api from "./api";

// ============= TYPES =============

export type ModerationStatus =
  | "Pending"
  | "Approved"
  | "AiRejected"
  | "AdminRejected"
  | "AdminApproved";

export interface ServiceModerationDto {
  id: number;
  name: string;
  description: string;
  price: number;
  priceType: string;
  categoryName: string;
  providerId: string;
  providerName: string;
  providerBusinessName?: string;
  moderationStatus: ModerationStatus;
  aiReason?: string;
  adminReason?: string;
  moderatedAt?: string;
  moderatedBy?: string;
  createdAt: string;
}

export interface GetPendingServicesResponse {
  services: ServiceModerationDto[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
}

export interface GetRejectedServicesResponse {
  services: ServiceModerationDto[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
}

export interface ModerateServiceRequest {
  action: "approve" | "reject";
  reason?: string;
}

export interface ModerateServiceResponse {
  serviceId: number;
  newStatus: ModerationStatus;
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
  totalBookings: number;
  completedBookings: number;
  totalReviews: number;
  averageRating: number;
}

export interface GetPendingServicesParams {
  page?: number;
  pageSize?: number;
  sortBy?: "newest" | "oldest";
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

  // Get pending services (waiting for moderation)
  getPendingServices: async (
    params?: GetPendingServicesParams
  ): Promise<GetPendingServicesResponse> => {
    const queryParams = new URLSearchParams();
    queryParams.append("page", String(params?.page || 1));
    queryParams.append("pageSize", String(params?.pageSize || 20));
    if (params?.sortBy) {
      queryParams.append("sortBy", params.sortBy);
    }

    const response = await api.get<GetPendingServicesResponse>(
      `/admin/services/pending?${queryParams.toString()}`
    );
    return response.data;
  },

  // Get AI rejected services
  getRejectedServices: async (
    params?: GetRejectedServicesParams
  ): Promise<GetRejectedServicesResponse> => {
    const queryParams = new URLSearchParams();
    queryParams.append("page", String(params?.page || 1));
    queryParams.append("pageSize", String(params?.pageSize || 20));
    if (params?.status && params.status !== "all") {
      queryParams.append("status", params.status);
    }
    if (params?.sortBy) {
      queryParams.append("sortBy", params.sortBy);
    }

    const response = await api.get<GetRejectedServicesResponse>(
      `/admin/services/rejected?${queryParams.toString()}`
    );
    return response.data;
  },

  // Moderate a service (approve or reject)
  moderateService: async (
    serviceId: number,
    request: ModerateServiceRequest
  ): Promise<ModerateServiceResponse> => {
    const response = await api.post<ModerateServiceResponse>(
      `/admin/services/${serviceId}/moderate`,
      request
    );
    return response.data;
  },

  // Get service details for moderation
  getServiceDetails: async (serviceId: number): Promise<ServiceModerationDto> => {
    const response = await api.get<ServiceModerationDto>(
      `/admin/services/${serviceId}`
    );
    return response.data;
  },
};
