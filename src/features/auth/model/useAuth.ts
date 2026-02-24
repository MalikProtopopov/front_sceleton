"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { authApi, authKeys } from "../api/authApi";
import {
  getAccessToken,
  setTokens,
  setTenantId,
  clearTokens,
} from "../lib/tokenStorage";
import type { LoginRequest, LoginSuccess, TenantOption, ForgotPasswordRequest, ResetPasswordRequest } from "@/entities/user";
import type { SelectTenantRequest, TenantByDomainResponse } from "@/entities/tenant";
import { ROUTES } from "@/shared/config";
import { useTenantStore } from "@/shared/model/useTenantStore";

export function useCurrentUser() {
  return useQuery({
    queryKey: authKeys.me(),
    queryFn: () => authApi.me(),
    enabled: !!getAccessToken(),
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

function completeLogin(
  result: LoginSuccess,
  queryClient: ReturnType<typeof useQueryClient>,
  router: ReturnType<typeof useRouter>,
  tenantMeta?: TenantOption,
) {
  setTokens(result.tokens);
  setTenantId(result.user.tenant_id);

  // Update tenant store so the interceptor picks up the new tenant ID
  const store = useTenantStore.getState();
  if (!store.tenantId || store.isSharedDomain) {
    const info: TenantByDomainResponse = tenantMeta
      ? {
          tenant_id: tenantMeta.tenant_id,
          slug: tenantMeta.slug,
          name: tenantMeta.name,
          logo_url: tenantMeta.logo_url,
          primary_color: tenantMeta.primary_color,
          site_url: null,
        }
      : {
          tenant_id: result.user.tenant_id,
          slug: "",
          name: "",
          logo_url: null,
          primary_color: null,
          site_url: null,
        };
    store.setTenant(info);
  }

  queryClient.setQueryData(authKeys.me(), result.user);

  if (result.user.force_password_change) {
    toast.warning("Необходимо сменить пароль перед началом работы");
  } else {
    toast.success("Вы успешно вошли в систему");
  }
  router.push(ROUTES.ARTICLES);
}

function extractLoginError(error: unknown): string {
  if (error && typeof error === "object") {
    const axiosError = error as { response?: { status?: number; data?: { detail?: string; message?: string } }; message?: string };
    if (axiosError.response?.status === 401) return "Неверный email или пароль";
    if (axiosError.response?.data?.detail) return axiosError.response.data.detail;
    if (axiosError.response?.data?.message) return axiosError.response.data.message;
    if (axiosError.message && !axiosError.message.includes("status code")) return axiosError.message;
  }
  if (error instanceof Error) return error.message;
  return "Неверный email или пароль";
}

export function useLogin() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: LoginRequest) => authApi.login(data),
    onSuccess: (result) => {
      if (result.status === "success") {
        completeLogin(result, queryClient, router);
      }
      // "tenant_selection_required" — data is stored in mutation.data,
      // the calling component reads it to show the tenant picker
    },
    onError: (error: unknown) => {
      toast.error(extractLoginError(error));
    },
  });
}

interface SelectTenantVars {
  request: SelectTenantRequest;
  tenantMeta?: TenantOption;
}

export function useSelectTenant() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (vars: SelectTenantVars) => authApi.selectTenant(vars.request),
    onSuccess: (result, vars) => {
      completeLogin(result, queryClient, router, vars.tenantMeta);
    },
    onError: (error: unknown) => {
      toast.error(extractLoginError(error));
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

