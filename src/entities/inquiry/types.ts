// Inquiry entity types

export type InquiryStatus = "new" | "in_progress" | "contacted" | "completed" | "spam" | "cancelled";

export interface Inquiry {
  id: string;
  tenant_id: string;
  form_id: string | null;
  status: InquiryStatus;
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  message: string | null;
  service_id: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_term: string | null;
  utm_content: string | null;
  referrer_url: string | null;
  source_url: string | null;
  page_path: string | null;
  page_title: string | null;
  device_type: string | null;
  browser: string | null;
  os: string | null;
  ip_address: string | null;
  country: string | null;
  city: string | null;
  session_id: string | null;
  session_page_views: number | null;
  time_on_page: number | null;
  assigned_to: string | null;
  notes: string | null;
  contacted_at: string | null;
  notification_sent: boolean;
  custom_fields: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

// Inquiry Form types
export interface InquiryFormField {
  name: string;
  type: "text" | "email" | "tel" | "textarea" | "select";
  label?: string;
  required?: boolean;
  options?: string[];
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
  fields_config: { fields: InquiryFormField[] } | null;
  sort_order: number;
  version: number;
  created_at: string;
  updated_at: string;
}

// Request DTOs
export interface UpdateInquiryDto {
  status?: InquiryStatus;
  assigned_to?: string | null;
  notes?: string;
}

// Filter params
export interface InquiryFilterParams {
  page?: number;
  pageSize?: number;
  status?: InquiryStatus;
  formId?: string;
  assignedTo?: string;
  utmSource?: string;
  search?: string;
}

// Analytics
export interface InquiryAnalytics {
  total: number;
  by_status: Record<string, number>;
  by_utm_source: Record<string, number>;
  by_device_type: Record<string, number>;
  by_day: Array<{ date: string; count: number }>;
}

// Status labels and colors
export const INQUIRY_STATUS_CONFIG: Record<InquiryStatus, { label: string; variant: "secondary" | "info" | "warning" | "success" | "error" }> = {
  new: { label: "Новый", variant: "info" },
  in_progress: { label: "В работе", variant: "warning" },
  contacted: { label: "Связались", variant: "secondary" },
  completed: { label: "Завершен", variant: "success" },
  spam: { label: "Спам", variant: "error" },
  cancelled: { label: "Отменен", variant: "secondary" },
};

