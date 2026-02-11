import { apiClient } from "@/shared/api";
import { API_ENDPOINTS } from "@/shared/config";
import type {
  PlatformOverview,
  TenantTableResponse,
  TenantTableParams,
  TenantDetailStats,
  PlatformTrends,
  PlatformAlerts,
} from "@/entities/platform";

export const platformApi = {
  getOverview: () =>
    apiClient.get<PlatformOverview>(API_ENDPOINTS.PLATFORM.OVERVIEW),

  getTenants: (params?: TenantTableParams) =>
    apiClient.get<TenantTableResponse>(API_ENDPOINTS.PLATFORM.TENANTS, { params }),

  getTenantDetails: (tenantId: string) =>
    apiClient.get<TenantDetailStats>(API_ENDPOINTS.PLATFORM.TENANT_DETAILS(tenantId)),

  getTrends: (days: number = 90) =>
    apiClient.get<PlatformTrends>(API_ENDPOINTS.PLATFORM.TRENDS, { params: { days } }),

  getAlerts: () =>
    apiClient.get<PlatformAlerts>(API_ENDPOINTS.PLATFORM.ALERTS),
};

export const platformKeys = {
  all: ["platform"] as const,
  overview: () => [...platformKeys.all, "overview"] as const,
  tenants: () => [...platformKeys.all, "tenants"] as const,
  tenantsList: (params?: TenantTableParams) => [...platformKeys.tenants(), "list", params] as const,
  tenantDetail: (id: string) => [...platformKeys.tenants(), "detail", id] as const,
  trends: (days?: number) => [...platformKeys.all, "trends", days] as const,
  alerts: () => [...platformKeys.all, "alerts"] as const,
};
