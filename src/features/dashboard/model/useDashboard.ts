"use client";

import { useQuery } from "@tanstack/react-query";
import { dashboardApi, dashboardKeys } from "../api/dashboardApi";

// 5 minute refresh interval to match backend Redis cache TTL
const DASHBOARD_STALE_TIME = 5 * 60 * 1000;

export function useDashboard() {
  return useQuery({
    queryKey: dashboardKeys.stats(),
    queryFn: () => dashboardApi.getStats(),
    staleTime: DASHBOARD_STALE_TIME,
    refetchInterval: DASHBOARD_STALE_TIME,
  });
}

