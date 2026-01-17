import { apiClient } from "@/shared/api";
import { API_ENDPOINTS } from "@/shared/config";
import type { PaginatedResponse } from "@/shared/types";
import type {
  Document,
  CreateDocumentDto,
  UpdateDocumentDto,
  DocumentFilterParams,
} from "@/entities/document";

export const documentsApi = {
  // Get all documents with pagination and filters
  getAll: (params?: DocumentFilterParams) =>
    apiClient.get<PaginatedResponse<Document>>(API_ENDPOINTS.DOCUMENTS.LIST, { params }),

  // Get single document by ID
  getById: (id: string) =>
    apiClient.get<Document>(API_ENDPOINTS.DOCUMENTS.BY_ID(id)),

  // Create new document
  create: (data: CreateDocumentDto) =>
    apiClient.post<Document>(API_ENDPOINTS.DOCUMENTS.LIST, data),

  // Update document (with optimistic locking via version field)
  update: (id: string, data: UpdateDocumentDto) =>
    apiClient.patch<Document>(API_ENDPOINTS.DOCUMENTS.BY_ID(id), data),

  // Delete document
  delete: (id: string) =>
    apiClient.delete(API_ENDPOINTS.DOCUMENTS.BY_ID(id)),

  // Publish document
  publish: (id: string) =>
    apiClient.post<Document>(API_ENDPOINTS.DOCUMENTS.PUBLISH(id)),

  // Unpublish document
  unpublish: (id: string) =>
    apiClient.post<Document>(API_ENDPOINTS.DOCUMENTS.UNPUBLISH(id)),

  // Upload file to document
  uploadFile: (id: string, file: File) =>
    apiClient.uploadFile<Document>(API_ENDPOINTS.DOCUMENTS.FILE(id), file),

  // Delete file from document
  deleteFile: (id: string) =>
    apiClient.delete(API_ENDPOINTS.DOCUMENTS.FILE(id)),
};

// Query keys factory for React Query
export const documentsKeys = {
  all: ["documents"] as const,
  lists: () => [...documentsKeys.all, "list"] as const,
  list: (params?: DocumentFilterParams) => [...documentsKeys.lists(), params] as const,
  details: () => [...documentsKeys.all, "detail"] as const,
  detail: (id: string) => [...documentsKeys.details(), id] as const,
};

