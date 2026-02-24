"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { uomsApi, uomsKeys } from "../api/uomsApi";
import { getErrorMessage } from "@/shared/lib/versionConflict";
import type { CreateUOMDto, UpdateUOMDto } from "@/entities/product";

export function useUomsList() {
  return useQuery({
    queryKey: uomsKeys.list(),
    queryFn: () => uomsApi.getAll(),
    staleTime: 10 * 60 * 1000,
  });
}

export function useCreateUom() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateUOMDto) => uomsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: uomsKeys.list() });
      toast.success("Единица измерения создана");
    },
    onError: (error) => {
      const message = getErrorMessage(error, "Не удалось создать единицу измерения");
      toast.error(message);
    },
  });
}

export function useUpdateUom(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateUOMDto) => uomsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: uomsKeys.list() });
      toast.success("Единица измерения обновлена");
    },
    onError: (error) => {
      const message = getErrorMessage(error, "Не удалось обновить единицу измерения");
      toast.error(message);
    },
  });
}
