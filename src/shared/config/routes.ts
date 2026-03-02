export const ROUTES = {
  // Auth
  LOGIN: "/login",
  FORGOT_PASSWORD: "/forgot-password",
  RESET_PASSWORD: "/reset-password",
  
  // Dashboard
  HOME: "/",
  
  // Content
  ARTICLES: "/articles",
  ARTICLE_NEW: "/articles/new",
  ARTICLE_EDIT: (id: string) => `/articles/${id}`,
  
  FAQ: "/faq",
  FAQ_NEW: "/faq/new",
  FAQ_EDIT: (id: string) => `/faq/${id}`,
  
  SERVICES: "/services",
  SERVICE_NEW: "/services/new",
  SERVICE_EDIT: (id: string) => `/services/${id}`,
  
  CASES: "/cases",
  CASE_NEW: "/cases/new",
  CASE_EDIT: (id: string) => `/cases/${id}`,
  
  DOCUMENTS: "/documents",
  DOCUMENT_NEW: "/documents/new",
  DOCUMENT_EDIT: (id: string) => `/documents/${id}`,
  
  // People & Company
  TEAM: "/team",
  TEAM_NEW: "/team/new",
  TEAM_EDIT: (id: string) => `/team/${id}`,
  
  REVIEWS: "/reviews",
  REVIEW_NEW: "/reviews/new",
  REVIEW_EDIT: (id: string) => `/reviews/${id}`,
  
  // Catalog
  CATALOG: "/catalog",
  UOM: "/catalog/uom",
  PRODUCTS: "/catalog/products",
  PRODUCT_NEW: "/catalog/products/new",
  PRODUCT_EDIT: (id: string) => `/catalog/products/${id}`,
  CATEGORIES: "/catalog/categories",
  CATEGORY_NEW: "/catalog/categories/new",
  CATEGORY_EDIT: (id: string) => `/catalog/categories/${id}`,
  PARAMETERS: "/catalog/parameters",
  PARAMETER_NEW: "/catalog/parameters/new",
  PARAMETER_EDIT: (id: string) => `/catalog/parameters/${id}`,
  
  // Leads
  LEADS: "/leads",
  LEAD_DETAIL: (id: string) => `/leads/${id}`,
  LEAD_FORMS: "/leads/forms",
  LEAD_FORM_NEW: "/leads/forms/new",
  LEAD_FORM_EDIT: (id: string) => `/leads/forms/${id}`,
  
  // Media
  MEDIA: "/media",
  
  // SEO
  SEO: "/seo/paths",
  SEO_REDIRECTS: "/seo/redirects",
  
  // Users & Security
  USERS: "/users",
  USER_NEW: "/users/new",
  USER_EDIT: (id: string) => `/users/${id}`,
  ROLES: "/users/roles",
  
  // Settings
  SETTINGS: "/settings",
  
  // Platform Dashboard (Platform Owner only)
  PLATFORM_DASHBOARD: "/platform",
  PLATFORM_TENANT_DETAIL: (id: string) => `/platform/tenants/${id}`,

  // Tenants (Platform Owner only)
  TENANTS: "/tenants",
  TENANT_NEW: "/tenants/new",
  TENANT_DETAIL: (id: string) => `/tenants/${id}`,
  TENANT_EDIT: (id: string) => `/tenants/${id}/edit`,
  TENANT_MODULES: (id: string) => `/tenants/${id}/modules`,
  
  // Audit Log
  AUDIT: "/audit",
  
  // Company Info
  COMPANY: "/company",
  PRACTICE_AREAS: "/company/practice-areas",
  PRACTICE_AREA_NEW: "/company/practice-areas/new",
  PRACTICE_AREA_EDIT: (id: string) => `/company/practice-areas/${id}`,
  ADVANTAGES: "/company/advantages",
  ADVANTAGE_NEW: "/company/advantages/new",
  ADVANTAGE_EDIT: (id: string) => `/company/advantages/${id}`,
  ADDRESSES: "/company/addresses",
  ADDRESS_NEW: "/company/addresses/new",
  ADDRESS_EDIT: (id: string) => `/company/addresses/${id}`,
  CONTACTS_LIST: "/company/contacts",
  CONTACT_NEW: "/company/contacts/new",
  CONTACT_EDIT: (id: string) => `/company/contacts/${id}`,
  
  // Role Management
  ROLE_NEW: "/users/roles/new",
  ROLE_EDIT: (id: string) => `/users/roles/${id}`,
  
  // Billing (user-facing)
  BILLING: "/billing",
  BILLING_MODULES: "/billing/modules",
  BILLING_LIMITS: "/billing/limits",
  BILLING_PLANS: "/billing/plans",
  BILLING_REQUESTS: "/billing/requests",
  
  // Billing platform management (superuser only)
  PLATFORM_PLANS: "/platform/plans",
  PLATFORM_PLAN_NEW: "/platform/plans/new",
  PLATFORM_PLAN_EDIT: (id: string) => `/platform/plans/${id}`,
  PLATFORM_MODULES: "/platform/modules",
  PLATFORM_MODULE_NEW: "/platform/modules/new",
  PLATFORM_MODULE_EDIT: (id: string) => `/platform/modules/${id}`,
  PLATFORM_BUNDLES: "/platform/bundles",
  PLATFORM_BUNDLE_NEW: "/platform/bundles/new",
  PLATFORM_BUNDLE_EDIT: (id: string) => `/platform/bundles/${id}`,
  PLATFORM_REQUESTS: "/platform/requests",
} as const;

