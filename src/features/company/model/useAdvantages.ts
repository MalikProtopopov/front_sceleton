"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { advantagesApi, companyKeys } from "../api/companyApi";
import { ROUTES } from "@/shared/config";
import type { CreateAdvantageDto, UpdateAdvantageDto, CreateAdvantageLocaleDto, UpdateAdvantageLocaleDto } from "@/entities/company";
import { handleLocaleError } from "@/shared/lib/localeErrors";

export function useAdvantagesList() {
  return useQuery({
    queryKey: companyKeys.advantages.list(),
    queryFn: () => advantagesApi.getAll(),
  });
}

export function useAdvantage(id: string) {
  return useQuery({
    queryKey: companyKeys.advantages.detail(id),
    queryFn: () => advantagesApi.getById(id),
    enabled: !!id,
  });
}

export function useCreateAdvantage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateAdvantageDto) => advantagesApi.create(data),
    onSuccess: (item) => {
      queryClient.invalidateQueries({ queryKey: companyKeys.advantages.list() });
      toast.success("Преимущество создано");
      router.push(ROUTES.ADVANTAGE_EDIT(item.id));
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : "Не удалось создать преимущество";
      toast.error(message);
    },
  });
}

export function useUpdateAdvantage(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateAdvantageDto) => advantagesApi.update(id, data),
    onSuccess: (item) => {
      queryClient.setQueryData(companyKeys.advantages.detail(id), item);
      queryClient.invalidateQueries({ queryKey: companyKeys.advantages.list() });
      toast.success("Преимущество обновлено");
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : "Не удалось обновить преимущество";
      toast.error(message);
    },
  });
}

export function useDeleteAdvantage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => advantagesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: companyKeys.advantages.list() });
      toast.success("Преимущество удалено");
      router.push(ROUTES.ADVANTAGES);
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : "Не удалось удалить преимущество";
      toast.error(message);
    },
  });
}

// =====================
// Locale Hooks
// =====================

export function useCreateAdvantageLocale(advantageId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateAdvantageLocaleDto) => advantagesApi.createLocale(advantageId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: companyKeys.advantages.detail(advantageId) });
      toast.success("Локаль добавлена");
    },
    onError: (error) => {
      handleLocaleError(error);
    },
  });
}

export function useUpdateAdvantageLocale(advantageId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ localeId, data }: { localeId: string; data: UpdateAdvantageLocaleDto }) =>
      advantagesApi.updateLocale(advantageId, localeId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: companyKeys.advantages.detail(advantageId) });
      toast.success("Локаль обновлена");
    },
    onError: (error) => {
      handleLocaleError(error);
    },
  });
}

export function useDeleteAdvantageLocale(advantageId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (localeId: string) => advantagesApi.deleteLocale(advantageId, localeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: companyKeys.advantages.detail(advantageId) });
      toast.success("Локаль удалена");
    },
    onError: (error) => {
      handleLocaleError(error);
    },
  });
}

