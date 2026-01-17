import { apiClient } from "@/shared/api";
import { API_ENDPOINTS } from "@/shared/config";
import type { PaginatedResponse } from "@/shared/types";
import type { AuditLog, AuditFilterParams } from "@/entities/audit";

export const auditApi = {
  getAll: (params?: AuditFilterParams) =>
    apiClient.get<PaginatedResponse<AuditLog>>(API_ENDPOINTS.AUDIT.LIST, { params }),
};

// Query keys factory
export const auditKeys = {
  all: ["audit"] as const,
  lists: () => [...auditKeys.all, "list"] as const,
  list: (params?: AuditFilterParams) => [...auditKeys.lists(), params] as const,
};

