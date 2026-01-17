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

