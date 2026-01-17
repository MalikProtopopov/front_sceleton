import { apiClient } from "@/shared/api";
import { API_ENDPOINTS } from "@/shared/config";
import type { PaginatedResponse } from "@/shared/types";
import type { Role, Permission, CreateRoleDto, UpdateRoleDto } from "@/entities/user";

export const rolesApi = {
  getAll: async (): Promise<Role[]> => {
    const response = await apiClient.get<PaginatedResponse<Role>>(API_ENDPOINTS.AUTH.ROLES);
    return response.items;
  },

  getById: (id: string) =>
    apiClient.get<Role>(API_ENDPOINTS.AUTH.ROLE_BY_ID(id)),

  create: (data: CreateRoleDto) =>
    apiClient.post<Role>(API_ENDPOINTS.AUTH.ROLES, data),

  update: (id: string, data: UpdateRoleDto) =>
    apiClient.patch<Role>(API_ENDPOINTS.AUTH.ROLE_BY_ID(id), data),

  delete: (id: string) =>
    apiClient.delete(API_ENDPOINTS.AUTH.ROLE_BY_ID(id)),

  getPermissions: async (): Promise<Permission[]> => {
    const response = await apiClient.get<PaginatedResponse<Permission> | Permission[]>(API_ENDPOINTS.AUTH.PERMISSIONS);
    // Handle both paginated and array responses
    return Array.isArray(response) ? response : response.items;
  },
};

// Query keys factory
export const rolesKeys = {
  all: ["roles"] as const,
  list: () => [...rolesKeys.all, "list"] as const,
  detail: (id: string) => [...rolesKeys.all, "detail", id] as const,
  permissions: () => ["permissions"] as const,
};

