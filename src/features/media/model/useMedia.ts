"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAppMutation } from "@/shared/lib";
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
  return useAppMutation({
    mutationFn: async ({ file, folder }: { file: File; folder?: string }) => {
      return mediaApi.uploadFile(file, folder);
    },
    successMessage: "Файл загружен",
    errorMessage: "Не удалось загрузить файл",
    invalidateKeys: [mediaKeys.lists()],
  });
}

export function useUpdateFile(id: string) {
  const queryClient = useQueryClient();
  return useAppMutation({
    mutationFn: (data: Partial<Pick<FileAsset, "alt_text" | "folder">>) =>
      mediaApi.update(id, data),
    successMessage: "Файл обновлен",
    errorMessage: "Не удалось обновить файл",
    invalidateKeys: [mediaKeys.lists()],
    onSuccess: (file) => {
      queryClient.setQueryData(mediaKeys.detail(id), file);
    },
  });
}

export function useDeleteFile() {
  return useAppMutation({
    mutationFn: (id: string) => mediaApi.delete(id),
    successMessage: "Файл удален",
    errorMessage: "Не удалось удалить файл",
    invalidateKeys: [mediaKeys.lists()],
  });
}
