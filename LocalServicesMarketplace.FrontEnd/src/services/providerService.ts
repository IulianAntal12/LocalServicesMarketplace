import api from "./api";

// TYPES
export interface ProviderListItem {
  name: any;
  category: ReactNode;
  reviews: ReactNode;
  location: ReactNode;
  price: ReactNode;
  id: string;
  businessName: string;
  businessDescription: string | null;
  rating: number | null;
  totalReviews: number;
  city: string | null;
  serviceAreas: string[];
  serviceCount: number;
  portfolioImageCount: number;
}

export interface ServiceDto {
  id: number;
  name: string;
  description: string;
  category: string;
  basePrice: number;
  priceType: string;
  estimatedDurationMinutes: number;
  isActive: boolean;
}

export interface PortfolioImageDto {
  id: number;
  imageUrl: string;
  description: string | null;
  displayOrder: number;
  uploadedAt: string;
}

export interface ProviderProfile {
  phoneNumber: string | null;
  id: string;
  email: string;
  fullName: string;
  businessName: string | null;
  businessDescription: string | null;
  hourlyRate: number | null;
  serviceAreas: string[];
  rating: number | null;
  totalReviews: number;
  profilePictureUrl: string | null;
  address: string | null;
  city: string | null;
  postalCode: string | null;
  services: ServiceDto[];
  portfolioImages: PortfolioImageDto[];
}

export interface UpdateProfileRequest {
  businessName?: string;
  businessDescription?: string;
  phoneNumber?: string;
  hourlyRate?: number;
  serviceAreas?: string[];
  address?: string;
  city?: string;
  postalCode?: string;
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
  isActive?: boolean;
}

export interface CreateServiceResponse {
  serviceId: number;
  message: string;
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
    params: SearchProvidersParams
  ): Promise<ProviderListItem[]> => {
    const response = await api.get<ProviderListItem[]>("/providers/search", {
      params,
    });
    return response.data;
  },

  // Get provider's services (public)
  getProviderServices: async (providerId: string): Promise<ServiceDto[]> => {
    const response = await api.get<ServiceDto[]>(
      `/providers/${providerId}/services`
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
    data: CreateServiceRequest
  ): Promise<CreateServiceResponse> => {
    const response = await api.post<CreateServiceResponse>(
      "/providers/services",
      data
    );
    return response.data;
  },

  // Update service
  updateService: async (
    serviceId: number,
    data: UpdateServiceRequest
  ): Promise<void> => {
    await api.put(`/providers/services/${serviceId}`, data);
  },

  // Delete service
  deleteService: async (serviceId: number): Promise<void> => {
    await api.delete(`/providers/services/${serviceId}`);
  },
};
