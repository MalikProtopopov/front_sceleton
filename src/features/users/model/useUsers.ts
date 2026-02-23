"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { usersApi, usersKeys } from "../api/usersApi";
import { ROUTES } from "@/shared/config";
import { getErrorMessage, handleVersionConflict } from "@/shared/lib/versionConflict";
import type { UserFilterParams, CreateUserDto, UpdateUserDto } from "@/entities/user";

export function useUsersList(params?: UserFilterParams, tenantId?: string) {
  return useQuery({
    queryKey: usersKeys.list(params, tenantId),
    queryFn: () => usersApi.getAll(params, tenantId),
  });
}

export function useUser(id: string, tenantId?: string) {
  return useQuery({
    queryKey: usersKeys.detail(id, tenantId),
    queryFn: () => usersApi.getById(id, tenantId),
    enabled: !!id,
  });
}

export function useCreateUser(tenantId?: string) {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateUserDto) => usersApi.create(data, tenantId),
    onSuccess: (user) => {
      queryClient.invalidateQueries({ queryKey: usersKeys.lists() });
      toast.success("Пользователь создан");
      // If managing cross-tenant users, don't navigate away
      if (!tenantId) {
        router.push(ROUTES.USER_EDIT(user.id));
      }
    },
    onError: (error) => {
      const message = getErrorMessage(error, "Не удалось создать пользователя");
      toast.error(message);
    },
  });
}

export function useUpdateUser(id: string, tenantId?: string) {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateUserDto) => usersApi.update(id, data, tenantId),
    onSuccess: (user) => {
      queryClient.setQueryData(usersKeys.detail(id, tenantId), user);
      queryClient.invalidateQueries({ queryKey: usersKeys.lists() });
      toast.success("Пользователь обновлен");
    },
    onError: (error) => {
      if (handleVersionConflict(error, queryClient, usersKeys.detail(id, tenantId))) {
        return;
      }
      const axiosError = error as { response?: { status?: number } };
      if (axiosError.response?.status === 404) {
        queryClient.removeQueries({ queryKey: usersKeys.detail(id, tenantId) });
        queryClient.invalidateQueries({ queryKey: usersKeys.lists() });
        toast.error("Пользователь был удалён");
        router.push(ROUTES.USERS);
        return;
      }
      const message = getErrorMessage(error, "Не удалось обновить пользователя");
      toast.error(message);
    },
  });
}

export function useDeleteUser(tenantId?: string) {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => usersApi.delete(id, tenantId),
    onSuccess: (_data, id) => {
      queryClient.removeQueries({ queryKey: usersKeys.detail(id, tenantId) });
      queryClient.invalidateQueries({ queryKey: usersKeys.lists() });
      toast.success("Пользователь удален");
      if (!tenantId) {
        router.push(ROUTES.USERS);
      }
    },
    onError: (error) => {
      const message = getErrorMessage(error, "Не удалось удалить пользователя");
      toast.error(message);
    },
  });
}

export function useRoles(tenantId?: string) {
  return useQuery({
    queryKey: usersKeys.roles(tenantId),
    queryFn: () => usersApi.getRoles(tenantId),
    staleTime: 10 * 60 * 1000, // Cache for 10 minutes
  });
}

export function useToggleUserActive(id: string, tenantId?: string) {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ isActive, version }: { isActive: boolean; version: number }) =>
      usersApi.update(id, { is_active: isActive, version }, tenantId),
    onSuccess: (user) => {
      queryClient.setQueryData(usersKeys.detail(id, tenantId), user);
      queryClient.invalidateQueries({ queryKey: usersKeys.lists() });
      toast.success(user.is_active ? "Пользователь активирован" : "Пользователь деактивирован");
    },
    onError: (error) => {
      if (handleVersionConflict(error, queryClient, usersKeys.detail(id, tenantId))) {
        return;
      }
      const axiosError = error as { response?: { status?: number } };
      if (axiosError.response?.status === 404) {
        queryClient.removeQueries({ queryKey: usersKeys.detail(id, tenantId) });
        queryClient.invalidateQueries({ queryKey: usersKeys.lists() });
        toast.error("Пользователь был удалён");
        router.push(ROUTES.USERS);
        return;
      }
      const message = getErrorMessage(error, "Не удалось изменить статус");
      toast.error(message);
    },
  });
}
