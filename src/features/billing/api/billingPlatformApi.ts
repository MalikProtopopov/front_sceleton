import { apiClient } from "@/shared/api";
import { API_ENDPOINTS } from "@/shared/config";
import type {
  PlanResponse,
  CreatePlanDto,
  UpdatePlanDto,
  PublicModule,
  CreateModuleDto,
  UpdateModuleDto,
  PublicBundle,
  CreateBundleDto,
  UpdateBundleDto,
  UpgradeRequest,
  ReviewUpgradeRequestDto,
  PlatformUpgradeRequestParams,
  TenantModule,
  AddTenantModuleDto,
  RemoveTenantModuleDto,
} from "@/entities/billing";

export const billingPlatformApi = {
  // Plans
  listPlans: () =>
    apiClient.get<PlanResponse[]>(API_ENDPOINTS.BILLING_PLATFORM.PLANS),

  createPlan: (data: CreatePlanDto) =>
    apiClient.post<PlanResponse>(API_ENDPOINTS.BILLING_PLATFORM.PLANS, data),

  updatePlan: (id: string, data: UpdatePlanDto) =>
    apiClient.patch<PlanResponse>(API_ENDPOINTS.BILLING_PLATFORM.PLAN_BY_ID(id), data),

  // Modules
  listModules: () =>
    apiClient.get<PublicModule[]>(API_ENDPOINTS.BILLING_PLATFORM.MODULES),

  createModule: (data: CreateModuleDto) =>
    apiClient.post<PublicModule>(API_ENDPOINTS.BILLING_PLATFORM.MODULES, data),

  updateModule: (id: string, data: UpdateModuleDto) =>
    apiClient.patch<PublicModule>(API_ENDPOINTS.BILLING_PLATFORM.MODULE_BY_ID(id), data),

  // Bundles
  listBundles: () =>
    apiClient.get<PublicBundle[]>(API_ENDPOINTS.BILLING_PLATFORM.BUNDLES),

  createBundle: (data: CreateBundleDto) =>
    apiClient.post<PublicBundle>(API_ENDPOINTS.BILLING_PLATFORM.BUNDLES, data),

  updateBundle: (id: string, data: UpdateBundleDto) =>
    apiClient.patch<PublicBundle>(API_ENDPOINTS.BILLING_PLATFORM.BUNDLE_BY_ID(id), data),

  // Upgrade requests
  listUpgradeRequests: (params?: PlatformUpgradeRequestParams) =>
    apiClient.get<UpgradeRequest[]>(API_ENDPOINTS.BILLING_PLATFORM.UPGRADE_REQUESTS, { params }),

  reviewUpgradeRequest: (id: string, data: ReviewUpgradeRequestDto) =>
    apiClient.patch<UpgradeRequest>(API_ENDPOINTS.BILLING_PLATFORM.UPGRADE_REQUEST_BY_ID(id), data),

  // Tenant modules
  addTenantModule: (tenantId: string, data: AddTenantModuleDto) =>
    apiClient.post<TenantModule>(API_ENDPOINTS.BILLING_PLATFORM.TENANT_MODULES(tenantId), data),

  removeTenantModule: async (tenantId: string, data: RemoveTenantModuleDto) => {
    const response = await apiClient.axios.delete(
      API_ENDPOINTS.BILLING_PLATFORM.TENANT_MODULES(tenantId),
      { data },
    );
    return response.data;
  },
};

export const billingPlatformKeys = {
  all: ["billing-platform"] as const,
  plans: () => [...billingPlatformKeys.all, "plans"] as const,
  planDetail: (id: string) => [...billingPlatformKeys.plans(), id] as const,
  modules: () => [...billingPlatformKeys.all, "modules"] as const,
  moduleDetail: (id: string) => [...billingPlatformKeys.modules(), id] as const,
  bundles: () => [...billingPlatformKeys.all, "bundles"] as const,
  bundleDetail: (id: string) => [...billingPlatformKeys.bundles(), id] as const,
  upgradeRequests: (params?: PlatformUpgradeRequestParams) =>
    [...billingPlatformKeys.all, "upgrade-requests", params] as const,
  tenantModules: (tenantId: string) =>
    [...billingPlatformKeys.all, "tenant-modules", tenantId] as const,
};
