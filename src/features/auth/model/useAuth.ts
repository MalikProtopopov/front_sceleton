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
import type { LoginRequest, ForgotPasswordRequest, ResetPasswordRequest } from "@/entities/user";
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

      // Check if user must change their password on first login
      if (response.user.force_password_change) {
        toast.warning("Необходимо сменить пароль перед началом работы");
        router.push(ROUTES.SETTINGS);
      } else {
        toast.success("Вы успешно вошли в систему");
        router.push(ROUTES.ARTICLES);
      }
    },
    onError: (error: unknown) => {
      // Extract error message from various error formats
      let message = "Неверный email или пароль";
      
      if (error && typeof error === "object") {
        // Axios error with response
        const axiosError = error as { response?: { status?: number; data?: { detail?: string; message?: string } }; message?: string };
        
        if (axiosError.response?.status === 401) {
          message = "Неверный email или пароль";
        } else if (axiosError.response?.data?.detail) {
          message = axiosError.response.data.detail;
        } else if (axiosError.response?.data?.message) {
          message = axiosError.response.data.message;
        } else if (axiosError.message && axiosError.message !== "Request failed with status code 401") {
          message = axiosError.message;
        }
      } else if (error instanceof Error) {
        message = error.message;
      }
      
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

export function useForgotPassword() {
  return useMutation({
    mutationFn: (data: ForgotPasswordRequest) => authApi.forgotPassword(data),
    onSuccess: () => {
      // Always show success to prevent email enumeration
      toast.success("Если указанный email зарегистрирован, вы получите письмо с инструкциями по сбросу пароля.");
    },
    onError: () => {
      // Still show "success" to prevent email enumeration (backend returns 204 anyway)
      toast.success("Если указанный email зарегистрирован, вы получите письмо с инструкциями по сбросу пароля.");
    },
  });
}

export function useResetPassword() {
  const router = useRouter();

  return useMutation({
    mutationFn: (data: ResetPasswordRequest) => authApi.resetPassword(data),
    onSuccess: () => {
      toast.success("Пароль успешно изменён. Войдите с новым паролем.");
      router.push(ROUTES.LOGIN);
    },
    onError: (error: unknown) => {
      let message = "Не удалось сбросить пароль. Ссылка могла устареть.";
      if (error && typeof error === "object") {
        const axiosError = error as { response?: { data?: { detail?: string } } };
        if (axiosError.response?.data?.detail) {
          message = axiosError.response.data.detail;
        }
      }
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

