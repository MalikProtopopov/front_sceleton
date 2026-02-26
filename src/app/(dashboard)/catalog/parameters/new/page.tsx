"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { ParameterForm, useCreateParameter } from "@/features/catalog";
import { Button, Card, CardHeader, CardTitle, CardContent } from "@/shared/ui";
import type { ParameterCreate, ParameterUpdate } from "@/entities/product";

export default function NewParameterPage() {
  const router = useRouter();
  const { mutate: createParameter, isPending } = useCreateParameter();

  const handleSubmit = (data: ParameterCreate | ParameterUpdate) => {
    createParameter(data as ParameterCreate);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
            Новый параметр
          </h1>
          <p className="text-[var(--color-text-secondary)]">
            Создание характеристики для товаров
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Основные данные</CardTitle>
        </CardHeader>
        <CardContent>
          <ParameterForm onSubmit={handleSubmit} isSubmitting={isPending} />
        </CardContent>
      </Card>
    </div>
  );
}
