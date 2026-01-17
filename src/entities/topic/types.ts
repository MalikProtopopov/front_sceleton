// Topic entity types

export interface TopicLocale {
  id?: string;
  topic_id?: string;
  locale: string;
  title: string;
  slug: string;
  description?: string;
  meta_title?: string;
  meta_description?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Topic {
  id: string;
  tenant_id?: string;
  icon?: string | null;
  color?: string | null;
  sort_order: number;
  locales: TopicLocale[];
  created_at: string;
  updated_at: string;
  version: number;
}

// Request DTOs
export interface CreateTopicDto {
  icon?: string | null;
  color?: string | null;
  sort_order?: number;
  locales: TopicLocale[];
}

export interface UpdateTopicDto {
  icon?: string | null;
  color?: string | null;
  sort_order?: number;
  locales?: TopicLocale[];
  version: number;
}

// Filter params
export interface TopicFilterParams {
  page?: number;
  pageSize?: number;
  is_active?: boolean;
  locale?: string;
}

// Locale DTOs (for independent locale management)
export interface CreateTopicLocaleDto {
  locale: string;
  title: string;
  slug: string;
  description?: string;
  meta_title?: string;
  meta_description?: string;
}

export interface UpdateTopicLocaleDto {
  locale: string; // Required
  title?: string;
  slug?: string;
  description?: string;
  meta_title?: string;
  meta_description?: string;
}

