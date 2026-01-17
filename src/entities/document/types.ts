// Document entity types

export type DocumentStatus = "draft" | "published" | "archived";

export interface DocumentLocale {
  id: string;
  document_id: string;
  locale: string;
  title: string;
  slug: string;
  excerpt: string | null;
  full_description: string | null;
  meta_title: string | null;
  meta_description: string | null;
  created_at: string;
  updated_at: string;
}

export interface Document {
  id: string;
  tenant_id: string;
  status: DocumentStatus;
  document_version: string | null;
  document_date: string | null;
  published_at: string | null;
  file_url: string | null;
  sort_order: number;
  version: number;
  created_at: string;
  updated_at: string;
  locales: DocumentLocale[];
}

// Request DTOs
export interface CreateDocumentLocaleDto {
  locale: string;
  title: string;
  slug: string;
  excerpt?: string;
  full_description?: string;
  meta_title?: string;
  meta_description?: string;
}

export interface CreateDocumentDto {
  status?: DocumentStatus;
  document_version?: string;
  document_date?: string;
  sort_order?: number;
  locales: CreateDocumentLocaleDto[];
}

export interface UpdateDocumentDto {
  status?: DocumentStatus;
  document_version?: string;
  document_date?: string;
  sort_order?: number;
  locales?: CreateDocumentLocaleDto[];
  version: number; // Required for optimistic locking
}

// Filter params
export interface DocumentFilterParams {
  page?: number;
  pageSize?: number;
  status?: DocumentStatus;
  search?: string;
  document_date_from?: string;
  document_date_to?: string;
  sortBy?: string;
  sortDirection?: "asc" | "desc";
}

