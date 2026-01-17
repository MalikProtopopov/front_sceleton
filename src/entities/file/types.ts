// File/Media entity types

export interface FileAsset {
  id: string;
  tenant_id: string;
  s3_key: string;
  file_url: string;
  original_filename: string;
  content_type: string;
  file_size: number;
  alt_text: string | null;
  folder: string | null;
  created_at: string;
  updated_at: string;
}

export interface UploadUrlRequest {
  filename: string;
  content_type: string;
  folder?: string;
}

export interface UploadUrlResponse {
  upload_url: string;
  file_url: string;
  s3_key: string;
}

export interface RegisterFileRequest {
  s3_key: string;
  original_filename: string;
  content_type: string;
  file_size: number;
  alt_text?: string;
  folder?: string;
}

export interface FileFilterParams {
  page?: number;
  pageSize?: number;
  folder?: string;
  contentType?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

// Common file types for filtering
export const SUPPORTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/svg+xml",
];

export const SUPPORTED_DOCUMENT_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

