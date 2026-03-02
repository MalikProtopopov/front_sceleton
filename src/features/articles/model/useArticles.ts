"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAppMutation, createContentBlockHooks, createLocaleHooks } from "@/shared/lib";
import { articlesApi, articlesKeys, topicsKeys } from "../api/articlesApi";
import { ROUTES } from "@/shared/config";
import type { ArticleFilterParams, CreateArticleDto, UpdateArticleDto, CreateArticleLocaleDto, UpdateArticleLocaleDto } from "@/entities/article";

import { handleVersionConflict, getErrorMessage } from "@/shared/lib/versionConflict";

export function useArticlesList(params?: ArticleFilterParams) {
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
  return useAppMutation({
    mutationFn: (data: CreateArticleDto) => articlesApi.create(data),
    successMessage: "Статья создана",
    errorMessage: "Не удалось создать статью",
    invalidateKeys: [articlesKeys.lists()],
    onSuccess: (article) => {
      router.push(ROUTES.ARTICLE_EDIT(article.id));
    },
  });
}

export function useUpdateArticle(id: string) {
  const queryClient = useQueryClient();
  return useAppMutation({
    mutationFn: (data: UpdateArticleDto) => articlesApi.update(id, data),
    successMessage: "Статья обновлена",
    errorMessage: "Не удалось обновить статью",
    invalidateKeys: [articlesKeys.lists()],
    versionConflictKey: articlesKeys.detail(id),
    onSuccess: (article) => {
      queryClient.setQueryData(articlesKeys.detail(id), article);
    },
  });
}

export function useDeleteArticle() {
  const router = useRouter();
  return useAppMutation({
    mutationFn: (id: string) => articlesApi.delete(id),
    successMessage: "Статья удалена",
    errorMessage: "Не удалось удалить статью",
    invalidateKeys: [articlesKeys.lists()],
    onSuccess: () => {
      router.push(ROUTES.ARTICLES);
    },
  });
}

export function usePublishArticle() {
  const queryClient = useQueryClient();
  return useAppMutation({
    mutationFn: (id: string) => articlesApi.publish(id),
    successMessage: "Статья опубликована",
    invalidateKeys: [articlesKeys.lists()],
    onSuccess: (article) => {
      queryClient.setQueryData(articlesKeys.detail(article.id), article);
    },
    onError: (error, id) => {
      if (handleVersionConflict(error, queryClient, articlesKeys.detail(id))) return;
      toast.error(getErrorMessage(error, "Не удалось опубликовать статью"));
    },
  });
}

export function useUnpublishArticle() {
  const queryClient = useQueryClient();
  return useAppMutation({
    mutationFn: (id: string) => articlesApi.unpublish(id),
    successMessage: "Статья снята с публикации",
    invalidateKeys: [articlesKeys.lists()],
    onSuccess: (article) => {
      queryClient.setQueryData(articlesKeys.detail(article.id), article);
    },
    onError: (error, id) => {
      if (handleVersionConflict(error, queryClient, articlesKeys.detail(id))) return;
      toast.error(getErrorMessage(error, "Не удалось снять статью с публикации"));
    },
  });
}

export function useTopics() {
  return useQuery({
    queryKey: topicsKeys.list(),
    queryFn: () => articlesApi.getTopics(),
    staleTime: 5 * 60 * 1000,
  });
}

// =====================
// Locale Hooks
// =====================

export const {
  useCreateLocale: useCreateArticleLocale,
  useUpdateLocale: useUpdateArticleLocale,
  useDeleteLocale: useDeleteArticleLocale,
} = createLocaleHooks<CreateArticleLocaleDto, UpdateArticleLocaleDto>(articlesApi, articlesKeys.detail);

// =====================
// Content Block Hooks
// =====================

export const {
  useContentBlocks: useArticleContentBlocks,
  useCreateContentBlock: useCreateArticleContentBlock,
  useUpdateContentBlock: useUpdateArticleContentBlock,
  useDeleteContentBlock: useDeleteArticleContentBlock,
  useReorderContentBlocks: useReorderArticleContentBlocks,
} = createContentBlockHooks(articlesApi, articlesKeys);
