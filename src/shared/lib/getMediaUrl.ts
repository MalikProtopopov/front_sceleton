import type { FileAsset } from "@/entities/file";

/**
 * Converts a relative media URL to an absolute URL for Next.js Image component
 * 
 * @param url - Relative URL (e.g., "/media/...") or absolute URL
 * @returns Absolute URL that can be used with Next.js Image component
 */
export function getMediaUrl(url: string | null | undefined): string {
  if (!url) return "";
  
  // If already absolute URL, return as is
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }
  
  // Extract base URL from NEXT_PUBLIC_API_URL (remove /api/v1 if present)
  // For example: http://localhost:8000/api/v1 -> http://localhost:8000
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
  let backendBaseUrl = "";
  
  if (apiUrl) {
    // Remove /api/v1 or /api suffix if present
    backendBaseUrl = apiUrl.replace(/\/api\/v1$|\/api$/, "");
  }
  
  // Fallback to localhost:8000 for development if no env var
  if (!backendBaseUrl && typeof window !== "undefined") {
    backendBaseUrl = "http://localhost:8000";
  }
  
  // If still no base URL, return relative (will work with rewrites)
  if (!backendBaseUrl) {
    return url;
  }
  
  // Ensure URL starts with /
  const cleanUrl = url.startsWith("/") ? url : `/${url}`;
  
  return `${backendBaseUrl}${cleanUrl}`;
}

/**
 * Gets the canonical URL from a FileAsset for storing in content blocks
 * Priority: cdn_url > file_url > s3_url
 * 
 * @param file - FileAsset object from media library
 * @returns URL string to store in content block's media_url field
 */
export function getFileContentUrl(file: FileAsset): string {
  return file.cdn_url || file.file_url || file.s3_url || "";
}