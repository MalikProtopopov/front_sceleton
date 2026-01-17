"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
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
    staleTime: 10 * 60 * 1000, // Cache for 10 minutes
  });
}

export function useCreateRole() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateRoleDto) => rolesApi.create(data),
    onSuccess: (role) => {
      queryClient.invalidateQueries({ queryKey: rolesKeys.list() });
      toast.success("Роль создана");
      router.push(ROUTES.ROLE_EDIT(role.id));
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : "Не удалось создать роль";
      toast.error(message);
    },
  });
}

export function useUpdateRole(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateRoleDto) => rolesApi.update(id, data),
    onSuccess: (role) => {
      queryClient.setQueryData(rolesKeys.detail(id), role);
      queryClient.invalidateQueries({ queryKey: rolesKeys.list() });
      toast.success("Роль обновлена");
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : "Не удалось обновить роль";
      toast.error(message);
    },
  });
}

export function useDeleteRole() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => rolesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: rolesKeys.list() });
      toast.success("Роль удалена");
      router.push(ROUTES.USERS);
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : "Не удалось удалить роль";
      toast.error(message);
    },
  });
}

