"use client";

import { useQuery } from "@tanstack/react-query";
import { auditApi, auditKeys } from "../api/auditApi";
import type { AuditFilterParams } from "@/entities/audit";

export function useAuditLogs(params?: AuditFilterParams) {
  return useQuery({
    queryKey: auditKeys.list(params),
    queryFn: () => auditApi.getAll(params),
  });
}

