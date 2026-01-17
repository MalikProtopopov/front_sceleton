"use client";

import { use, useState } from "react";
import { notFound } from "next/navigation";
import { Lock } from "lucide-react";
import {
  RoleForm,
  useRole,
  useUpdateRole,
  useDeleteRole,
  usePermissions,
} from "@/features/users";
import { Button, Spinner, Badge, ConfirmModal } from "@/shared/ui";
import { formatDateTime } from "@/shared/lib";
import type { CreateRoleDto, UpdateRoleDto } from "@/entities/user";

export default function EditRolePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const { data: role, isLoading, error } = useRole(id);
  const { data: permissions } = usePermissions();
  const { mutate: updateRole, isPending: isUpdating } = useUpdateRole(id);
  const { mutate: deleteRole, isPending: isDeleting } = useDeleteRole();

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !role) {
    notFound();
  }

  // System roles cannot be edited
  if (role.is_system) {
    return (
      <div className="space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
                {role.name}
              </h1>
              <Badge variant="secondary" className="flex items-center gap-1">
                <Lock className="h-3 w-3" />
                Системная роль
              </Badge>
            </div>
            <p className="mt-1 text-sm text-[var(--color-text-muted)]">
              Создана: {formatDateTime(role.created_at)}
            </p>
          </div>
        </div>

        <div className="rounded-lg border border-[var(--color-warning)]/30 bg-[var(--color-warning)]/5 p-4">
          <p className="text-[var(--color-warning)]">
            Системные роли нельзя редактировать или удалять.
          </p>
        </div>

        <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-primary)] p-6">
          <h3 className="mb-4 font-medium text-[var(--color-text-primary)]">Права доступа</h3>
          <div className="flex flex-wrap gap-2">
            {role.permissions.map((permission) => (
              <Badge key={permission.id} variant="secondary">
                {permission.name || permission.code}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = (data: CreateRoleDto | UpdateRoleDto) => {
    updateRole(data as UpdateRoleDto);
  };

  const handleDelete = () => {
    deleteRole(id);
    setDeleteModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
            {role.name}
          </h1>
          <p className="mt-1 text-sm text-[var(--color-text-muted)]">
            Создана: {formatDateTime(role.created_at)} · Обновлена:{" "}
            {formatDateTime(role.updated_at)}
          </p>
        </div>
        <Button variant="danger" onClick={() => setDeleteModalOpen(true)}>
          Удалить
        </Button>
      </div>

      {/* Form */}
      <RoleForm
        role={role}
        permissions={permissions || []}
        onSubmit={handleSubmit}
        isSubmitting={isUpdating}
      />

      {/* Delete confirmation modal */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Удалить роль?"
        description={`Вы уверены, что хотите удалить роль "${role.name}"? Пользователи с этой ролью потеряют связанные права.`}
        confirmText="Удалить"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
}

