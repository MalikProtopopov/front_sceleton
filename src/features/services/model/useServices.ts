"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { servicesApi, servicesKeys } from "../api/servicesApi";
import { ROUTES } from "@/shared/config";
import type {
  ServiceFilterParams,
  CreateServiceDto,
  UpdateServiceDto,
  CreateServiceLocaleDto,
  UpdateServiceLocaleDto,
  CreateServicePriceDto,
  UpdateServicePriceDto,
  CreateServiceTagDto,
  UpdateServiceTagDto,
} from "@/entities/service";
import { handleLocaleError } from "@/shared/lib/localeErrors";

export function useServicesList(params?: ServiceFilterParams) {
  return useQuery({
    queryKey: servicesKeys.list(params),
    queryFn: () => servicesApi.getAll(params),
  });
}

export function useService(id: string) {
  return useQuery({
    queryKey: servicesKeys.detail(id),
    queryFn: () => servicesApi.getById(id),
    enabled: !!id,
  });
}

export function useCreateService() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateServiceDto) => servicesApi.create(data),
    onSuccess: (service) => {
      queryClient.invalidateQueries({ queryKey: servicesKeys.lists() });
      toast.success("Услуга создана");
      router.push(ROUTES.SERVICE_EDIT(service.id));
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : "Не удалось создать услугу";
      toast.error(message);
    },
  });
}

export function useUpdateService(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateServiceDto) => servicesApi.update(id, data),
    onSuccess: (service) => {
      queryClient.setQueryData(servicesKeys.detail(id), service);
      queryClient.invalidateQueries({ queryKey: servicesKeys.lists() });
      toast.success("Услуга обновлена");
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : "Не удалось обновить услугу";
      toast.error(message);
    },
  });
}

export function useDeleteService() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => servicesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: servicesKeys.lists() });
      toast.success("Услуга удалена");
      router.push(ROUTES.SERVICES);
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : "Не удалось удалить услугу";
      toast.error(message);
    },
  });
}

export function useToggleServicePublished(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ isPublished, version }: { isPublished: boolean; version: number }) =>
      servicesApi.update(id, { is_published: isPublished, version }),
    onSuccess: (service) => {
      queryClient.setQueryData(servicesKeys.detail(id), service);
      queryClient.invalidateQueries({ queryKey: servicesKeys.lists() });
      toast.success(service.is_published ? "Услуга опубликована" : "Услуга снята с публикации");
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : "Не удалось изменить статус";
      toast.error(message);
    },
  });
}

// =====================
// Price Hooks
// =====================

export function useAddServicePrice(serviceId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateServicePriceDto) => servicesApi.addPrice(serviceId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: servicesKeys.detail(serviceId) });
      toast.success("Цена добавлена");
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : "Не удалось добавить цену";
      toast.error(message);
    },
  });
}

export function useUpdateServicePrice(serviceId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ priceId, data }: { priceId: string; data: UpdateServicePriceDto }) =>
      servicesApi.updatePrice(serviceId, priceId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: servicesKeys.detail(serviceId) });
      toast.success("Цена обновлена");
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : "Не удалось обновить цену";
      toast.error(message);
    },
  });
}

export function useDeleteServicePrice(serviceId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (priceId: string) => servicesApi.deletePrice(serviceId, priceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: servicesKeys.detail(serviceId) });
      toast.success("Цена удалена");
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : "Не удалось удалить цену";
      toast.error(message);
    },
  });
}

// =====================
// Tag Hooks
// =====================

export function useAddServiceTag(serviceId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateServiceTagDto) => servicesApi.addTag(serviceId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: servicesKeys.detail(serviceId) });
      toast.success("Тег добавлен");
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : "Не удалось добавить тег";
      toast.error(message);
    },
  });
}

export function useUpdateServiceTag(serviceId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ tagId, data }: { tagId: string; data: UpdateServiceTagDto }) =>
      servicesApi.updateTag(serviceId, tagId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: servicesKeys.detail(serviceId) });
      toast.success("Тег обновлен");
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : "Не удалось обновить тег";
      toast.error(message);
    },
  });
}

export function useDeleteServiceTag(serviceId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (tagId: string) => servicesApi.deleteTag(serviceId, tagId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: servicesKeys.detail(serviceId) });
      toast.success("Тег удален");
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : "Не удалось удалить тег";
      toast.error(message);
    },
  });
}

// =====================
// Locale Hooks
// =====================

export function useCreateServiceLocale(serviceId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateServiceLocaleDto) => servicesApi.createLocale(serviceId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: servicesKeys.detail(serviceId) });
      toast.success("Локаль добавлена");
    },
    onError: (error) => {
      handleLocaleError(error);
    },
  });
}

export function useUpdateServiceLocale(serviceId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ localeId, data }: { localeId: string; data: UpdateServiceLocaleDto }) =>
      servicesApi.updateLocale(serviceId, localeId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: servicesKeys.detail(serviceId) });
      toast.success("Локаль обновлена");
    },
    onError: (error) => {
      handleLocaleError(error);
    },
  });
}

export function useDeleteServiceLocale(serviceId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (localeId: string) => servicesApi.deleteLocale(serviceId, localeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: servicesKeys.detail(serviceId) });
      toast.success("Локаль удалена");
    },
    onError: (error) => {
      handleLocaleError(error);
    },
  });
}

