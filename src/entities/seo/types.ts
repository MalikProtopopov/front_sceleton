// SEO entity types

export interface SEORoute {
  id: string;
  tenant_id: string;
  path: string;
  locale: string;
  title: string | null;
  meta_title: string | null;
  meta_description: string | null;
  meta_keywords: string | null;
  og_image: string | null;
  canonical_url: string | null;
  robots_index: boolean;
  robots_follow: boolean;
  robots_meta: string | null;
  structured_data: string | null;
  sitemap_priority: number;
  sitemap_changefreq: string | null;
  include_in_sitemap: boolean;
  version: number;
  created_at: string;
  updated_at: string;
}

export interface SEORedirect {
  id: string;
  tenant_id: string;
  source_path: string;
  target_url: string;
  redirect_type: number;
  is_active: boolean;
  hit_count: number;
  created_at: string;
  updated_at: string;
}

// Request DTOs
export interface CreateSEORouteDto {
  path: string;
  locale: string;
  title?: string;
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string;
  og_image?: string;
  canonical_url?: string;
  robots_index?: boolean;
  robots_follow?: boolean;
  structured_data?: string;
  sitemap_priority?: number;
  sitemap_changefreq?: string;
  include_in_sitemap?: boolean;
}

export interface UpdateSEORouteDto {
  title?: string;
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string;
  og_image?: string;
  canonical_url?: string;
  robots_index?: boolean;
  robots_follow?: boolean;
  structured_data?: string;
  sitemap_priority?: number;
  sitemap_changefreq?: string;
  include_in_sitemap?: boolean;
}

export interface CreateRedirectDto {
  source_path: string;
  target_url: string;
  redirect_type?: number;
  is_active?: boolean;
}

export interface UpdateRedirectDto {
  source_path?: string;
  target_url?: string;
  redirect_type?: number;
  is_active?: boolean;
}

// Filter params
export interface RedirectFilterParams {
  page?: number;
  pageSize?: number;
  isActive?: boolean;
}

// Sitemap change frequencies
export const SITEMAP_CHANGEFREQ_OPTIONS = [
  { value: "always", label: "Постоянно" },
  { value: "hourly", label: "Каждый час" },
  { value: "daily", label: "Ежедневно" },
  { value: "weekly", label: "Еженедельно" },
  { value: "monthly", label: "Ежемесячно" },
  { value: "yearly", label: "Ежегодно" },
  { value: "never", label: "Никогда" },
] as const;

// Redirect types
export const REDIRECT_TYPE_OPTIONS = [
  { value: 301, label: "301 (Permanent)" },
  { value: 302, label: "302 (Temporary)" },
  { value: 307, label: "307 (Temporary Redirect)" },
  { value: 308, label: "308 (Permanent Redirect)" },
] as const;

