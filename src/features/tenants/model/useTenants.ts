"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAppMutation } from "@/shared/lib";
import { tenantsApi, tenantsKeys } from "../api/tenantsApi";
import type {
  TenantListParams,
  CreateTenantDto,
  UpdateTenantDto,
  TenantDomainCreate,
  TenantDomainUpdate,
  TenantDomainListResponse,
  EmailLogParams,
} from "@/entities/tenant";

export function useTenantsList(params?: TenantListParams) {
  return useQuery({
    queryKey: tenantsKeys.list(params),
    queryFn: () => tenantsApi.list(params),
  });
}

export function useTenantDetail(tenantId: string) {
  return useQuery({
    queryKey: tenantsKeys.detail(tenantId),
    queryFn: () => tenantsApi.getById(tenantId),
    enabled: !!tenantId,
  });
}

export function useCreateTenant() {
  return useAppMutation({
    mutationFn: (data: CreateTenantDto) => tenantsApi.create(data),
    successMessage: "Проект создан",
    errorMessage: "Не удалось создать проект",
    invalidateKeys: [tenantsKeys.lists()],
  });
}

export function useUpdateTenant(tenantId: string) {
  const queryClient = useQueryClient();
  return useAppMutation({
    mutationFn: (data: UpdateTenantDto) => tenantsApi.update(tenantId, data),
    successMessage: "Проект обновлен",
    errorMessage: "Не удалось обновить проект",
    invalidateKeys: [tenantsKeys.lists()],
    versionConflictKey: tenantsKeys.detail(tenantId),
    onSuccess: (tenant) => {
      queryClient.setQueryData(tenantsKeys.detail(tenantId), tenant);
    },
  });
}

export function useDeleteTenant() {
  return useAppMutation({
    mutationFn: (tenantId: string) => tenantsApi.delete(tenantId),
    successMessage: "Проект удален",
    errorMessage: "Не удалось удалить проект",
    invalidateKeys: [tenantsKeys.lists()],
  });
}

export function useUploadTenantLogo(tenantId: string) {
  const queryClient = useQueryClient();
  return useAppMutation({
    mutationFn: (file: File) => tenantsApi.uploadLogo(tenantId, file),
    successMessage: "Логотип загружен",
    errorMessage: "Не удалось загрузить логотип",
    invalidateKeys: [tenantsKeys.lists()],
    onSuccess: (tenant) => {
      queryClient.setQueryData(tenantsKeys.detail(tenantId), tenant);
    },
  });
}

export function useDeleteTenantLogo(tenantId: string) {
  return useAppMutation({
    mutationFn: () => tenantsApi.deleteLogo(tenantId),
    successMessage: "Логотип удален",
    errorMessage: "Не удалось удалить логотип",
    invalidateKeys: [tenantsKeys.detail(tenantId), tenantsKeys.lists()],
  });
}

export function useEnabledFeatures() {
  return useQuery({
    queryKey: tenantsKeys.enabledFeatures(),
    queryFn: () => tenantsApi.getEnabledFeatures(),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

// --- Domains ---

export function useTenantDomains(tenantId: string) {
  return useQuery({
    queryKey: tenantsKeys.domains(tenantId),
    queryFn: () => tenantsApi.listDomains(tenantId),
    enabled: !!tenantId,
  });
}

export function useCreateTenantDomain(tenantId: string) {
  return useAppMutation({
    mutationFn: (data: TenantDomainCreate) => tenantsApi.createDomain(tenantId, data),
    successMessage: "Домен добавлен",
    errorMessage: "Не удалось добавить домен",
    invalidateKeys: [tenantsKeys.domains(tenantId)],
  });
}

export function useUpdateTenantDomain(tenantId: string) {
  return useAppMutation({
    mutationFn: ({ domainId, data }: { domainId: string; data: TenantDomainUpdate }) =>
      tenantsApi.updateDomain(tenantId, domainId, data),
    successMessage: "Домен обновлён",
    errorMessage: "Не удалось обновить домен",
    invalidateKeys: [tenantsKeys.domains(tenantId)],
  });
}

export function useDeleteTenantDomain(tenantId: string) {
  return useAppMutation({
    mutationFn: (domainId: string) => tenantsApi.deleteDomain(tenantId, domainId),
    successMessage: "Домен удалён",
    errorMessage: "Не удалось удалить домен",
    invalidateKeys: [tenantsKeys.domains(tenantId)],
  });
}

export function useVerifyTenantDomain(tenantId: string) {
  const queryClient = useQueryClient();
  return useAppMutation({
    mutationFn: (domainId: string) => tenantsApi.verifyDomain(tenantId, domainId),
    errorMessage: "Не удалось проверить DNS",
    onSuccess: (result) => {
      if (result.ok) {
        queryClient.invalidateQueries({ queryKey: tenantsKeys.domains(tenantId) });
        toast.success("DNS подтверждён, получаем SSL-сертификат...");
      }
    },
  });
}

export function useDomainSSLPolling(tenantId: string, domainId: string, enabled: boolean) {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: [...tenantsKeys.domains(tenantId), "ssl-poll", domainId],
    queryFn: async () => {
      const data = await tenantsApi.getDomainSSLStatus(tenantId, domainId);

      queryClient.setQueryData<TenantDomainListResponse>(
        tenantsKeys.domains(tenantId),
        (old) =>
          old && {
            ...old,
            items: old.items.map((d) =>
              d.id === data.domain_id
                ? {
                    ...d,
                    ssl_status: data.ssl_status,
                    dns_verified_at: data.dns_verified_at,
                    ssl_provisioned_at: data.ssl_provisioned_at,
                  }
                : d,
            ),
          },
      );

      if (data.ssl_status === "active" || data.ssl_status === "error") {
        queryClient.invalidateQueries({ queryKey: tenantsKeys.domains(tenantId) });
      }

      return data;
    },
    enabled,
    refetchInterval: (query) => {
      const status = query.state.data?.ssl_status;
      return status === "active" || status === "error" ? false : 10_000;
    },
  });
}

// --- Email ---

export function useSendTestEmail(tenantId: string) {
  return useAppMutation({
    mutationFn: (toEmail: string) => tenantsApi.sendTestEmail(tenantId, toEmail),
    errorMessage: "Не удалось отправить тестовое письмо",
    onSuccess: (result) => {
      if (result.success) {
        toast.success("Тестовое письмо отправлено");
      } else {
        toast.error(`Ошибка отправки: ${result.error || "Неизвестная ошибка"}`);
      }
    },
  });
}

export function useEmailLogs(tenantId: string, params?: EmailLogParams) {
  return useQuery({
    queryKey: [...tenantsKeys.emailLogs(tenantId), params],
    queryFn: () => tenantsApi.getEmailLogs(tenantId, params),
    enabled: !!tenantId && !!params,
  });
}
