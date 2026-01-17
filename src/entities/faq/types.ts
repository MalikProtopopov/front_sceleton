// FAQ entity types

export interface FAQLocale {
  id: string;
  faq_id: string;
  locale: string;
  question: string;
  answer: string;
  created_at: string;
  updated_at: string;
}

export interface FAQ {
  id: string;
  tenant_id: string;
  category: string | null;
  is_published: boolean;
  sort_order: number;
  version: number;
  created_at: string;
  updated_at: string;
  locales: FAQLocale[];
}

// Request DTOs
export interface CreateFAQLocaleDto {
  locale: string;
  question: string;
  answer: string;
}

export interface CreateFAQDto {
  category?: string;
  is_published?: boolean;
  sort_order?: number;
  locales: CreateFAQLocaleDto[];
}

export interface UpdateFAQDto {
  category?: string;
  is_published?: boolean;
  sort_order?: number;
  locales?: CreateFAQLocaleDto[];
  version: number; // Required for optimistic locking
}

// Filter params
export interface FAQFilterParams {
  page?: number;
  pageSize?: number;
  category?: string;
  isPublished?: boolean;
}

// Common FAQ categories
export const FAQ_CATEGORIES = [
  { value: "general", label: "Общие вопросы" },
  { value: "services", label: "Услуги" },
  { value: "pricing", label: "Цены и оплата" },
  { value: "delivery", label: "Сроки и доставка" },
  { value: "legal", label: "Юридические вопросы" },
] as const;

// Locale DTOs (for independent locale management)
export interface UpdateFAQLocaleDto {
  locale: string; // Required
  question?: string;
  answer?: string;
}

