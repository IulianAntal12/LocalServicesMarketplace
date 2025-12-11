import { useState } from "react";
import type { ReactNode } from "react";
import type { User, LoginRequest, RegisterRequest } from "../models";
import { authService } from "../services";
import { AuthContext } from "./authContextDef";
import type { AuthContextType } from "./authContextDef";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    // Initialize from localStorage synchronously
    const storedUser = authService.getStoredUser();
    if (storedUser && authService.isAuthenticated()) {
      return storedUser;
    }
    return null;
  });

  const login = async (credentials: LoginRequest) => {
    const response = await authService.login(credentials);
    authService.setAuthData(
      response.token,
      response.refreshToken,
      response.user
    );
    setUser(response.user);
  };

  const register = async (userData: RegisterRequest) => {
    const response = await authService.register(userData);
    authService.setAuthData(
      response.token,
      response.refreshToken,
      response.user
    );
    setUser(response.user);
  };

  const logout = () => {
    authService.clearAuthData();
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    isProvider: user?.roles?.includes("Provider") ?? false,
    isCustomer: user?.roles?.includes("Customer") ?? false,
    isAdmin: user?.roles?.includes("Admin") ?? false,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
