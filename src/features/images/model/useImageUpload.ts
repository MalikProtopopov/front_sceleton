"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
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
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => articleImageApi.upload(articleId, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: articlesKeys.detail(articleId) });
      queryClient.invalidateQueries({ queryKey: articlesKeys.lists() });
    },
  });
}

export function useDeleteArticleCoverImage(articleId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => articleImageApi.delete(articleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: articlesKeys.detail(articleId) });
      queryClient.invalidateQueries({ queryKey: articlesKeys.lists() });
    },
  });
}

// Case cover image hooks
export function useUploadCaseCoverImage(caseId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => caseImageApi.upload(caseId, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: casesKeys.detail(caseId) });
      queryClient.invalidateQueries({ queryKey: casesKeys.lists() });
    },
  });
}

export function useDeleteCaseCoverImage(caseId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => caseImageApi.delete(caseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: casesKeys.detail(caseId) });
      queryClient.invalidateQueries({ queryKey: casesKeys.lists() });
    },
  });
}

// Service image hooks
export function useUploadServiceImage(serviceId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => serviceImageApi.upload(serviceId, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: servicesKeys.detail(serviceId) });
      queryClient.invalidateQueries({ queryKey: servicesKeys.lists() });
    },
  });
}

export function useDeleteServiceImage(serviceId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => serviceImageApi.delete(serviceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: servicesKeys.detail(serviceId) });
      queryClient.invalidateQueries({ queryKey: servicesKeys.lists() });
    },
  });
}

// Employee photo hooks
export function useUploadEmployeePhoto(employeeId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => employeeImageApi.upload(employeeId, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: employeesKeys.detail(employeeId) });
      queryClient.invalidateQueries({ queryKey: employeesKeys.lists() });
    },
  });
}

export function useDeleteEmployeePhoto(employeeId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => employeeImageApi.delete(employeeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: employeesKeys.detail(employeeId) });
      queryClient.invalidateQueries({ queryKey: employeesKeys.lists() });
    },
  });
}

// Review author photo hooks
export function useUploadReviewAuthorPhoto(reviewId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => reviewImageApi.upload(reviewId, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reviewsKeys.detail(reviewId) });
      queryClient.invalidateQueries({ queryKey: reviewsKeys.lists() });
    },
  });
}

export function useDeleteReviewAuthorPhoto(reviewId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => reviewImageApi.delete(reviewId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reviewsKeys.detail(reviewId) });
      queryClient.invalidateQueries({ queryKey: reviewsKeys.lists() });
    },
  });
}

// User avatar hooks (admin)
export function useUploadUserAvatar(userId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => userImageApi.upload(userId, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: usersKeys.detail(userId) });
      queryClient.invalidateQueries({ queryKey: usersKeys.lists() });
    },
  });
}

export function useDeleteUserAvatar(userId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => userImageApi.delete(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: usersKeys.detail(userId) });
      queryClient.invalidateQueries({ queryKey: usersKeys.lists() });
    },
  });
}

// Current user (me) avatar hooks
export function useUploadMyAvatar() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => meImageApi.upload(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
    },
  });
}

export function useDeleteMyAvatar() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => meImageApi.delete(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
    },
  });
}

// Tenant logo hooks
export function useUploadTenantLogo(tenantId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => tenantImageApi.upload(tenantId, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenants", tenantId] });
    },
  });
}

export function useDeleteTenantLogo(tenantId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => tenantImageApi.delete(tenantId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenants", tenantId] });
    },
  });
}

