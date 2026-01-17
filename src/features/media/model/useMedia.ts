"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { mediaApi, mediaKeys } from "../api/mediaApi";
import type { FileFilterParams, FileAsset } from "@/entities/file";

export function useFiles(params?: FileFilterParams) {
  return useQuery({
    queryKey: mediaKeys.list(params),
    queryFn: () => mediaApi.getAll(params),
  });
}

export function useFile(id: string) {
  return useQuery({
    queryKey: mediaKeys.detail(id),
    queryFn: () => mediaApi.getById(id),
    enabled: !!id,
  });
}

export function useUploadFile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ file, folder }: { file: File; folder?: string }) => {
      return mediaApi.uploadFile(file, folder);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: mediaKeys.lists() });
      toast.success("Файл загружен");
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : "Не удалось загрузить файл";
      toast.error(message);
    },
  });
}

export function useUpdateFile(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<Pick<FileAsset, "alt_text" | "folder">>) =>
      mediaApi.update(id, data),
    onSuccess: (file) => {
      queryClient.setQueryData(mediaKeys.detail(id), file);
      queryClient.invalidateQueries({ queryKey: mediaKeys.lists() });
      toast.success("Файл обновлен");
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : "Не удалось обновить файл";
      toast.error(message);
    },
  });
}

export function useDeleteFile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => mediaApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: mediaKeys.lists() });
      toast.success("Файл удален");
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : "Не удалось удалить файл";
      toast.error(message);
    },
  });
}

