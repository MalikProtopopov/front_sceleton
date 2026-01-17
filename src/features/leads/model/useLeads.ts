"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
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

  return useMutation({
    mutationFn: (data: UpdateInquiryDto) => leadsApi.update(id, data),
    onSuccess: (inquiry) => {
      queryClient.setQueryData(leadsKeys.detail(id), inquiry);
      queryClient.invalidateQueries({ queryKey: leadsKeys.lists() });
      toast.success("Лид обновлен");
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : "Не удалось обновить лид";
      toast.error(message);
    },
  });
}

export function useUpdateLeadStatus(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (status: InquiryStatus) => leadsApi.update(id, { status }),
    onSuccess: (inquiry) => {
      queryClient.setQueryData(leadsKeys.detail(id), inquiry);
      queryClient.invalidateQueries({ queryKey: leadsKeys.lists() });
      toast.success("Статус обновлен");
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : "Не удалось изменить статус";
      toast.error(message);
    },
  });
}

export function useDeleteLead() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => leadsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: leadsKeys.lists() });
      toast.success("Лид удален");
      router.push(ROUTES.LEADS);
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : "Не удалось удалить лид";
      toast.error(message);
    },
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
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
}

