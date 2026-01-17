"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { practiceAreasApi, companyKeys } from "../api/companyApi";
import { ROUTES } from "@/shared/config";
import type { CreatePracticeAreaDto, UpdatePracticeAreaDto, CreatePracticeAreaLocaleDto, UpdatePracticeAreaLocaleDto } from "@/entities/company";
import { handleLocaleError } from "@/shared/lib/localeErrors";

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
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePracticeAreaDto) => practiceAreasApi.create(data),
    onSuccess: (item) => {
      queryClient.invalidateQueries({ queryKey: companyKeys.practiceAreas.list() });
      toast.success("Направление создано");
      router.push(ROUTES.PRACTICE_AREA_EDIT(item.id));
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : "Не удалось создать направление";
      toast.error(message);
    },
  });
}

export function useUpdatePracticeArea(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdatePracticeAreaDto) => practiceAreasApi.update(id, data),
    onSuccess: (item) => {
      queryClient.setQueryData(companyKeys.practiceAreas.detail(id), item);
      queryClient.invalidateQueries({ queryKey: companyKeys.practiceAreas.list() });
      toast.success("Направление обновлено");
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : "Не удалось обновить направление";
      toast.error(message);
    },
  });
}

export function useDeletePracticeArea() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => practiceAreasApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: companyKeys.practiceAreas.list() });
      toast.success("Направление удалено");
      router.push(ROUTES.PRACTICE_AREAS);
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : "Не удалось удалить направление";
      toast.error(message);
    },
  });
}

// =====================
// Locale Hooks
// =====================

export function useCreatePracticeAreaLocale(practiceAreaId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePracticeAreaLocaleDto) => practiceAreasApi.createLocale(practiceAreaId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: companyKeys.practiceAreas.detail(practiceAreaId) });
      toast.success("Локаль добавлена");
    },
    onError: (error) => {
      handleLocaleError(error);
    },
  });
}

export function useUpdatePracticeAreaLocale(practiceAreaId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ localeId, data }: { localeId: string; data: UpdatePracticeAreaLocaleDto }) =>
      practiceAreasApi.updateLocale(practiceAreaId, localeId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: companyKeys.practiceAreas.detail(practiceAreaId) });
      toast.success("Локаль обновлена");
    },
    onError: (error) => {
      handleLocaleError(error);
    },
  });
}

export function useDeletePracticeAreaLocale(practiceAreaId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (localeId: string) => practiceAreasApi.deleteLocale(practiceAreaId, localeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: companyKeys.practiceAreas.detail(practiceAreaId) });
      toast.success("Локаль удалена");
    },
    onError: (error) => {
      handleLocaleError(error);
    },
  });
}

