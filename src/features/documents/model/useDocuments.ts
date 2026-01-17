import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { documentsApi, documentsKeys } from "../api/documentsApi";
import type {
  CreateDocumentDto,
  UpdateDocumentDto,
  DocumentFilterParams,
} from "@/entities/document";

// Hook for fetching documents list
export function useDocuments(params?: DocumentFilterParams) {
  return useQuery({
    queryKey: documentsKeys.list(params),
    queryFn: () => documentsApi.getAll(params),
  });
}

// Hook for fetching single document
export function useDocument(id: string) {
  return useQuery({
    queryKey: documentsKeys.detail(id),
    queryFn: () => documentsApi.getById(id),
    enabled: !!id,
  });
}

// Hook for creating document
export function useCreateDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateDocumentDto) => documentsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: documentsKeys.lists() });
    },
  });
}

// Hook for updating document
export function useUpdateDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateDocumentDto }) =>
      documentsApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: documentsKeys.lists() });
      queryClient.invalidateQueries({ queryKey: documentsKeys.detail(variables.id) });
    },
  });
}

// Hook for deleting document
export function useDeleteDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => documentsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: documentsKeys.lists() });
    },
  });
}

// Hook for publishing document
export function usePublishDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => documentsApi.publish(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: documentsKeys.lists() });
      queryClient.invalidateQueries({ queryKey: documentsKeys.detail(id) });
    },
  });
}

// Hook for unpublishing document
export function useUnpublishDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => documentsApi.unpublish(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: documentsKeys.lists() });
      queryClient.invalidateQueries({ queryKey: documentsKeys.detail(id) });
    },
  });
}

// Hook for uploading document file
export function useUploadDocumentFile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, file }: { id: string; file: File }) =>
      documentsApi.uploadFile(id, file),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: documentsKeys.detail(variables.id) });
    },
  });
}

// Hook for deleting document file
export function useDeleteDocumentFile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => documentsApi.deleteFile(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: documentsKeys.detail(id) });
    },
  });
}

