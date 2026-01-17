"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { usersApi, usersKeys } from "../api/usersApi";
import { ROUTES } from "@/shared/config";
import type { UserFilterParams, CreateUserDto, UpdateUserDto } from "@/entities/user";

export function useUsersList(params?: UserFilterParams) {
  return useQuery({
    queryKey: usersKeys.list(params),
    queryFn: () => usersApi.getAll(params),
  });
}

export function useUser(id: string) {
  return useQuery({
    queryKey: usersKeys.detail(id),
    queryFn: () => usersApi.getById(id),
    enabled: !!id,
  });
}

export function useCreateUser() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateUserDto) => usersApi.create(data),
    onSuccess: (user) => {
      queryClient.invalidateQueries({ queryKey: usersKeys.lists() });
      toast.success("Пользователь создан");
      router.push(ROUTES.USER_EDIT(user.id));
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : "Не удалось создать пользователя";
      toast.error(message);
    },
  });
}

export function useUpdateUser(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateUserDto) => usersApi.update(id, data),
    onSuccess: (user) => {
      queryClient.setQueryData(usersKeys.detail(id), user);
      queryClient.invalidateQueries({ queryKey: usersKeys.lists() });
      toast.success("Пользователь обновлен");
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : "Не удалось обновить пользователя";
      toast.error(message);
    },
  });
}

export function useDeleteUser() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => usersApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: usersKeys.lists() });
      toast.success("Пользователь удален");
      router.push(ROUTES.USERS);
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : "Не удалось удалить пользователя";
      toast.error(message);
    },
  });
}

export function useRoles() {
  return useQuery({
    queryKey: usersKeys.roles(),
    queryFn: () => usersApi.getRoles(),
    staleTime: 10 * 60 * 1000, // Cache for 10 minutes
  });
}

export function useToggleUserActive(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ isActive, version }: { isActive: boolean; version: number }) =>
      usersApi.update(id, { is_active: isActive, version }),
    onSuccess: (user) => {
      queryClient.setQueryData(usersKeys.detail(id), user);
      queryClient.invalidateQueries({ queryKey: usersKeys.lists() });
      toast.success(user.is_active ? "Пользователь активирован" : "Пользователь деактивирован");
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : "Не удалось изменить статус";
      toast.error(message);
    },
  });
}

