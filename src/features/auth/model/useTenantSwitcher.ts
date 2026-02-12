"use client";

import { useQuery, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { authApi, authKeys } from "../api/authApi";
import { getAccessToken, setTokens } from "../lib/tokenStorage";
import type { TenantAccessInfo } from "@/entities/tenant";

/**
 * Fetch the list of organisations the current user belongs to.
 * Only enabled when the user is authenticated.
 */
export function useMyTenants() {
  return useQuery({
    queryKey: authKeys.myTenants(),
    queryFn: () => authApi.myTenants(),
    enabled: !!getAccessToken(),
    staleTime: 10 * 60 * 1000, // 10 minutes — rarely changes
  });
}

/**
 * Switch to another tenant.
 *
 * **Variant A (recommended):** If the target tenant has an `admin_domain`,
 * redirect the browser there. The user will re-authenticate on the new domain.
 *
 * **Variant B:** If all tenants share a single domain, call
 * `POST /auth/switch-tenant` to get fresh tokens and reload.
 */
export function useSwitchTenant() {
  return useMutation({
    mutationFn: (tenantId: string) => authApi.switchTenant(tenantId),
    onSuccess: (data) => {
      // Save the new token pair
      setTokens({
        access_token: data.access_token,
        refresh_token: data.refresh_token,
      });

      // Full reload so every provider re-initialises with the new tenant
      window.location.reload();
    },
    onError: (error: unknown) => {
      let message = "Не удалось переключить организацию";

      if (error && typeof error === "object") {
        const axiosError = error as {
          response?: { status?: number; data?: { detail?: string } };
        };

        if (axiosError.response?.status === 403) {
          message = "У вас нет доступа к этой организации";
        } else if (axiosError.response?.data?.detail) {
          message = axiosError.response.data.detail;
        }
      }

      toast.error(message);
    },
  });
}

/**
 * Redirect-based tenant switch (Variant A).
 * Simply navigates the browser to the target tenant's admin domain.
 */
export function switchTenantByRedirect(tenant: TenantAccessInfo) {
  if (tenant.admin_domain) {
    window.location.href = `https://${tenant.admin_domain}`;
  }
}
