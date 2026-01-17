"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { setTokenHandlers } from "@/shared/api";
import {
  getAccessToken,
  getRefreshToken,
  setTokens,
  clearTokens,
} from "@/features/auth/lib/tokenStorage";
import { authApi, authKeys } from "@/features/auth/api/authApi";
import type { UserWithPermissions } from "@/entities/user";

interface AuthContextValue {
  user: UserWithPermissions | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  isLoading: true,
  isAuthenticated: false,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserWithPermissions | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const queryClient = useQueryClient();

  // Initialize token handlers for API client
  useEffect(() => {
    setTokenHandlers({
      getAccessToken,
      getRefreshToken,
      setTokens,
      clearTokens,
    });
  }, []);

  // Fetch current user on mount
  useEffect(() => {
    async function fetchUser() {
      const token = getAccessToken();
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const userData = await authApi.me();
        setUser(userData);
        queryClient.setQueryData(authKeys.me(), userData);
      } catch {
        // Token invalid or expired
        clearTokens();
      } finally {
        setIsLoading(false);
      }
    }

    fetchUser();
  }, [queryClient]);

  // Subscribe to auth query changes
  useEffect(() => {
    const unsubscribe = queryClient.getQueryCache().subscribe((event) => {
      if (event.query.queryKey[0] === "auth" && event.query.queryKey[1] === "me") {
        const data = event.query.state.data as UserWithPermissions | undefined;
        if (data) {
          setUser(data);
        } else if (event.query.state.status === "error") {
          setUser(null);
        }
      }
    });

    return unsubscribe;
  }, [queryClient]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

