// Platform Dashboard types (Platform Owner only)

export interface PlatformOverview {
  total_tenants: number;
  active_tenants: number;
  inactive_tenants: number;
  total_users: number;
  active_users: number;
  total_inquiries: number;
  inquiries_this_month: number;
  inquiries_prev_month: number;
  inactive_tenants_30d: number;
}

export interface TenantRow {
  id: string;
  name: string;
  slug: string;
  domain: string | null;
  is_active: boolean;
  created_at: string;
  users_count: number;
  active_users_count: number;
  content_count: number;
  articles_count: number;
  cases_count: number;
  services_count: number;
  inquiries_total: number;
  inquiries_this_month: number;
  inquiries_new: number;
  last_login_at: string | null;
  enabled_features_count: number;
  enabled_features: string[];
}

export interface TenantTableResponse {
  items: TenantRow[];
  total: number;
  page: number;
  per_page: number;
  pages: number;
}

export interface TenantTableParams {
  page?: number;
  per_page?: number;
  sort_by?: string;
  sort_dir?: "asc" | "desc";
  search?: string;
}

// Tenant Detail
export interface ContentByStatus {
  published: number;
  draft: number;
  archived: number;
}

export interface ReviewByStatus {
  pending: number;
  approved: number;
  rejected: number;
}

export interface ContentBreakdown {
  articles: ContentByStatus;
  cases: ContentByStatus;
  documents: ContentByStatus;
  services: number;
  services_total: number;
  employees: number;
  employees_total: number;
  faqs: number;
  faqs_total: number;
  reviews: ReviewByStatus;
}

export interface InquiryBreakdown {
  total: number;
  by_status: Record<string, number>;
  by_utm_source: Record<string, number>;
  by_device_type: Record<string, number>;
  by_country_top10: Array<{ country: string; count: number }>;
  top_pages: Array<{ page: string; count: number }>;
  avg_processing_hours: number | null;
}

export interface FeatureFlagInfo {
  feature_name: string;
  enabled: boolean;
}

export interface TenantUserInfo {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  is_active: boolean;
  role_name: string | null;
  last_login_at: string | null;
}

export interface AuditEntry {
  id: string;
  action: string;
  resource_type: string;
  resource_id: string;
  user_email: string | null;
  created_at: string;
}

export interface TenantDetailStats {
  tenant_id: string;
  tenant_name: string;
  tenant_slug: string;
  is_active: boolean;
  content: ContentBreakdown;
  inquiries: InquiryBreakdown;
  feature_flags: FeatureFlagInfo[];
  users: TenantUserInfo[];
  recent_activity: AuditEntry[];
}

// Trends
export interface TrendPoint {
  date: string;
  value: number;
}

export interface TenantTrendSeries {
  tenant_id: string;
  tenant_name: string;
  data: TrendPoint[];
}

export interface PlatformTrends {
  new_tenants_by_month: TrendPoint[];
  new_users_by_month: TrendPoint[];
  inquiries_by_day: TrendPoint[];
  logins_by_day: TrendPoint[];
  inquiries_by_tenant: TenantTrendSeries[];
}

// Alerts
export interface HealthAlert {
  type: string;
  severity: "critical" | "warning" | "info";
  tenant_id: string | null;
  tenant_name: string | null;
  message: string;
  details: Record<string, unknown> | null;
}

export interface AlertSummary {
  critical: number;
  warning: number;
  info: number;
}

export interface PlatformAlerts {
  alerts: HealthAlert[];
  summary: AlertSummary;
}
