"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
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
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateInquiryFormDto) => inquiryFormsApi.create(data),
    onSuccess: (form) => {
      queryClient.invalidateQueries({ queryKey: inquiryFormsKeys.lists() });
      toast.success("Форма создана");
      router.push(ROUTES.LEAD_FORM_EDIT(form.id));
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : "Не удалось создать форму";
      toast.error(message);
    },
  });
}

export function useUpdateInquiryForm(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateInquiryFormDto) => inquiryFormsApi.update(id, data),
    onSuccess: (form) => {
      queryClient.setQueryData(inquiryFormsKeys.detail(id), form);
      queryClient.invalidateQueries({ queryKey: inquiryFormsKeys.lists() });
      toast.success("Форма обновлена");
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : "Не удалось обновить форму";
      toast.error(message);
    },
  });
}

export function useDeleteInquiryForm() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => inquiryFormsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inquiryFormsKeys.lists() });
      toast.success("Форма удалена");
      router.push(ROUTES.LEAD_FORMS);
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : "Не удалось удалить форму";
      toast.error(message);
    },
  });
}

