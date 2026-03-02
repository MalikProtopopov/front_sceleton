"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useAppMutation } from "@/shared/lib";
import { leadsApi, leadsKeys } from "../api/leadsApi";
import { ROUTES } from "@/shared/config";
import type { InquiryFilterParams, UpdateInquiryDto, InquiryStatus } from "@/entities/inquiry";

export function useLeadsList(params?: InquiryFilterParams) {
  return useQuery({
    queryKey: leadsKeys.list(params),
    queryFn: () => leadsApi.getAll(params),
  });
}

export function useLead(id: string) {
  return useQuery({
    queryKey: leadsKeys.detail(id),
    queryFn: () => leadsApi.getById(id),
    enabled: !!id,
  });
}

export function useUpdateLead(id: string) {
  const queryClient = useQueryClient();
  return useAppMutation({
    mutationFn: (data: UpdateInquiryDto) => leadsApi.update(id, data),
    successMessage: "Лид обновлен",
    errorMessage: "Не удалось обновить лид",
    invalidateKeys: [leadsKeys.lists()],
    onSuccess: (inquiry) => {
      queryClient.setQueryData(leadsKeys.detail(id), inquiry);
    },
  });
}

export function useUpdateLeadStatus(id: string) {
  const queryClient = useQueryClient();
  return useAppMutation({
    mutationFn: (status: InquiryStatus) => leadsApi.update(id, { status }),
    successMessage: "Статус обновлен",
    errorMessage: "Не удалось изменить статус",
    invalidateKeys: [leadsKeys.lists()],
    onSuccess: (inquiry) => {
      queryClient.setQueryData(leadsKeys.detail(id), inquiry);
    },
  });
}

export function useDeleteLead() {
  const router = useRouter();
  return useAppMutation({
    mutationFn: (id: string) => leadsApi.delete(id),
    successMessage: "Лид удален",
    errorMessage: "Не удалось удалить лид",
    invalidateKeys: [leadsKeys.lists()],
    onSuccess: () => router.push(ROUTES.LEADS),
  });
}

export function useLeadsAnalytics(days: number = 30) {
  return useQuery({
    queryKey: leadsKeys.analytics(days),
    queryFn: () => leadsApi.getAnalytics(days),
  });
}

// Inquiry Forms hooks
export function useInquiryForms() {
  return useQuery({
    queryKey: leadsKeys.forms(),
    queryFn: () => leadsApi.getForms(),
    staleTime: 5 * 60 * 1000,
  });
}
