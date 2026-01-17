import { apiClient } from "@/shared/api";
import { API_ENDPOINTS } from "@/shared/config";
import type { PaginatedResponse } from "@/shared/types";
import type { Topic, TopicLocale, CreateTopicDto, UpdateTopicDto, CreateTopicLocaleDto, UpdateTopicLocaleDto, TopicFilterParams } from "@/entities/topic";

export const topicsApi = {
  getAll: async (params?: TopicFilterParams) => {
    // Backend returns array directly, not PaginatedResponse
    // apiClient.get already returns response.data, so response is Topic[]
    const topics = await apiClient.get<Topic[]>(API_ENDPOINTS.TOPICS.LIST, { params });
    // Convert array to PaginatedResponse format for consistency
    const topicsArray = Array.isArray(topics) ? topics : [];
    return {
      items: topicsArray,
      total: topicsArray.length,
      page: 1,
      page_size: topicsArray.length,
    } as PaginatedResponse<Topic>;
  },

  getById: (id: string) =>
    apiClient.get<Topic>(API_ENDPOINTS.TOPICS.BY_ID(id)),

  create: (data: CreateTopicDto) =>
    apiClient.post<Topic>(API_ENDPOINTS.TOPICS.LIST, data),

  update: (id: string, data: UpdateTopicDto) =>
    apiClient.patch<Topic>(API_ENDPOINTS.TOPICS.BY_ID(id), data),

  delete: (id: string) =>
    apiClient.delete(API_ENDPOINTS.TOPICS.BY_ID(id)),

  // Locales
  createLocale: (topicId: string, data: CreateTopicLocaleDto) =>
    apiClient.post<TopicLocale>(API_ENDPOINTS.TOPICS.LOCALES(topicId), data),

  updateLocale: (topicId: string, localeId: string, data: UpdateTopicLocaleDto) =>
    apiClient.patch<TopicLocale>(API_ENDPOINTS.TOPICS.LOCALE_BY_ID(topicId, localeId), data),

  deleteLocale: (topicId: string, localeId: string) =>
    apiClient.delete(API_ENDPOINTS.TOPICS.LOCALE_BY_ID(topicId, localeId)),
};

// Query keys factory
export const topicsKeys = {
  all: ["topics"] as const,
  lists: () => [...topicsKeys.all, "list"] as const,
  list: (params?: TopicFilterParams) => [...topicsKeys.lists(), params] as const,
  details: () => [...topicsKeys.all, "detail"] as const,
  detail: (id: string) => [...topicsKeys.details(), id] as const,
};

