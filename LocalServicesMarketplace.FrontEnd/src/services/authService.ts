import api from "./api";
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  RefreshTokenRequest,
  RefreshTokenResponse,
  User,
} from "../models";

export const authService = {
  /**
   * Login with email and password
   */
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>("/auth/login", credentials);
    return response.data;
  },

  /**
   * Register a new user (customer or provider)
   */
  async register(userData: RegisterRequest): Promise<RegisterResponse> {
    const response = await api.post<RegisterResponse>(
      "/auth/register",
      userData
    );
    return response.data;
  },

  /**
   * Refresh access token using refresh token
   */
  async refreshToken(
    tokens: RefreshTokenRequest
  ): Promise<RefreshTokenResponse> {
    const response = await api.post<RefreshTokenResponse>(
      "/auth/refresh",
      tokens
    );
    return response.data;
  },

  /**
   * Store authentication data in localStorage
   */
  setAuthData(token: string, refreshToken: string, user: User): void {
    localStorage.setItem("accessToken", token);
    localStorage.setItem("refreshToken", refreshToken);
    localStorage.setItem("user", JSON.stringify(user));
  },

  /**
   * Clear authentication data from localStorage
   */
  clearAuthData(): void {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
  },

  /**
   * Get stored access token
   */
  getAccessToken(): string | null {
    return localStorage.getItem("accessToken");
  },

  /**
   * Get stored user data
   */
  getStoredUser(): User | null {
    const user = localStorage.getItem("user");
    return user ? (JSON.parse(user) as User) : null;
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!localStorage.getItem("accessToken");
  },
};

export default authService;
