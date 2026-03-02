"use client";

import { useRouter } from "next/navigation";
import { ROUTES } from "@/shared/config";
import { useCreateModule } from "@/features/billing";
import { ModuleForm } from "@/features/billing/ui/ModuleForm";

export default function PlatformModuleNewPage() {
  const router = useRouter();
  const { mutate: createModule, isPending } = useCreateModule();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Новый модуль</h1>
        <p className="text-[var(--color-text-secondary)]">Создание нового модуля платформы</p>
      </div>

      <ModuleForm
        onSubmit={(data) =>
          createModule(data, {
            onSuccess: () => router.push(ROUTES.PLATFORM_MODULES),
          })
        }
        isLoading={isPending}
      />
    </div>
  );
}
