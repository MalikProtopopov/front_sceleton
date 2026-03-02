"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useAppMutation } from "@/shared/lib";
import { reviewsApi, reviewsKeys } from "../api/reviewsApi";
import { ROUTES } from "@/shared/config";
import type { ReviewFilterParams, CreateReviewDto, UpdateReviewDto } from "@/entities/review";
import type { CreateContactDto, UpdateContactDto } from "@/entities/case";

export function useReviewsList(params?: ReviewFilterParams) {
  return useQuery({
    queryKey: reviewsKeys.list(params),
    queryFn: () => reviewsApi.getAll(params),
  });
}

export function useReview(id: string) {
  return useQuery({
    queryKey: reviewsKeys.detail(id),
    queryFn: () => reviewsApi.getById(id),
    enabled: !!id,
  });
}

export function useCreateReview() {
  const router = useRouter();
  return useAppMutation({
    mutationFn: (data: CreateReviewDto) => reviewsApi.create(data),
    successMessage: "Отзыв создан",
    errorMessage: "Не удалось создать отзыв",
    invalidateKeys: [reviewsKeys.lists()],
    onSuccess: (review) => {
      router.push(ROUTES.REVIEW_EDIT(review.id));
    },
  });
}

export function useUpdateReview(id: string) {
  const queryClient = useQueryClient();
  return useAppMutation({
    mutationFn: (data: UpdateReviewDto) => reviewsApi.update(id, data),
    successMessage: "Отзыв обновлен",
    errorMessage: "Не удалось обновить отзыв",
    invalidateKeys: [reviewsKeys.lists()],
    onSuccess: (review) => {
      queryClient.setQueryData(reviewsKeys.detail(id), review);
    },
  });
}

export function useDeleteReview() {
  const router = useRouter();
  return useAppMutation({
    mutationFn: (id: string) => reviewsApi.delete(id),
    successMessage: "Отзыв удален",
    errorMessage: "Не удалось удалить отзыв",
    invalidateKeys: [reviewsKeys.lists()],
    onSuccess: () => router.push(ROUTES.REVIEWS),
  });
}

export function useApproveReview() {
  const queryClient = useQueryClient();
  return useAppMutation({
    mutationFn: (id: string) => reviewsApi.approve(id),
    successMessage: "Отзыв одобрен",
    errorMessage: "Не удалось одобрить отзыв",
    invalidateKeys: [reviewsKeys.lists()],
    onSuccess: (review) => {
      queryClient.setQueryData(reviewsKeys.detail(review.id), review);
    },
  });
}

export function useRejectReview() {
  const queryClient = useQueryClient();
  return useAppMutation({
    mutationFn: (id: string) => reviewsApi.reject(id),
    successMessage: "Отзыв отклонен",
    errorMessage: "Не удалось отклонить отзыв",
    invalidateKeys: [reviewsKeys.lists()],
    onSuccess: (review) => {
      queryClient.setQueryData(reviewsKeys.detail(review.id), review);
    },
  });
}

export function useToggleReviewFeatured(id: string) {
  const queryClient = useQueryClient();
  return useAppMutation({
    mutationFn: ({ isFeatured, version }: { isFeatured: boolean; version: number }) =>
      reviewsApi.update(id, { is_featured: isFeatured, version }),
    successMessage: (review) =>
      review.is_featured ? "Отзыв добавлен в избранное" : "Отзыв удален из избранного",
    errorMessage: "Не удалось изменить статус",
    invalidateKeys: [reviewsKeys.lists()],
    onSuccess: (review) => {
      queryClient.setQueryData(reviewsKeys.detail(id), review);
    },
  });
}

// =====================
// Author Contact Hooks
// =====================

export function useCreateAuthorContact(reviewId: string) {
  return useAppMutation({
    mutationFn: (data: CreateContactDto) => reviewsApi.createAuthorContact(reviewId, data),
    successMessage: "Контакт автора добавлен",
    errorMessage: "Не удалось добавить контакт",
    invalidateKeys: [reviewsKeys.detail(reviewId)],
  });
}

export function useUpdateAuthorContact(reviewId: string) {
  return useAppMutation({
    mutationFn: ({ contactId, data }: { contactId: string; data: UpdateContactDto }) =>
      reviewsApi.updateAuthorContact(reviewId, contactId, data),
    successMessage: "Контакт автора обновлен",
    errorMessage: "Не удалось обновить контакт",
    invalidateKeys: [reviewsKeys.detail(reviewId)],
  });
}

export function useDeleteAuthorContact(reviewId: string) {
  return useAppMutation({
    mutationFn: (contactId: string) => reviewsApi.deleteAuthorContact(reviewId, contactId),
    successMessage: "Контакт автора удален",
    errorMessage: "Не удалось удалить контакт",
    invalidateKeys: [reviewsKeys.detail(reviewId)],
  });
}
