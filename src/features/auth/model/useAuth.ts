"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { authApi, authKeys } from "../api/authApi";
import {
  getAccessToken,
  setTokens,
  clearTokens,
} from "../lib/tokenStorage";
import type { LoginRequest } from "@/entities/user";
import { ROUTES } from "@/shared/config";

export function useCurrentUser() {
  return useQuery({
    queryKey: authKeys.me(),
    queryFn: () => authApi.me(),
    enabled: !!getAccessToken(),
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useLogin() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: LoginRequest) => authApi.login(data),
    onSuccess: (response) => {
      setTokens(response.tokens);
      queryClient.setQueryData(authKeys.me(), response.user);
      toast.success("Вы успешно вошли в систему");
      router.push(ROUTES.ARTICLES);
    },
    onError: (error) => {
      const message =
        error instanceof Error
          ? error.message
          : "Неверный email или пароль";
      toast.error(message);
    },
  });
}

export function useLogout() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => authApi.logout(),
    onSuccess: () => {
      clearTokens();
      queryClient.clear();
      toast.success("Вы вышли из системы");
      router.push(ROUTES.LOGIN);
    },
    onError: () => {
      // Even if logout fails on server, clear local state
      clearTokens();
      queryClient.clear();
      router.push(ROUTES.LOGIN);
    },
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: authApi.changePassword,
    onSuccess: () => {
      toast.success("Пароль успешно изменен");
    },
    onError: (error) => {
      const message =
        error instanceof Error ? error.message : "Не удалось изменить пароль";
      toast.error(message);
    },
  });
}

export function useIsAuthenticated(): boolean {
  return !!getAccessToken();
}

export function useAuth() {
  const { data: user, isLoading } = useCurrentUser();
  const isAuthenticated = !!getAccessToken();

  return {
    user,
    isLoading,
    isAuthenticated,
  };
}

