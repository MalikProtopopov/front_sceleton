import { apiClient } from "@/shared/api";
import { API_ENDPOINTS } from "@/shared/config";
import type { PaginatedResponse } from "@/shared/types";
import type { 
  SEORoute, 
  SEORedirect, 
  CreateSEORouteDto, 
  UpdateSEORouteDto,
  CreateRedirectDto,
  UpdateRedirectDto,
  RedirectFilterParams 
} from "@/entities/seo";

export const seoApi = {
  // SEO Routes
  getRoutes: () =>
    apiClient.get<SEORoute[]>(API_ENDPOINTS.SEO.ROUTES),

  getRouteById: (id: string) =>
    apiClient.get<SEORoute>(API_ENDPOINTS.SEO.ROUTE_BY_ID(id)),

  upsertRoute: (data: CreateSEORouteDto) =>
    apiClient.put<SEORoute>(API_ENDPOINTS.SEO.ROUTES, data),

  updateRoute: (id: string, data: UpdateSEORouteDto) =>
    apiClient.patch<SEORoute>(API_ENDPOINTS.SEO.ROUTE_BY_ID(id), data),

  deleteRoute: (id: string) =>
    apiClient.delete(API_ENDPOINTS.SEO.ROUTE_BY_ID(id)),

  // Redirects
  getRedirects: (params?: RedirectFilterParams) =>
    apiClient.get<PaginatedResponse<SEORedirect>>(API_ENDPOINTS.SEO.REDIRECTS, { params }),

  getRedirectById: (id: string) =>
    apiClient.get<SEORedirect>(API_ENDPOINTS.SEO.REDIRECT_BY_ID(id)),

  createRedirect: (data: CreateRedirectDto) =>
    apiClient.post<SEORedirect>(API_ENDPOINTS.SEO.REDIRECTS, data),

  updateRedirect: (id: string, data: UpdateRedirectDto) =>
    apiClient.patch<SEORedirect>(API_ENDPOINTS.SEO.REDIRECT_BY_ID(id), data),

  deleteRedirect: (id: string) =>
    apiClient.delete(API_ENDPOINTS.SEO.REDIRECT_BY_ID(id)),
};

// Query keys factory
export const seoKeys = {
  all: ["seo"] as const,
  routes: () => [...seoKeys.all, "routes"] as const,
  route: (id: string) => [...seoKeys.routes(), id] as const,
  redirects: () => [...seoKeys.all, "redirects"] as const,
  redirectList: (params?: RedirectFilterParams) => [...seoKeys.redirects(), "list", params] as const,
  redirect: (id: string) => [...seoKeys.redirects(), id] as const,
};

