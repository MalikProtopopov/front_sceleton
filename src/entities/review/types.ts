// Review entity types

export type ReviewStatus = "pending" | "approved" | "rejected";

// Minimal case info returned with review
export interface CaseMinimalResponse {
  id: string;
  slug: string;
  title: string;
  cover_image_url?: string;
  client_name?: string;
}

export interface ReviewLocale {
  id: string;
  review_id: string;
  locale: string;
  content: string;
  company_name: string | null;
  created_at: string;
  updated_at: string;
}

export interface Review {
  id: string;
  tenant_id: string;
  status: ReviewStatus;
  case_id: string | null;
  case?: CaseMinimalResponse; // Case object returned from API
  author_name: string;
  author_position: string | null;
  author_avatar_url: string | null;
  author_photo_url?: string | null; // Alternative field name from backend
  author_company?: string | null; // Company name at top level from backend
  content?: string; // Content at top level from backend
  rating: number | null;
  is_featured: boolean;
  sort_order: number;
  review_date: string | null;
  version: number;
  created_at: string;
  updated_at: string;
  locales?: ReviewLocale[]; // May be undefined if backend returns content at top level
}

// Request DTOs
export interface CreateReviewLocaleDto {
  locale: string;
  content: string;
  company_name?: string;
}

export interface CreateReviewDto {
  author_name: string;
  author_position?: string;
  rating: number; // Required field (1-5)
  is_featured?: boolean;
  sort_order?: number;
  review_date?: string;
  case_id?: string;
  content: string; // Backend requires content at top level (min 10 chars)
  locales: CreateReviewLocaleDto[];
}

export interface UpdateReviewDto {
  author_name?: string;
  author_position?: string;
  rating?: number;
  is_featured?: boolean;
  sort_order?: number;
  review_date?: string;
  case_id?: string | null; // UUID of case, or null to unlink
  status?: ReviewStatus;
  content?: string; // Backend may require content at top level
  locales?: CreateReviewLocaleDto[];
  version: number; // Required for optimistic locking
}

// Filter params
export interface ReviewFilterParams {
  page?: number;
  pageSize?: number;
  status?: ReviewStatus;
  caseId?: string;
  caseSlug?: string; // Filter by case slug
  featured?: boolean;
}

