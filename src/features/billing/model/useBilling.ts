"use client";

import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAppMutation } from "@/shared/lib";
import { billingApi, billingKeys } from "../api/billingApi";
import type { CreateUpgradeRequestDto } from "@/entities/billing";

export function useMyPlan() {
  return useQuery({
    queryKey: billingKeys.myPlan(),
    queryFn: () => billingApi.getMyPlan(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useMyModules() {
  return useQuery({
    queryKey: billingKeys.myModules(),
    queryFn: () => billingApi.getMyModules(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useMyLimits() {
  return useQuery({
    queryKey: billingKeys.myLimits(),
    queryFn: () => billingApi.getMyLimits(),
    staleTime: 60 * 1000,
  });
}

export function usePublicPlans() {
  return useQuery({
    queryKey: billingKeys.publicPlans(),
    queryFn: () => billingApi.getPublicPlans(),
    staleTime: 10 * 60 * 1000,
  });
}

export function usePublicModules() {
  return useQuery({
    queryKey: billingKeys.publicModules(),
    queryFn: () => billingApi.getPublicModules(),
    staleTime: 10 * 60 * 1000,
  });
}

export function usePublicBundles() {
  return useQuery({
    queryKey: billingKeys.publicBundles(),
    queryFn: () => billingApi.getPublicBundles(),
    staleTime: 10 * 60 * 1000,
  });
}

export function useCreateUpgradeRequest() {
  return useAppMutation({
    mutationFn: (data: CreateUpgradeRequestDto) => billingApi.createUpgradeRequest(data),
    successMessage: "Заявка отправлена",
    invalidateKeys: [billingKeys.upgradeRequests()],
    onError: (error: Error) => {
      const err = error as Error & { status?: number; retry_after?: number };
      if (err.status === 429) {
        const minutes = Math.ceil((err.retry_after || 3600) / 60);
        toast.error(`Слишком много заявок. Попробуйте через ${minutes} мин.`);
        return;
      }
      toast.error("Не удалось отправить заявку");
    },
  });
}

export function useUpgradeRequests() {
  return useQuery({
    queryKey: billingKeys.upgradeRequests(),
    queryFn: () => billingApi.getUpgradeRequests(),
  });
}
