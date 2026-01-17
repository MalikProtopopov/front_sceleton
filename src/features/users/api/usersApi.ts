import { apiClient } from "@/shared/api";
import { API_ENDPOINTS } from "@/shared/config";
import type { PaginatedResponse } from "@/shared/types";
import type { User, Role, Permission, CreateUserDto, UpdateUserDto, UserFilterParams } from "@/entities/user";

export const usersApi = {
  // Users
  getAll: (params?: UserFilterParams) =>
    apiClient.get<PaginatedResponse<User>>(API_ENDPOINTS.AUTH.USERS, { params }),

  getById: (id: string) =>
    apiClient.get<User>(API_ENDPOINTS.AUTH.USER_BY_ID(id)),

  create: (data: CreateUserDto) =>
    apiClient.post<User>(API_ENDPOINTS.AUTH.USERS, data),

  update: (id: string, data: UpdateUserDto) =>
    apiClient.patch<User>(API_ENDPOINTS.AUTH.USER_BY_ID(id), data),

  delete: (id: string) =>
    apiClient.delete(API_ENDPOINTS.AUTH.USER_BY_ID(id)),

  // Roles
  getRoles: () =>
    apiClient.get<{ items: Role[]; total: number }>(API_ENDPOINTS.AUTH.ROLES),

  // Permissions
  getPermissions: () =>
    apiClient.get<{ items: Permission[]; total: number }>(API_ENDPOINTS.AUTH.PERMISSIONS),
};

// Query keys factory
export const usersKeys = {
  all: ["users"] as const,
  lists: () => [...usersKeys.all, "list"] as const,
  list: (params?: UserFilterParams) => [...usersKeys.lists(), params] as const,
  details: () => [...usersKeys.all, "detail"] as const,
  detail: (id: string) => [...usersKeys.details(), id] as const,
  roles: () => [...usersKeys.all, "roles"] as const,
  permissions: () => [...usersKeys.all, "permissions"] as const,
};

