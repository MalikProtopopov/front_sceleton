"use client";

import { ReviewForm, useCreateReview } from "@/features/reviews";
import type { CreateReviewDto, UpdateReviewDto } from "@/entities/review";

export default function NewReviewPage() {
  const { mutate: createReview, isPending } = useCreateReview();

  const handleSubmit = (data: CreateReviewDto | UpdateReviewDto) => {
    createReview(data as CreateReviewDto);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Новый отзыв</h1>
        <p className="text-[var(--color-text-secondary)]">Добавьте новый отзыв клиента</p>
      </div>

      <ReviewForm onSubmit={handleSubmit} isSubmitting={isPending} />
    </div>
  );
}

