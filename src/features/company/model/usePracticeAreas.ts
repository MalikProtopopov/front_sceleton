"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useAppMutation, createLocaleHooks } from "@/shared/lib";
import { practiceAreasApi, companyKeys } from "../api/companyApi";
import { ROUTES } from "@/shared/config";
import type { CreatePracticeAreaDto, UpdatePracticeAreaDto, CreatePracticeAreaLocaleDto, UpdatePracticeAreaLocaleDto } from "@/entities/company";

export function usePracticeAreasList() {
  return useQuery({
    queryKey: companyKeys.practiceAreas.list(),
    queryFn: () => practiceAreasApi.getAll(),
  });
}

export function usePracticeArea(id: string) {
  return useQuery({
    queryKey: companyKeys.practiceAreas.detail(id),
    queryFn: () => practiceAreasApi.getById(id),
    enabled: !!id,
  });
}

export function useCreatePracticeArea() {
  const router = useRouter();
  return useAppMutation({
    mutationFn: (data: CreatePracticeAreaDto) => practiceAreasApi.create(data),
    successMessage: "Направление создано",
    errorMessage: "Не удалось создать направление",
    invalidateKeys: [companyKeys.practiceAreas.list()],
    onSuccess: (item) => {
      router.push(ROUTES.PRACTICE_AREA_EDIT(item.id));
    },
  });
}

export function useUpdatePracticeArea(id: string) {
  const queryClient = useQueryClient();
  return useAppMutation({
    mutationFn: (data: UpdatePracticeAreaDto) => practiceAreasApi.update(id, data),
    successMessage: "Направление обновлено",
    errorMessage: "Не удалось обновить направление",
    invalidateKeys: [companyKeys.practiceAreas.list()],
    onSuccess: (item) => {
      queryClient.setQueryData(companyKeys.practiceAreas.detail(id), item);
    },
  });
}

export function useDeletePracticeArea() {
  const router = useRouter();
  return useAppMutation({
    mutationFn: (id: string) => practiceAreasApi.delete(id),
    successMessage: "Направление удалено",
    errorMessage: "Не удалось удалить направление",
    invalidateKeys: [companyKeys.practiceAreas.list()],
    onSuccess: () => router.push(ROUTES.PRACTICE_AREAS),
  });
}

// =====================
// Locale Hooks
// =====================

export const {
  useCreateLocale: useCreatePracticeAreaLocale,
  useUpdateLocale: useUpdatePracticeAreaLocale,
  useDeleteLocale: useDeletePracticeAreaLocale,
} = createLocaleHooks<CreatePracticeAreaLocaleDto, UpdatePracticeAreaLocaleDto>(practiceAreasApi, companyKeys.practiceAreas.detail);
