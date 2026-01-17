import { apiClient } from "@/shared/api";
import { API_ENDPOINTS } from "@/shared/config";
import type { InquiryForm, CreateInquiryFormDto, UpdateInquiryFormDto } from "@/entities/inquiry-form";

export const inquiryFormsApi = {
  getAll: () =>
    apiClient.get<InquiryForm[]>(API_ENDPOINTS.INQUIRY_FORMS.LIST),

  getById: (id: string) =>
    apiClient.get<InquiryForm>(API_ENDPOINTS.INQUIRY_FORMS.BY_ID(id)),

  create: (data: CreateInquiryFormDto) =>
    apiClient.post<InquiryForm>(API_ENDPOINTS.INQUIRY_FORMS.LIST, data),

  update: (id: string, data: UpdateInquiryFormDto) =>
    apiClient.patch<InquiryForm>(API_ENDPOINTS.INQUIRY_FORMS.BY_ID(id), data),

  delete: (id: string) =>
    apiClient.delete(API_ENDPOINTS.INQUIRY_FORMS.BY_ID(id)),
};

// Query keys factory
export const inquiryFormsKeys = {
  all: ["inquiry-forms"] as const,
  lists: () => [...inquiryFormsKeys.all, "list"] as const,
  list: () => [...inquiryFormsKeys.lists()] as const,
  details: () => [...inquiryFormsKeys.all, "detail"] as const,
  detail: (id: string) => [...inquiryFormsKeys.details(), id] as const,
};

