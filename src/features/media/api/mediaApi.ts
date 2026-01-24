import { apiClient } from "@/shared/api";
import { API_ENDPOINTS } from "@/shared/config";
import type { PaginatedResponse } from "@/shared/types";
import type {
  FileAsset,
  UploadUrlRequest,
  UploadUrlResponse,
  RegisterFileRequest,
  FileFilterParams,
} from "@/entities/file";

export const mediaApi = {
  // List files
  getAll: (params?: FileFilterParams) =>
    apiClient.get<PaginatedResponse<FileAsset>>(API_ENDPOINTS.FILES.LIST, { params }),

  // Get single file
  getById: (id: string) =>
    apiClient.get<FileAsset>(API_ENDPOINTS.FILES.BY_ID(id)),

  // Get presigned upload URL
  getUploadUrl: (data: UploadUrlRequest) =>
    apiClient.post<UploadUrlResponse>(API_ENDPOINTS.FILES.UPLOAD_URL, data),

  // Register uploaded file
  register: (data: RegisterFileRequest) =>
    apiClient.post<FileAsset>(API_ENDPOINTS.FILES.LIST, data),

  // Update file metadata (alt_text, folder)
  update: (id: string, data: Partial<Pick<FileAsset, "alt_text" | "folder">>) =>
    apiClient.patch<FileAsset>(API_ENDPOINTS.FILES.BY_ID(id), data),

  // Delete file
  delete: (id: string) =>
    apiClient.delete(API_ENDPOINTS.FILES.BY_ID(id)),

  // Upload file helper (combines getUploadUrl + S3 upload + register)
  uploadFile: async (
    file: File,
    folder?: string,
  ): Promise<FileAsset> => {
    // 1. Get presigned upload URL
    const { upload_url, file_url, s3_key } = await mediaApi.getUploadUrl({
      filename: file.name,
      content_type: file.type,
      folder,
    });

    // 2. Upload to S3
    await fetch(upload_url, {
      method: "PUT",
      body: file,
      headers: {
        "Content-Type": file.type,
      },
    });

    // 3. Register file in database
    const registeredFile = await mediaApi.register({
      filename: s3_key.split("/").pop() || file.name,  // имя файла из s3_key
      original_filename: file.name,                     // оригинальное имя
      mime_type: file.type,                             // MIME тип
      file_size: file.size,
      s3_bucket: "cms-assets",                          // bucket в S3
      s3_key,                                           // полный ключ в S3
      s3_url: file_url,                                 // относительный URL из ответа
      folder,
    });

    return registeredFile;
  },
};

// Query keys factory
export const mediaKeys = {
  all: ["media"] as const,
  lists: () => [...mediaKeys.all, "list"] as const,
  list: (params?: FileFilterParams) => [...mediaKeys.lists(), params] as const,
  details: () => [...mediaKeys.all, "detail"] as const,
  detail: (id: string) => [...mediaKeys.details(), id] as const,
};

