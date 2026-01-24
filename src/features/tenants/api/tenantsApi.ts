import { apiClient } from "@/shared/api";
import { API_ENDPOINTS } from "@/shared/config";
import type {
  Tenant,
  TenantListParams,
  TenantsListResponse,
  CreateTenantDto,
  UpdateTenantDto,
  EnabledFeaturesResponse,
} from "@/entities/tenant";

export const tenantsApi = {
  // List all tenants (platform owner only)
  list: (params?: TenantListParams) =>
    apiClient.get<TenantsListResponse>(API_ENDPOINTS.TENANTS.LIST, { params }),

  // Get tenant by ID
  getById: (tenantId: string) =>
    apiClient.get<Tenant>(API_ENDPOINTS.TENANTS.BY_ID(tenantId)),

  // Create new tenant (platform owner only)
  create: (data: CreateTenantDto) =>
    apiClient.post<Tenant>(API_ENDPOINTS.TENANTS.LIST, data),

  // Update tenant
  update: (tenantId: string, data: UpdateTenantDto) =>
    apiClient.patch<Tenant>(API_ENDPOINTS.TENANTS.BY_ID(tenantId), data),

  // Delete tenant (platform owner only)
  delete: (tenantId: string) =>
    apiClient.delete(API_ENDPOINTS.TENANTS.BY_ID(tenantId)),

  // Upload logo
  uploadLogo: (tenantId: string, file: File) =>
    apiClient.uploadFile<Tenant>(API_ENDPOINTS.TENANTS.LOGO(tenantId), file),

  // Delete logo
  deleteLogo: (tenantId: string) =>
    apiClient.delete(API_ENDPOINTS.TENANTS.LOGO(tenantId)),

  // Get enabled features for current user (for sidebar filtering)
  getEnabledFeatures: () =>
    apiClient.get<EnabledFeaturesResponse>(API_ENDPOINTS.AUTH.ME_FEATURES),
};

// Query keys factory
export const tenantsKeys = {
  all: ["tenants"] as const,
  lists: () => [...tenantsKeys.all, "list"] as const,
  list: (params?: TenantListParams) => [...tenantsKeys.lists(), params] as const,
  details: () => [...tenantsKeys.all, "detail"] as const,
  detail: (id: string) => [...tenantsKeys.details(), id] as const,
  enabledFeatures: () => ["enabledFeatures"] as const,
};
