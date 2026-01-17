import { apiClient } from "@/shared/api";
import { API_ENDPOINTS } from "@/shared/config";
import type { PaginatedResponse } from "@/shared/types";
import type {
  PracticeArea,
  PracticeAreaLocale,
  CreatePracticeAreaDto,
  UpdatePracticeAreaDto,
  CreatePracticeAreaLocaleDto,
  UpdatePracticeAreaLocaleDto,
  Advantage,
  AdvantageLocale,
  CreateAdvantageDto,
  UpdateAdvantageDto,
  CreateAdvantageLocaleDto,
  UpdateAdvantageLocaleDto,
  Address,
  AddressLocale,
  CreateAddressDto,
  UpdateAddressDto,
  CreateAddressLocaleDto,
  UpdateAddressLocaleDto,
  Contact,
  CreateContactDto,
  UpdateContactDto,
} from "@/entities/company";

// Practice Areas API
export const practiceAreasApi = {
  getAll: () =>
    apiClient.get<PaginatedResponse<PracticeArea>>(API_ENDPOINTS.PRACTICE_AREAS.LIST),

  getById: (id: string) =>
    apiClient.get<PracticeArea>(API_ENDPOINTS.PRACTICE_AREAS.BY_ID(id)),

  create: (data: CreatePracticeAreaDto) =>
    apiClient.post<PracticeArea>(API_ENDPOINTS.PRACTICE_AREAS.LIST, data),

  update: (id: string, data: UpdatePracticeAreaDto) =>
    apiClient.patch<PracticeArea>(API_ENDPOINTS.PRACTICE_AREAS.BY_ID(id), data),

  delete: (id: string) =>
    apiClient.delete(API_ENDPOINTS.PRACTICE_AREAS.BY_ID(id)),

  // Locales
  createLocale: (practiceAreaId: string, data: CreatePracticeAreaLocaleDto) =>
    apiClient.post<PracticeAreaLocale>(API_ENDPOINTS.PRACTICE_AREAS.LOCALES(practiceAreaId), data),

  updateLocale: (practiceAreaId: string, localeId: string, data: UpdatePracticeAreaLocaleDto) =>
    apiClient.patch<PracticeAreaLocale>(API_ENDPOINTS.PRACTICE_AREAS.LOCALE_BY_ID(practiceAreaId, localeId), data),

  deleteLocale: (practiceAreaId: string, localeId: string) =>
    apiClient.delete(API_ENDPOINTS.PRACTICE_AREAS.LOCALE_BY_ID(practiceAreaId, localeId)),
};

// Advantages API
export const advantagesApi = {
  getAll: () =>
    apiClient.get<PaginatedResponse<Advantage>>(API_ENDPOINTS.ADVANTAGES.LIST),

  getById: (id: string) =>
    apiClient.get<Advantage>(API_ENDPOINTS.ADVANTAGES.BY_ID(id)),

  create: (data: CreateAdvantageDto) =>
    apiClient.post<Advantage>(API_ENDPOINTS.ADVANTAGES.LIST, data),

  update: (id: string, data: UpdateAdvantageDto) =>
    apiClient.patch<Advantage>(API_ENDPOINTS.ADVANTAGES.BY_ID(id), data),

  delete: (id: string) =>
    apiClient.delete(API_ENDPOINTS.ADVANTAGES.BY_ID(id)),

  // Locales
  createLocale: (advantageId: string, data: CreateAdvantageLocaleDto) =>
    apiClient.post<AdvantageLocale>(API_ENDPOINTS.ADVANTAGES.LOCALES(advantageId), data),

  updateLocale: (advantageId: string, localeId: string, data: UpdateAdvantageLocaleDto) =>
    apiClient.patch<AdvantageLocale>(API_ENDPOINTS.ADVANTAGES.LOCALE_BY_ID(advantageId, localeId), data),

  deleteLocale: (advantageId: string, localeId: string) =>
    apiClient.delete(API_ENDPOINTS.ADVANTAGES.LOCALE_BY_ID(advantageId, localeId)),
};

// Addresses API
export const addressesApi = {
  getAll: () =>
    apiClient.get<PaginatedResponse<Address>>(API_ENDPOINTS.ADDRESSES.LIST),

  getById: (id: string) =>
    apiClient.get<Address>(API_ENDPOINTS.ADDRESSES.BY_ID(id)),

  create: (data: CreateAddressDto) =>
    apiClient.post<Address>(API_ENDPOINTS.ADDRESSES.LIST, data),

  update: (id: string, data: UpdateAddressDto) =>
    apiClient.patch<Address>(API_ENDPOINTS.ADDRESSES.BY_ID(id), data),

  delete: (id: string) =>
    apiClient.delete(API_ENDPOINTS.ADDRESSES.BY_ID(id)),

  // Locales
  createLocale: (addressId: string, data: CreateAddressLocaleDto) =>
    apiClient.post<AddressLocale>(API_ENDPOINTS.ADDRESSES.LOCALES(addressId), data),

  updateLocale: (addressId: string, localeId: string, data: UpdateAddressLocaleDto) =>
    apiClient.patch<AddressLocale>(API_ENDPOINTS.ADDRESSES.LOCALE_BY_ID(addressId, localeId), data),

  deleteLocale: (addressId: string, localeId: string) =>
    apiClient.delete(API_ENDPOINTS.ADDRESSES.LOCALE_BY_ID(addressId, localeId)),
};

// Contacts API
export const contactsApi = {
  getAll: () =>
    apiClient.get<PaginatedResponse<Contact>>(API_ENDPOINTS.CONTACTS.LIST),

  getById: (id: string) =>
    apiClient.get<Contact>(API_ENDPOINTS.CONTACTS.BY_ID(id)),

  create: (data: CreateContactDto) =>
    apiClient.post<Contact>(API_ENDPOINTS.CONTACTS.LIST, data),

  update: (id: string, data: UpdateContactDto) =>
    apiClient.patch<Contact>(API_ENDPOINTS.CONTACTS.BY_ID(id), data),

  delete: (id: string) =>
    apiClient.delete(API_ENDPOINTS.CONTACTS.BY_ID(id)),
};

// Query keys
export const companyKeys = {
  practiceAreas: {
    all: ["practiceAreas"] as const,
    list: () => [...companyKeys.practiceAreas.all, "list"] as const,
    detail: (id: string) => [...companyKeys.practiceAreas.all, "detail", id] as const,
  },
  advantages: {
    all: ["advantages"] as const,
    list: () => [...companyKeys.advantages.all, "list"] as const,
    detail: (id: string) => [...companyKeys.advantages.all, "detail", id] as const,
  },
  addresses: {
    all: ["addresses"] as const,
    list: () => [...companyKeys.addresses.all, "list"] as const,
    detail: (id: string) => [...companyKeys.addresses.all, "detail", id] as const,
  },
  contacts: {
    all: ["contacts"] as const,
    list: () => [...companyKeys.contacts.all, "list"] as const,
    detail: (id: string) => [...companyKeys.contacts.all, "detail", id] as const,
  },
};

