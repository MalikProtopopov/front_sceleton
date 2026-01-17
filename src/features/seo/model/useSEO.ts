"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { seoApi, seoKeys } from "../api/seoApi";
import type { 
  CreateSEORouteDto, 
  UpdateSEORouteDto,
  CreateRedirectDto,
  UpdateRedirectDto,
  RedirectFilterParams 
} from "@/entities/seo";

// SEO Routes hooks
export function useSEORoutes() {
  return useQuery({
    queryKey: seoKeys.routes(),
    queryFn: () => seoApi.getRoutes(),
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
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateSEORouteDto) => seoApi.upsertRoute(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: seoKeys.routes() });
      toast.success("SEO настройки сохранены");
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : "Не удалось сохранить SEO настройки";
      toast.error(message);
    },
  });
}

export function useUpdateSEORoute(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateSEORouteDto) => seoApi.updateRoute(id, data),
    onSuccess: (route) => {
      queryClient.setQueryData(seoKeys.route(id), route);
      queryClient.invalidateQueries({ queryKey: seoKeys.routes() });
      toast.success("SEO настройки обновлены");
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : "Не удалось обновить SEO настройки";
      toast.error(message);
    },
  });
}

export function useDeleteSEORoute() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => seoApi.deleteRoute(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: seoKeys.routes() });
      toast.success("SEO настройки удалены");
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : "Не удалось удалить SEO настройки";
      toast.error(message);
    },
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
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateRedirectDto) => seoApi.createRedirect(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: seoKeys.redirects() });
      toast.success("Редирект создан");
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : "Не удалось создать редирект";
      toast.error(message);
    },
  });
}

export function useUpdateRedirect(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateRedirectDto) => seoApi.updateRedirect(id, data),
    onSuccess: (redirect) => {
      queryClient.setQueryData(seoKeys.redirect(id), redirect);
      queryClient.invalidateQueries({ queryKey: seoKeys.redirects() });
      toast.success("Редирект обновлен");
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : "Не удалось обновить редирект";
      toast.error(message);
    },
  });
}

export function useDeleteRedirect() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => seoApi.deleteRedirect(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: seoKeys.redirects() });
      toast.success("Редирект удален");
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : "Не удалось удалить редирект";
      toast.error(message);
    },
  });
}

export function useToggleRedirect() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => 
      seoApi.updateRedirect(id, { is_active: isActive }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: seoKeys.redirects() });
      toast.success("Статус редиректа изменен");
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : "Не удалось изменить статус";
      toast.error(message);
    },
  });
}

