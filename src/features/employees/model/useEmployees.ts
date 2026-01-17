"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { employeesApi, employeesKeys } from "../api/employeesApi";
import { ROUTES } from "@/shared/config";
import type { EmployeeFilterParams, CreateEmployeeDto, UpdateEmployeeDto, CreateEmployeeLocaleDto, UpdateEmployeeLocaleDto } from "@/entities/employee";
import { handleLocaleError } from "@/shared/lib/localeErrors";

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
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateEmployeeDto) => employeesApi.create(data),
    onSuccess: (employee) => {
      queryClient.invalidateQueries({ queryKey: employeesKeys.lists() });
      toast.success("Сотрудник создан");
      router.push(ROUTES.TEAM_EDIT(employee.id));
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : "Не удалось создать сотрудника";
      toast.error(message);
    },
  });
}

export function useUpdateEmployee(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateEmployeeDto) => employeesApi.update(id, data),
    onSuccess: (employee) => {
      queryClient.setQueryData(employeesKeys.detail(id), employee);
      queryClient.invalidateQueries({ queryKey: employeesKeys.lists() });
      toast.success("Сотрудник обновлен");
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : "Не удалось обновить сотрудника";
      toast.error(message);
    },
  });
}

export function useDeleteEmployee() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => employeesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: employeesKeys.lists() });
      toast.success("Сотрудник удален");
      router.push(ROUTES.TEAM);
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : "Не удалось удалить сотрудника";
      toast.error(message);
    },
  });
}

export function useToggleEmployeePublished(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ isPublished, version }: { isPublished: boolean; version: number }) =>
      employeesApi.update(id, { is_published: isPublished, version }),
    onSuccess: (employee) => {
      queryClient.setQueryData(employeesKeys.detail(id), employee);
      queryClient.invalidateQueries({ queryKey: employeesKeys.lists() });
      toast.success(employee.is_published ? "Сотрудник опубликован" : "Сотрудник снят с публикации");
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

export function useCreateEmployeeLocale(employeeId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateEmployeeLocaleDto) => employeesApi.createLocale(employeeId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: employeesKeys.detail(employeeId) });
      toast.success("Локаль добавлена");
    },
    onError: (error) => {
      handleLocaleError(error);
    },
  });
}

export function useUpdateEmployeeLocale(employeeId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ localeId, data }: { localeId: string; data: UpdateEmployeeLocaleDto }) =>
      employeesApi.updateLocale(employeeId, localeId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: employeesKeys.detail(employeeId) });
      toast.success("Локаль обновлена");
    },
    onError: (error) => {
      handleLocaleError(error);
    },
  });
}

export function useDeleteEmployeeLocale(employeeId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (localeId: string) => employeesApi.deleteLocale(employeeId, localeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: employeesKeys.detail(employeeId) });
      toast.success("Локаль удалена");
    },
    onError: (error) => {
      handleLocaleError(error);
    },
  });
}

