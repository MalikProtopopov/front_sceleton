"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAppMutation } from "@/shared/lib";
import { settingsApi, settingsKeys } from "../api/settingsApi";
import { tenantsKeys } from "@/features/tenants/api/tenantsApi";
import type { UpdateTenantDto, UpdateTenantSettingsDto, UpdateFeatureFlagDto } from "@/entities/tenant";

export function useTenant(tenantId: string) {
  return useQuery({
    queryKey: settingsKeys.tenant(tenantId),
    queryFn: () => settingsApi.getTenant(tenantId),
    enabled: !!tenantId,
    staleTime: 0,
  });
}

export function useUpdateTenant(tenantId: string) {
  const queryClient = useQueryClient();
  return useAppMutation({
    mutationFn: (data: UpdateTenantDto) => settingsApi.updateTenant(tenantId, data),
    successMessage: "Настройки организации сохранены",
    errorMessage: "Не удалось сохранить настройки",
    onSuccess: (tenant) => {
      queryClient.setQueryData(settingsKeys.tenant(tenantId), tenant);
    },
  });
}

export function useUpdateTenantSettings(tenantId: string) {
  return useAppMutation({
    mutationFn: (data: UpdateTenantSettingsDto) => settingsApi.updateSettings(tenantId, data),
    successMessage: "Настройки сохранены",
    errorMessage: "Не удалось сохранить настройки",
    invalidateKeys: [settingsKeys.tenant(tenantId)],
  });
}

export function useFeatureFlags(tenantId: string) {
  return useQuery({
    queryKey: settingsKeys.featureFlags(tenantId),
    queryFn: () => settingsApi.getFeatureFlags(tenantId),
    enabled: !!tenantId,
    staleTime: 0,
  });
}

export function useUpdateFeatureFlag(tenantId: string) {
  const queryClient = useQueryClient();
  const queryKey = settingsKeys.featureFlags(tenantId);

  return useMutation({
    mutationFn: ({ featureName, data }: { featureName: string; data: UpdateFeatureFlagDto }) =>
      settingsApi.updateFeatureFlag(featureName, tenantId, data),
    
    // Optimistic update для мгновенного отклика UI
    onMutate: async ({ featureName, data }) => {
      await queryClient.cancelQueries({ queryKey });
      
      const previousFlags = queryClient.getQueryData(queryKey);
      
      queryClient.setQueryData(queryKey, (old: { items: Array<{ feature_name: string; enabled: boolean }> } | undefined) => {
        if (!old) return old;
        return {
          ...old,
          items: old.items.map((item) =>
            item.feature_name === featureName 
              ? { ...item, enabled: data.enabled } 
              : item
          ),
        };
      });
      
      return { previousFlags };
    },
    
    onError: (error, _variables, context) => {
      if (context?.previousFlags) {
        queryClient.setQueryData(queryKey, context.previousFlags);
      }
      const message = error instanceof Error ? error.message : "Не удалось обновить модуль";
      toast.error(message);
    },
    
    onSuccess: () => {
      toast.success("Модуль обновлен");
    },
    
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
      queryClient.invalidateQueries({ queryKey: tenantsKeys.enabledFeatures() });
    },
  });
}

export interface ChangePasswordDto {
  current_password: string;
  new_password: string;
}

export function useChangePassword() {
  return useAppMutation({
    mutationFn: (data: ChangePasswordDto) => settingsApi.changePassword(data),
    successMessage: "Пароль успешно изменен",
    errorMessage: "Не удалось изменить пароль",
  });
}

export function useUploadTenantLogo(tenantId: string) {
  const queryClient = useQueryClient();
  return useAppMutation({
    mutationFn: (file: File) => settingsApi.uploadLogo(tenantId, file),
    successMessage: "Логотип загружен",
    errorMessage: "Не удалось загрузить логотип",
    onSuccess: (tenant) => {
      queryClient.setQueryData(settingsKeys.tenant(tenantId), tenant);
    },
  });
}

export function useDeleteTenantLogo(tenantId: string) {
  return useAppMutation({
    mutationFn: () => settingsApi.deleteLogo(tenantId),
    successMessage: "Логотип удален",
    errorMessage: "Не удалось удалить логотип",
    invalidateKeys: [settingsKeys.tenant(tenantId)],
  });
}
