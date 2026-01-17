"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { settingsApi, settingsKeys } from "../api/settingsApi";
import type { UpdateTenantDto, UpdateTenantSettingsDto, UpdateFeatureFlagDto } from "@/entities/tenant";

export function useTenant(tenantId: string) {
  return useQuery({
    queryKey: settingsKeys.tenant(tenantId),
    queryFn: () => settingsApi.getTenant(tenantId),
    enabled: !!tenantId,
  });
}

export function useUpdateTenant(tenantId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateTenantDto) => settingsApi.updateTenant(tenantId, data),
    onSuccess: (tenant) => {
      queryClient.setQueryData(settingsKeys.tenant(tenantId), tenant);
      toast.success("Настройки организации сохранены");
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : "Не удалось сохранить настройки";
      toast.error(message);
    },
  });
}

export function useUpdateTenantSettings(tenantId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateTenantSettingsDto) => settingsApi.updateSettings(tenantId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.tenant(tenantId) });
      toast.success("Настройки сохранены");
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : "Не удалось сохранить настройки";
      toast.error(message);
    },
  });
}

export function useFeatureFlags(tenantId: string) {
  return useQuery({
    queryKey: settingsKeys.featureFlags(tenantId),
    queryFn: () => settingsApi.getFeatureFlags(tenantId),
    enabled: !!tenantId,
  });
}

export function useUpdateFeatureFlag(tenantId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ featureName, data }: { featureName: string; data: UpdateFeatureFlagDto }) =>
      settingsApi.updateFeatureFlag(featureName, tenantId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: settingsKeys.featureFlags(tenantId) });
      toast.success("Модуль обновлен");
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : "Не удалось обновить модуль";
      toast.error(message);
    },
  });
}

export interface ChangePasswordDto {
  current_password: string;
  new_password: string;
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (data: ChangePasswordDto) => settingsApi.changePassword(data),
    onSuccess: () => {
      toast.success("Пароль успешно изменен");
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : "Не удалось изменить пароль";
      toast.error(message);
    },
  });
}

