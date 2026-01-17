import { apiClient } from "@/shared/api";
import { API_ENDPOINTS } from "@/shared/config";
import type {
  LoginRequest,
  LoginResponse,
  UserWithPermissions,
  ChangePasswordRequest,
  User,
} from "@/entities/user";
import type { PaginatedResponse, ListParams } from "@/shared/types";

export const authApi = {
  // Authentication
  login: (data: LoginRequest) =>
    apiClient.post<LoginResponse>(API_ENDPOINTS.AUTH.LOGIN, data),

  logout: () =>
    apiClient.post<void>(API_ENDPOINTS.AUTH.LOGOUT),

  me: () =>
    apiClient.get<UserWithPermissions>(API_ENDPOINTS.AUTH.ME),

  changePassword: (data: ChangePasswordRequest) =>
    apiClient.post<void>(API_ENDPOINTS.AUTH.CHANGE_PASSWORD, data),

  // User management
  getUsers: (params?: ListParams) =>
    apiClient.get<PaginatedResponse<User>>(API_ENDPOINTS.AUTH.USERS, { params }),

  getUserById: (id: string) =>
    apiClient.get<User>(API_ENDPOINTS.AUTH.USER_BY_ID(id)),

  createUser: (data: Omit<User, "id" | "tenant_id" | "created_at" | "updated_at"> & { password: string }) =>
    apiClient.post<User>(API_ENDPOINTS.AUTH.USERS, data),

  updateUser: (id: string, data: Partial<User>) =>
    apiClient.patch<User>(API_ENDPOINTS.AUTH.USER_BY_ID(id), data),

  deleteUser: (id: string) =>
    apiClient.delete(API_ENDPOINTS.AUTH.USER_BY_ID(id)),
};

// Query keys factory
export const authKeys = {
  all: ["auth"] as const,
  me: () => [...authKeys.all, "me"] as const,
  users: () => [...authKeys.all, "users"] as const,
  usersList: (params?: ListParams) => [...authKeys.users(), "list", params] as const,
  userDetail: (id: string) => [...authKeys.users(), "detail", id] as const,
};

