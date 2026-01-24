import { apiClient } from "@/shared/api";
import { API_ENDPOINTS } from "@/shared/config";
import type {
  Tenant,
  TenantSettings,
  FeatureFlagsResponse,
  FeatureFlag,
  UpdateTenantDto,
  UpdateTenantSettingsDto,
  UpdateFeatureFlagDto,
} from "@/entities/tenant";
import type { ChangePasswordDto } from "../model/useSettings";

export const settingsApi = {
  // Tenant
  getTenant: (tenantId: string) =>
    apiClient.get<Tenant>(API_ENDPOINTS.TENANTS.BY_ID(tenantId)),

  updateTenant: (tenantId: string, data: UpdateTenantDto) =>
    apiClient.patch<Tenant>(API_ENDPOINTS.TENANTS.BY_ID(tenantId), data),

  // Tenant Logo
  uploadLogo: (tenantId: string, file: File) =>
    apiClient.uploadFile<Tenant>(API_ENDPOINTS.TENANTS.LOGO(tenantId), file),

  deleteLogo: (tenantId: string) =>
    apiClient.delete(API_ENDPOINTS.TENANTS.LOGO(tenantId)),

  // Settings
  updateSettings: (tenantId: string, data: UpdateTenantSettingsDto) =>
    apiClient.put<TenantSettings>(API_ENDPOINTS.TENANTS.SETTINGS(tenantId), data),

  // Feature Flags
  getFeatureFlags: (tenantId: string) =>
    apiClient.get<FeatureFlagsResponse>(API_ENDPOINTS.FEATURE_FLAGS.LIST, { 
      params: { tenant_id: tenantId } 
    }),

  updateFeatureFlag: (featureName: string, tenantId: string, data: UpdateFeatureFlagDto) =>
    apiClient.patch<FeatureFlag>(
      `${API_ENDPOINTS.FEATURE_FLAGS.BY_NAME(featureName)}?tenant_id=${tenantId}`,
      data
    ),

  // Password change
  changePassword: (data: ChangePasswordDto) =>
    apiClient.post(API_ENDPOINTS.AUTH.CHANGE_PASSWORD, data),
};

// Query keys factory
export const settingsKeys = {
  all: ["settings"] as const,
  tenant: (tenantId: string) => [...settingsKeys.all, "tenant", tenantId] as const,
  featureFlags: (tenantId: string) => [...settingsKeys.all, "featureFlags", tenantId] as const,
};

