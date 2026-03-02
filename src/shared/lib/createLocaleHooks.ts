"use client";

import { useAppMutation } from "./useAppMutation";

export interface LocaleApi<TCreateDto, TUpdateDto> {
  createLocale: (entityId: string, data: TCreateDto) => Promise<unknown>;
  updateLocale: (entityId: string, localeId: string, data: TUpdateDto) => Promise<unknown>;
  deleteLocale: (entityId: string, localeId: string) => Promise<unknown>;
}

export function createLocaleHooks<TCreateDto, TUpdateDto>(
  api: LocaleApi<TCreateDto, TUpdateDto>,
  detailKey: (entityId: string) => readonly unknown[],
) {
  function useCreateLocale(entityId: string) {
    return useAppMutation({
      mutationFn: (data: TCreateDto) => api.createLocale(entityId, data),
      successMessage: "Локаль добавлена",
      useLocaleError: true,
      invalidateKeys: [detailKey(entityId)],
    });
  }

  function useUpdateLocale(entityId: string) {
    return useAppMutation({
      mutationFn: ({ localeId, data }: { localeId: string; data: TUpdateDto }) =>
        api.updateLocale(entityId, localeId, data),
      successMessage: "Локаль обновлена",
      useLocaleError: true,
      invalidateKeys: [detailKey(entityId)],
    });
  }

  function useDeleteLocale(entityId: string) {
    return useAppMutation({
      mutationFn: (localeId: string) => api.deleteLocale(entityId, localeId),
      successMessage: "Локаль удалена",
      useLocaleError: true,
      invalidateKeys: [detailKey(entityId)],
    });
  }

  return {
    useCreateLocale,
    useUpdateLocale,
    useDeleteLocale,
  };
}
