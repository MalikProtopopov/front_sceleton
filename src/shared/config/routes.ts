export const ROUTES = {
  // Auth
  LOGIN: "/login",
  
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
  
  // Leads
  LEADS: "/leads",
  LEAD_DETAIL: (id: string) => `/leads/${id}`,
  LEAD_FORMS: "/leads/forms",
  LEAD_FORM_NEW: "/leads/forms/new",
  LEAD_FORM_EDIT: (id: string) => `/leads/forms/${id}`,
  
  // Media
  MEDIA: "/media",
  
  // SEO
  SEO: "/seo",
  SEO_REDIRECTS: "/seo/redirects",
  
  // Users & Security
  USERS: "/users",
  USER_NEW: "/users/new",
  USER_EDIT: (id: string) => `/users/${id}`,
  ROLES: "/users/roles",
  
  // Settings
  SETTINGS: "/settings",
  
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
} as const;

