"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useAppMutation } from "@/shared/lib";
import { inquiryFormsApi, inquiryFormsKeys } from "../api/inquiryFormsApi";
import { ROUTES } from "@/shared/config";
import type { CreateInquiryFormDto, UpdateInquiryFormDto } from "@/entities/inquiry-form";

export function useInquiryForms() {
  return useQuery({
    queryKey: inquiryFormsKeys.list(),
    queryFn: () => inquiryFormsApi.getAll(),
  });
}

export function useInquiryForm(id: string) {
  return useQuery({
    queryKey: inquiryFormsKeys.detail(id),
    queryFn: () => inquiryFormsApi.getById(id),
    enabled: !!id,
  });
}

export function useCreateInquiryForm() {
  const router = useRouter();
  return useAppMutation({
    mutationFn: (data: CreateInquiryFormDto) => inquiryFormsApi.create(data),
    successMessage: "Форма создана",
    errorMessage: "Не удалось создать форму",
    invalidateKeys: [inquiryFormsKeys.lists()],
    onSuccess: (form) => {
      router.push(ROUTES.LEAD_FORM_EDIT(form.id));
    },
  });
}

export function useUpdateInquiryForm(id: string) {
  const queryClient = useQueryClient();
  return useAppMutation({
    mutationFn: (data: UpdateInquiryFormDto) => inquiryFormsApi.update(id, data),
    successMessage: "Форма обновлена",
    errorMessage: "Не удалось обновить форму",
    invalidateKeys: [inquiryFormsKeys.lists()],
    onSuccess: (form) => {
      queryClient.setQueryData(inquiryFormsKeys.detail(id), form);
    },
  });
}

export function useDeleteInquiryForm() {
  const router = useRouter();
  return useAppMutation({
    mutationFn: (id: string) => inquiryFormsApi.delete(id),
    successMessage: "Форма удалена",
    errorMessage: "Не удалось удалить форму",
    invalidateKeys: [inquiryFormsKeys.lists()],
    onSuccess: () => router.push(ROUTES.LEAD_FORMS),
  });
}
