// Generic API Types

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
}

export interface ListParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  search?: string;
}

export interface ApiError {
  type: string;
  title: string;
  status: number;
  detail: string;
  instance?: string;
  errors?: ValidationError[];
  error_code?: string; // e.g. "tenant_inactive", "feature_disabled", "already_exists", "version_conflict", "system_role_protected", "permission_denied", "insufficient_role", "rate_limit_exceeded"
  resource?: string;
  field?: string;
  /** "organization" for feature_disabled, "user" for permission_denied / insufficient_role */
  restriction_level?: "organization" | "user";
  /** Feature name when error_code is "feature_disabled" */
  feature?: string;
  /** Required permission code when error_code is "permission_denied" */
  required_permission?: string;
}

export interface ValidationError {
  loc: (string | number)[];
  msg: string;
  type: string;
}

// Base entity with common fields
export interface BaseEntity {
  id: string;
  tenant_id: string;
  created_at: string;
  updated_at: string;
}

// Entity with optimistic locking
export interface VersionedEntity extends BaseEntity {
  version: number;
}

// Localized content
export interface LocalizedContent {
  locale: string;
  title: string;
  slug: string;
  meta_title?: string | null;
  meta_description?: string | null;
}

