"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useAppMutation, createContentBlockHooks, createLocaleHooks } from "@/shared/lib";
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
  return useAppMutation({
    mutationFn: (data: CreateServiceDto) => servicesApi.create(data),
    successMessage: "Услуга создана",
    errorMessage: "Не удалось создать услугу",
    invalidateKeys: [servicesKeys.lists()],
    onSuccess: (service) => {
      router.push(ROUTES.SERVICE_EDIT(service.id));
    },
  });
}

export function useUpdateService(id: string) {
  const queryClient = useQueryClient();
  return useAppMutation({
    mutationFn: (data: UpdateServiceDto) => servicesApi.update(id, data),
    successMessage: "Услуга обновлена",
    errorMessage: "Не удалось обновить услугу",
    invalidateKeys: [servicesKeys.lists()],
    versionConflictKey: servicesKeys.detail(id),
    onSuccess: (service) => {
      queryClient.setQueryData(servicesKeys.detail(id), service);
    },
  });
}

export function useDeleteService() {
  const router = useRouter();
  return useAppMutation({
    mutationFn: (id: string) => servicesApi.delete(id),
    successMessage: "Услуга удалена",
    errorMessage: "Не удалось удалить услугу",
    invalidateKeys: [servicesKeys.lists()],
    onSuccess: () => {
      router.push(ROUTES.SERVICES);
    },
  });
}

export function useToggleServicePublished(id: string) {
  const queryClient = useQueryClient();
  return useAppMutation({
    mutationFn: ({ isPublished, version }: { isPublished: boolean; version: number }) =>
      servicesApi.update(id, { is_published: isPublished, version }),
    successMessage: (service) =>
      service.is_published ? "Услуга опубликована" : "Услуга снята с публикации",
    errorMessage: "Не удалось изменить статус",
    invalidateKeys: [servicesKeys.lists()],
    versionConflictKey: servicesKeys.detail(id),
    onSuccess: (service) => {
      queryClient.setQueryData(servicesKeys.detail(id), service);
    },
  });
}

// =====================
// Price Hooks
// =====================

export function useAddServicePrice(serviceId: string) {
  return useAppMutation({
    mutationFn: (data: CreateServicePriceDto) => servicesApi.addPrice(serviceId, data),
    successMessage: "Цена добавлена",
    errorMessage: "Не удалось добавить цену",
    invalidateKeys: [servicesKeys.detail(serviceId)],
  });
}

export function useUpdateServicePrice(serviceId: string) {
  return useAppMutation({
    mutationFn: ({ priceId, data }: { priceId: string; data: UpdateServicePriceDto }) =>
      servicesApi.updatePrice(serviceId, priceId, data),
    successMessage: "Цена обновлена",
    errorMessage: "Не удалось обновить цену",
    invalidateKeys: [servicesKeys.detail(serviceId)],
  });
}

export function useDeleteServicePrice(serviceId: string) {
  return useAppMutation({
    mutationFn: (priceId: string) => servicesApi.deletePrice(serviceId, priceId),
    successMessage: "Цена удалена",
    errorMessage: "Не удалось удалить цену",
    invalidateKeys: [servicesKeys.detail(serviceId)],
  });
}

// =====================
// Tag Hooks
// =====================

export function useAddServiceTag(serviceId: string) {
  return useAppMutation({
    mutationFn: (data: CreateServiceTagDto) => servicesApi.addTag(serviceId, data),
    successMessage: "Тег добавлен",
    errorMessage: "Не удалось добавить тег",
    invalidateKeys: [servicesKeys.detail(serviceId)],
  });
}

export function useUpdateServiceTag(serviceId: string) {
  return useAppMutation({
    mutationFn: ({ tagId, data }: { tagId: string; data: UpdateServiceTagDto }) =>
      servicesApi.updateTag(serviceId, tagId, data),
    successMessage: "Тег обновлен",
    errorMessage: "Не удалось обновить тег",
    invalidateKeys: [servicesKeys.detail(serviceId)],
  });
}

export function useDeleteServiceTag(serviceId: string) {
  return useAppMutation({
    mutationFn: (tagId: string) => servicesApi.deleteTag(serviceId, tagId),
    successMessage: "Тег удален",
    errorMessage: "Не удалось удалить тег",
    invalidateKeys: [servicesKeys.detail(serviceId)],
  });
}

// =====================
// Locale Hooks
// =====================

export const {
  useCreateLocale: useCreateServiceLocale,
  useUpdateLocale: useUpdateServiceLocale,
  useDeleteLocale: useDeleteServiceLocale,
} = createLocaleHooks<CreateServiceLocaleDto, UpdateServiceLocaleDto>(servicesApi, servicesKeys.detail);

// =====================
// Content Block Hooks
// =====================

export const {
  useContentBlocks: useServiceContentBlocks,
  useCreateContentBlock: useCreateServiceContentBlock,
  useUpdateContentBlock: useUpdateServiceContentBlock,
  useDeleteContentBlock: useDeleteServiceContentBlock,
  useReorderContentBlocks: useReorderServiceContentBlocks,
} = createContentBlockHooks(servicesApi, servicesKeys);
