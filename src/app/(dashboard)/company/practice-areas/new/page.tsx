"use client";

import { useCreatePracticeArea, PracticeAreaForm } from "@/features/company";

export default function NewPracticeAreaPage() {
  const { mutate: create, isPending } = useCreatePracticeArea();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Новое направление</h1>
        <p className="text-[var(--color-text-secondary)]">Создайте новое направление деятельности</p>
      </div>

      <PracticeAreaForm onSubmit={create} isSubmitting={isPending} />
    </div>
  );
}
