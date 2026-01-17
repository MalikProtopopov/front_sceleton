// Employee entity types

export interface EmployeeLocale {
  id: string;
  employee_id: string;
  locale: string;
  first_name: string;
  last_name: string;
  position: string | null;
  slug: string;
  bio: string | null;
  meta_title: string | null;
  meta_description: string | null;
  created_at: string;
  updated_at: string;
}

export interface EmployeePracticeArea {
  practice_area_id: string;
}

export interface Employee {
  id: string;
  tenant_id: string;
  photo_url: string | null;
  email: string | null;
  phone: string | null;
  is_published: boolean;
  sort_order: number;
  version: number;
  created_at: string;
  updated_at: string;
  locales: EmployeeLocale[];
  practice_areas: EmployeePracticeArea[];
}

// Request DTOs
export interface CreateEmployeeLocaleDto {
  locale: string;
  first_name: string;
  last_name: string;
  position?: string;
  slug: string;
  bio?: string;
  meta_title?: string;
  meta_description?: string;
}

export interface CreateEmployeeDto {
  email?: string;
  phone?: string;
  is_published?: boolean;
  sort_order?: number;
  practice_area_ids?: string[];
  locales: CreateEmployeeLocaleDto[];
}

export interface UpdateEmployeeDto {
  email?: string;
  phone?: string;
  is_published?: boolean;
  sort_order?: number;
  practice_area_ids?: string[];
  locales?: CreateEmployeeLocaleDto[];
  version: number; // Required for optimistic locking
}

// Filter params
export interface EmployeeFilterParams {
  page?: number;
  pageSize?: number;
  isPublished?: boolean;
  search?: string;
}

// Locale DTOs (for independent locale management)
export interface UpdateEmployeeLocaleDto {
  locale: string; // Required
  first_name?: string;
  last_name?: string;
  position?: string;
  slug?: string;
  bio?: string;
  meta_title?: string;
  meta_description?: string;
}

