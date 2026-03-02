"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useAppMutation } from "@/shared/lib";
import { parametersApi, parametersKeys } from "../api/parametersApi";
import { ROUTES } from "@/shared/config";
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
  return useAppMutation({
    mutationFn: (data: ParameterCreate) => parametersApi.create(data),
    successMessage: "Параметр создан",
    errorMessage: "Не удалось создать параметр",
    invalidateKeys: [parametersKeys.lists()],
    onSuccess: (param) => {
      router.push(ROUTES.PARAMETER_EDIT(param.id));
    },
  });
}

export function useUpdateParameter(id: string) {
  const queryClient = useQueryClient();
  return useAppMutation({
    mutationFn: (data: ParameterUpdate) => parametersApi.update(id, data),
    successMessage: "Параметр обновлён",
    errorMessage: "Не удалось обновить параметр",
    invalidateKeys: [parametersKeys.lists()],
    onSuccess: (param) => {
      queryClient.setQueryData(parametersKeys.detail(id), param);
    },
  });
}

export function useDeleteParameter() {
  const router = useRouter();
  return useAppMutation({
    mutationFn: (id: string) => parametersApi.delete(id),
    successMessage: "Параметр деактивирован",
    errorMessage: "Не удалось деактивировать параметр",
    invalidateKeys: [parametersKeys.lists()],
    onSuccess: () => {
      router.push(ROUTES.PARAMETERS);
    },
  });
}

// --- Parameter Values (enum) ---

export function useAddParameterValue(parameterId: string) {
  return useAppMutation({
    mutationFn: (data: ParameterValueCreate) => parametersApi.addValue(parameterId, data),
    successMessage: "Значение добавлено",
    errorMessage: "Не удалось добавить значение",
    invalidateKeys: [parametersKeys.detail(parameterId)],
  });
}

export function useUpdateParameterValue(parameterId: string) {
  return useAppMutation({
    mutationFn: ({ valueId, data }: { valueId: string; data: ParameterValueUpdate }) =>
      parametersApi.updateValue(parameterId, valueId, data),
    successMessage: "Значение обновлено",
    errorMessage: "Не удалось обновить значение",
    invalidateKeys: [parametersKeys.detail(parameterId)],
  });
}

export function useDeleteParameterValue(parameterId: string) {
  return useAppMutation({
    mutationFn: (valueId: string) => parametersApi.deleteValue(parameterId, valueId),
    successMessage: "Значение удалено",
    errorMessage: "Не удалось удалить значение",
    invalidateKeys: [parametersKeys.detail(parameterId)],
  });
}

// --- Parameter Categories ---

export function useSetParameterCategories(parameterId: string) {
  return useAppMutation({
    mutationFn: (data: ParameterCategorySet) =>
      parametersApi.setCategories(parameterId, data),
    successMessage: "Привязка к категориям обновлена",
    errorMessage: "Не удалось обновить привязку к категориям",
    invalidateKeys: [parametersKeys.detail(parameterId)],
  });
}
