// File/Media entity types

export interface FileAsset {
  id: string;
  tenant_id: string;
  filename: string;
  s3_key: string;
  s3_bucket: string;
  s3_url: string;
  file_url: string;
  cdn_url: string | null;
  original_filename: string;
  mime_type: string;
  file_size: number;
  width: number | null;
  height: number | null;
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
  expires_in?: number;
}

export interface RegisterFileRequest {
  filename: string;           // имя файла в S3 (последняя часть s3_key)
  original_filename: string;  // оригинальное имя файла
  mime_type: string;          // MIME тип (было content_type)
  file_size: number;          // размер в байтах
  s3_bucket: string;          // bucket в S3 ("cms-assets")
  s3_key: string;             // полный ключ в S3
  s3_url: string;             // относительный URL файла (/media/...)
  cdn_url?: string;           // CDN URL (опционально)
  width?: number;             // ширина (для изображений)
  height?: number;            // высота (для изображений)
  alt_text?: string;          // альт текст
  folder?: string;            // папка
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

