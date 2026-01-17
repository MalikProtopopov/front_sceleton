"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, User as UserIcon, Shield, Search } from "lucide-react";
import { useUsersList, useDeleteUser } from "@/features/users";
import { Button, Table, Pagination, Badge, ConfirmModal, Select, Input, FilterBar, type Column } from "@/shared/ui";
import { ROUTES } from "@/shared/config";
import { formatDateTime } from "@/shared/lib";
import type { User, UserFilterParams } from "@/entities/user";

export default function UsersPage() {
  const router = useRouter();
  const [filters, setFilters] = useState<UserFilterParams>({
    page: 1,
    pageSize: 20,
  });
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const { data, isLoading } = useUsersList(filters);
  const { mutate: deleteUser, isPending: isDeleting } = useDeleteUser();

  const handleFiltersChange = (newFilters: Partial<UserFilterParams>) => {
    setFilters((prev) => ({
      ...prev,
      ...newFilters,
      page: newFilters.page || 1,
    }));
  };

  const handleResetFilters = () => {
    setFilters({ page: 1, pageSize: 20 });
  };

  const handleDeleteClick = (user: User) => {
    setSelectedUser(user);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (selectedUser) {
      deleteUser(selectedUser.id);
      setDeleteModalOpen(false);
      setSelectedUser(null);
    }
  };

  const getUserName = (user: User): string => {
    return `${user.first_name} ${user.last_name}`;
  };

  const columns: Column<User>[] = [
    {
      key: "avatar",
      header: "",
      width: "60px",
      render: (user) => (
        user.avatar_url ? (
          <img
            src={user.avatar_url}
            alt={getUserName(user)}
            className="h-10 w-10 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-bg-secondary)]">
            <UserIcon className="h-5 w-5 text-[var(--color-text-muted)]" />
          </div>
        )
      ),
    },
    {
      key: "name",
      header: "Имя",
      render: (user) => (
        <div>
          <p className="font-medium text-[var(--color-text-primary)]">
            {getUserName(user)}
            {user.is_superuser && (
              <Shield className="ml-1 inline h-4 w-4 text-[var(--color-accent-primary)]" />
            )}
          </p>
          <p className="text-sm text-[var(--color-text-muted)]">{user.email}</p>
        </div>
      ),
    },
    {
      key: "role",
      header: "Роль",
      width: "160px",
      render: (user) => (
        <Badge variant="secondary">{user.role?.name || "Без роли"}</Badge>
      ),
    },
    {
      key: "is_active",
      header: "Статус",
      width: "120px",
      render: (user) => (
        <Badge variant={user.is_active ? "success" : "error"}>
          {user.is_active ? "Активен" : "Неактивен"}
        </Badge>
      ),
    },
    {
      key: "last_login_at",
      header: "Последний вход",
      width: "160px",
      render: (user) => (
        <span className="text-[var(--color-text-secondary)] text-sm">
          {user.last_login_at ? formatDateTime(user.last_login_at) : "Никогда"}
        </span>
      ),
    },
    {
      key: "actions",
      header: "",
      width: "100px",
      render: (user) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              router.push(ROUTES.USER_EDIT(user.id));
            }}
            className="h-8 w-8"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteClick(user);
            }}
            className="h-8 w-8 text-[var(--color-error)] hover:text-[var(--color-error)]"
            disabled={user.is_superuser}
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
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Пользователи</h1>
          <p className="text-[var(--color-text-secondary)]">
            Управление пользователями системы
          </p>
        </div>
        <Button
          onClick={() => router.push(ROUTES.USER_NEW)}
          leftIcon={<Plus className="h-4 w-4" />}
        >
          Добавить пользователя
        </Button>
      </div>

      {/* Filters */}
      <FilterBar onReset={handleResetFilters}>
        <Input
          label="Поиск"
          type="search"
          placeholder="Поиск по email, имени..."
          value={filters.search || ""}
          onChange={(e) => handleFiltersChange({ search: e.target.value || undefined })}
          leftIcon={<Search className="h-4 w-4" />}
          className="w-64"
        />
        <Select
          label="Статус"
          value={filters.is_active === undefined ? "" : String(filters.is_active)}
          onChange={(e) => 
            handleFiltersChange({ 
              is_active: e.target.value === "" ? undefined : e.target.value === "true" 
            })
          }
          options={[
            { value: "", label: "Все статусы" },
            { value: "true", label: "Активные" },
            { value: "false", label: "Неактивные" },
          ]}
          className="w-48"
        />
      </FilterBar>

      {/* Table */}
      <Table
        data={data?.items || []}
        columns={columns}
        keyExtractor={(user) => user.id}
        isLoading={isLoading}
        emptyMessage="Пользователи не найдены"
        onRowClick={(user) => router.push(ROUTES.USER_EDIT(user.id))}
      />

      {/* Pagination */}
      {data && data.total > 0 && (
        <Pagination
          page={filters.page || 1}
          pageSize={filters.pageSize || 20}
          total={data.total}
          onPageChange={(page) => handleFiltersChange({ page })}
          onPageSizeChange={(pageSize) => handleFiltersChange({ pageSize, page: 1 })}
        />
      )}

      {/* Delete confirmation modal */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Удалить пользователя?"
        description={`Вы уверены, что хотите удалить пользователя "${selectedUser ? getUserName(selectedUser) : ""}"? Это действие нельзя отменить.`}
        confirmText="Удалить"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
}
