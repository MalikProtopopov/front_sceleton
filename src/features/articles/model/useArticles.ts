"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { articlesApi, articlesKeys, topicsKeys } from "../api/articlesApi";
import { ROUTES } from "@/shared/config";
import type { ArticleFilterParams, CreateArticleDto, UpdateArticleDto, CreateArticleLocaleDto, UpdateArticleLocaleDto } from "@/entities/article";
import { handleLocaleError } from "@/shared/lib/localeErrors";
import { handleVersionConflict, getErrorMessage } from "@/shared/lib/versionConflict";

export function useArticles(params?: ArticleFilterParams) {
  return useQuery({
    queryKey: articlesKeys.list(params),
    queryFn: () => articlesApi.getAll(params),
  });
}

export function useArticle(id: string) {
  return useQuery({
    queryKey: articlesKeys.detail(id),
    queryFn: () => articlesApi.getById(id),
    enabled: !!id,
  });
}

export function useCreateArticle() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateArticleDto) => articlesApi.create(data),
    onSuccess: (article) => {
      queryClient.invalidateQueries({ queryKey: articlesKeys.lists() });
      toast.success("Статья создана");
      router.push(ROUTES.ARTICLE_EDIT(article.id));
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : "Не удалось создать статью";
      toast.error(message);
    },
  });
}

export function useUpdateArticle(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateArticleDto) => articlesApi.update(id, data),
    onSuccess: (article) => {
      queryClient.setQueryData(articlesKeys.detail(id), article);
      queryClient.invalidateQueries({ queryKey: articlesKeys.lists() });
      toast.success("Статья обновлена");
    },
    onError: (error) => {
      // Handle version conflict - reload fresh data
      if (handleVersionConflict(error, queryClient, articlesKeys.detail(id))) {
        return;
      }
      const message = getErrorMessage(error, "Не удалось обновить статью");
      toast.error(message);
    },
  });
}

export function useDeleteArticle() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => articlesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: articlesKeys.lists() });
      toast.success("Статья удалена");
      router.push(ROUTES.ARTICLES);
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : "Не удалось удалить статью";
      toast.error(message);
    },
  });
}

export function usePublishArticle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => articlesApi.publish(id),
    onSuccess: (article) => {
      queryClient.setQueryData(articlesKeys.detail(article.id), article);
      queryClient.invalidateQueries({ queryKey: articlesKeys.lists() });
      toast.success("Статья опубликована");
    },
    onError: (error, id) => {
      if (handleVersionConflict(error, queryClient, articlesKeys.detail(id))) {
        return;
      }
      const message = getErrorMessage(error, "Не удалось опубликовать статью");
      toast.error(message);
    },
  });
}

export function useUnpublishArticle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => articlesApi.unpublish(id),
    onSuccess: (article) => {
      queryClient.setQueryData(articlesKeys.detail(article.id), article);
      queryClient.invalidateQueries({ queryKey: articlesKeys.lists() });
      toast.success("Статья снята с публикации");
    },
    onError: (error, id) => {
      if (handleVersionConflict(error, queryClient, articlesKeys.detail(id))) {
        return;
      }
      const message = getErrorMessage(error, "Не удалось снять статью с публикации");
      toast.error(message);
    },
  });
}

export function useTopics() {
  return useQuery({
    queryKey: topicsKeys.list(),
    queryFn: () => articlesApi.getTopics(),
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
}

// =====================
// Locale Hooks
// =====================

export function useCreateArticleLocale(articleId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateArticleLocaleDto) => articlesApi.createLocale(articleId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: articlesKeys.detail(articleId) });
      toast.success("Локаль добавлена");
    },
    onError: (error) => {
      handleLocaleError(error);
    },
  });
}

export function useUpdateArticleLocale(articleId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ localeId, data }: { localeId: string; data: UpdateArticleLocaleDto }) =>
      articlesApi.updateLocale(articleId, localeId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: articlesKeys.detail(articleId) });
      toast.success("Локаль обновлена");
    },
    onError: (error) => {
      handleLocaleError(error);
    },
  });
}

export function useDeleteArticleLocale(articleId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (localeId: string) => articlesApi.deleteLocale(articleId, localeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: articlesKeys.detail(articleId) });
      toast.success("Локаль удалена");
    },
    onError: (error) => {
      handleLocaleError(error);
    },
  });
}

