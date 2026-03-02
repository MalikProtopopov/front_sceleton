"use client";

import { useQuery } from "@tanstack/react-query";
import { useAppMutation } from "./useAppMutation";
import type { ContentBlock, CreateContentBlockDto, UpdateContentBlockDto, ReorderContentBlocksDto } from "@/entities/content-block";

export interface ContentBlockApi {
  getContentBlocks: (entityId: string, locale?: string) => Promise<ContentBlock[]>;
  createContentBlock: (entityId: string, data: CreateContentBlockDto) => Promise<ContentBlock>;
  updateContentBlock: (entityId: string, blockId: string, data: UpdateContentBlockDto) => Promise<ContentBlock>;
  deleteContentBlock: (entityId: string, blockId: string) => Promise<void>;
  reorderContentBlocks: (entityId: string, data: ReorderContentBlocksDto) => Promise<ContentBlock[]>;
}

export interface ContentBlockKeysConfig {
  all: readonly string[];
  contentBlocks: (entityId: string, locale?: string) => readonly unknown[];
}

export function createContentBlockHooks(
  api: ContentBlockApi,
  keys: ContentBlockKeysConfig,
) {
  const invalidationKey = (entityId: string) =>
    [...keys.all, "content-blocks", entityId] as const;

  function useContentBlocks(entityId: string, locale?: string) {
    return useQuery({
      queryKey: keys.contentBlocks(entityId, locale),
      queryFn: () => api.getContentBlocks(entityId, locale),
      enabled: !!entityId,
    });
  }

  function useCreateContentBlock(entityId: string) {
    return useAppMutation({
      mutationFn: (data: CreateContentBlockDto) => api.createContentBlock(entityId, data),
      successMessage: "Блок добавлен",
      errorMessage: "Не удалось добавить блок",
      invalidateKeys: [invalidationKey(entityId)],
    });
  }

  function useUpdateContentBlock(entityId: string) {
    return useAppMutation({
      mutationFn: ({ blockId, data }: { blockId: string; data: UpdateContentBlockDto }) =>
        api.updateContentBlock(entityId, blockId, data),
      successMessage: "Блок обновлён",
      errorMessage: "Не удалось обновить блок",
      invalidateKeys: [invalidationKey(entityId)],
    });
  }

  function useDeleteContentBlock(entityId: string) {
    return useAppMutation({
      mutationFn: (blockId: string) => api.deleteContentBlock(entityId, blockId),
      successMessage: "Блок удалён",
      errorMessage: "Не удалось удалить блок",
      invalidateKeys: [invalidationKey(entityId)],
    });
  }

  function useReorderContentBlocks(entityId: string) {
    return useAppMutation({
      mutationFn: (data: ReorderContentBlocksDto) => api.reorderContentBlocks(entityId, data),
      errorMessage: "Не удалось изменить порядок блоков",
      invalidateKeys: [invalidationKey(entityId)],
    });
  }

  return {
    useContentBlocks,
    useCreateContentBlock,
    useUpdateContentBlock,
    useDeleteContentBlock,
    useReorderContentBlocks,
  };
}
