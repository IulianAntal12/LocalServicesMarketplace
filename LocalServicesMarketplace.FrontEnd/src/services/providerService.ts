import api from "./api";
import type {
  Provider,
  ProviderProfile,
  UpdateProviderProfileRequest,
  Service,
  CreateServiceRequest,
  UpdateServiceRequest,
} from "../models";

export const providerService = {
  /**
   * Get all active providers
   */
  async getAllProviders(): Promise<Provider[]> {
    const response = await api.get<Provider[]>("/providers");
    return response.data;
  },

  /**
   * Get provider by ID
   */
  async getProviderById(providerId: string): Promise<ProviderProfile> {
    const response = await api.get<ProviderProfile>(`/providers/${providerId}`);
    return response.data;
  },

  /**
   * Get current provider's profile (authenticated)
   */
  async getMyProfile(): Promise<ProviderProfile> {
    const response = await api.get<ProviderProfile>("/providers/profile/me");
    return response.data;
  },

  /**
   * Update provider profile
   */
  async updateProfile(
    data: UpdateProviderProfileRequest
  ): Promise<{ message: string }> {
    const response = await api.put<{ message: string }>(
      "/providers/profile",
      data
    );
    return response.data;
  },

  /**
   * Search providers by category or location
   */
  async searchProviders(params: {
    category?: string;
    location?: string;
  }): Promise<Provider[]> {
    const response = await api.get<Provider[]>("/providers/search", { params });
    return response.data;
  },

  /**
   * Get services by provider
   */
  async getProviderServices(providerId: string): Promise<Service[]> {
    const response = await api.get<Service[]>(
      `/providers/${providerId}/services`
    );
    return response.data;
  },

  /**
   * Create a new service (provider only)
   */
  async createService(
    data: CreateServiceRequest
  ): Promise<{ serviceId: number; message: string }> {
    const response = await api.post<{ serviceId: number; message: string }>(
      "/providers/services",
      data
    );
    return response.data;
  },

  /**
   * Update a service
   */
  async updateService(
    serviceId: number,
    data: UpdateServiceRequest
  ): Promise<void> {
    await api.put(`/providers/services/${serviceId}`, data);
  },

  /**
   * Delete a service
   */
  async deleteService(serviceId: number): Promise<void> {
    await api.delete(`/providers/services/${serviceId}`);
  },
};

export default providerService;
