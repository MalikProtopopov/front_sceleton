"use client";

import { FAQForm, useCreateFAQ } from "@/features/faq";
import type { CreateFAQDto, UpdateFAQDto } from "@/entities/faq";

export default function NewFAQPage() {
  const { mutate: createFAQ, isPending } = useCreateFAQ();

  const handleSubmit = (data: CreateFAQDto | UpdateFAQDto) => {
    createFAQ(data as CreateFAQDto);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Новый FAQ</h1>
        <p className="text-[var(--color-text-secondary)]">Создайте новый часто задаваемый вопрос</p>
      </div>

      <FAQForm onSubmit={handleSubmit} isSubmitting={isPending} />
    </div>
  );
}

