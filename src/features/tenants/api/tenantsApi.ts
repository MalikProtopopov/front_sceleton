import { apiClient } from "@/shared/api";
import { API_ENDPOINTS } from "@/shared/config";
import type {
  Tenant,
  TenantListParams,
  TenantsListResponse,
  CreateTenantDto,
  UpdateTenantDto,
  EnabledFeaturesResponse,
  FeatureCatalogResponse,
  TenantDomainResponse,
  TenantDomainListResponse,
  TenantDomainCreate,
  TenantDomainUpdate,
  DNSVerifyResponse,
  TenantDomainSSLStatusResponse,
  EmailTestResponse,
  EmailLogParams,
  EmailLogsResponse,
} from "@/entities/tenant";

export const tenantsApi = {
  list: (params?: TenantListParams) =>
    apiClient.get<TenantsListResponse>(API_ENDPOINTS.TENANTS.LIST, { params }),

  getById: (tenantId: string) =>
    apiClient.get<Tenant>(API_ENDPOINTS.TENANTS.BY_ID(tenantId)),

  create: (data: CreateTenantDto) =>
    apiClient.post<Tenant>(API_ENDPOINTS.TENANTS.LIST, data),

  update: (tenantId: string, data: UpdateTenantDto) =>
    apiClient.patch<Tenant>(API_ENDPOINTS.TENANTS.BY_ID(tenantId), data),

  delete: (tenantId: string) =>
    apiClient.delete(API_ENDPOINTS.TENANTS.BY_ID(tenantId)),

  uploadLogo: (tenantId: string, file: File) =>
    apiClient.uploadFile<Tenant>(API_ENDPOINTS.TENANTS.LOGO(tenantId), file),

  deleteLogo: (tenantId: string) =>
    apiClient.delete(API_ENDPOINTS.TENANTS.LOGO(tenantId)),

  // --- Domains ---

  listDomains: (tenantId: string) =>
    apiClient.get<TenantDomainListResponse>(API_ENDPOINTS.TENANTS.DOMAINS(tenantId)),

  createDomain: (tenantId: string, data: TenantDomainCreate) =>
    apiClient.post<TenantDomainResponse>(API_ENDPOINTS.TENANTS.DOMAINS(tenantId), data),

  updateDomain: (tenantId: string, domainId: string, data: TenantDomainUpdate) =>
    apiClient.patch<TenantDomainResponse>(
      API_ENDPOINTS.TENANTS.DOMAIN_BY_ID(tenantId, domainId),
      data,
    ),

  deleteDomain: (tenantId: string, domainId: string) =>
    apiClient.delete(API_ENDPOINTS.TENANTS.DOMAIN_BY_ID(tenantId, domainId)),

  verifyDomain: (tenantId: string, domainId: string) =>
    apiClient.post<DNSVerifyResponse>(
      API_ENDPOINTS.TENANTS.DOMAIN_VERIFY(tenantId, domainId),
    ),

  getDomainSSLStatus: (tenantId: string, domainId: string) =>
    apiClient.get<TenantDomainSSLStatusResponse>(
      API_ENDPOINTS.TENANTS.DOMAIN_SSL_STATUS(tenantId, domainId),
    ),

  // --- Email ---

  sendTestEmail: (tenantId: string, toEmail: string) =>
    apiClient.post<EmailTestResponse>(
      API_ENDPOINTS.TENANTS.SETTINGS_EMAIL_TEST(tenantId),
      { to_email: toEmail },
    ),

  getEmailLogs: (tenantId: string, params?: EmailLogParams) =>
    apiClient.get<EmailLogsResponse>(API_ENDPOINTS.TENANTS.EMAIL_LOGS(tenantId), { params }),

  // --- Feature catalog ---

  getEnabledFeatures: async (): Promise<EnabledFeaturesResponse> => {
    const data = await apiClient.get<FeatureCatalogResponse | EnabledFeaturesResponse>(
      API_ENDPOINTS.AUTH.ME_FEATURES,
      { params: { locale: "ru" } },
    );
    if ("features" in data && Array.isArray(data.features)) {
      const catalog = data as FeatureCatalogResponse;
      return {
        enabled_features: catalog.features.filter((f) => f.enabled).map((f) => f.name),
        all_features_enabled: catalog.all_features_enabled,
        features: catalog.features,
      };
    }
    return data as EnabledFeaturesResponse;
  },
};

export const tenantsKeys = {
  all: ["tenants"] as const,
  lists: () => [...tenantsKeys.all, "list"] as const,
  list: (params?: TenantListParams) => [...tenantsKeys.lists(), params] as const,
  details: () => [...tenantsKeys.all, "detail"] as const,
  detail: (id: string) => [...tenantsKeys.details(), id] as const,
  domains: (tenantId: string) => [...tenantsKeys.all, "domains", tenantId] as const,
  emailLogs: (tenantId: string) => [...tenantsKeys.all, "emailLogs", tenantId] as const,
  enabledFeatures: () => ["enabledFeatures"] as const,
};
