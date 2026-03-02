"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAppMutation } from "@/shared/lib";
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
  return useAppMutation({
    mutationFn: (data: CreateUserDto) => usersApi.create(data, tenantId),
    successMessage: "Пользователь создан",
    errorMessage: "Не удалось создать пользователя",
    invalidateKeys: [usersKeys.lists()],
    onSuccess: (user) => {
      if (!tenantId) {
        router.push(ROUTES.USER_EDIT(user.id));
      }
    },
  });
}

export function useUpdateUser(id: string, tenantId?: string) {
  const router = useRouter();
  const queryClient = useQueryClient();
  return useAppMutation({
    mutationFn: (data: UpdateUserDto) => usersApi.update(id, data, tenantId),
    successMessage: "Пользователь обновлен",
    invalidateKeys: [usersKeys.lists()],
    onSuccess: (user) => {
      queryClient.setQueryData(usersKeys.detail(id, tenantId), user);
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
  return useAppMutation({
    mutationFn: (id: string) => usersApi.delete(id, tenantId),
    successMessage: "Пользователь удален",
    errorMessage: "Не удалось удалить пользователя",
    invalidateKeys: [usersKeys.lists()],
    onSuccess: (_data, id) => {
      queryClient.removeQueries({ queryKey: usersKeys.detail(id, tenantId) });
      if (!tenantId) {
        router.push(ROUTES.USERS);
      }
    },
  });
}

export function useRoles(tenantId?: string) {
  return useQuery({
    queryKey: usersKeys.roles(tenantId),
    queryFn: () => usersApi.getRoles(tenantId),
    staleTime: 10 * 60 * 1000,
  });
}

export function useToggleUserActive(id: string, tenantId?: string) {
  const router = useRouter();
  const queryClient = useQueryClient();
  return useAppMutation({
    mutationFn: ({ isActive, version }: { isActive: boolean; version: number }) =>
      usersApi.update(id, { is_active: isActive, version }, tenantId),
    successMessage: (user) =>
      user.is_active ? "Пользователь активирован" : "Пользователь деактивирован",
    invalidateKeys: [usersKeys.lists()],
    onSuccess: (user) => {
      queryClient.setQueryData(usersKeys.detail(id, tenantId), user);
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
