"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { notFound } from "next/navigation";
import { Spinner } from "@/shared/ui";
import { ROUTES } from "@/shared/config";
import { usePlatformBundles, usePlatformModules, useUpdateBundle } from "@/features/billing";
import { BundleForm } from "@/features/billing/ui/BundleForm";

export default function PlatformBundleEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { data: bundles, isLoading: bundlesLoading } = usePlatformBundles();
  const { data: modules, isLoading: modulesLoading } = usePlatformModules();
  const { mutate: updateBundle, isPending } = useUpdateBundle(id);

  const isLoading = bundlesLoading || modulesLoading;

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  const bundle = bundles?.find((b) => b.id === id);
  if (!bundle) return notFound();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
          Редактирование: {bundle.name_ru}
        </h1>
        <p className="text-[var(--color-text-secondary)]">Изменение пакета модулей</p>
      </div>

      <BundleForm
        bundle={bundle}
        allModules={modules ?? []}
        onSubmit={(data) =>
          updateBundle(data, {
            onSuccess: () => router.push(ROUTES.PLATFORM_BUNDLES),
          })
        }
        isLoading={isPending}
      />
    </div>
  );
}
