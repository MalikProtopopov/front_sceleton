// Article entity types

export type ArticleStatus = "draft" | "published" | "archived";

export interface ArticleLocale {
  id: string;
  article_id: string;
  locale: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  meta_title: string | null;
  meta_description: string | null;
  created_at: string;
  updated_at: string;
}

export interface ArticleTopic {
  topic_id: string;
}

export interface Article {
  id: string;
  tenant_id: string;
  status: ArticleStatus;
  cover_image_url: string | null;
  reading_time_minutes: number | null;
  sort_order: number;
  version: number;
  published_at: string | null;
  view_count: number;
  author_id: string;
  created_at: string;
  updated_at: string;
  locales: ArticleLocale[];
  topics: ArticleTopic[];
}

// Request DTOs
export interface CreateArticleLocaleDto {
  locale: string;
  title: string;
  slug: string;
  excerpt?: string;
  content?: string;
  meta_title?: string;
  meta_description?: string;
}

export interface CreateArticleDto {
  status?: ArticleStatus;
  reading_time_minutes?: number;
  sort_order?: number;
  topic_ids?: string[];
  locales: CreateArticleLocaleDto[];
}

export interface UpdateArticleDto {
  status?: ArticleStatus;
  reading_time_minutes?: number;
  sort_order?: number;
  topic_ids?: string[];
  locales?: CreateArticleLocaleDto[];
  version: number; // Required for optimistic locking
}

// Topic types
export interface TopicLocale {
  id: string;
  topic_id: string;
  locale: string;
  name: string;
  slug: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface Topic {
  id: string;
  tenant_id: string;
  sort_order: number;
  version: number;
  created_at: string;
  updated_at: string;
  locales: TopicLocale[];
}

// Filter params
export interface ArticleFilterParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  status?: ArticleStatus;
  topicId?: string;
  search?: string;
}

// Locale DTOs (for independent locale management)
export interface UpdateArticleLocaleDto {
  locale: string; // Required
  title?: string;
  slug?: string;
  excerpt?: string;
  content?: string;
  meta_title?: string;
  meta_description?: string;
}

