"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { parametersApi, parametersKeys } from "../api/parametersApi";
import { ROUTES } from "@/shared/config";
import { getErrorMessage } from "@/shared/lib/versionConflict";
import type {
  ParameterFilterParams,
  ParameterCreate,
  ParameterUpdate,
  ParameterValueCreate,
  ParameterValueUpdate,
  ParameterCategorySet,
} from "@/entities/product";

// --- Parameter CRUD ---

export function useParametersList(params?: ParameterFilterParams) {
  return useQuery({
    queryKey: parametersKeys.list(params),
    queryFn: () => parametersApi.getAll(params),
  });
}

export function useParameter(id: string) {
  return useQuery({
    queryKey: parametersKeys.detail(id),
    queryFn: () => parametersApi.getById(id),
    enabled: !!id,
  });
}

export function useCreateParameter() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ParameterCreate) => parametersApi.create(data),
    onSuccess: (param) => {
      queryClient.invalidateQueries({ queryKey: parametersKeys.lists() });
      toast.success("Параметр создан");
      router.push(ROUTES.PARAMETER_EDIT(param.id));
    },
    onError: (error) => {
      const message = getErrorMessage(error, "Не удалось создать параметр");
      toast.error(message);
    },
  });
}

export function useUpdateParameter(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ParameterUpdate) => parametersApi.update(id, data),
    onSuccess: (param) => {
      queryClient.setQueryData(parametersKeys.detail(id), param);
      queryClient.invalidateQueries({ queryKey: parametersKeys.lists() });
      toast.success("Параметр обновлён");
    },
    onError: (error) => {
      const message = getErrorMessage(error, "Не удалось обновить параметр");
      toast.error(message);
    },
  });
}

export function useDeleteParameter() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => parametersApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: parametersKeys.lists() });
      toast.success("Параметр деактивирован");
      router.push(ROUTES.PARAMETERS);
    },
    onError: (error) => {
      const message = getErrorMessage(error, "Не удалось деактивировать параметр");
      toast.error(message);
    },
  });
}

// --- Parameter Values (enum) ---

export function useAddParameterValue(parameterId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ParameterValueCreate) => parametersApi.addValue(parameterId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: parametersKeys.detail(parameterId) });
      toast.success("Значение добавлено");
    },
    onError: (error) => {
      const message = getErrorMessage(error, "Не удалось добавить значение");
      toast.error(message);
    },
  });
}

export function useUpdateParameterValue(parameterId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ valueId, data }: { valueId: string; data: ParameterValueUpdate }) =>
      parametersApi.updateValue(parameterId, valueId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: parametersKeys.detail(parameterId) });
      toast.success("Значение обновлено");
    },
    onError: (error) => {
      const message = getErrorMessage(error, "Не удалось обновить значение");
      toast.error(message);
    },
  });
}

export function useDeleteParameterValue(parameterId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (valueId: string) => parametersApi.deleteValue(parameterId, valueId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: parametersKeys.detail(parameterId) });
      toast.success("Значение удалено");
    },
    onError: (error) => {
      const message = getErrorMessage(error, "Не удалось удалить значение");
      toast.error(message);
    },
  });
}

// --- Parameter Categories ---

export function useSetParameterCategories(parameterId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ParameterCategorySet) =>
      parametersApi.setCategories(parameterId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: parametersKeys.detail(parameterId) });
      toast.success("Привязка к категориям обновлена");
    },
    onError: (error) => {
      const message = getErrorMessage(error, "Не удалось обновить привязку к категориям");
      toast.error(message);
    },
  });
}
