"use client";

import { ServiceForm, useCreateService } from "@/features/services";
import type { CreateServiceDto, UpdateServiceDto } from "@/entities/service";

export default function NewServicePage() {
  const { mutate: createService, isPending } = useCreateService();

  const handleSubmit = (data: CreateServiceDto | UpdateServiceDto) => {
    createService(data as CreateServiceDto);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Новая услуга</h1>
        <p className="text-[var(--color-text-secondary)]">Создайте новую услугу</p>
      </div>

      <ServiceForm onSubmit={handleSubmit} isSubmitting={isPending} />
    </div>
  );
}

