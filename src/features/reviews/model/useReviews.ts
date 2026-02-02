"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
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
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateReviewDto) => reviewsApi.create(data),
    onSuccess: (review) => {
      queryClient.invalidateQueries({ queryKey: reviewsKeys.lists() });
      toast.success("Отзыв создан");
      router.push(ROUTES.REVIEW_EDIT(review.id));
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : "Не удалось создать отзыв";
      toast.error(message);
    },
  });
}

export function useUpdateReview(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateReviewDto) => reviewsApi.update(id, data),
    onSuccess: (review) => {
      queryClient.setQueryData(reviewsKeys.detail(id), review);
      queryClient.invalidateQueries({ queryKey: reviewsKeys.lists() });
      toast.success("Отзыв обновлен");
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : "Не удалось обновить отзыв";
      toast.error(message);
    },
  });
}

export function useDeleteReview() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => reviewsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reviewsKeys.lists() });
      toast.success("Отзыв удален");
      router.push(ROUTES.REVIEWS);
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : "Не удалось удалить отзыв";
      toast.error(message);
    },
  });
}

export function useApproveReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => reviewsApi.approve(id),
    onSuccess: (review) => {
      queryClient.setQueryData(reviewsKeys.detail(review.id), review);
      queryClient.invalidateQueries({ queryKey: reviewsKeys.lists() });
      toast.success("Отзыв одобрен");
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : "Не удалось одобрить отзыв";
      toast.error(message);
    },
  });
}

export function useRejectReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => reviewsApi.reject(id),
    onSuccess: (review) => {
      queryClient.setQueryData(reviewsKeys.detail(review.id), review);
      queryClient.invalidateQueries({ queryKey: reviewsKeys.lists() });
      toast.success("Отзыв отклонен");
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : "Не удалось отклонить отзыв";
      toast.error(message);
    },
  });
}

export function useToggleReviewFeatured(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ isFeatured, version }: { isFeatured: boolean; version: number }) =>
      reviewsApi.update(id, { is_featured: isFeatured, version }),
    onSuccess: (review) => {
      queryClient.setQueryData(reviewsKeys.detail(id), review);
      queryClient.invalidateQueries({ queryKey: reviewsKeys.lists() });
      toast.success(review.is_featured ? "Отзыв добавлен в избранное" : "Отзыв удален из избранного");
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : "Не удалось изменить статус";
      toast.error(message);
    },
  });
}

// =====================
// Author Contact Hooks
// =====================

export function useCreateAuthorContact(reviewId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateContactDto) => reviewsApi.createAuthorContact(reviewId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reviewsKeys.detail(reviewId) });
      toast.success("Контакт автора добавлен");
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : "Не удалось добавить контакт";
      toast.error(message);
    },
  });
}

export function useUpdateAuthorContact(reviewId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ contactId, data }: { contactId: string; data: UpdateContactDto }) =>
      reviewsApi.updateAuthorContact(reviewId, contactId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reviewsKeys.detail(reviewId) });
      toast.success("Контакт автора обновлен");
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : "Не удалось обновить контакт";
      toast.error(message);
    },
  });
}

export function useDeleteAuthorContact(reviewId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (contactId: string) => reviewsApi.deleteAuthorContact(reviewId, contactId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reviewsKeys.detail(reviewId) });
      toast.success("Контакт автора удален");
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : "Не удалось удалить контакт";
      toast.error(message);
    },
  });
}

