import { apiClient } from "@/shared/api";
import { API_ENDPOINTS } from "@/shared/config";
import type { DashboardResponse } from "@/entities/dashboard";

export const dashboardApi = {
  getStats: () =>
    apiClient.get<DashboardResponse>(API_ENDPOINTS.DASHBOARD),
};

// Query keys factory
export const dashboardKeys = {
  all: ["dashboard"] as const,
  stats: () => [...dashboardKeys.all, "stats"] as const,
};

