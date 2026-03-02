"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useAppMutation, createLocaleHooks, createContentBlockHooks } from "@/shared/lib";
import { employeesApi, employeesKeys } from "../api/employeesApi";
import { ROUTES } from "@/shared/config";
import type { EmployeeFilterParams, CreateEmployeeDto, UpdateEmployeeDto, CreateEmployeeLocaleDto, UpdateEmployeeLocaleDto } from "@/entities/employee";


export function useEmployeesList(params?: EmployeeFilterParams) {
  return useQuery({
    queryKey: employeesKeys.list(params),
    queryFn: () => employeesApi.getAll(params),
  });
}

export function useEmployee(id: string) {
  return useQuery({
    queryKey: employeesKeys.detail(id),
    queryFn: () => employeesApi.getById(id),
    enabled: !!id,
  });
}

export function useCreateEmployee() {
  const router = useRouter();
  return useAppMutation({
    mutationFn: (data: CreateEmployeeDto) => employeesApi.create(data),
    successMessage: "Сотрудник создан",
    errorMessage: "Не удалось создать сотрудника",
    invalidateKeys: [employeesKeys.lists()],
    onSuccess: (employee) => {
      router.push(ROUTES.TEAM_EDIT(employee.id));
    },
  });
}

export function useUpdateEmployee(id: string) {
  const queryClient = useQueryClient();
  return useAppMutation({
    mutationFn: (data: UpdateEmployeeDto) => employeesApi.update(id, data),
    successMessage: "Сотрудник обновлен",
    errorMessage: "Не удалось обновить сотрудника",
    invalidateKeys: [employeesKeys.lists()],
    onSuccess: (employee) => {
      queryClient.setQueryData(employeesKeys.detail(id), employee);
    },
  });
}

export function useDeleteEmployee() {
  const router = useRouter();
  return useAppMutation({
    mutationFn: (id: string) => employeesApi.delete(id),
    successMessage: "Сотрудник удален",
    errorMessage: "Не удалось удалить сотрудника",
    invalidateKeys: [employeesKeys.lists()],
    onSuccess: () => router.push(ROUTES.TEAM),
  });
}

export function useToggleEmployeePublished(id: string) {
  const queryClient = useQueryClient();
  return useAppMutation({
    mutationFn: ({ isPublished, version }: { isPublished: boolean; version: number }) =>
      employeesApi.update(id, { is_published: isPublished, version }),
    successMessage: (employee) =>
      employee.is_published ? "Сотрудник опубликован" : "Сотрудник снят с публикации",
    errorMessage: "Не удалось изменить статус",
    invalidateKeys: [employeesKeys.lists()],
    onSuccess: (employee) => {
      queryClient.setQueryData(employeesKeys.detail(id), employee);
    },
  });
}

// =====================
// Locale Hooks
// =====================

export const {
  useCreateLocale: useCreateEmployeeLocale,
  useUpdateLocale: useUpdateEmployeeLocale,
  useDeleteLocale: useDeleteEmployeeLocale,
} = createLocaleHooks<CreateEmployeeLocaleDto, UpdateEmployeeLocaleDto>(employeesApi, employeesKeys.detail);

// =====================
// Content Block Hooks
// =====================

export const {
  useContentBlocks: useEmployeeContentBlocks,
  useCreateContentBlock: useCreateEmployeeContentBlock,
  useUpdateContentBlock: useUpdateEmployeeContentBlock,
  useDeleteContentBlock: useDeleteEmployeeContentBlock,
  useReorderContentBlocks: useReorderEmployeeContentBlocks,
} = createContentBlockHooks(employeesApi, employeesKeys);
