// ─── Plan & Limits ───

export interface PlanLimits {
  max_users: number;
  max_storage_mb: number;
  max_leads_per_month: number;
  max_products: number;
  max_variants: number;
  max_domains: number;
  max_articles: number;
  max_rbac_roles: number;
}

export interface PlanModule {
  id: string;
  slug: string;
  name: string;
  name_ru: string;
  category: ModuleCategory;
  is_base: boolean;
}

export interface PlanResponse {
  id: string;
  slug: string;
  name: string;
  name_ru: string;
  description_ru: string;
  price_monthly_kopecks: number;
  price_yearly_kopecks: number;
  setup_fee_kopecks: number;
  is_default: boolean;
  is_active: boolean;
  sort_order: number;
  limits: PlanLimits;
  modules: PlanModule[];
}

// ─── My Plan ───

export type UsageStatus = "ok" | "warning" | "exceeded";

export interface UsageEntry {
  current: number;
  limit: number;
  status: UsageStatus;
}

export type UsageMap = Record<string, UsageEntry>;

export type ModuleSource = "plan" | "addon" | "bundle" | "manual";

export interface TenantModule {
  id: string;
  tenant_id: string;
  module_id: string;
  module_slug: string;
  module_name: string;
  module_name_ru: string;
  source: ModuleSource;
  enabled: boolean;
  activated_at: string;
  expires_at: string | null;
}

export interface MyPlanResponse {
  plan: PlanResponse;
  modules: TenantModule[];
  usage: UsageMap;
}

export interface MyModulesResponse {
  items: TenantModule[];
}

// ─── Public Catalog ───

export type ModuleCategory = "platform" | "content" | "company" | "crm" | "commerce";

export interface PublicModule {
  id: string;
  slug: string;
  name: string;
  name_ru: string;
  description: string;
  description_ru: string;
  category: ModuleCategory;
  price_monthly_kopecks: number;
  is_base: boolean;
  sort_order: number;
}

export interface BundleModule {
  id: string;
  slug: string;
  name: string;
  name_ru: string;
}

export interface PublicBundle {
  id: string;
  slug: string;
  name: string;
  name_ru: string;
  description_ru: string;
  price_monthly_kopecks: number;
  discount_percent: number;
  is_active: boolean;
  sort_order: number;
  modules: BundleModule[];
}

// ─── Upgrade Requests ───

export type UpgradeRequestType = "plan_upgrade" | "module_addon" | "bundle_addon";
export type UpgradeRequestStatus = "pending" | "approved" | "rejected";

export interface UpgradeRequest {
  id: string;
  tenant_id: string;
  request_type: UpgradeRequestType;
  target_plan_id: string | null;
  target_module_id: string | null;
  target_bundle_id: string | null;
  status: UpgradeRequestStatus;
  message: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
  target_plan_name: string | null;
  target_module_name: string | null;
  target_bundle_name: string | null;
}

export interface CreateUpgradeRequestDto {
  request_type: UpgradeRequestType;
  target_plan_id?: string;
  target_module_id?: string;
  target_bundle_id?: string;
  message?: string;
}

// ─── Platform: Plans ───

export interface CreatePlanDto {
  slug: string;
  name: string;
  name_ru: string;
  description_ru: string;
  price_monthly_kopecks: number;
  price_yearly_kopecks: number;
  setup_fee_kopecks: number;
  is_default: boolean;
  is_active: boolean;
  sort_order: number;
  limits: PlanLimits;
  module_slugs: string[];
}

export type UpdatePlanDto = Partial<CreatePlanDto>;

// ─── Platform: Modules ───

export interface CreateModuleDto {
  slug: string;
  name: string;
  name_ru: string;
  description: string;
  description_ru: string;
  category: ModuleCategory;
  price_monthly_kopecks: number;
  is_base: boolean;
  sort_order: number;
}

export type UpdateModuleDto = Partial<CreateModuleDto>;

// ─── Platform: Bundles ───

export interface CreateBundleDto {
  slug: string;
  name: string;
  name_ru: string;
  description: string;
  description_ru: string;
  price_monthly_kopecks: number;
  discount_percent: number;
  is_active: boolean;
  sort_order: number;
  module_slugs: string[];
}

export type UpdateBundleDto = Partial<CreateBundleDto>;

// ─── Platform: Tenant Modules ───

export interface AddTenantModuleDto {
  module_slug: string;
  source: ModuleSource;
  enabled: boolean;
}

export interface RemoveTenantModuleDto {
  module_slug: string;
}

// ─── Platform: Upgrade Request Review ───

export interface ReviewUpgradeRequestDto {
  status: "approved" | "rejected";
}

export interface PlatformUpgradeRequestParams {
  status?: UpgradeRequestStatus;
}

// ─── Error types ───

export interface LimitExceededError {
  type: string;
  title: string;
  status: 403;
  detail: string;
  resource: string;
  current_usage: number;
  limit: number;
  restriction_level: string;
}

export interface RateLimitError {
  type: string;
  status: 429;
  detail: string;
  retry_after: number;
}
