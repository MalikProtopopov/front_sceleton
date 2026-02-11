"use client";

import { useQuery } from "@tanstack/react-query";
import { platformApi, platformKeys } from "../api/platformApi";
import type { TenantTableParams } from "@/entities/platform";

export function usePlatformOverview() {
  return useQuery({
    queryKey: platformKeys.overview(),
    queryFn: () => platformApi.getOverview(),
    staleTime: 5 * 60 * 1000, // 5 min
    refetchOnWindowFocus: true,
  });
}

export function usePlatformTenants(params?: TenantTableParams) {
  return useQuery({
    queryKey: platformKeys.tenantsList(params),
    queryFn: () => platformApi.getTenants(params),
    staleTime: 60 * 1000,
  });
}

export function usePlatformTenantDetails(tenantId: string) {
  return useQuery({
    queryKey: platformKeys.tenantDetail(tenantId),
    queryFn: () => platformApi.getTenantDetails(tenantId),
    enabled: !!tenantId,
  });
}

export function usePlatformTrends(days: number = 90) {
  return useQuery({
    queryKey: platformKeys.trends(days),
    queryFn: () => platformApi.getTrends(days),
    staleTime: 10 * 60 * 1000, // cache for session
  });
}

export function usePlatformAlerts() {
  return useQuery({
    queryKey: platformKeys.alerts(),
    queryFn: () => platformApi.getAlerts(),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
  });
}
