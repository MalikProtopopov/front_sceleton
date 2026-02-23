"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { tenantsApi, tenantsKeys } from "../api/tenantsApi";
import { getErrorMessage, handleVersionConflict } from "@/shared/lib/versionConflict";
import type {
  TenantListParams,
  CreateTenantDto,
  UpdateTenantDto,
  TenantDomainCreate,
  TenantDomainUpdate,
  EmailLogParams,
} from "@/entities/tenant";

// List all tenants (platform owner only)
export function useTenantsList(params?: TenantListParams) {
  return useQuery({
    queryKey: tenantsKeys.list(params),
    queryFn: () => tenantsApi.list(params),
  });
}

// Get single tenant
export function useTenantDetail(tenantId: string) {
  return useQuery({
    queryKey: tenantsKeys.detail(tenantId),
    queryFn: () => tenantsApi.getById(tenantId),
    enabled: !!tenantId,
  });
}

// Create tenant
export function useCreateTenant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTenantDto) => tenantsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tenantsKeys.lists() });
      toast.success("Проект создан");
    },
    onError: (error) => {
      const message = getErrorMessage(error, "Не удалось создать проект");
      toast.error(message);
    },
  });
}

// Update tenant
export function useUpdateTenant(tenantId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateTenantDto) => tenantsApi.update(tenantId, data),
    onSuccess: (tenant) => {
      queryClient.setQueryData(tenantsKeys.detail(tenantId), tenant);
      queryClient.invalidateQueries({ queryKey: tenantsKeys.lists() });
      toast.success("Проект обновлен");
    },
    onError: (error) => {
      if (handleVersionConflict(error, queryClient, tenantsKeys.detail(tenantId))) {
        return;
      }
      const message = getErrorMessage(error, "Не удалось обновить проект");
      toast.error(message);
    },
  });
}

// Delete tenant
export function useDeleteTenant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (tenantId: string) => tenantsApi.delete(tenantId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tenantsKeys.lists() });
      toast.success("Проект удален");
    },
    onError: (error) => {
      const message = getErrorMessage(error, "Не удалось удалить проект");
      toast.error(message);
    },
  });
}

// Upload tenant logo
export function useUploadTenantLogo(tenantId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => tenantsApi.uploadLogo(tenantId, file),
    onSuccess: (tenant) => {
      queryClient.setQueryData(tenantsKeys.detail(tenantId), tenant);
      queryClient.invalidateQueries({ queryKey: tenantsKeys.lists() });
      toast.success("Логотип загружен");
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : "Не удалось загрузить логотип";
      toast.error(message);
    },
  });
}

// Delete tenant logo
export function useDeleteTenantLogo(tenantId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => tenantsApi.deleteLogo(tenantId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tenantsKeys.detail(tenantId) });
      queryClient.invalidateQueries({ queryKey: tenantsKeys.lists() });
      toast.success("Логотип удален");
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : "Не удалось удалить логотип";
      toast.error(message);
    },
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
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: TenantDomainCreate) => tenantsApi.createDomain(tenantId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tenantsKeys.domains(tenantId) });
      toast.success("Домен добавлен");
    },
    onError: (error) => {
      const message = getErrorMessage(error, "Не удалось добавить домен");
      toast.error(message);
    },
  });
}

export function useUpdateTenantDomain(tenantId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ domainId, data }: { domainId: string; data: TenantDomainUpdate }) =>
      tenantsApi.updateDomain(tenantId, domainId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tenantsKeys.domains(tenantId) });
      toast.success("Домен обновлён");
    },
    onError: (error) => {
      const message = getErrorMessage(error, "Не удалось обновить домен");
      toast.error(message);
    },
  });
}

export function useDeleteTenantDomain(tenantId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (domainId: string) => tenantsApi.deleteDomain(tenantId, domainId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tenantsKeys.domains(tenantId) });
      toast.success("Домен удалён");
    },
    onError: (error) => {
      const message = getErrorMessage(error, "Не удалось удалить домен");
      toast.error(message);
    },
  });
}

// --- Email ---

export function useSendTestEmail(tenantId: string) {
  return useMutation({
    mutationFn: (toEmail: string) => tenantsApi.sendTestEmail(tenantId, toEmail),
    onSuccess: (result) => {
      if (result.success) {
        toast.success("Тестовое письмо отправлено");
      } else {
        toast.error(`Ошибка отправки: ${result.error || "Неизвестная ошибка"}`);
      }
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : "Не удалось отправить тестовое письмо";
      toast.error(message);
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
