// Inquiry Form entity types

export interface FormField {
  name: string;
  type: "text" | "email" | "tel" | "textarea" | "select" | "checkbox" | "radio" | "number";
  label?: string;
  placeholder?: string;
  required?: boolean;
  options?: string[];
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
  };
}

export interface FieldsConfig {
  fields: FormField[];
}

export interface InquiryForm {
  id: string;
  tenant_id: string;
  name: string;
  slug: string;
  description: string | null;
  is_active: boolean;
  notification_email: string | null;
  success_message: Record<string, string> | null;
  fields_config: FieldsConfig | null;
  sort_order: number;
  version: number;
  created_at: string;
  updated_at: string;
}

// Request DTOs
export interface CreateInquiryFormDto {
  name: string;
  slug: string;
  description?: string;
  is_active?: boolean;
  notification_email?: string;
  success_message?: Record<string, string>;
  fields_config?: FieldsConfig;
  sort_order?: number;
}

export interface UpdateInquiryFormDto {
  name?: string;
  slug?: string;
  description?: string | null;
  is_active?: boolean;
  notification_email?: string | null;
  success_message?: Record<string, string> | null;
  fields_config?: FieldsConfig | null;
  sort_order?: number;
  version: number;
}

// Filter params
export interface InquiryFormFilterParams {
  page?: number;
  pageSize?: number;
  is_active?: boolean;
}

// Field type options
export const FIELD_TYPES = [
  { value: "text", label: "Текст" },
  { value: "email", label: "Email" },
  { value: "tel", label: "Телефон" },
  { value: "textarea", label: "Многострочный текст" },
  { value: "select", label: "Выпадающий список" },
  { value: "checkbox", label: "Чекбокс" },
  { value: "radio", label: "Радио-кнопки" },
  { value: "number", label: "Число" },
] as const;

