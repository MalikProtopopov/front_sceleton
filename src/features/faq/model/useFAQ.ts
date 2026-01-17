"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { faqApi, faqKeys } from "../api/faqApi";
import { ROUTES } from "@/shared/config";
import type { FAQFilterParams, CreateFAQDto, UpdateFAQDto, CreateFAQLocaleDto, UpdateFAQLocaleDto } from "@/entities/faq";
import { handleLocaleError } from "@/shared/lib/localeErrors";

export function useFAQList(params?: FAQFilterParams) {
  return useQuery({
    queryKey: faqKeys.list(params),
    queryFn: () => faqApi.getAll(params),
  });
}

export function useFAQ(id: string) {
  return useQuery({
    queryKey: faqKeys.detail(id),
    queryFn: () => faqApi.getById(id),
    enabled: !!id,
  });
}

export function useCreateFAQ() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateFAQDto) => faqApi.create(data),
    onSuccess: (faq) => {
      queryClient.invalidateQueries({ queryKey: faqKeys.lists() });
      toast.success("FAQ создан");
      router.push(ROUTES.FAQ_EDIT(faq.id));
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : "Не удалось создать FAQ";
      toast.error(message);
    },
  });
}

export function useUpdateFAQ(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateFAQDto) => faqApi.update(id, data),
    onSuccess: (faq) => {
      queryClient.setQueryData(faqKeys.detail(id), faq);
      queryClient.invalidateQueries({ queryKey: faqKeys.lists() });
      toast.success("FAQ обновлен");
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : "Не удалось обновить FAQ";
      toast.error(message);
    },
  });
}

export function useDeleteFAQ() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => faqApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: faqKeys.lists() });
      toast.success("FAQ удален");
      router.push(ROUTES.FAQ);
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : "Не удалось удалить FAQ";
      toast.error(message);
    },
  });
}

export function useToggleFAQPublished(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ isPublished, version }: { isPublished: boolean; version: number }) =>
      faqApi.update(id, { is_published: isPublished, version }),
    onSuccess: (faq) => {
      queryClient.setQueryData(faqKeys.detail(id), faq);
      queryClient.invalidateQueries({ queryKey: faqKeys.lists() });
      toast.success(faq.is_published ? "FAQ опубликован" : "FAQ снят с публикации");
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : "Не удалось изменить статус";
      toast.error(message);
    },
  });
}

// =====================
// Locale Hooks
// =====================

export function useCreateFAQLocale(faqId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateFAQLocaleDto) => faqApi.createLocale(faqId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: faqKeys.detail(faqId) });
      toast.success("Локаль добавлена");
    },
    onError: (error) => {
      handleLocaleError(error);
    },
  });
}

export function useUpdateFAQLocale(faqId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ localeId, data }: { localeId: string; data: UpdateFAQLocaleDto }) =>
      faqApi.updateLocale(faqId, localeId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: faqKeys.detail(faqId) });
      toast.success("Локаль обновлена");
    },
    onError: (error) => {
      handleLocaleError(error);
    },
  });
}

export function useDeleteFAQLocale(faqId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (localeId: string) => faqApi.deleteLocale(faqId, localeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: faqKeys.detail(faqId) });
      toast.success("Локаль удалена");
    },
    onError: (error) => {
      handleLocaleError(error);
    },
  });
}

