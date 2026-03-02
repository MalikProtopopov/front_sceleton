"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { notFound } from "next/navigation";
import { Spinner } from "@/shared/ui";
import { ROUTES } from "@/shared/config";
import { usePlatformModules, useUpdateModule } from "@/features/billing";
import { ModuleForm } from "@/features/billing/ui/ModuleForm";

export default function PlatformModuleEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { data: modules, isLoading } = usePlatformModules();
  const { mutate: updateModule, isPending } = useUpdateModule(id);

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  const mod = modules?.find((m) => m.id === id);
  if (!mod) return notFound();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
          Редактирование: {mod.name_ru}
        </h1>
        <p className="text-[var(--color-text-secondary)]">Изменение модуля платформы</p>
      </div>

      <ModuleForm
        module={mod}
        onSubmit={(data) =>
          updateModule(data, {
            onSuccess: () => router.push(ROUTES.PLATFORM_MODULES),
          })
        }
        isLoading={isPending}
      />
    </div>
  );
}
