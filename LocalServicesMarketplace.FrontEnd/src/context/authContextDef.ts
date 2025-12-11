import { createContext } from "react";
import type { User, LoginRequest, RegisterRequest } from "../models";

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  register: (userData: RegisterRequest) => Promise<void>;
  logout: () => void;
  isProvider: boolean;
  isCustomer: boolean;
  isAdmin: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);
