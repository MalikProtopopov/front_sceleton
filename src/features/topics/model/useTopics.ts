"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { topicsApi, topicsKeys } from "../api/topicsApi";
import type { TopicFilterParams, CreateTopicDto, UpdateTopicDto, CreateTopicLocaleDto, UpdateTopicLocaleDto } from "@/entities/topic";
import { handleLocaleError } from "@/shared/lib/localeErrors";

export function useTopics(params?: TopicFilterParams) {
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
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTopicDto) => topicsApi.create(data),
    onSuccess: () => {
      // Invalidate all topic queries to ensure list is refreshed
      queryClient.invalidateQueries({ queryKey: topicsKeys.all });
      toast.success("Тема создана");
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : "Не удалось создать тему";
      toast.error(message);
    },
  });
}

export function useUpdateTopic(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateTopicDto) => topicsApi.update(id, data),
    onSuccess: (topic) => {
      queryClient.setQueryData(topicsKeys.detail(id), topic);
      queryClient.invalidateQueries({ queryKey: topicsKeys.lists() });
      toast.success("Тема обновлена");
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : "Не удалось обновить тему";
      toast.error(message);
    },
  });
}

export function useDeleteTopic() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => topicsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: topicsKeys.lists() });
      toast.success("Тема удалена");
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : "Не удалось удалить тему";
      toast.error(message);
    },
  });
}

// Note: is_active field was removed from Topic model
// This hook is kept for backward compatibility but may not work with current API
export function useToggleTopicActive(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ version }: { isActive: boolean; version: number }) =>
      topicsApi.update(id, { version } as UpdateTopicDto),
    onSuccess: (topic) => {
      queryClient.setQueryData(topicsKeys.detail(id), topic);
      queryClient.invalidateQueries({ queryKey: topicsKeys.lists() });
      toast.success("Тема обновлена");
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : "Не удалось изменить статус";
      toast.error(message);
    },
  });
}

// =====================
// Locale Hooks
// =====================

export function useCreateTopicLocale(topicId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTopicLocaleDto) => topicsApi.createLocale(topicId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: topicsKeys.detail(topicId) });
      queryClient.invalidateQueries({ queryKey: topicsKeys.lists() });
      toast.success("Локаль добавлена");
    },
    onError: (error) => {
      handleLocaleError(error);
    },
  });
}

export function useUpdateTopicLocale(topicId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ localeId, data }: { localeId: string; data: UpdateTopicLocaleDto }) =>
      topicsApi.updateLocale(topicId, localeId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: topicsKeys.detail(topicId) });
      queryClient.invalidateQueries({ queryKey: topicsKeys.lists() });
      toast.success("Локаль обновлена");
    },
    onError: (error) => {
      handleLocaleError(error);
    },
  });
}

export function useDeleteTopicLocale(topicId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (localeId: string) => topicsApi.deleteLocale(topicId, localeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: topicsKeys.detail(topicId) });
      queryClient.invalidateQueries({ queryKey: topicsKeys.lists() });
      toast.success("Локаль удалена");
    },
    onError: (error) => {
      handleLocaleError(error);
    },
  });
}

