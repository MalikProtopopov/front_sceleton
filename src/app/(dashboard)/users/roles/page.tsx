"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, Shield, Lock } from "lucide-react";
import { useRolesList, useDeleteRole } from "@/features/users";
import { Button, Table, Badge, ConfirmModal, type Column } from "@/shared/ui";
import { ROUTES } from "@/shared/config";
import { formatDate } from "@/shared/lib";
import type { Role } from "@/entities/user";

export default function RolesPage() {
  const router = useRouter();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);

  const { data, isLoading } = useRolesList();
  const { mutate: deleteRole, isPending: isDeleting } = useDeleteRole();

  const handleDeleteClick = (role: Role) => {
    setSelectedRole(role);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (selectedRole) {
      deleteRole(selectedRole.id);
      setDeleteModalOpen(false);
      setSelectedRole(null);
    }
  };

  const columns: Column<Role>[] = [
    {
      key: "name",
      header: "Название",
      render: (role) => (
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-bg-secondary)]">
            <Shield className="h-4 w-4 text-[var(--color-text-muted)]" />
          </div>
          <div>
            <p className="font-medium text-[var(--color-text-primary)]">{role.name}</p>
            {role.is_system && (
              <Badge variant="secondary" className="mt-0.5 text-xs">
                <Lock className="mr-1 h-3 w-3" />
                Системная
              </Badge>
            )}
          </div>
        </div>
      ),
    },
    {
      key: "description",
      header: "Описание",
      render: (role) => (
        <p className="max-w-md text-[var(--color-text-secondary)] line-clamp-2">
          {role.description || "—"}
        </p>
      ),
    },
    {
      key: "permissions_count",
      header: "Права",
      width: "100px",
      render: (role) => (
        <Badge variant="info">
          {role.permissions.length}
        </Badge>
      ),
    },
    {
      key: "created_at",
      header: "Создана",
      width: "120px",
      render: (role) => (
        <span className="text-[var(--color-text-secondary)]">{formatDate(role.created_at)}</span>
      ),
    },
    {
      key: "actions",
      header: "",
      width: "100px",
      render: (role) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              router.push(ROUTES.ROLE_EDIT(role.id));
            }}
            className="h-8 w-8"
            disabled={role.is_system}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteClick(role);
            }}
            className="h-8 w-8 text-[var(--color-error)] hover:text-[var(--color-error)]"
            disabled={role.is_system}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Роли</h1>
          <p className="text-[var(--color-text-secondary)]">
            Управление ролями и правами доступа
          </p>
        </div>
        <Button
          onClick={() => router.push(ROUTES.ROLE_NEW)}
          leftIcon={<Plus className="h-4 w-4" />}
        >
          Создать роль
        </Button>
      </div>

      {/* Table */}
      <Table
        data={data || []}
        columns={columns}
        keyExtractor={(role) => role.id}
        isLoading={isLoading}
        emptyMessage="Роли не найдены"
        onRowClick={(role) => !role.is_system && router.push(ROUTES.ROLE_EDIT(role.id))}
      />

      {/* Delete confirmation modal */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Удалить роль?"
        description={`Вы уверены, что хотите удалить роль "${selectedRole?.name}"? Пользователи с этой ролью потеряют связанные права.`}
        confirmText="Удалить"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
}

