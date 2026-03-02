"use client";

import { useQuery } from "@tanstack/react-query";
import { useAppMutation } from "@/shared/lib";
import { billingPlatformApi, billingPlatformKeys } from "../api/billingPlatformApi";
import { billingKeys } from "../api/billingApi";
import type {
  CreatePlanDto,
  UpdatePlanDto,
  CreateModuleDto,
  UpdateModuleDto,
  CreateBundleDto,
  UpdateBundleDto,
  ReviewUpgradeRequestDto,
  PlatformUpgradeRequestParams,
  AddTenantModuleDto,
  RemoveTenantModuleDto,
} from "@/entities/billing";

// ─── Plans ───

export function usePlatformPlans() {
  return useQuery({
    queryKey: billingPlatformKeys.plans(),
    queryFn: () => billingPlatformApi.listPlans(),
  });
}

export function useCreatePlan() {
  return useAppMutation({
    mutationFn: (data: CreatePlanDto) => billingPlatformApi.createPlan(data),
    successMessage: "Тариф создан",
    errorMessage: "Не удалось создать тариф",
    invalidateKeys: [billingPlatformKeys.plans(), billingKeys.publicPlans()],
  });
}

export function useUpdatePlan(planId: string) {
  return useAppMutation({
    mutationFn: (data: UpdatePlanDto) => billingPlatformApi.updatePlan(planId, data),
    successMessage: "Тариф обновлён",
    errorMessage: "Не удалось обновить тариф",
    invalidateKeys: [billingPlatformKeys.plans(), billingKeys.publicPlans()],
  });
}

// ─── Modules ───

export function usePlatformModules() {
  return useQuery({
    queryKey: billingPlatformKeys.modules(),
    queryFn: () => billingPlatformApi.listModules(),
  });
}

export function useCreateModule() {
  return useAppMutation({
    mutationFn: (data: CreateModuleDto) => billingPlatformApi.createModule(data),
    successMessage: "Модуль создан",
    errorMessage: "Не удалось создать модуль",
    invalidateKeys: [billingPlatformKeys.modules(), billingKeys.publicModules()],
  });
}

export function useUpdateModule(moduleId: string) {
  return useAppMutation({
    mutationFn: (data: UpdateModuleDto) => billingPlatformApi.updateModule(moduleId, data),
    successMessage: "Модуль обновлён",
    errorMessage: "Не удалось обновить модуль",
    invalidateKeys: [billingPlatformKeys.modules(), billingKeys.publicModules()],
  });
}

// ─── Bundles ───

export function usePlatformBundles() {
  return useQuery({
    queryKey: billingPlatformKeys.bundles(),
    queryFn: () => billingPlatformApi.listBundles(),
  });
}

export function useCreateBundle() {
  return useAppMutation({
    mutationFn: (data: CreateBundleDto) => billingPlatformApi.createBundle(data),
    successMessage: "Пакет создан",
    errorMessage: "Не удалось создать пакет",
    invalidateKeys: [billingPlatformKeys.bundles(), billingKeys.publicBundles()],
  });
}

export function useUpdateBundle(bundleId: string) {
  return useAppMutation({
    mutationFn: (data: UpdateBundleDto) => billingPlatformApi.updateBundle(bundleId, data),
    successMessage: "Пакет обновлён",
    errorMessage: "Не удалось обновить пакет",
    invalidateKeys: [billingPlatformKeys.bundles(), billingKeys.publicBundles()],
  });
}

// ─── Upgrade Requests ───

export function usePlatformUpgradeRequests(params?: PlatformUpgradeRequestParams) {
  return useQuery({
    queryKey: billingPlatformKeys.upgradeRequests(params),
    queryFn: () => billingPlatformApi.listUpgradeRequests(params),
  });
}

export function useReviewUpgradeRequest() {
  return useAppMutation({
    mutationFn: ({ id, data }: { id: string; data: ReviewUpgradeRequestDto }) =>
      billingPlatformApi.reviewUpgradeRequest(id, data),
    successMessage: "Заявка обработана",
    errorMessage: "Не удалось обработать заявку",
    invalidateKeys: [
      billingPlatformKeys.upgradeRequests(),
      billingKeys.upgradeRequests(),
      billingKeys.myPlan(),
      billingKeys.myModules(),
    ],
  });
}

// ─── Tenant Modules ───

export function useTenantModules(tenantId: string) {
  return useQuery({
    queryKey: billingPlatformKeys.tenantModules(tenantId),
    queryFn: () => billingPlatformApi.listTenantModules(tenantId),
    enabled: !!tenantId,
  });
}

export function useAddTenantModule(tenantId: string) {
  return useAppMutation({
    mutationFn: (data: AddTenantModuleDto) =>
      billingPlatformApi.addTenantModule(tenantId, data),
    successMessage: "Модуль добавлен",
    errorMessage: "Не удалось добавить модуль",
    invalidateKeys: [billingPlatformKeys.tenantModules(tenantId)],
  });
}

export function useRemoveTenantModule(tenantId: string) {
  return useAppMutation({
    mutationFn: (data: RemoveTenantModuleDto) =>
      billingPlatformApi.removeTenantModule(tenantId, data),
    successMessage: "Модуль удалён",
    errorMessage: "Не удалось удалить модуль",
    invalidateKeys: [billingPlatformKeys.tenantModules(tenantId)],
  });
}
