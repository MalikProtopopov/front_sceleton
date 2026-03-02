import { useMemo } from "react";
import { useMyLimits } from "@/features/billing";
import type { UsageEntry, UsageStatus } from "@/entities/billing";

interface LimitGuardResult {
  isLoading: boolean;
  /** true if the user can create new records (ok, warning, or unlimited) */
  canCreate: boolean;
  status: UsageStatus | null;
  current: number;
  limit: number | null;
  entry: UsageEntry | null;
}

const DEFAULT: LimitGuardResult = {
  isLoading: false,
  canCreate: true,
  status: null,
  current: 0,
  limit: null,
  entry: null,
};

export function useLimitGuard(resourceKey: string): LimitGuardResult {
  const { data: limits, isLoading } = useMyLimits();

  return useMemo(() => {
    if (!limits) return { ...DEFAULT, isLoading };

    const entry: UsageEntry | undefined = limits[resourceKey];
    if (!entry) return { ...DEFAULT, isLoading };

    const canCreate =
      entry.limit === null ||
      (entry.status !== "exceeded" && entry.status !== "not_available");

    return {
      isLoading,
      canCreate,
      status: entry.status,
      current: entry.current,
      limit: entry.limit,
      entry,
    };
  }, [limits, resourceKey, isLoading]);
}
