// Company Info types

// Practice Area
export interface PracticeAreaLocale {
  id: string;
  practice_area_id: string;
  locale: string;
  name: string;
  slug: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface PracticeArea {
  id: string;
  tenant_id: string;
  icon: string | null;
  sort_order: number;
  is_active: boolean;
  version: number;
  created_at: string;
  updated_at: string;
  locales: PracticeAreaLocale[];
}

export interface CreatePracticeAreaLocaleDto {
  locale: string;
  name: string;
  slug: string;
  description?: string;
}

export interface CreatePracticeAreaDto {
  icon?: string;
  sort_order?: number;
  is_active?: boolean;
  locales: CreatePracticeAreaLocaleDto[];
}

export interface UpdatePracticeAreaDto extends Partial<CreatePracticeAreaDto> {
  version: number;
}

// Advantage
export interface AdvantageLocale {
  id: string;
  advantage_id: string;
  locale: string;
  title: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface Advantage {
  id: string;
  tenant_id: string;
  icon: string | null;
  sort_order: number;
  is_active: boolean;
  version: number;
  created_at: string;
  updated_at: string;
  locales: AdvantageLocale[];
}

export interface CreateAdvantageLocaleDto {
  locale: string;
  title: string;
  description?: string;
}

export interface CreateAdvantageDto {
  icon?: string;
  sort_order?: number;
  is_active?: boolean;
  locales: CreateAdvantageLocaleDto[];
}

export interface UpdateAdvantageDto extends Partial<CreateAdvantageDto> {
  version: number;
}

// Address
export interface AddressLocale {
  id: string;
  address_id: string;
  locale: string;
  name: string;
  address_line: string;
  city: string;
  country: string;
  region: string | null;
  created_at: string;
  updated_at: string;
}

export interface Address {
  id: string;
  tenant_id: string;
  postal_code: string | null;
  latitude: number | null;
  longitude: number | null;
  sort_order: number;
  is_primary: boolean;
  version: number;
  created_at: string;
  updated_at: string;
  locales: AddressLocale[];
}

export interface CreateAddressLocaleDto {
  locale: string;
  name: string;
  address_line: string;
  city: string;
  country: string;
  region?: string;
}

export interface CreateAddressDto {
  postal_code?: string;
  latitude?: number;
  longitude?: number;
  sort_order?: number;
  is_primary?: boolean;
  locales: CreateAddressLocaleDto[];
}

export interface UpdateAddressDto extends Partial<CreateAddressDto> {
  version: number;
}

// Contact
export type ContactType = "phone" | "email" | "social";

export interface Contact {
  id: string;
  tenant_id: string;
  type: ContactType;
  label: string | null;
  value: string;
  icon: string | null;
  sort_order: number;
  is_primary: boolean;
  version: number;
  created_at: string;
  updated_at: string;
}

export interface CreateContactDto {
  type: ContactType;
  label?: string;
  value: string;
  icon?: string;
  sort_order?: number;
  is_primary?: boolean;
}

export interface UpdateContactDto extends Partial<CreateContactDto> {
  version: number;
}

// Filter params
export interface CompanyFilterParams {
  page?: number;
  pageSize?: number;
}

// Locale DTOs (for independent locale management)
export interface UpdatePracticeAreaLocaleDto {
  locale: string; // Required
  name?: string;
  slug?: string;
  description?: string;
}

export interface UpdateAdvantageLocaleDto {
  locale: string; // Required
  title?: string;
  description?: string;
}

export interface UpdateAddressLocaleDto {
  locale: string; // Required
  name?: string;
  address_line?: string;
  city?: string;
  country?: string;
  region?: string;
}

