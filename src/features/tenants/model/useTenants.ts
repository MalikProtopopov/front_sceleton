"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { tenantsApi, tenantsKeys } from "../api/tenantsApi";
import type {
  TenantListParams,
  CreateTenantDto,
  UpdateTenantDto,
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
      const message = error instanceof Error ? error.message : "Не удалось создать проект";
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
      const message = error instanceof Error ? error.message : "Не удалось обновить проект";
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
      const message = error instanceof Error ? error.message : "Не удалось удалить проект";
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

// Get enabled features for current user (for sidebar filtering)
export function useEnabledFeatures() {
  return useQuery({
    queryKey: tenantsKeys.enabledFeatures(),
    queryFn: () => tenantsApi.getEnabledFeatures(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
}
