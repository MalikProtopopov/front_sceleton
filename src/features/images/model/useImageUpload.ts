"use client";

import { useAppMutation } from "@/shared/lib";
import {
  articleImageApi,
  caseImageApi,
  serviceImageApi,
  employeeImageApi,
  reviewImageApi,
  userImageApi,
  meImageApi,
  tenantImageApi,
} from "../api/imagesApi";
import { articlesKeys } from "@/features/articles";
import { casesKeys } from "@/features/cases";
import { servicesKeys } from "@/features/services";
import { employeesKeys } from "@/features/employees";
import { reviewsKeys } from "@/features/reviews";
import { usersKeys } from "@/features/users";

// Article cover image hooks
export function useUploadArticleCoverImage(articleId: string) {
  return useAppMutation({
    mutationFn: (file: File) => articleImageApi.upload(articleId, file),
    invalidateKeys: [articlesKeys.detail(articleId), articlesKeys.lists()],
  });
}

export function useDeleteArticleCoverImage(articleId: string) {
  return useAppMutation({
    mutationFn: () => articleImageApi.delete(articleId),
    invalidateKeys: [articlesKeys.detail(articleId), articlesKeys.lists()],
  });
}

// Case cover image hooks
export function useUploadCaseCoverImage(caseId: string) {
  return useAppMutation({
    mutationFn: (file: File) => caseImageApi.upload(caseId, file),
    invalidateKeys: [casesKeys.detail(caseId), casesKeys.lists()],
  });
}

export function useDeleteCaseCoverImage(caseId: string) {
  return useAppMutation({
    mutationFn: () => caseImageApi.delete(caseId),
    invalidateKeys: [casesKeys.detail(caseId), casesKeys.lists()],
  });
}

// Service image hooks
export function useUploadServiceImage(serviceId: string) {
  return useAppMutation({
    mutationFn: (file: File) => serviceImageApi.upload(serviceId, file),
    invalidateKeys: [servicesKeys.detail(serviceId), servicesKeys.lists()],
  });
}

export function useDeleteServiceImage(serviceId: string) {
  return useAppMutation({
    mutationFn: () => serviceImageApi.delete(serviceId),
    invalidateKeys: [servicesKeys.detail(serviceId), servicesKeys.lists()],
  });
}

// Employee photo hooks
export function useUploadEmployeePhoto(employeeId: string) {
  return useAppMutation({
    mutationFn: (file: File) => employeeImageApi.upload(employeeId, file),
    invalidateKeys: [employeesKeys.detail(employeeId), employeesKeys.lists()],
  });
}

export function useDeleteEmployeePhoto(employeeId: string) {
  return useAppMutation({
    mutationFn: () => employeeImageApi.delete(employeeId),
    invalidateKeys: [employeesKeys.detail(employeeId), employeesKeys.lists()],
  });
}

// Review author photo hooks
export function useUploadReviewAuthorPhoto(reviewId: string) {
  return useAppMutation({
    mutationFn: (file: File) => reviewImageApi.upload(reviewId, file),
    invalidateKeys: [reviewsKeys.detail(reviewId), reviewsKeys.lists()],
  });
}

export function useDeleteReviewAuthorPhoto(reviewId: string) {
  return useAppMutation({
    mutationFn: () => reviewImageApi.delete(reviewId),
    invalidateKeys: [reviewsKeys.detail(reviewId), reviewsKeys.lists()],
  });
}

// User avatar hooks (admin)
export function useUploadUserAvatar(userId: string) {
  return useAppMutation({
    mutationFn: (file: File) => userImageApi.upload(userId, file),
    invalidateKeys: [usersKeys.detail(userId), usersKeys.lists()],
  });
}

export function useDeleteUserAvatar(userId: string) {
  return useAppMutation({
    mutationFn: () => userImageApi.delete(userId),
    invalidateKeys: [usersKeys.detail(userId), usersKeys.lists()],
  });
}

// Current user (me) avatar hooks
export function useUploadMyAvatar() {
  return useAppMutation({
    mutationFn: (file: File) => meImageApi.upload(file),
    invalidateKeys: [["auth", "me"]],
  });
}

export function useDeleteMyAvatar() {
  return useAppMutation({
    mutationFn: () => meImageApi.delete(),
    invalidateKeys: [["auth", "me"]],
  });
}

// Tenant logo hooks
export function useUploadTenantLogo(tenantId: string) {
  return useAppMutation({
    mutationFn: (file: File) => tenantImageApi.upload(tenantId, file),
    invalidateKeys: [["tenants", tenantId]],
  });
}

export function useDeleteTenantLogo(tenantId: string) {
  return useAppMutation({
    mutationFn: () => tenantImageApi.delete(tenantId),
    invalidateKeys: [["tenants", tenantId]],
  });
}
