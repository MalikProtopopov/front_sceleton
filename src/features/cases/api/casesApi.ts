import { apiClient } from "@/shared/api";
import { API_ENDPOINTS } from "@/shared/config";
import type { PaginatedResponse } from "@/shared/types";
import type {
  Case,
  CaseLocale,
  CreateCaseDto,
  UpdateCaseDto,
  CreateCaseLocaleDto,
  UpdateCaseLocaleDto,
  CaseFilterParams,
  Contact,
  CreateContactDto,
  UpdateContactDto,
} from "@/entities/case";

export const casesApi = {
  getAll: (params?: CaseFilterParams) =>
    apiClient.get<PaginatedResponse<Case>>(API_ENDPOINTS.CASES.LIST, { params }),

  getById: (id: string) =>
    apiClient.get<Case>(API_ENDPOINTS.CASES.BY_ID(id)),

  create: (data: CreateCaseDto) =>
    apiClient.post<Case>(API_ENDPOINTS.CASES.LIST, data),

  update: (id: string, data: UpdateCaseDto) =>
    apiClient.patch<Case>(API_ENDPOINTS.CASES.BY_ID(id), data),

  delete: (id: string) =>
    apiClient.delete(API_ENDPOINTS.CASES.BY_ID(id)),

  publish: (id: string) =>
    apiClient.post<Case>(API_ENDPOINTS.CASES.PUBLISH(id)),

  unpublish: (id: string) =>
    apiClient.post<Case>(API_ENDPOINTS.CASES.UNPUBLISH(id)),

  // Locales
  createLocale: (caseId: string, data: CreateCaseLocaleDto) =>
    apiClient.post<CaseLocale>(API_ENDPOINTS.CASES.LOCALES(caseId), data),

  updateLocale: (caseId: string, localeId: string, data: UpdateCaseLocaleDto) =>
    apiClient.patch<CaseLocale>(API_ENDPOINTS.CASES.LOCALE_BY_ID(caseId, localeId), data),

  deleteLocale: (caseId: string, localeId: string) =>
    apiClient.delete(API_ENDPOINTS.CASES.LOCALE_BY_ID(caseId, localeId)),

  // Contacts
  createContact: (caseId: string, data: CreateContactDto) =>
    apiClient.post<Contact>(API_ENDPOINTS.CASES.CONTACTS(caseId), data),

  updateContact: (caseId: string, contactId: string, data: UpdateContactDto) =>
    apiClient.patch<Contact>(API_ENDPOINTS.CASES.CONTACT_BY_ID(caseId, contactId), data),

  deleteContact: (caseId: string, contactId: string) =>
    apiClient.delete(API_ENDPOINTS.CASES.CONTACT_BY_ID(caseId, contactId)),
};

// Query keys factory
export const casesKeys = {
  all: ["cases"] as const,
  lists: () => [...casesKeys.all, "list"] as const,
  list: (params?: CaseFilterParams) => [...casesKeys.lists(), params] as const,
  details: () => [...casesKeys.all, "detail"] as const,
  detail: (id: string) => [...casesKeys.details(), id] as const,
};

