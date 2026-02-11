"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useTenantDetail, useUpdateTenant } from "@/features/tenants";
import { TenantForm } from "@/features/tenants/ui/TenantForm";
import { Button, Spinner } from "@/shared/ui";
import { ROUTES } from "@/shared/config";
import type { UpdateTenantDto } from "@/entities/tenant";

export default function TenantEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { data: tenant, isLoading } = useTenantDetail(id);
  const updateTenant = useUpdateTenant(id);

  const handleSubmit = (data: UpdateTenantDto) => {
    updateTenant.mutate(data, {
      onSuccess: () => {
        router.push(ROUTES.TENANT_DETAIL(id));
      },
    });
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!tenant) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center">
        <h2 className="text-lg font-medium text-[var(--color-text-primary)]">
          Проект не найден
        </h2>
        <Button
          variant="ghost"
          className="mt-4"
          onClick={() => router.push(ROUTES.TENANTS)}
        >
          Вернуться к списку
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push(ROUTES.TENANT_DETAIL(id))}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
            Редактирование: {tenant.name}
          </h1>
          <p className="text-[var(--color-text-secondary)]">
            Версия: {tenant.version}
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-primary)] p-6">
        <TenantForm
          tenant={tenant}
          isSubmitting={updateTenant.isPending}
          onSubmit={(data) => handleSubmit(data as UpdateTenantDto)}
          onCancel={() => router.push(ROUTES.TENANT_DETAIL(id))}
        />
      </div>
    </div>
  );
}
