// Inquiry entity types

export type InquiryStatus = "new" | "in_progress" | "contacted" | "completed" | "spam" | "cancelled";

export interface Inquiry {
  id: string;
  tenant_id: string;
  form_id: string | null;
  form_slug: string | null;
  status: InquiryStatus;
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  message: string | null;
  service_id: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_term: string | null;
  utm_content: string | null;
  referrer_url: string | null;
  source_url: string | null;
  page_path: string | null;
  page_title: string | null;
  device_type: string | null;
  browser: string | null;
  os: string | null;
  ip_address: string | null;
  country: string | null;
  city: string | null;
  session_id: string | null;
  session_page_views: number | null;
  time_on_page: number | null;
  assigned_to: string | null;
  notes: string | null;
  contacted_at: string | null;
  notification_sent: boolean;
  custom_fields: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

// Inquiry Form types
export interface InquiryFormField {
  name: string;
  type: "text" | "email" | "tel" | "textarea" | "select";
  label?: string;
  required?: boolean;
  options?: string[];
}

export interface InquiryForm {
  id: string;
  tenant_id: string;
  name: string;
  slug: string;
  description: string | null;
  is_active: boolean;
  notification_email: string | null;
  success_message: Record<string, string> | null;
  fields_config: { fields: InquiryFormField[] } | null;
  sort_order: number;
  version: number;
  created_at: string;
  updated_at: string;
}

// Request DTOs
export interface UpdateInquiryDto {
  status?: InquiryStatus;
  assigned_to?: string | null;
  notes?: string;
}

// Filter params
export interface InquiryFilterParams {
  page?: number;
  pageSize?: number;
  status?: InquiryStatus;
  formId?: string;
  formSlug?: string;
  assignedTo?: string;
  utmSource?: string;
  search?: string;
}

// Analytics
export interface InquiryAnalytics {
  total: number;
  by_status: Record<string, number>;
  by_utm_source: Record<string, number>;
  by_device_type: Record<string, number>;
  by_day: Array<{ date: string; count: number }>;
}

// Status labels and colors
export const INQUIRY_STATUS_CONFIG: Record<InquiryStatus, { label: string; variant: "secondary" | "info" | "warning" | "success" | "error" }> = {
  new: { label: "Новый", variant: "info" },
  in_progress: { label: "В работе", variant: "warning" },
  contacted: { label: "Связались", variant: "secondary" },
  completed: { label: "Завершен", variant: "success" },
  spam: { label: "Спам", variant: "error" },
  cancelled: { label: "Отменен", variant: "secondary" },
};

// MVP Brief form fields interface
export interface MvpBriefFields {
  idea?: string;
  market?: string;
  audience?: string;
  audienceSize?: string;
  aiRequired?: string;
  appTypes?: string[];
  integrations?: string;
  budget?: string;
  urgency?: string;
  telegram?: string;
  source?: string;
  consent?: boolean;
}

// Form slug configuration
export const FORM_SLUG_CONFIG: Record<string, { label: string; variant: "info" | "warning" }> = {
  quick: { label: "Быстрая", variant: "info" },
  "mvp-brief": { label: "MVP Brief", variant: "warning" },
};

// Brief field labels
export const BRIEF_FIELD_LABELS: Record<string, string> = {
  idea: "Идея продукта",
  market: "Рынок",
  audience: "Целевая аудитория",
  audienceSize: "Размер аудитории",
  aiRequired: "AI/ML требования",
  appTypes: "Типы приложений",
  integrations: "Интеграции",
  budget: "Бюджет",
  urgency: "Сроки",
  telegram: "Telegram",
  source: "Источник заявки",
};

// Market options labels
export const MARKET_OPTIONS: Record<string, string> = {
  b2b_saas: "B2B SaaS",
  b2c_mobile: "B2C Mobile",
  ai_service: "AI Service",
  marketplace: "Marketplace",
  internal: "Внутренний продукт",
  other: "Другое",
};

// Audience size options labels
export const AUDIENCE_SIZE_OPTIONS: Record<string, string> = {
  small: "Малый (до 1000)",
  medium: "Средний (1000-10000)",
  large: "Большой (10000+)",
  unknown: "Неизвестно",
};

// AI required options labels
export const AI_REQUIRED_OPTIONS: Record<string, string> = {
  no: "Не требуется",
  nlp: "NLP (обработка текста)",
  llm: "LLM (языковые модели)",
  cv: "Computer Vision",
  unknown: "Неизвестно",
};

// App types options labels
export const APP_TYPES_OPTIONS: Record<string, string> = {
  website: "Веб-сайт",
  webapp: "Веб-приложение",
  mobile: "Мобильное приложение",
  desktop: "Десктоп",
  telegram: "Telegram бот",
  api: "API",
};

// Budget options labels
export const BUDGET_OPTIONS: Record<string, string> = {
  "5-15k": "$5,000 – $15,000",
  "15-40k": "$15,000 – $40,000",
  "40-100k": "$40,000 – $100,000",
  "100k+": "$100,000+",
  undefined: "Не определён",
};

// Urgency options labels
export const URGENCY_OPTIONS: Record<string, string> = {
  "30days": "В течение 30 дней",
  fast: "Срочно",
  flexible: "Гибкие сроки",
};

// Source options labels
export const SOURCE_OPTIONS: Record<string, string> = {
  friend: "Рекомендация",
  google: "Google",
  linkedin: "LinkedIn",
  investor: "Инвестор",
  portfolio: "Портфолио",
  other: "Другое",
};

