"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";import { message } from "antd";import { USER_ROLES } from "@/lib/constants";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  refreshUser: () => Promise<void>;
  isAuthenticated: boolean;
  hasRole: (roles: UserRole | UserRole[]) => boolean;
}

interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  dateOfBirth: string;
  gender: Gender;
  address: string;
  employmentStatus: EmploymentStatus;
  maritalStatus: MaritalStatus;
  interests: string[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Check authentication status on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      // Try to get current user
      const response = await fetch("/api/auth/me", {
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.data);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      console.log("AuthProvider: Starting login...");
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      });

      const data = await response.json();
      console.log("AuthProvider: Login response:", data);

      if (!response.ok) {
        throw new Error(data.error || "Login failed");
      }

      setUser(data.data.user);
      message.success("Welcome back!");

      // Redirect based on role
      const redirectPath = getRoleBasedRedirect(data.data.user.role);
      router.push(redirectPath);
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });

      setUser(null);
      message.success("Logged out successfully!");
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
      // Still clear user and redirect even if API call fails
      setUser(null);
      message.success("Logged out successfully!");
      router.push("/login");
    }
  };

  const register = async (data: RegisterData) => {
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Registration failed");
      }

      // Auto-login after registration
      setUser(result.data.user);
      message.success("Account created successfully! Redirecting...");

      // Redirect based on role (typically MEMBER for new registrations)
      const redirectPath = getRoleBasedRedirect(result.data.user.role);
      router.push(redirectPath);
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    }
  };

  const refreshUser = async () => {
    await checkAuth();
  };

  const hasRole = (roles: UserRole | UserRole[]): boolean => {
    if (!user) return false;

    if (Array.isArray(roles)) {
      return roles.includes(user.role);
    }

    return user.role === roles;
  };

  const getRoleBasedRedirect = (role: UserRole): string => {
    switch (role) {
      case USER_ROLES.SUPERADMIN:
        return "/superadmin/dashboard";
      case USER_ROLES.LEADER:
        return "/leader/dashboard";
      case USER_ROLES.MEMBER:
        return "/member/dashboard";
      default:
        return "/";
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    logout,
    register,
    refreshUser,
    isAuthenticated: !!user,
    hasRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
