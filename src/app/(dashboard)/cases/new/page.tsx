"use client";

import { CaseForm, useCreateCase } from "@/features/cases";
import { useServicesList } from "@/features/services";
import { Spinner } from "@/shared/ui";
import type { CreateCaseDto, UpdateCaseDto } from "@/entities/case";

export default function NewCasePage() {
  const { data: servicesData, isLoading: servicesLoading } = useServicesList();
  const { mutate: createCase, isPending } = useCreateCase();

  const handleSubmit = (data: CreateCaseDto | UpdateCaseDto) => {
    createCase(data as CreateCaseDto);
  };

  if (servicesLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Новый кейс</h1>
        <p className="text-[var(--color-text-secondary)]">Создайте новый кейс для портфолио</p>
      </div>

      <CaseForm
        services={servicesData?.items || []}
        onSubmit={handleSubmit}
        isSubmitting={isPending}
      />
    </div>
  );
}

