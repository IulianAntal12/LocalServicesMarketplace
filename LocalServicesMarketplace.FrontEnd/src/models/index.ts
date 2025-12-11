// ============= User & Auth Models =============

export interface User {
  id: string;
  email: string;
  fullName: string;
  roles: string[];
  businessName?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  refreshToken: string;
  user: User;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: "Customer" | "Provider";
  businessName?: string;
  businessDescription?: string;
}

export interface RegisterResponse {
  token: string;
  refreshToken: string;
  user: User;
}

export interface RefreshTokenRequest {
  accessToken: string;
  refreshToken: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}

// ============= Provider Models =============

export interface Provider {
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

export interface ProviderProfile {
  id: string;
  email: string;
  fullName: string;
  businessName?: string;
  businessDescription?: string;
  hourlyRate?: number;
  serviceAreas: string[];
  rating?: number;
  totalReviews: number;
  profilePictureUrl?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  services: Service[];
  portfolioImages: PortfolioImage[];
}

export interface UpdateProviderProfileRequest {
  businessName?: string;
  businessDescription?: string;
  hourlyRate?: number;
  serviceAreas?: string[];
  address?: string;
  city?: string;
  postalCode?: string;
}

// ============= Service Models =============

export interface Service {
  id: number;
  name: string;
  description: string;
  category: string;
  basePrice: number;
  priceType: "Hourly" | "Fixed" | "Quote";
  estimatedDurationMinutes: number;
  isActive: boolean;
}

export interface CreateServiceRequest {
  name: string;
  description: string;
  category: string;
  basePrice: number;
  priceType: "Hourly" | "Fixed" | "Quote";
  estimatedDurationMinutes: number;
}

export interface UpdateServiceRequest {
  name?: string;
  description?: string;
  basePrice?: number;
  isActive?: boolean;
}

// ============= Category Models =============

export interface ServiceCategory {
  id: number;
  name: string;
  description?: string;
  icon?: string;
  isActive: boolean;
  displayOrder: number;
}

// ============= Portfolio Models =============

export interface PortfolioImage {
  id: number;
  imageUrl: string;
  description?: string;
  displayOrder: number;
  uploadedAt: string;
}

export interface UploadImageResponse {
  imageId: number;
  imageUrl: string;
  fileName: string;
}

// ============= Search Models =============

export interface SearchServicesParams {
  q?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  lat?: number;
  lng?: number;
  radius?: number;
  minRating?: number;
  page?: number;
  pageSize?: number;
  sortBy?: "relevance" | "price-low" | "price-high" | "rating" | "distance";
}

export interface SearchProvidersParams {
  q?: string;
  category?: string;
  city?: string;
  lat?: number;
  lng?: number;
  radius?: number;
  minRating?: number;
  page?: number;
  pageSize?: number;
  sortBy?: "relevance" | "rating" | "reviews" | "distance";
}

// ============= API Response Models =============

export interface ApiError {
  error: string;
  errors?: string[];
}

export interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
