"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Search, Pencil, Trash2 } from "lucide-react";
import { useUsersList, useDeleteUser } from "@/features/users/model/useUsers";
import {
  Table,
  Pagination,
  Input,
  Select,
  FilterBar,
  Badge,
  Button,
  ConfirmModal,
} from "@/shared/ui";
import { formatDateTime } from "@/shared/lib";
import { ROUTES } from "@/shared/config";
import { getRoleLabel } from "@/entities/user";
import type { UserFilterParams, User } from "@/entities/user";

interface TenantUsersTabProps {
  tenantId: string;
  tenantName: string;
}

export function TenantUsersTab({ tenantId, tenantName }: TenantUsersTabProps) {
  const router = useRouter();
  const [filters, setFilters] = useState<UserFilterParams>({
    page: 1,
    pageSize: 20,
  });
  const [searchInput, setSearchInput] = useState("");
  const [deleteUser, setDeleteUser] = useState<User | null>(null);

  const { data, isLoading } = useUsersList(filters, tenantId);
  const deleteUserMutation = useDeleteUser(tenantId);

  const handleFiltersChange = (newFilters: Partial<UserFilterParams>) => {
    setFilters((prev) => ({
      ...prev,
      ...newFilters,
      page: newFilters.page || 1,
    }));
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchInput(value);
    // Simple debounce using setTimeout
    const timer = setTimeout(() => {
      handleFiltersChange({ search: value || undefined });
    }, 300);
    return () => clearTimeout(timer);
  };

  const handleResetFilters = () => {
    setFilters({ page: 1, pageSize: 20 });
    setSearchInput("");
  };

  const handleDeleteConfirm = () => {
    if (!deleteUser) return;
    deleteUserMutation.mutate(deleteUser.id, {
      onSuccess: () => setDeleteUser(null),
    });
  };

  const columns = [
    {
      key: "name",
      header: "Пользователь",
      render: (user: User) => (
        <div>
          <p className="font-medium text-[var(--color-text-primary)]">
            {user.first_name} {user.last_name}
          </p>
          <p className="text-sm text-[var(--color-text-muted)]">{user.email}</p>
        </div>
      ),
    },
    {
      key: "role",
      header: "Роль",
      render: (user: User) => (
        <span className="text-[var(--color-text-secondary)]">
          {user.role ? getRoleLabel(user.role.name) : "—"}
        </span>
      ),
    },
    {
      key: "status",
      header: "Статус",
      render: (user: User) => (
        <Badge variant={user.is_active ? "success" : "error"}>
          {user.is_active ? "Активен" : "Неактивен"}
        </Badge>
      ),
    },
    {
      key: "last_login",
      header: "Последний вход",
      render: (user: User) => (
        <span className="text-sm text-[var(--color-text-muted)]">
          {user.last_login_at ? formatDateTime(user.last_login_at) : "Никогда"}
        </span>
      ),
    },
    {
      key: "actions",
      header: "",
      render: (user: User) => (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              router.push(ROUTES.USER_EDIT(user.id));
            }}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              setDeleteUser(user);
            }}
          >
            <Trash2 className="h-4 w-4 text-[var(--color-danger)]" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex items-center justify-between">
        <FilterBar onReset={handleResetFilters}>
          <Input
            placeholder="Поиск по имени или email..."
            value={searchInput}
            onChange={handleSearchChange}
            leftIcon={<Search className="h-4 w-4" />}
            className="w-64"
          />
          <Select
            label="Статус"
            value={filters.is_active === undefined ? "" : String(filters.is_active)}
            onChange={(e) =>
              handleFiltersChange({
                is_active: e.target.value === "" ? undefined : e.target.value === "true",
              })
            }
            options={[
              { value: "", label: "Все" },
              { value: "true", label: "Активные" },
              { value: "false", label: "Неактивные" },
            ]}
            className="w-40"
          />
        </FilterBar>
        <Button
          onClick={() => router.push(`${ROUTES.USER_NEW}?tenant_id=${tenantId}`)}
          leftIcon={<Plus className="h-4 w-4" />}
          size="sm"
        >
          Добавить
        </Button>
      </div>

      {/* Table */}
      <Table
        data={data?.items || []}
        columns={columns}
        keyExtractor={(user) => user.id}
        isLoading={isLoading}
        emptyMessage="В этой организации нет пользователей"
        onRowClick={(user) => router.push(ROUTES.USER_EDIT(user.id))}
      />

      {/* Pagination */}
      {data && data.total > (filters.pageSize || 20) && (
        <Pagination
          page={filters.page || 1}
          pageSize={filters.pageSize || 20}
          total={data.total}
          onPageChange={(page) => handleFiltersChange({ page })}
          onPageSizeChange={(pageSize) => handleFiltersChange({ pageSize, page: 1 })}
        />
      )}

      {/* Delete Modal */}
      <ConfirmModal
        isOpen={!!deleteUser}
        onClose={() => setDeleteUser(null)}
        onConfirm={handleDeleteConfirm}
        title="Удалить пользователя?"
        description={`Вы уверены, что хотите удалить пользователя "${deleteUser?.first_name} ${deleteUser?.last_name}" из организации "${tenantName}"?`}
        confirmText="Удалить"
        variant="danger"
        isLoading={deleteUserMutation.isPending}
      />
    </div>
  );
}
