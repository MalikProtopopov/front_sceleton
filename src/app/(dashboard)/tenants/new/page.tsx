"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useCreateTenant } from "@/features/tenants";
import { TenantForm } from "@/features/tenants/ui/TenantForm";
import { Button } from "@/shared/ui";
import { ROUTES } from "@/shared/config";
import type { CreateTenantDto } from "@/entities/tenant";

export default function TenantNewPage() {
  const router = useRouter();
  const createTenant = useCreateTenant();

  const handleSubmit = (data: CreateTenantDto) => {
    createTenant.mutate(data, {
      onSuccess: (tenant) => {
        router.push(ROUTES.TENANT_DETAIL(tenant.id));
      },
    });
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push(ROUTES.TENANTS)}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
            Новый проект
          </h1>
          <p className="text-[var(--color-text-secondary)]">
            Создание нового проекта на платформе
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-primary)] p-6">
        <TenantForm
          isSubmitting={createTenant.isPending}
          onSubmit={(data) => handleSubmit(data as CreateTenantDto)}
          onCancel={() => router.push(ROUTES.TENANTS)}
        />
      </div>
    </div>
  );
}
