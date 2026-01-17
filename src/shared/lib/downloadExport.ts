import { apiClient } from "@/shared/api";
import { API_ENDPOINTS } from "@/shared/config";
import { toast } from "sonner";

export type ExportResourceType = "inquiries" | "team" | "seo_routes" | "audit_logs";
export type ExportFormat = "csv" | "json";

export async function downloadExport(
  resourceType: ExportResourceType,
  format: ExportFormat = "csv",
  filters?: Record<string, string | undefined>
): Promise<void> {
  try {
    const params = new URLSearchParams();
    params.set("resourceType", resourceType);
    params.set("format", format);
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) {
          params.set(key, value);
        }
      });
    }

    // Use raw axios instance for blob response
    const response = await apiClient.axios.get(`${API_ENDPOINTS.EXPORT}?${params.toString()}`, {
      responseType: "blob",
    });

    // Get filename from Content-Disposition header
    const contentDisposition = response.headers?.["content-disposition"];
    let filename = `export_${resourceType}_${new Date().toISOString().split("T")[0]}.${format}`;
    
    if (contentDisposition) {
      const match = contentDisposition.match(/filename="(.+)"/);
      if (match) {
        filename = match[1];
      }
    }

    // Create download link
    const blob = new Blob([response.data as BlobPart], {
      type: format === "csv" ? "text/csv;charset=utf-8" : "application/json",
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    toast.success("Файл скачан");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Не удалось экспортировать данные";
    toast.error(message);
    throw error;
  }
}

