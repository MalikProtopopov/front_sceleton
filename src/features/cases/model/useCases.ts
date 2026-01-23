"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { casesApi, casesKeys } from "../api/casesApi";
import { ROUTES } from "@/shared/config";
import type { CaseFilterParams, CreateCaseDto, UpdateCaseDto, CreateCaseLocaleDto, UpdateCaseLocaleDto } from "@/entities/case";
import { handleLocaleError } from "@/shared/lib/localeErrors";
import { handleVersionConflict, getErrorMessage } from "@/shared/lib/versionConflict";

export function useCases(params?: CaseFilterParams) {
  return useQuery({
    queryKey: casesKeys.list(params),
    queryFn: () => casesApi.getAll(params),
  });
}

export function useCase(id: string) {
  return useQuery({
    queryKey: casesKeys.detail(id),
    queryFn: () => casesApi.getById(id),
    enabled: !!id,
  });
}

export function useCreateCase() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCaseDto) => casesApi.create(data),
    onSuccess: (caseItem) => {
      queryClient.invalidateQueries({ queryKey: casesKeys.lists() });
      toast.success("Кейс создан");
      router.push(ROUTES.CASE_EDIT(caseItem.id));
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : "Не удалось создать кейс";
      toast.error(message);
    },
  });
}

export function useUpdateCase(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateCaseDto) => casesApi.update(id, data),
    onSuccess: (caseItem) => {
      queryClient.setQueryData(casesKeys.detail(id), caseItem);
      queryClient.invalidateQueries({ queryKey: casesKeys.lists() });
      toast.success("Кейс обновлен");
    },
    onError: (error) => {
      if (handleVersionConflict(error, queryClient, casesKeys.detail(id))) {
        return;
      }
      const message = getErrorMessage(error, "Не удалось обновить кейс");
      toast.error(message);
    },
  });
}

export function useDeleteCase() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => casesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: casesKeys.lists() });
      toast.success("Кейс удален");
      router.push(ROUTES.CASES);
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : "Не удалось удалить кейс";
      toast.error(message);
    },
  });
}

export function usePublishCase() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => casesApi.publish(id),
    onSuccess: (caseItem) => {
      queryClient.setQueryData(casesKeys.detail(caseItem.id), caseItem);
      queryClient.invalidateQueries({ queryKey: casesKeys.lists() });
      toast.success("Кейс опубликован");
    },
    onError: (error, id) => {
      if (handleVersionConflict(error, queryClient, casesKeys.detail(id))) {
        return;
      }
      const message = getErrorMessage(error, "Не удалось опубликовать кейс");
      toast.error(message);
    },
  });
}

export function useUnpublishCase() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => casesApi.unpublish(id),
    onSuccess: (caseItem) => {
      queryClient.setQueryData(casesKeys.detail(caseItem.id), caseItem);
      queryClient.invalidateQueries({ queryKey: casesKeys.lists() });
      toast.success("Кейс снят с публикации");
    },
    onError: (error, id) => {
      if (handleVersionConflict(error, queryClient, casesKeys.detail(id))) {
        return;
      }
      const message = getErrorMessage(error, "Не удалось снять кейс с публикации");
      toast.error(message);
    },
  });
}

// =====================
// Locale Hooks
// =====================

export function useCreateCaseLocale(caseId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCaseLocaleDto) => casesApi.createLocale(caseId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: casesKeys.detail(caseId) });
      toast.success("Локаль добавлена");
    },
    onError: (error) => {
      handleLocaleError(error);
    },
  });
}

export function useUpdateCaseLocale(caseId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ localeId, data }: { localeId: string; data: UpdateCaseLocaleDto }) =>
      casesApi.updateLocale(caseId, localeId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: casesKeys.detail(caseId) });
      toast.success("Локаль обновлена");
    },
    onError: (error) => {
      handleLocaleError(error);
    },
  });
}

export function useDeleteCaseLocale(caseId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (localeId: string) => casesApi.deleteLocale(caseId, localeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: casesKeys.detail(caseId) });
      toast.success("Локаль удалена");
    },
    onError: (error) => {
      handleLocaleError(error);
    },
  });
}

