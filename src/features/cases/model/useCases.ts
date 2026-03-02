"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAppMutation, createLocaleHooks, createContentBlockHooks } from "@/shared/lib";
import { casesApi, casesKeys } from "../api/casesApi";
import { ROUTES } from "@/shared/config";
import type { CaseFilterParams, CreateCaseDto, UpdateCaseDto, CreateCaseLocaleDto, UpdateCaseLocaleDto, CreateContactDto, UpdateContactDto } from "@/entities/case";

import { handleVersionConflict, getErrorMessage } from "@/shared/lib/versionConflict";

export function useCasesList(params?: CaseFilterParams) {
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
  return useAppMutation({
    mutationFn: (data: CreateCaseDto) => casesApi.create(data),
    successMessage: "Кейс создан",
    errorMessage: "Не удалось создать кейс",
    invalidateKeys: [casesKeys.lists()],
    onSuccess: (caseItem) => {
      router.push(ROUTES.CASE_EDIT(caseItem.id));
    },
  });
}

export function useUpdateCase(id: string) {
  const queryClient = useQueryClient();
  return useAppMutation({
    mutationFn: (data: UpdateCaseDto) => casesApi.update(id, data),
    successMessage: "Кейс обновлен",
    errorMessage: "Не удалось обновить кейс",
    invalidateKeys: [casesKeys.lists()],
    versionConflictKey: casesKeys.detail(id),
    onSuccess: (caseItem) => {
      queryClient.setQueryData(casesKeys.detail(id), caseItem);
    },
  });
}

export function useDeleteCase() {
  const router = useRouter();
  return useAppMutation({
    mutationFn: (id: string) => casesApi.delete(id),
    successMessage: "Кейс удален",
    errorMessage: "Не удалось удалить кейс",
    invalidateKeys: [casesKeys.lists()],
    onSuccess: () => {
      router.push(ROUTES.CASES);
    },
  });
}

export function usePublishCase() {
  const queryClient = useQueryClient();
  return useAppMutation({
    mutationFn: (id: string) => casesApi.publish(id),
    successMessage: "Кейс опубликован",
    invalidateKeys: [casesKeys.lists()],
    onSuccess: (caseItem) => {
      queryClient.setQueryData(casesKeys.detail(caseItem.id), caseItem);
    },
    onError: (error, id) => {
      if (handleVersionConflict(error, queryClient, casesKeys.detail(id))) return;
      toast.error(getErrorMessage(error, "Не удалось опубликовать кейс"));
    },
  });
}

export function useUnpublishCase() {
  const queryClient = useQueryClient();
  return useAppMutation({
    mutationFn: (id: string) => casesApi.unpublish(id),
    successMessage: "Кейс снят с публикации",
    invalidateKeys: [casesKeys.lists()],
    onSuccess: (caseItem) => {
      queryClient.setQueryData(casesKeys.detail(caseItem.id), caseItem);
    },
    onError: (error, id) => {
      if (handleVersionConflict(error, queryClient, casesKeys.detail(id))) return;
      toast.error(getErrorMessage(error, "Не удалось снять кейс с публикации"));
    },
  });
}

// =====================
// Locale Hooks
// =====================

export const {
  useCreateLocale: useCreateCaseLocale,
  useUpdateLocale: useUpdateCaseLocale,
  useDeleteLocale: useDeleteCaseLocale,
} = createLocaleHooks<CreateCaseLocaleDto, UpdateCaseLocaleDto>(casesApi, casesKeys.detail);

// =====================
// Contact Hooks
// =====================

export function useCreateCaseContact(caseId: string) {
  return useAppMutation({
    mutationFn: (data: CreateContactDto) => casesApi.createContact(caseId, data),
    successMessage: "Контакт добавлен",
    errorMessage: "Не удалось добавить контакт",
    invalidateKeys: [casesKeys.detail(caseId)],
  });
}

export function useUpdateCaseContact(caseId: string) {
  return useAppMutation({
    mutationFn: ({ contactId, data }: { contactId: string; data: UpdateContactDto }) =>
      casesApi.updateContact(caseId, contactId, data),
    successMessage: "Контакт обновлен",
    errorMessage: "Не удалось обновить контакт",
    invalidateKeys: [casesKeys.detail(caseId)],
  });
}

export function useDeleteCaseContact(caseId: string) {
  return useAppMutation({
    mutationFn: (contactId: string) => casesApi.deleteContact(caseId, contactId),
    successMessage: "Контакт удален",
    errorMessage: "Не удалось удалить контакт",
    invalidateKeys: [casesKeys.detail(caseId)],
  });
}

// =====================
// Content Block Hooks
// =====================

export const {
  useContentBlocks: useCaseContentBlocks,
  useCreateContentBlock: useCreateCaseContentBlock,
  useUpdateContentBlock: useUpdateCaseContentBlock,
  useDeleteContentBlock: useDeleteCaseContentBlock,
  useReorderContentBlocks: useReorderCaseContentBlocks,
} = createContentBlockHooks(casesApi, casesKeys);
