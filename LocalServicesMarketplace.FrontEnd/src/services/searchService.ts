import api from "./api";

export interface SearchProvidersParams {
  q?: string;
  category?: string;
  city?: string;
  serviceArea?: string;
  lat?: number;
  lng?: number;
  radius?: number;
  minRating?: number;
  page?: number;
  pageSize?: number;
  sortBy?: string;
}

export interface ProviderSearchResult {
  id: string;
  fullName: string;
  businessName: string;
  businessDescription: string | null;
  rating: number | null;
  totalReviews: number;
  hourlyRate: number | null;
  city: string | null;
  serviceAreas: string[];
  profilePictureUrl: string | null;
  serviceCount: number;
  portfolioImageCount: number;
  categories: string[];
  distanceKm: number | null;
  memberSince: string;
}

export interface SearchProvidersResponse {
  providers: ProviderSearchResult[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
}

export interface SearchServicesParams {
  q?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  priceType?: string;
  lat?: number;
  lng?: number;
  radius?: number;
  minRating?: number;
  page?: number;
  pageSize?: number;
  sortBy?: string;
}

export interface ServiceSearchResult {
  id: number;
  name: string;
  description: string;
  category: string;
  basePrice: number;
  priceType: string;
  estimatedDurationMinutes: number;
  providerId: string;
  providerName: string;
  businessName: string | null;
  providerRating: number | null;
  providerTotalReviews: number;
  providerCity: string | null;
  providerProfilePicture: string | null;
  distanceKm: number | null;
}

export interface SearchServicesResponse {
  services: ServiceSearchResult[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  filtersApplied: {
    query: string | null;
    category: string | null;
    minPrice: number | null;
    maxPrice: number | null;
    minRating: number | null;
    radiusKm: number | null;
    locationFilterActive: boolean;
  };
}

export const searchService = {
  /**
   * Search providers with location-based filtering
   */
  searchProviders: async (
    params: SearchProvidersParams,
  ): Promise<SearchProvidersResponse> => {
    const queryParams = new URLSearchParams();

    if (params.q) queryParams.set("q", params.q);
    if (params.category) queryParams.set("category", params.category);
    if (params.city) queryParams.set("city", params.city);
    if (params.serviceArea) queryParams.set("serviceArea", params.serviceArea);
    if (params.lat !== undefined) queryParams.set("lat", params.lat.toString());
    if (params.lng !== undefined) queryParams.set("lng", params.lng.toString());
    if (params.radius !== undefined)
      queryParams.set("radius", params.radius.toString());
    if (params.minRating !== undefined)
      queryParams.set("minRating", params.minRating.toString());
    if (params.page !== undefined)
      queryParams.set("page", params.page.toString());
    if (params.pageSize !== undefined)
      queryParams.set("pageSize", params.pageSize.toString());
    if (params.sortBy) queryParams.set("sortBy", params.sortBy);

    const response = await api.get<SearchProvidersResponse>(
      `/search/providers?${queryParams.toString()}`,
    );
    return response.data;
  },

  /**
   * Search services with location-based filtering
   */
  searchServices: async (
    params: SearchServicesParams,
  ): Promise<SearchServicesResponse> => {
    const queryParams = new URLSearchParams();

    if (params.q) queryParams.set("q", params.q);
    if (params.category) queryParams.set("category", params.category);
    if (params.minPrice !== undefined)
      queryParams.set("minPrice", params.minPrice.toString());
    if (params.maxPrice !== undefined)
      queryParams.set("maxPrice", params.maxPrice.toString());
    if (params.priceType) queryParams.set("priceType", params.priceType);
    if (params.lat !== undefined) queryParams.set("lat", params.lat.toString());
    if (params.lng !== undefined) queryParams.set("lng", params.lng.toString());
    if (params.radius !== undefined)
      queryParams.set("radius", params.radius.toString());
    if (params.minRating !== undefined)
      queryParams.set("minRating", params.minRating.toString());
    if (params.page !== undefined)
      queryParams.set("page", params.page.toString());
    if (params.pageSize !== undefined)
      queryParams.set("pageSize", params.pageSize.toString());
    if (params.sortBy) queryParams.set("sortBy", params.sortBy);

    const response = await api.get<SearchServicesResponse>(
      `/search/services?${queryParams.toString()}`,
    );
    return response.data;
  },
};
