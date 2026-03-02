"use client";

import { useQuery } from "@tanstack/react-query";
import { useAppMutation } from "@/shared/lib";
import { uomsApi, uomsKeys } from "../api/uomsApi";
import type { CreateUOMDto, UpdateUOMDto } from "@/entities/product";

export function useUomsList() {
  return useQuery({
    queryKey: uomsKeys.list(),
    queryFn: () => uomsApi.getAll(),
    staleTime: 10 * 60 * 1000,
  });
}

export function useCreateUom() {
  return useAppMutation({
    mutationFn: (data: CreateUOMDto) => uomsApi.create(data),
    successMessage: "Единица измерения создана",
    errorMessage: "Не удалось создать единицу измерения",
    invalidateKeys: [uomsKeys.list()],
  });
}

export function useUpdateUom(id: string) {
  return useAppMutation({
    mutationFn: (data: UpdateUOMDto) => uomsApi.update(id, data),
    successMessage: "Единица измерения обновлена",
    errorMessage: "Не удалось обновить единицу измерения",
    invalidateKeys: [uomsKeys.list()],
  });
}
