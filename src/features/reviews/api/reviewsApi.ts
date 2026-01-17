import { apiClient } from "@/shared/api";
import { API_ENDPOINTS } from "@/shared/config";
import type { PaginatedResponse } from "@/shared/types";
import type { Review, CreateReviewDto, UpdateReviewDto, ReviewFilterParams } from "@/entities/review";

export const reviewsApi = {
  getAll: (params?: ReviewFilterParams) =>
    apiClient.get<PaginatedResponse<Review>>(API_ENDPOINTS.REVIEWS.LIST, { params }),

  getById: (id: string) =>
    apiClient.get<Review>(API_ENDPOINTS.REVIEWS.BY_ID(id)),

  create: (data: CreateReviewDto) =>
    apiClient.post<Review>(API_ENDPOINTS.REVIEWS.LIST, data),

  update: (id: string, data: UpdateReviewDto) =>
    apiClient.patch<Review>(API_ENDPOINTS.REVIEWS.BY_ID(id), data),

  delete: (id: string) =>
    apiClient.delete(API_ENDPOINTS.REVIEWS.BY_ID(id)),

  approve: (id: string) =>
    apiClient.post<Review>(API_ENDPOINTS.REVIEWS.APPROVE(id)),

  reject: (id: string) =>
    apiClient.post<Review>(API_ENDPOINTS.REVIEWS.REJECT(id)),
};

// Query keys factory
export const reviewsKeys = {
  all: ["reviews"] as const,
  lists: () => [...reviewsKeys.all, "list"] as const,
  list: (params?: ReviewFilterParams) => [...reviewsKeys.lists(), params] as const,
  details: () => [...reviewsKeys.all, "detail"] as const,
  detail: (id: string) => [...reviewsKeys.details(), id] as const,
};

