import { apiClient } from "@/shared/api";
import { API_ENDPOINTS } from "@/shared/config";
import type {
  MyPlanResponse,
  MyModulesResponse,
  UsageMap,
  PlanResponse,
  PublicModule,
  PublicBundle,
  UpgradeRequest,
  CreateUpgradeRequestDto,
} from "@/entities/billing";

export const billingApi = {
  getMyPlan: () =>
    apiClient.get<MyPlanResponse>(API_ENDPOINTS.BILLING.MY_PLAN),

  getMyModules: () =>
    apiClient.get<MyModulesResponse>(API_ENDPOINTS.BILLING.MY_MODULES),

  getMyLimits: () =>
    apiClient.get<UsageMap>(API_ENDPOINTS.BILLING.MY_LIMITS),

  getPublicPlans: () =>
    apiClient.get<PlanResponse[]>(API_ENDPOINTS.PUBLIC_BILLING.PLANS),

  getPublicModules: () =>
    apiClient.get<PublicModule[]>(API_ENDPOINTS.PUBLIC_BILLING.MODULES),

  getPublicBundles: () =>
    apiClient.get<PublicBundle[]>(API_ENDPOINTS.PUBLIC_BILLING.BUNDLES),

  createUpgradeRequest: (data: CreateUpgradeRequestDto) =>
    apiClient.post<UpgradeRequest>(API_ENDPOINTS.BILLING.UPGRADE_REQUESTS, data),

  getUpgradeRequests: () =>
    apiClient.get<UpgradeRequest[]>(API_ENDPOINTS.BILLING.UPGRADE_REQUESTS),
};

export const billingKeys = {
  all: ["billing"] as const,
  myPlan: () => [...billingKeys.all, "my-plan"] as const,
  myModules: () => [...billingKeys.all, "my-modules"] as const,
  myLimits: () => [...billingKeys.all, "my-limits"] as const,
  publicPlans: () => [...billingKeys.all, "public-plans"] as const,
  publicModules: () => [...billingKeys.all, "public-modules"] as const,
  publicBundles: () => [...billingKeys.all, "public-bundles"] as const,
  upgradeRequests: () => [...billingKeys.all, "upgrade-requests"] as const,
};
