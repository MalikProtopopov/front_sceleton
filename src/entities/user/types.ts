// User entity types

export interface Permission {
  id: string;
  code: string;
  name: string;
  description: string | null;
  resource: string;
  action: string;
}

export interface Role {
  id: string;
  name: string;
  description: string | null;
  is_system: boolean;
  permissions: Permission[];
  created_at: string;
  updated_at: string;
}

// Role DTOs
export interface CreateRoleDto {
  name: string;
  description?: string;
  permission_ids: string[];
}

export interface UpdateRoleDto {
  name?: string;
  description?: string;
  permission_ids?: string[];
}

export interface User {
  id: string;
  tenant_id: string;
  email: string;
  first_name: string;
  last_name: string;
  is_active: boolean;
  is_superuser: boolean;
  avatar_url: string | null;
  last_login_at: string | null;
  role: Role | null;
  created_at: string;
  updated_at: string;
  version: number;
}

// Request DTOs
export interface CreateUserDto {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  role_id?: string;
  is_active?: boolean;
  avatar_url?: string;
}

export interface UpdateUserDto {
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
  is_active?: boolean;
  role_id?: string;
  password?: string;
  version: number;
}

// Filter params
export interface UserFilterParams {
  page?: number;
  pageSize?: number;
  is_active?: boolean;
  search?: string;
}

// Auth types
export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  tokens: AuthTokens;
}

// For backward compatibility
export type TokensResponse = AuthTokens;

// Extended user with permissions for /auth/me endpoint
export interface UserWithPermissions extends User {
  permissions: string[]; // List of permission codes like ["articles.read", "articles.write"]
}

// Change password request
export interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
}
