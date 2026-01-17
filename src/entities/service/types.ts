// Service entity types

export interface ServiceLocale {
  id: string;
  service_id: string;
  locale: string;
  title: string;
  slug: string;
  short_description: string | null;
  description: string | null;
  meta_title: string | null;
  meta_description: string | null;
  meta_keywords: string | null;
  created_at: string;
  updated_at: string;
}

export type ServiceCurrency = "RUB" | "USD";

export interface ServicePrice {
  id: string;
  service_id: string;
  locale: string;
  price: number;
  currency: ServiceCurrency;
  created_at: string;
  updated_at: string;
}

export interface ServiceTag {
  id: string;
  service_id: string;
  locale: string;
  tag: string;
  created_at: string;
  updated_at: string;
}

export interface Service {
  id: string;
  tenant_id: string;
  icon: string | null;
  cover_image_url: string | null;
  is_published: boolean;
  sort_order: number;
  version: number;
  created_at: string;
  updated_at: string;
  locales: ServiceLocale[];
  prices: ServicePrice[];
  tags: ServiceTag[];
}

// Request DTOs
export interface CreateServiceLocaleDto {
  locale: string;
  title: string;
  slug: string;
  short_description?: string;
  description?: string;
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string;
}

export interface CreateServiceDto {
  icon?: string;
  is_published?: boolean;
  sort_order?: number;
  locales: CreateServiceLocaleDto[];
}

export interface UpdateServiceDto {
  icon?: string;
  is_published?: boolean;
  sort_order?: number;
  locales?: CreateServiceLocaleDto[];
  version: number; // Required for optimistic locking
}

// Filter params
export interface ServiceFilterParams {
  page?: number;
  pageSize?: number;
  isPublished?: boolean;
}

// Price DTOs
export interface CreateServicePriceDto {
  locale: string;
  price: number;
  currency: ServiceCurrency;
}

export interface UpdateServicePriceDto {
  price?: number;
  currency?: ServiceCurrency;
}

// Tag DTOs
export interface CreateServiceTagDto {
  locale: string;
  tag: string;
}

export interface UpdateServiceTagDto {
  locale: string;
  tag: string;
}

// Locale DTOs (for independent locale management)
export interface UpdateServiceLocaleDto {
  locale: string; // Required
  title?: string;
  slug?: string;
  short_description?: string;
  description?: string;
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string;
}

