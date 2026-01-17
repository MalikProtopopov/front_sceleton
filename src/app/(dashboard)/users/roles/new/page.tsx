"use client";

import { RoleForm, useCreateRole, usePermissions } from "@/features/users";
import { Spinner } from "@/shared/ui";
import type { CreateRoleDto, UpdateRoleDto } from "@/entities/user";

export default function NewRolePage() {
  const { data: permissions, isLoading: permissionsLoading } = usePermissions();
  const { mutate: createRole, isPending } = useCreateRole();

  const handleSubmit = (data: CreateRoleDto | UpdateRoleDto) => {
    createRole(data as CreateRoleDto);
  };

  if (permissionsLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Новая роль</h1>
        <p className="text-[var(--color-text-secondary)]">Создайте новую роль с правами доступа</p>
      </div>

      <RoleForm
        permissions={permissions || []}
        onSubmit={handleSubmit}
        isSubmitting={isPending}
      />
    </div>
  );
}

