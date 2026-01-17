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
  
  // Convert relative URL to absolute using NEXT_PUBLIC_BACKEND_URL
  // Falls back to empty string for relative URLs (will work with rewrites in production)
  const backendBaseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "";
  
  // If no base URL, return relative (will work with rewrites)
  if (!backendBaseUrl) {
    return url;
  }
  
  // Ensure URL starts with /
  const cleanUrl = url.startsWith("/") ? url : `/${url}`;
  
  return `${backendBaseUrl}${cleanUrl}`;
}

