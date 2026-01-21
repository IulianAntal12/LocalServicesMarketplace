import api from "./api";

// ============= TYPES =============

export interface ServiceDto {
  id: number;
  name: string;
  description: string;
  category: string;
  basePrice: number;
  priceType: string;
  estimatedDurationMinutes: number;
  isActive: boolean;
  moderationStatus?: string;
  moderationReason?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface PortfolioImageDto {
  id: number;
  imageUrl: string;
  caption?: string;
  displayOrder: number;
  createdAt: string;
}

export interface ProviderProfile {
  id: string;
  email: string;
  businessName?: string;
  businessDescription?: string;
  hourlyRate?: number;
  rating?: number;
  totalReviews: number;
  serviceAreas: string[];
  phoneNumber?: string;
  address?: string;
  city?: string;
  county?: string;
  postalCode?: string;
  latitude?: number;
  longitude?: number;
  serviceRadiusKm?: number;
  services: ServiceDto[];
  portfolioImages: PortfolioImageDto[];
}

export interface ProviderListItem {
  id: string;
  businessName: string;
  businessDescription?: string;
  rating?: number;
  totalReviews: number;
  city?: string;
  serviceAreas: string[];
  serviceCount: number;
  portfolioImageCount: number;
}

export interface UpdateProfileRequest {
  businessName?: string;
  businessDescription?: string;
  hourlyRate?: number;
  serviceAreas?: string[];
  phoneNumber?: string;
  address?: string;
  city?: string;
  county?: string;
  postalCode?: string;
  latitude?: number;
  longitude?: number;
  serviceRadiusKm?: number;
}

export interface CreateServiceRequest {
  name: string;
  description: string;
  category: string;
  basePrice: number;
  priceType: string;
  estimatedDurationMinutes: number;
}

export interface UpdateServiceRequest {
  name?: string;
  description?: string;
  basePrice?: number;
  priceType?: string;
  estimatedDurationMinutes?: number;
}

export interface CreateServiceResponse {
  serviceId: number;
  message: string;
  moderationStatus?: string;
  moderationReason?: string;
}

export interface UpdateServiceResponse {
  serviceId: number;
  message: string;
  moderationStatus?: string;
  moderationReason?: string;
}

export interface SearchProvidersParams {
  category?: string;
  location?: string;
}

// SERVICE
export const providerService = {
  // PUBLIC ENDPOINTS
  // Get all providers
  getAll: async (): Promise<ProviderListItem[]> => {
    const response = await api.get<ProviderListItem[]>("/providers");
    return response.data;
  },

  // Get provider by ID (public profile)
  getById: async (providerId: string): Promise<ProviderProfile> => {
    const response = await api.get<ProviderProfile>(`/providers/${providerId}`);
    return response.data;
  },

  // Search providers
  search: async (
    params: SearchProvidersParams,
  ): Promise<ProviderListItem[]> => {
    const response = await api.get<ProviderListItem[]>("/providers/search", {
      params,
    });
    return response.data;
  },

  // Get provider's services (public)
  getProviderServices: async (providerId: string): Promise<ServiceDto[]> => {
    const response = await api.get<ServiceDto[]>(
      `/providers/${providerId}/services`,
    );
    return response.data;
  },

  // PROVIDER-ONLY ENDPOINTS
  // Get my profile
  getMyProfile: async (): Promise<ProviderProfile> => {
    const response = await api.get<ProviderProfile>("/providers/profile/me");
    return response.data;
  },

  // Update my profile
  updateProfile: async (data: UpdateProfileRequest): Promise<void> => {
    await api.put("/providers/profile", data);
  },

  // SERVICES CRUD
  // Create service
  createService: async (
    data: CreateServiceRequest,
  ): Promise<CreateServiceResponse> => {
    const response = await api.post<CreateServiceResponse>(
      "/providers/services",
      data,
    );
    return response.data;
  },

  // Update service
  updateService: async (
    serviceId: number,
    data: UpdateServiceRequest,
  ): Promise<UpdateServiceResponse> => {
    const response = await api.put<UpdateServiceResponse>(
      `/providers/services/${serviceId}`,
      data,
    );
    return response.data;
  },

  // Delete service
  deleteService: async (serviceId: number): Promise<void> => {
    await api.delete(`/providers/services/${serviceId}`);
  },
};
