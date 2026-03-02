"use client";

import { useRouter } from "next/navigation";
import { Spinner } from "@/shared/ui";
import { ROUTES } from "@/shared/config";
import { useCreateBundle, usePlatformModules } from "@/features/billing";
import { BundleForm } from "@/features/billing/ui/BundleForm";

export default function PlatformBundleNewPage() {
  const router = useRouter();
  const { data: modules, isLoading: modulesLoading } = usePlatformModules();
  const { mutate: createBundle, isPending } = useCreateBundle();

  if (modulesLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Новый пакет</h1>
        <p className="text-[var(--color-text-secondary)]">Создание нового пакета модулей</p>
      </div>

      <BundleForm
        allModules={modules ?? []}
        onSubmit={(data) =>
          createBundle(data, {
            onSuccess: () => router.push(ROUTES.PLATFORM_BUNDLES),
          })
        }
        isLoading={isPending}
      />
    </div>
  );
}
