import { apiClient } from "@/shared/api";
import { API_ENDPOINTS } from "@/shared/config";
import type { PaginatedResponse } from "@/shared/types";
import type { FAQ, FAQLocale, CreateFAQDto, UpdateFAQDto, CreateFAQLocaleDto, UpdateFAQLocaleDto, FAQFilterParams } from "@/entities/faq";

export const faqApi = {
  getAll: (params?: FAQFilterParams) =>
    apiClient.get<PaginatedResponse<FAQ>>(API_ENDPOINTS.FAQ.LIST, { params }),

  getById: (id: string) =>
    apiClient.get<FAQ>(API_ENDPOINTS.FAQ.BY_ID(id)),

  create: (data: CreateFAQDto) =>
    apiClient.post<FAQ>(API_ENDPOINTS.FAQ.LIST, data),

  update: (id: string, data: UpdateFAQDto) =>
    apiClient.patch<FAQ>(API_ENDPOINTS.FAQ.BY_ID(id), data),

  delete: (id: string) =>
    apiClient.delete(API_ENDPOINTS.FAQ.BY_ID(id)),

  // Locales
  createLocale: (faqId: string, data: CreateFAQLocaleDto) =>
    apiClient.post<FAQLocale>(API_ENDPOINTS.FAQ.LOCALES(faqId), data),

  updateLocale: (faqId: string, localeId: string, data: UpdateFAQLocaleDto) =>
    apiClient.patch<FAQLocale>(API_ENDPOINTS.FAQ.LOCALE_BY_ID(faqId, localeId), data),

  deleteLocale: (faqId: string, localeId: string) =>
    apiClient.delete(API_ENDPOINTS.FAQ.LOCALE_BY_ID(faqId, localeId)),
};

// Query keys factory
export const faqKeys = {
  all: ["faq"] as const,
  lists: () => [...faqKeys.all, "list"] as const,
  list: (params?: FAQFilterParams) => [...faqKeys.lists(), params] as const,
  details: () => [...faqKeys.all, "detail"] as const,
  detail: (id: string) => [...faqKeys.details(), id] as const,
};

