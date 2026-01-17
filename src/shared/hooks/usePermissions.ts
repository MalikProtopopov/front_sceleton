"use client";

import { useAuth } from "@/providers";

// Permission format: "resource:action" e.g. "articles:create", "users:read"
type Permission = string;

/**
 * Hook to check user permissions
 * Superusers have all permissions automatically
 */
export function usePermissions() {
  const { user } = useAuth();

  const permissions = user?.permissions || [];
  const isSuperuser = user?.is_superuser || false;

  /**
   * Check if user has a specific permission
   */
  const hasPermission = (permission: Permission): boolean => {
    if (isSuperuser) return true;
    return permissions.includes(permission);
  };

  /**
   * Check if user has any of the specified permissions
   */
  const hasAnyPermission = (permissionList: Permission[]): boolean => {
    if (isSuperuser) return true;
    return permissionList.some((p) => permissions.includes(p));
  };

  /**
   * Check if user has all of the specified permissions
   */
  const hasAllPermissions = (permissionList: Permission[]): boolean => {
    if (isSuperuser) return true;
    return permissionList.every((p) => permissions.includes(p));
  };

  /**
   * Check if user can perform action on resource
   * @param resource - e.g. "articles", "users", "media"
   * @param action - e.g. "create", "read", "update", "delete"
   */
  const can = (resource: string, action: string): boolean => {
    return hasPermission(`${resource}:${action}`);
  };

  return {
    permissions,
    isSuperuser,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    can,
  };
}

// Common permission constants
export const PERMISSIONS = {
  // Articles
  ARTICLES_CREATE: "articles:create",
  ARTICLES_READ: "articles:read",
  ARTICLES_UPDATE: "articles:update",
  ARTICLES_DELETE: "articles:delete",
  ARTICLES_PUBLISH: "articles:publish",

  // FAQ
  FAQ_CREATE: "faq:create",
  FAQ_READ: "faq:read",
  FAQ_UPDATE: "faq:update",
  FAQ_DELETE: "faq:delete",

  // Services
  SERVICES_CREATE: "services:create",
  SERVICES_READ: "services:read",
  SERVICES_UPDATE: "services:update",
  SERVICES_DELETE: "services:delete",

  // Employees
  EMPLOYEES_CREATE: "employees:create",
  EMPLOYEES_READ: "employees:read",
  EMPLOYEES_UPDATE: "employees:update",
  EMPLOYEES_DELETE: "employees:delete",

  // Reviews
  REVIEWS_CREATE: "reviews:create",
  REVIEWS_READ: "reviews:read",
  REVIEWS_UPDATE: "reviews:update",
  REVIEWS_DELETE: "reviews:delete",
  REVIEWS_MODERATE: "reviews:moderate",

  // Inquiries
  INQUIRIES_READ: "inquiries:read",
  INQUIRIES_UPDATE: "inquiries:update",
  INQUIRIES_DELETE: "inquiries:delete",

  // Media
  MEDIA_CREATE: "media:create",
  MEDIA_READ: "media:read",
  MEDIA_UPDATE: "media:update",
  MEDIA_DELETE: "media:delete",

  // SEO
  SEO_READ: "seo:read",
  SEO_UPDATE: "seo:update",

  // Users
  USERS_CREATE: "users:create",
  USERS_READ: "users:read",
  USERS_UPDATE: "users:update",
  USERS_DELETE: "users:delete",

  // Roles (admin only)
  ROLES_READ: "roles:read",
  ROLES_UPDATE: "roles:update",
} as const;

