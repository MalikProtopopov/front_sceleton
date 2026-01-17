import { apiClient } from "@/shared/api";
import { API_ENDPOINTS } from "@/shared/config";
import type { PaginatedResponse } from "@/shared/types";
import type {
  Article,
  ArticleLocale,
  Topic,
  CreateArticleDto,
  UpdateArticleDto,
  CreateArticleLocaleDto,
  UpdateArticleLocaleDto,
  ArticleFilterParams,
} from "@/entities/article";

export const articlesApi = {
  // Articles
  getAll: (params?: ArticleFilterParams) =>
    apiClient.get<PaginatedResponse<Article>>(API_ENDPOINTS.ARTICLES.LIST, { params }),

  getById: (id: string) =>
    apiClient.get<Article>(API_ENDPOINTS.ARTICLES.BY_ID(id)),

  create: (data: CreateArticleDto) =>
    apiClient.post<Article>(API_ENDPOINTS.ARTICLES.LIST, data),

  update: (id: string, data: UpdateArticleDto) =>
    apiClient.patch<Article>(API_ENDPOINTS.ARTICLES.BY_ID(id), data),

  delete: (id: string) =>
    apiClient.delete(API_ENDPOINTS.ARTICLES.BY_ID(id)),

  publish: (id: string) =>
    apiClient.post<Article>(API_ENDPOINTS.ARTICLES.PUBLISH(id)),

  unpublish: (id: string) =>
    apiClient.post<Article>(API_ENDPOINTS.ARTICLES.UNPUBLISH(id)),

  // Topics
  getTopics: () =>
    apiClient.get<PaginatedResponse<Topic>>(API_ENDPOINTS.TOPICS.LIST),

  getTopic: (id: string) =>
    apiClient.get<Topic>(API_ENDPOINTS.TOPICS.BY_ID(id)),

  // Locales
  createLocale: (articleId: string, data: CreateArticleLocaleDto) =>
    apiClient.post<ArticleLocale>(API_ENDPOINTS.ARTICLES.LOCALES(articleId), data),

  updateLocale: (articleId: string, localeId: string, data: UpdateArticleLocaleDto) =>
    apiClient.patch<ArticleLocale>(API_ENDPOINTS.ARTICLES.LOCALE_BY_ID(articleId, localeId), data),

  deleteLocale: (articleId: string, localeId: string) =>
    apiClient.delete(API_ENDPOINTS.ARTICLES.LOCALE_BY_ID(articleId, localeId)),
};

// Query keys factory
export const articlesKeys = {
  all: ["articles"] as const,
  lists: () => [...articlesKeys.all, "list"] as const,
  list: (params?: ArticleFilterParams) => [...articlesKeys.lists(), params] as const,
  details: () => [...articlesKeys.all, "detail"] as const,
  detail: (id: string) => [...articlesKeys.details(), id] as const,
};

export const topicsKeys = {
  all: ["topics"] as const,
  list: () => [...topicsKeys.all, "list"] as const,
  detail: (id: string) => [...topicsKeys.all, "detail", id] as const,
};

