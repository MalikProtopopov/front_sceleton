import { apiClient } from "@/shared/api";
import { API_ENDPOINTS } from "@/shared/config";
import type { PaginatedResponse } from "@/shared/types";
import type {
  Category,
  CategoryFilterParams,
  CreateCategoryDto,
  UpdateCategoryDto,
} from "@/entities/product";

export const categoriesApi = {
  getAll: (params?: CategoryFilterParams) =>
    apiClient.get<PaginatedResponse<Category>>(API_ENDPOINTS.CATEGORIES.LIST, { params }),

  getTree: () =>
    apiClient.get<{ items: Category[]; total: number }>(API_ENDPOINTS.CATEGORIES.TREE),

  getById: (id: string) =>
    apiClient.get<Category>(API_ENDPOINTS.CATEGORIES.BY_ID(id)),

  create: (data: CreateCategoryDto) =>
    apiClient.post<Category>(API_ENDPOINTS.CATEGORIES.LIST, data),

  update: (id: string, data: UpdateCategoryDto) =>
    apiClient.patch<Category>(API_ENDPOINTS.CATEGORIES.BY_ID(id), data),

  delete: (id: string) =>
    apiClient.delete(API_ENDPOINTS.CATEGORIES.BY_ID(id)),
};

export const categoriesKeys = {
  all: ["categories"] as const,
  lists: () => [...categoriesKeys.all, "list"] as const,
  list: (params?: CategoryFilterParams) => [...categoriesKeys.lists(), params] as const,
  tree: () => [...categoriesKeys.all, "tree"] as const,
  details: () => [...categoriesKeys.all, "detail"] as const,
  detail: (id: string) => [...categoriesKeys.details(), id] as const,
};
