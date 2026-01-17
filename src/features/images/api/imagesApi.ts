import { apiClient } from "@/shared/api";
import { API_ENDPOINTS } from "@/shared/config";
import type { Article } from "@/entities/article";
import type { Case } from "@/entities/case";
import type { Service } from "@/entities/service";
import type { Employee } from "@/entities/employee";
import type { Review } from "@/entities/review";
import type { User } from "@/entities/user";
import type { Tenant } from "@/entities/tenant";

// Supported image types and max size
export const SUPPORTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

export const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB

// Validation helper
export interface ImageValidationResult {
  valid: boolean;
  error?: string;
}

export function validateImageFile(file: File): ImageValidationResult {
  if (!SUPPORTED_IMAGE_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: `Неверный тип файла: ${file.type}. Допустимые: JPEG, PNG, WebP, GIF`,
    };
  }

  if (file.size > MAX_IMAGE_SIZE) {
    return {
      valid: false,
      error: `Файл слишком большой: ${(file.size / (1024 * 1024)).toFixed(1)}MB. Максимум: 10MB`,
    };
  }

  return { valid: true };
}

// Article cover image
export const articleImageApi = {
  upload: (id: string, file: File) =>
    apiClient.uploadFile<Article>(API_ENDPOINTS.ARTICLES.COVER_IMAGE(id), file),
  
  delete: (id: string) =>
    apiClient.delete(API_ENDPOINTS.ARTICLES.COVER_IMAGE(id)),
};

// Case cover image
export const caseImageApi = {
  upload: (id: string, file: File) =>
    apiClient.uploadFile<Case>(API_ENDPOINTS.CASES.COVER_IMAGE(id), file),
  
  delete: (id: string) =>
    apiClient.delete(API_ENDPOINTS.CASES.COVER_IMAGE(id)),
};

// Service image
export const serviceImageApi = {
  upload: (id: string, file: File) =>
    apiClient.uploadFile<Service>(API_ENDPOINTS.SERVICES.IMAGE(id), file),
  
  delete: (id: string) =>
    apiClient.delete(API_ENDPOINTS.SERVICES.IMAGE(id)),
};

// Employee photo
export const employeeImageApi = {
  upload: (id: string, file: File) =>
    apiClient.uploadFile<Employee>(API_ENDPOINTS.EMPLOYEES.PHOTO(id), file),
  
  delete: (id: string) =>
    apiClient.delete(API_ENDPOINTS.EMPLOYEES.PHOTO(id)),
};

// Review author photo
export const reviewImageApi = {
  upload: (id: string, file: File) =>
    apiClient.uploadFile<Review>(API_ENDPOINTS.REVIEWS.AUTHOR_PHOTO(id), file),
  
  delete: (id: string) =>
    apiClient.delete(API_ENDPOINTS.REVIEWS.AUTHOR_PHOTO(id)),
};

// User avatar (admin)
export const userImageApi = {
  upload: (id: string, file: File) =>
    apiClient.uploadFile<User>(API_ENDPOINTS.AUTH.USER_AVATAR(id), file),
  
  delete: (id: string) =>
    apiClient.delete(API_ENDPOINTS.AUTH.USER_AVATAR(id)),
};

// Current user avatar (me)
export const meImageApi = {
  upload: (file: File) =>
    apiClient.uploadFile<User>(API_ENDPOINTS.AUTH.ME_AVATAR, file),
  
  delete: () =>
    apiClient.delete(API_ENDPOINTS.AUTH.ME_AVATAR),
};

// Tenant logo
export const tenantImageApi = {
  upload: (id: string, file: File) =>
    apiClient.uploadFile<Tenant>(API_ENDPOINTS.TENANTS.LOGO(id), file),
  
  delete: (id: string) =>
    apiClient.delete(API_ENDPOINTS.TENANTS.LOGO(id)),
};

// Query keys factory
export const imageKeys = {
  articles: {
    coverImage: (id: string) => ["articles", id, "cover-image"] as const,
  },
  cases: {
    coverImage: (id: string) => ["cases", id, "cover-image"] as const,
  },
  services: {
    image: (id: string) => ["services", id, "image"] as const,
  },
  employees: {
    photo: (id: string) => ["employees", id, "photo"] as const,
  },
  reviews: {
    authorPhoto: (id: string) => ["reviews", id, "author-photo"] as const,
  },
  users: {
    avatar: (id: string) => ["users", id, "avatar"] as const,
  },
  me: {
    avatar: () => ["me", "avatar"] as const,
  },
  tenants: {
    logo: (id: string) => ["tenants", id, "logo"] as const,
  },
};

