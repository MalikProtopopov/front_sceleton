import { apiClient } from "@/shared/api";
import { API_ENDPOINTS } from "@/shared/config";
import type { PaginatedResponse } from "@/shared/types";
import type { Inquiry, InquiryForm, InquiryAnalytics, InquiryFilterParams, UpdateInquiryDto, InquiryStatus } from "@/entities/inquiry";

export const leadsApi = {
  // Inquiries
  getAll: (params?: InquiryFilterParams) =>
    apiClient.get<PaginatedResponse<Inquiry>>(API_ENDPOINTS.INQUIRIES.LIST, { params }),

  getById: (id: string) =>
    apiClient.get<Inquiry>(API_ENDPOINTS.INQUIRIES.BY_ID(id)),

  update: (id: string, data: UpdateInquiryDto) =>
    apiClient.patch<Inquiry>(API_ENDPOINTS.INQUIRIES.BY_ID(id), data),

  updateStatus: (id: string, status: InquiryStatus) =>
    apiClient.patch<Inquiry>(API_ENDPOINTS.INQUIRIES.BY_ID(id), { status }),

  delete: (id: string) =>
    apiClient.delete(API_ENDPOINTS.INQUIRIES.BY_ID(id)),

  getAnalytics: (days?: number) =>
    apiClient.get<InquiryAnalytics>(API_ENDPOINTS.INQUIRIES.ANALYTICS, { params: { days } }),

  // Inquiry Forms
  getForms: () =>
    apiClient.get<InquiryForm[]>(API_ENDPOINTS.INQUIRY_FORMS.LIST),

  getFormById: (id: string) =>
    apiClient.get<InquiryForm>(API_ENDPOINTS.INQUIRY_FORMS.BY_ID(id)),

  createForm: (data: Partial<InquiryForm>) =>
    apiClient.post<InquiryForm>(API_ENDPOINTS.INQUIRY_FORMS.LIST, data),

  updateForm: (id: string, data: Partial<InquiryForm>) =>
    apiClient.patch<InquiryForm>(API_ENDPOINTS.INQUIRY_FORMS.BY_ID(id), data),

  deleteForm: (id: string) =>
    apiClient.delete(API_ENDPOINTS.INQUIRY_FORMS.BY_ID(id)),
};

// Query keys factory
export const leadsKeys = {
  all: ["leads"] as const,
  lists: () => [...leadsKeys.all, "list"] as const,
  list: (params?: InquiryFilterParams) => [...leadsKeys.lists(), params] as const,
  details: () => [...leadsKeys.all, "detail"] as const,
  detail: (id: string) => [...leadsKeys.details(), id] as const,
  analytics: (days?: number) => [...leadsKeys.all, "analytics", days] as const,
  forms: () => [...leadsKeys.all, "forms"] as const,
  form: (id: string) => [...leadsKeys.forms(), id] as const,
};

