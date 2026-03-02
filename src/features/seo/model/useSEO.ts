"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAppMutation } from "@/shared/lib";
import { seoApi, seoKeys } from "../api/seoApi";
import type { 
  CreateSEORouteDto, 
  UpdateSEORouteDto,
  CreateRedirectDto,
  UpdateRedirectDto,
  RedirectFilterParams,
  SEORouteFilterParams
} from "@/entities/seo";

// SEO Routes hooks
export function useSEORoutes(params?: SEORouteFilterParams) {
  return useQuery({
    queryKey: seoKeys.routesList(params),
    queryFn: () => seoApi.getRoutes(params),
  });
}

export function useSEORoute(id: string) {
  return useQuery({
    queryKey: seoKeys.route(id),
    queryFn: () => seoApi.getRouteById(id),
    enabled: !!id,
  });
}

export function useUpsertSEORoute() {
  return useAppMutation({
    mutationFn: (data: CreateSEORouteDto) => seoApi.upsertRoute(data),
    successMessage: "SEO настройки сохранены",
    errorMessage: "Не удалось сохранить SEO настройки",
    invalidateKeys: [seoKeys.routes()],
  });
}

export function useUpdateSEORoute(id: string) {
  const queryClient = useQueryClient();
  return useAppMutation({
    mutationFn: (data: UpdateSEORouteDto) => seoApi.updateRoute(id, data),
    successMessage: "SEO настройки обновлены",
    errorMessage: "Не удалось обновить SEO настройки",
    invalidateKeys: [seoKeys.routes()],
    onSuccess: (route) => {
      queryClient.setQueryData(seoKeys.route(id), route);
    },
  });
}

export function useDeleteSEORoute() {
  return useAppMutation({
    mutationFn: (id: string) => seoApi.deleteRoute(id),
    successMessage: "SEO настройки удалены",
    errorMessage: "Не удалось удалить SEO настройки",
    invalidateKeys: [seoKeys.routes()],
  });
}

// Redirects hooks
export function useRedirects(params?: RedirectFilterParams) {
  return useQuery({
    queryKey: seoKeys.redirectList(params),
    queryFn: () => seoApi.getRedirects(params),
  });
}

export function useRedirect(id: string) {
  return useQuery({
    queryKey: seoKeys.redirect(id),
    queryFn: () => seoApi.getRedirectById(id),
    enabled: !!id,
  });
}

export function useCreateRedirect() {
  return useAppMutation({
    mutationFn: (data: CreateRedirectDto) => seoApi.createRedirect(data),
    successMessage: "Редирект создан",
    errorMessage: "Не удалось создать редирект",
    invalidateKeys: [seoKeys.redirects()],
  });
}

export function useUpdateRedirect(id: string) {
  const queryClient = useQueryClient();
  return useAppMutation({
    mutationFn: (data: UpdateRedirectDto) => seoApi.updateRedirect(id, data),
    successMessage: "Редирект обновлен",
    errorMessage: "Не удалось обновить редирект",
    invalidateKeys: [seoKeys.redirects()],
    onSuccess: (redirect) => {
      queryClient.setQueryData(seoKeys.redirect(id), redirect);
    },
  });
}

export function useDeleteRedirect() {
  return useAppMutation({
    mutationFn: (id: string) => seoApi.deleteRedirect(id),
    successMessage: "Редирект удален",
    errorMessage: "Не удалось удалить редирект",
    invalidateKeys: [seoKeys.redirects()],
  });
}

export function useToggleRedirect() {
  return useAppMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => 
      seoApi.updateRedirect(id, { is_active: isActive }),
    successMessage: "Статус редиректа изменен",
    errorMessage: "Не удалось изменить статус",
    invalidateKeys: [seoKeys.redirects()],
  });
}
