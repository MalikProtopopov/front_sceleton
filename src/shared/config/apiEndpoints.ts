// Use proxied path in both development and production
// Proxy is configured in next.config.ts to forward /api/* to backend
// Can be overridden with NEXT_PUBLIC_API_URL environment variable
export const API_BASE_URL = 
  process.env.NEXT_PUBLIC_API_URL || 
  "/api/v1";

// Tenant ID - needed ONLY for login endpoint
export const TENANT_ID = process.env.NEXT_PUBLIC_TENANT_ID || "f8f8a58e-6e2b-4779-a5fc-75a104cc10e7";

export const API_ENDPOINTS = {
  // Auth
  AUTH: {
    LOGIN: "/auth/login",
    LOGOUT: "/auth/logout",
    REFRESH: "/auth/refresh",
    ME: "/auth/me",
    ME_FEATURES: "/auth/me/features",
    CHANGE_PASSWORD: "/auth/me/password",
    ME_AVATAR: "/auth/me/avatar",
    USERS: "/auth/users",
    USER_BY_ID: (id: string) => `/auth/users/${id}`,
    USER_AVATAR: (id: string) => `/auth/users/${id}/avatar`,
    ROLES: "/auth/roles",
    ROLE_BY_ID: (id: string) => `/auth/roles/${id}`,
    PERMISSIONS: "/auth/permissions",
  },
  
  // Articles
  ARTICLES: {
    LIST: "/admin/articles",
    BY_ID: (id: string) => `/admin/articles/${id}`,
    PUBLISH: (id: string) => `/admin/articles/${id}/publish`,
    UNPUBLISH: (id: string) => `/admin/articles/${id}/unpublish`,
    COVER_IMAGE: (id: string) => `/admin/articles/${id}/cover-image`,
    LOCALES: (id: string) => `/admin/articles/${id}/locales`,
    LOCALE_BY_ID: (articleId: string, localeId: string) => `/admin/articles/${articleId}/locales/${localeId}`,
  },
  
  // Topics
  TOPICS: {
    LIST: "/admin/topics",
    BY_ID: (id: string) => `/admin/topics/${id}`,
    LOCALES: (id: string) => `/admin/topics/${id}/locales`,
    LOCALE_BY_ID: (topicId: string, localeId: string) => `/admin/topics/${topicId}/locales/${localeId}`,
  },
  
  // FAQ
  FAQ: {
    LIST: "/admin/faq",
    BY_ID: (id: string) => `/admin/faq/${id}`,
    LOCALES: (id: string) => `/admin/faq/${id}/locales`,
    LOCALE_BY_ID: (faqId: string, localeId: string) => `/admin/faq/${faqId}/locales/${localeId}`,
  },
  
  // Services
  SERVICES: {
    LIST: "/admin/services",
    BY_ID: (id: string) => `/admin/services/${id}`,
    IMAGE: (id: string) => `/admin/services/${id}/image`,
    PRICES: (id: string) => `/admin/services/${id}/prices`,
    PRICE_BY_ID: (serviceId: string, priceId: string) => `/admin/services/${serviceId}/prices/${priceId}`,
    TAGS: (id: string) => `/admin/services/${id}/tags`,
    TAG_BY_ID: (serviceId: string, tagId: string) => `/admin/services/${serviceId}/tags/${tagId}`,
    LOCALES: (id: string) => `/admin/services/${id}/locales`,
    LOCALE_BY_ID: (serviceId: string, localeId: string) => `/admin/services/${serviceId}/locales/${localeId}`,
  },
  
  // Employees
  EMPLOYEES: {
    LIST: "/admin/employees",
    BY_ID: (id: string) => `/admin/employees/${id}`,
    PHOTO: (id: string) => `/admin/employees/${id}/photo`,
    LOCALES: (id: string) => `/admin/employees/${id}/locales`,
    LOCALE_BY_ID: (employeeId: string, localeId: string) => `/admin/employees/${employeeId}/locales/${localeId}`,
  },
  
  // Reviews
  REVIEWS: {
    LIST: "/admin/reviews",
    BY_ID: (id: string) => `/admin/reviews/${id}`,
    APPROVE: (id: string) => `/admin/reviews/${id}/approve`,
    REJECT: (id: string) => `/admin/reviews/${id}/reject`,
    AUTHOR_PHOTO: (id: string) => `/admin/reviews/${id}/author-photo`,
  },
  
  // Inquiries
  INQUIRIES: {
    LIST: "/admin/inquiries",
    BY_ID: (id: string) => `/admin/inquiries/${id}`,
    ANALYTICS: "/admin/inquiries/analytics",
  },
  
  // Inquiry Forms
  INQUIRY_FORMS: {
    LIST: "/admin/inquiry-forms",
    BY_ID: (id: string) => `/admin/inquiry-forms/${id}`,
  },
  
  // Files
  FILES: {
    LIST: "/admin/files",
    BY_ID: (id: string) => `/admin/files/${id}`,
    UPLOAD_URL: "/admin/files/upload-url",
  },
  
  // SEO
  SEO: {
    ROUTES: "/admin/seo/routes",
    ROUTE_BY_ID: (id: string) => `/admin/seo/routes/${id}`,
    REDIRECTS: "/admin/seo/redirects",
    REDIRECT_BY_ID: (id: string) => `/admin/seo/redirects/${id}`,
  },
  
  // Tenants/Settings
  TENANTS: {
    LIST: "/tenants",
    BY_ID: (id: string) => `/tenants/${id}`,
    SETTINGS: (id: string) => `/tenants/${id}/settings`,
    LOGO: (id: string) => `/tenants/${id}/logo`,
  },
  
  // Feature Flags
  FEATURE_FLAGS: {
    LIST: "/feature-flags",
    BY_NAME: (name: string) => `/feature-flags/${name}`,
  },
  
  // Cases
  CASES: {
    LIST: "/admin/cases",
    BY_ID: (id: string) => `/admin/cases/${id}`,
    PUBLISH: (id: string) => `/admin/cases/${id}/publish`,
    UNPUBLISH: (id: string) => `/admin/cases/${id}/unpublish`,
    COVER_IMAGE: (id: string) => `/admin/cases/${id}/cover-image`,
    LOCALES: (id: string) => `/admin/cases/${id}/locales`,
    LOCALE_BY_ID: (caseId: string, localeId: string) => `/admin/cases/${caseId}/locales/${localeId}`,
  },
  
  // Documents
  DOCUMENTS: {
    LIST: "/admin/documents",
    BY_ID: (id: string) => `/admin/documents/${id}`,
    PUBLISH: (id: string) => `/admin/documents/${id}/publish`,
    UNPUBLISH: (id: string) => `/admin/documents/${id}/unpublish`,
    FILE: (id: string) => `/admin/documents/${id}/file`,
  },
  
  // Dashboard
  DASHBOARD: "/admin/dashboard",
  
  // Audit Log
  AUDIT: {
    LIST: "/admin/audit-logs",
  },
  
  // Bulk Operations
  BULK: "/admin/bulk",
  
  // Export
  EXPORT: "/admin/export",
  
  // Company Info
  PRACTICE_AREAS: {
    LIST: "/admin/practice-areas",
    BY_ID: (id: string) => `/admin/practice-areas/${id}`,
    LOCALES: (id: string) => `/admin/practice-areas/${id}/locales`,
    LOCALE_BY_ID: (practiceAreaId: string, localeId: string) => `/admin/practice-areas/${practiceAreaId}/locales/${localeId}`,
  },
  
  ADVANTAGES: {
    LIST: "/admin/advantages",
    BY_ID: (id: string) => `/admin/advantages/${id}`,
    LOCALES: (id: string) => `/admin/advantages/${id}/locales`,
    LOCALE_BY_ID: (advantageId: string, localeId: string) => `/admin/advantages/${advantageId}/locales/${localeId}`,
  },
  
  ADDRESSES: {
    LIST: "/admin/addresses",
    BY_ID: (id: string) => `/admin/addresses/${id}`,
    LOCALES: (id: string) => `/admin/addresses/${id}/locales`,
    LOCALE_BY_ID: (addressId: string, localeId: string) => `/admin/addresses/${addressId}/locales/${localeId}`,
  },
  
  CONTACTS: {
    LIST: "/admin/contacts",
    BY_ID: (id: string) => `/admin/contacts/${id}`,
  },
  
  // Telegram Integration
  TELEGRAM: {
    INTEGRATION: "/telegram/integration",
    TEST: "/telegram/integration/test",
    WEBHOOK_URL: "/telegram/integration/webhook-url",
    WEBHOOK: "/telegram/integration/webhook",
  },
} as const;

