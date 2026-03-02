"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useAppMutation, createLocaleHooks } from "@/shared/lib";
import { faqApi, faqKeys } from "../api/faqApi";
import { ROUTES } from "@/shared/config";
import type { FAQFilterParams, CreateFAQDto, UpdateFAQDto, CreateFAQLocaleDto, UpdateFAQLocaleDto } from "@/entities/faq";

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
  return useAppMutation({
    mutationFn: (data: CreateFAQDto) => faqApi.create(data),
    successMessage: "FAQ создан",
    errorMessage: "Не удалось создать FAQ",
    invalidateKeys: [faqKeys.lists()],
    onSuccess: (faq) => {
      router.push(ROUTES.FAQ_EDIT(faq.id));
    },
  });
}

export function useUpdateFAQ(id: string) {
  const queryClient = useQueryClient();
  return useAppMutation({
    mutationFn: (data: UpdateFAQDto) => faqApi.update(id, data),
    successMessage: "FAQ обновлен",
    errorMessage: "Не удалось обновить FAQ",
    invalidateKeys: [faqKeys.lists()],
    versionConflictKey: faqKeys.detail(id),
    onSuccess: (faq) => {
      queryClient.setQueryData(faqKeys.detail(id), faq);
    },
  });
}

export function useDeleteFAQ() {
  const router = useRouter();
  return useAppMutation({
    mutationFn: (id: string) => faqApi.delete(id),
    successMessage: "FAQ удален",
    errorMessage: "Не удалось удалить FAQ",
    invalidateKeys: [faqKeys.lists()],
    onSuccess: () => router.push(ROUTES.FAQ),
  });
}

export function useToggleFAQPublished(id: string) {
  const queryClient = useQueryClient();
  return useAppMutation({
    mutationFn: ({ isPublished, version }: { isPublished: boolean; version: number }) =>
      faqApi.update(id, { is_published: isPublished, version }),
    successMessage: (faq) =>
      faq.is_published ? "FAQ опубликован" : "FAQ снят с публикации",
    errorMessage: "Не удалось изменить статус",
    invalidateKeys: [faqKeys.lists()],
    versionConflictKey: faqKeys.detail(id),
    onSuccess: (faq) => {
      queryClient.setQueryData(faqKeys.detail(id), faq);
    },
  });
}

// =====================
// Locale Hooks
// =====================

export const {
  useCreateLocale: useCreateFAQLocale,
  useUpdateLocale: useUpdateFAQLocale,
  useDeleteLocale: useDeleteFAQLocale,
} = createLocaleHooks<CreateFAQLocaleDto, UpdateFAQLocaleDto>(faqApi, faqKeys.detail);
