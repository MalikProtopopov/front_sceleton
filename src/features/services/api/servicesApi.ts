import { apiClient } from "@/shared/api";
import { API_ENDPOINTS } from "@/shared/config";
import type { PaginatedResponse } from "@/shared/types";
import type {
  Service,
  ServiceLocale,
  CreateServiceDto,
  UpdateServiceDto,
  CreateServiceLocaleDto,
  UpdateServiceLocaleDto,
  ServiceFilterParams,
  ServicePrice,
  CreateServicePriceDto,
  UpdateServicePriceDto,
  ServiceTag,
  CreateServiceTagDto,
  UpdateServiceTagDto,
} from "@/entities/service";

export const servicesApi = {
  getAll: (params?: ServiceFilterParams) =>
    apiClient.get<PaginatedResponse<Service>>(API_ENDPOINTS.SERVICES.LIST, { params }),

  getById: (id: string) =>
    apiClient.get<Service>(API_ENDPOINTS.SERVICES.BY_ID(id)),

  create: (data: CreateServiceDto) =>
    apiClient.post<Service>(API_ENDPOINTS.SERVICES.LIST, data),

  update: (id: string, data: UpdateServiceDto) =>
    apiClient.patch<Service>(API_ENDPOINTS.SERVICES.BY_ID(id), data),

  delete: (id: string) =>
    apiClient.delete(API_ENDPOINTS.SERVICES.BY_ID(id)),

  // Prices
  addPrice: (serviceId: string, data: CreateServicePriceDto) =>
    apiClient.post<ServicePrice>(API_ENDPOINTS.SERVICES.PRICES(serviceId), data),

  updatePrice: (serviceId: string, priceId: string, data: UpdateServicePriceDto) =>
    apiClient.patch<ServicePrice>(API_ENDPOINTS.SERVICES.PRICE_BY_ID(serviceId, priceId), data),

  deletePrice: (serviceId: string, priceId: string) =>
    apiClient.delete(API_ENDPOINTS.SERVICES.PRICE_BY_ID(serviceId, priceId)),

  // Tags
  addTag: (serviceId: string, data: CreateServiceTagDto) =>
    apiClient.post<ServiceTag>(API_ENDPOINTS.SERVICES.TAGS(serviceId), data),

  updateTag: (serviceId: string, tagId: string, data: UpdateServiceTagDto) =>
    apiClient.patch<ServiceTag>(API_ENDPOINTS.SERVICES.TAG_BY_ID(serviceId, tagId), data),

  deleteTag: (serviceId: string, tagId: string) =>
    apiClient.delete(API_ENDPOINTS.SERVICES.TAG_BY_ID(serviceId, tagId)),

  // Locales
  createLocale: (serviceId: string, data: CreateServiceLocaleDto) =>
    apiClient.post<ServiceLocale>(API_ENDPOINTS.SERVICES.LOCALES(serviceId), data),

  updateLocale: (serviceId: string, localeId: string, data: UpdateServiceLocaleDto) =>
    apiClient.patch<ServiceLocale>(API_ENDPOINTS.SERVICES.LOCALE_BY_ID(serviceId, localeId), data),

  deleteLocale: (serviceId: string, localeId: string) =>
    apiClient.delete(API_ENDPOINTS.SERVICES.LOCALE_BY_ID(serviceId, localeId)),
};

// Query keys factory
export const servicesKeys = {
  all: ["services"] as const,
  lists: () => [...servicesKeys.all, "list"] as const,
  list: (params?: ServiceFilterParams) => [...servicesKeys.lists(), params] as const,
  details: () => [...servicesKeys.all, "detail"] as const,
  detail: (id: string) => [...servicesKeys.details(), id] as const,
};

