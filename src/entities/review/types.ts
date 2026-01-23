// Review entity types

export type ReviewStatus = "pending" | "approved" | "rejected";

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
  author_name: string;
  author_position: string | null;
  author_avatar_url: string | null;
  rating: number | null;
  is_featured: boolean;
  sort_order: number;
  review_date: string | null;
  version: number;
  created_at: string;
  updated_at: string;
  locales: ReviewLocale[];
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
  case_id?: string;
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
  featured?: boolean;
}

