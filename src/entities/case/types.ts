// Case entity types

export type CaseStatus = "draft" | "published" | "archived";

export interface CaseLocale {
  id: string;
  case_id: string;
  locale: string;
  title: string;
  slug: string;
  excerpt: string | null;
  description: string | null;
  results: string | null;
  meta_title: string | null;
  meta_description: string | null;
  created_at: string;
  updated_at: string;
}

export interface CaseServiceLink {
  service_id: string;
}

export interface Case {
  id: string;
  tenant_id: string;
  status: CaseStatus;
  cover_image_url: string | null;
  client_name: string | null;
  project_year: number | null;
  project_duration: string | null;
  is_featured: boolean;
  sort_order: number;
  version: number;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  locales: CaseLocale[];
  services: CaseServiceLink[];
}

// Request DTOs
export interface CreateCaseLocaleDto {
  locale: string;
  title: string;
  slug: string;
  excerpt?: string;
  description?: string;
  results?: string;
  meta_title?: string;
  meta_description?: string;
}

export interface CreateCaseDto {
  status?: CaseStatus;
  client_name?: string;
  project_year?: number;
  project_duration?: string;
  is_featured?: boolean;
  sort_order?: number;
  service_ids?: string[];
  locales: CreateCaseLocaleDto[];
}

export interface UpdateCaseDto {
  status?: CaseStatus;
  client_name?: string;
  project_year?: number;
  project_duration?: string;
  is_featured?: boolean;
  sort_order?: number;
  service_ids?: string[];
  locales?: CreateCaseLocaleDto[];
  version: number; // Required for optimistic locking
}

// Filter params
export interface CaseFilterParams {
  page?: number;
  pageSize?: number;
  status?: CaseStatus;
  featured?: boolean;
  serviceId?: string;
  search?: string;
}

// Locale DTOs (for independent locale management)
export interface UpdateCaseLocaleDto {
  locale: string; // Required
  title?: string;
  slug?: string;
  excerpt?: string;
  description?: string;
  results?: string;
  meta_title?: string;
  meta_description?: string;
}

