import { apiClient } from "@/shared/api";
import { API_ENDPOINTS } from "@/shared/config";
import type { UOM, CreateUOMDto, UpdateUOMDto } from "@/entities/product";

export const uomsApi = {
  getAll: () => apiClient.get<UOM[]>(API_ENDPOINTS.UOMS.LIST),

  create: (data: CreateUOMDto) =>
    apiClient.post<UOM>(API_ENDPOINTS.UOMS.LIST, data),

  update: (id: string, data: UpdateUOMDto) =>
    apiClient.patch<UOM>(API_ENDPOINTS.UOMS.BY_ID(id), data),
};

export const uomsKeys = {
  all: ["uoms"] as const,
  list: () => [...uomsKeys.all, "list"] as const,
};
