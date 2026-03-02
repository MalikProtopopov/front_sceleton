"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useAppMutation } from "@/shared/lib";
import { rolesApi, rolesKeys } from "../api/rolesApi";
import { ROUTES } from "@/shared/config";
import type { CreateRoleDto, UpdateRoleDto } from "@/entities/user";

export function useRolesList() {
  return useQuery({
    queryKey: rolesKeys.list(),
    queryFn: () => rolesApi.getAll(),
  });
}

export function useRole(id: string) {
  return useQuery({
    queryKey: rolesKeys.detail(id),
    queryFn: () => rolesApi.getById(id),
    enabled: !!id,
  });
}

export function usePermissions() {
  return useQuery({
    queryKey: rolesKeys.permissions(),
    queryFn: () => rolesApi.getPermissions(),
    staleTime: 10 * 60 * 1000,
  });
}

export function useCreateRole() {
  const router = useRouter();
  return useAppMutation({
    mutationFn: (data: CreateRoleDto) => rolesApi.create(data),
    successMessage: "Роль создана",
    errorMessage: "Не удалось создать роль",
    invalidateKeys: [rolesKeys.list()],
    onSuccess: (role) => {
      router.push(ROUTES.ROLE_EDIT(role.id));
    },
  });
}

export function useUpdateRole(id: string) {
  const queryClient = useQueryClient();
  return useAppMutation({
    mutationFn: (data: UpdateRoleDto) => rolesApi.update(id, data),
    successMessage: "Роль обновлена",
    errorMessage: "Не удалось обновить роль",
    invalidateKeys: [rolesKeys.list()],
    onSuccess: (role) => {
      queryClient.setQueryData(rolesKeys.detail(id), role);
    },
  });
}

export function useDeleteRole() {
  const router = useRouter();
  return useAppMutation({
    mutationFn: (id: string) => rolesApi.delete(id),
    successMessage: "Роль удалена",
    errorMessage: "Не удалось удалить роль",
    invalidateKeys: [rolesKeys.list()],
    onSuccess: () => router.push(ROUTES.USERS),
  });
}
