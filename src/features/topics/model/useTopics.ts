"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAppMutation } from "@/shared/lib";
import { topicsApi, topicsKeys } from "../api/topicsApi";
import type { TopicFilterParams, CreateTopicDto, UpdateTopicDto, CreateTopicLocaleDto, UpdateTopicLocaleDto } from "@/entities/topic";

export function useTopicsList(params?: TopicFilterParams) {
  return useQuery({
    queryKey: topicsKeys.list(params),
    queryFn: () => topicsApi.getAll(params),
  });
}

export function useTopic(id: string) {
  return useQuery({
    queryKey: topicsKeys.detail(id),
    queryFn: () => topicsApi.getById(id),
    enabled: !!id,
  });
}

export function useCreateTopic() {
  return useAppMutation({
    mutationFn: (data: CreateTopicDto) => topicsApi.create(data),
    successMessage: "Тема создана",
    errorMessage: "Не удалось создать тему",
    invalidateKeys: [topicsKeys.all],
  });
}

export function useUpdateTopic(id: string) {
  const queryClient = useQueryClient();
  return useAppMutation({
    mutationFn: (data: UpdateTopicDto) => topicsApi.update(id, data),
    successMessage: "Тема обновлена",
    errorMessage: "Не удалось обновить тему",
    invalidateKeys: [topicsKeys.lists()],
    onSuccess: (topic) => {
      queryClient.setQueryData(topicsKeys.detail(id), topic);
    },
  });
}

export function useDeleteTopic() {
  return useAppMutation({
    mutationFn: (id: string) => topicsApi.delete(id),
    successMessage: "Тема удалена",
    errorMessage: "Не удалось удалить тему",
    invalidateKeys: [topicsKeys.lists()],
  });
}

// Note: is_active field was removed from Topic model
// This hook is kept for backward compatibility but may not work with current API
export function useToggleTopicActive(id: string) {
  const queryClient = useQueryClient();
  return useAppMutation({
    mutationFn: ({ version }: { isActive: boolean; version: number }) =>
      topicsApi.update(id, { version } as UpdateTopicDto),
    successMessage: "Тема обновлена",
    errorMessage: "Не удалось изменить статус",
    invalidateKeys: [topicsKeys.lists()],
    onSuccess: (topic) => {
      queryClient.setQueryData(topicsKeys.detail(id), topic);
    },
  });
}

// =====================
// Locale Hooks
// =====================

export function useCreateTopicLocale(topicId: string) {
  return useAppMutation({
    mutationFn: (data: CreateTopicLocaleDto) => topicsApi.createLocale(topicId, data),
    successMessage: "Локаль добавлена",
    useLocaleError: true,
    invalidateKeys: [topicsKeys.detail(topicId), topicsKeys.lists()],
  });
}

export function useUpdateTopicLocale(topicId: string) {
  return useAppMutation({
    mutationFn: ({ localeId, data }: { localeId: string; data: UpdateTopicLocaleDto }) =>
      topicsApi.updateLocale(topicId, localeId, data),
    successMessage: "Локаль обновлена",
    useLocaleError: true,
    invalidateKeys: [topicsKeys.detail(topicId), topicsKeys.lists()],
  });
}

export function useDeleteTopicLocale(topicId: string) {
  return useAppMutation({
    mutationFn: (localeId: string) => topicsApi.deleteLocale(topicId, localeId),
    successMessage: "Локаль удалена",
    useLocaleError: true,
    invalidateKeys: [topicsKeys.detail(topicId), topicsKeys.lists()],
  });
}
