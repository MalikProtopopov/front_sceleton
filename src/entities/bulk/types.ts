// Bulk operations types

export type BulkResourceType = "articles" | "cases" | "faq" | "reviews";
export type BulkAction = "publish" | "unpublish" | "archive" | "delete";

export interface BulkOperationRequest {
  resource_type: BulkResourceType;
  action: BulkAction;
  ids: string[];
}

export interface BulkOperationDetail {
  id: string;
  status: "success" | "error";
  message: string | null;
}

export interface BulkOperationSummary {
  total: number;
  succeeded: number;
  failed: number;
  details: BulkOperationDetail[];
}

export interface BulkOperationResponse {
  job_id: string | null;
  status: "completed" | "processing";
  summary: BulkOperationSummary;
}

export const BULK_ACTION_CONFIG: Record<BulkAction, { label: string; variant: "primary" | "secondary" | "danger" }> = {
  publish: { label: "Опубликовать", variant: "primary" },
  unpublish: { label: "Снять с публикации", variant: "secondary" },
  archive: { label: "В архив", variant: "secondary" },
  delete: { label: "Удалить", variant: "danger" },
};

