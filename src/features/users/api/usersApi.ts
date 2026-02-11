import { apiClient } from "@/shared/api";
import { API_ENDPOINTS } from "@/shared/config";
import type { PaginatedResponse } from "@/shared/types";
import type { User, Role, Permission, CreateUserDto, UpdateUserDto, UserFilterParams } from "@/entities/user";

/** Append tenant_id as query param if provided */
function withTenantId(url: string, tenantId?: string): string {
  if (!tenantId) return url;
  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}tenant_id=${tenantId}`;
}

export const usersApi = {
  // Users
  getAll: (params?: UserFilterParams, tenantId?: string) => {
    // Extract tenant_id from params to avoid sending it both ways
    const { tenant_id, ...restParams } = params || {};
    const effectiveTenantId = tenantId || tenant_id;
    return apiClient.get<PaginatedResponse<User>>(
      withTenantId(API_ENDPOINTS.AUTH.USERS, effectiveTenantId),
      { params: restParams },
    );
  },

  getById: (id: string, tenantId?: string) =>
    apiClient.get<User>(withTenantId(API_ENDPOINTS.AUTH.USER_BY_ID(id), tenantId)),

  create: (data: CreateUserDto, tenantId?: string) =>
    apiClient.post<User>(withTenantId(API_ENDPOINTS.AUTH.USERS, tenantId), data),

  update: (id: string, data: UpdateUserDto, tenantId?: string) =>
    apiClient.patch<User>(withTenantId(API_ENDPOINTS.AUTH.USER_BY_ID(id), tenantId), data),

  delete: (id: string, tenantId?: string) =>
    apiClient.delete(withTenantId(API_ENDPOINTS.AUTH.USER_BY_ID(id), tenantId)),

  // Roles
  getRoles: (tenantId?: string) =>
    apiClient.get<{ items: Role[]; total: number }>(
      withTenantId(API_ENDPOINTS.AUTH.ROLES, tenantId),
    ),

  // Permissions
  getPermissions: () =>
    apiClient.get<{ items: Permission[]; total: number }>(API_ENDPOINTS.AUTH.PERMISSIONS),
};

// Query keys factory
export const usersKeys = {
  all: ["users"] as const,
  lists: () => [...usersKeys.all, "list"] as const,
  list: (params?: UserFilterParams, tenantId?: string) =>
    [...usersKeys.lists(), { ...params, tenantId }] as const,
  details: () => [...usersKeys.all, "detail"] as const,
  detail: (id: string, tenantId?: string) =>
    [...usersKeys.details(), id, tenantId] as const,
  roles: (tenantId?: string) => [...usersKeys.all, "roles", tenantId] as const,
  permissions: () => [...usersKeys.all, "permissions"] as const,
};
