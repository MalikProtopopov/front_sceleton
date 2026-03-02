"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useAppMutation, createLocaleHooks } from "@/shared/lib";
import { advantagesApi, companyKeys } from "../api/companyApi";
import { ROUTES } from "@/shared/config";
import type { CreateAdvantageDto, UpdateAdvantageDto, CreateAdvantageLocaleDto, UpdateAdvantageLocaleDto } from "@/entities/company";

export function useAdvantagesList() {
  return useQuery({
    queryKey: companyKeys.advantages.list(),
    queryFn: () => advantagesApi.getAll(),
  });
}

export function useAdvantage(id: string) {
  return useQuery({
    queryKey: companyKeys.advantages.detail(id),
    queryFn: () => advantagesApi.getById(id),
    enabled: !!id,
  });
}

export function useCreateAdvantage() {
  const router = useRouter();
  return useAppMutation({
    mutationFn: (data: CreateAdvantageDto) => advantagesApi.create(data),
    successMessage: "Преимущество создано",
    errorMessage: "Не удалось создать преимущество",
    invalidateKeys: [companyKeys.advantages.list()],
    onSuccess: (item) => {
      router.push(ROUTES.ADVANTAGE_EDIT(item.id));
    },
  });
}

export function useUpdateAdvantage(id: string) {
  const queryClient = useQueryClient();
  return useAppMutation({
    mutationFn: (data: UpdateAdvantageDto) => advantagesApi.update(id, data),
    successMessage: "Преимущество обновлено",
    errorMessage: "Не удалось обновить преимущество",
    invalidateKeys: [companyKeys.advantages.list()],
    onSuccess: (item) => {
      queryClient.setQueryData(companyKeys.advantages.detail(id), item);
    },
  });
}

export function useDeleteAdvantage() {
  const router = useRouter();
  return useAppMutation({
    mutationFn: (id: string) => advantagesApi.delete(id),
    successMessage: "Преимущество удалено",
    errorMessage: "Не удалось удалить преимущество",
    invalidateKeys: [companyKeys.advantages.list()],
    onSuccess: () => router.push(ROUTES.ADVANTAGES),
  });
}

// =====================
// Locale Hooks
// =====================

export const {
  useCreateLocale: useCreateAdvantageLocale,
  useUpdateLocale: useUpdateAdvantageLocale,
  useDeleteLocale: useDeleteAdvantageLocale,
} = createLocaleHooks<CreateAdvantageLocaleDto, UpdateAdvantageLocaleDto>(advantagesApi, companyKeys.advantages.detail);
