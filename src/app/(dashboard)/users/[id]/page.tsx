"use client";

import { use, useState } from "react";
import { notFound } from "next/navigation";
import { useRouter } from "next/navigation";
import { User as UserIcon, Shield } from "lucide-react";
import { useUser, useUpdateUser, useDeleteUser, useRoles, useToggleUserActive } from "@/features/users";
import { Button, Input, Select, Card, CardHeader, CardTitle, CardContent, Spinner, Badge, ConfirmModal } from "@/shared/ui";
import { formatDateTime } from "@/shared/lib";
import { ROUTES } from "@/shared/config";
import type { UpdateUserDto } from "@/entities/user";

export default function EditUserPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const { data: user, isLoading, error } = useUser(id);
  const { data: rolesData } = useRoles();
  const { mutate: updateUser, isPending: isUpdating } = useUpdateUser(id);
  const { mutate: deleteUser, isPending: isDeleting } = useDeleteUser();
  const { mutate: toggleActive, isPending: isToggling } = useToggleUserActive(id);

  const [formData, setFormData] = useState<Partial<UpdateUserDto>>({});
  const [password, setPassword] = useState("");

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !user) {
    notFound();
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload: UpdateUserDto = {
      first_name: formData.first_name ?? user.first_name,
      last_name: formData.last_name ?? user.last_name,
      role_id: formData.role_id !== undefined ? (formData.role_id || undefined) : user.role?.id,
      version: user.version,
    };

    if (password) {
      payload.password = password;
    }

    updateUser(payload);
  };

  const handleDelete = () => {
    deleteUser(id);
    setDeleteModalOpen(false);
  };

  const handleToggleActive = () => {
    toggleActive({ isActive: !user.is_active, version: user.version });
  };

  const getUserName = (): string => {
    return `${user.first_name} ${user.last_name}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          {user.avatar_url ? (
            <img
              src={user.avatar_url}
              alt={getUserName()}
              className="h-16 w-16 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-bg-secondary)]">
              <UserIcon className="h-8 w-8 text-[var(--color-text-muted)]" />
            </div>
          )}
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
                {getUserName()}
                {user.is_superuser && (
                  <Shield className="ml-2 inline h-5 w-5 text-[var(--color-accent-primary)]" />
                )}
              </h1>
              <Badge variant={user.is_active ? "success" : "error"}>
                {user.is_active ? "Активен" : "Неактивен"}
              </Badge>
            </div>
            <p className="mt-1 text-sm text-[var(--color-text-muted)]">
              {user.email} · Последний вход:{" "}
              {user.last_login_at ? formatDateTime(user.last_login_at) : "никогда"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!user.is_superuser && (
            <Button
              variant={user.is_active ? "secondary" : "primary"}
              onClick={handleToggleActive}
              isLoading={isToggling}
            >
              {user.is_active ? "Деактивировать" : "Активировать"}
            </Button>
          )}
          {!user.is_superuser && (
            <Button variant="danger" onClick={() => setDeleteModalOpen(true)}>
              Удалить
            </Button>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Личные данные</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              label="Email"
              type="email"
              value={user.email}
              disabled
            />
            <div className="grid gap-4 md:grid-cols-2">
              <Input
                label="Имя"
                value={formData.first_name ?? user.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
              />
              <Input
                label="Фамилия"
                value={formData.last_name ?? user.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Безопасность</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              label="Новый пароль"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Оставьте пустым, чтобы не менять"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Права доступа</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Select
              label="Роль"
              value={(formData.role_id !== undefined ? formData.role_id : user.role?.id) || ""}
              onChange={(e) => setFormData({ ...formData, role_id: e.target.value })}
              options={[
                { value: "", label: "Без роли" },
                ...(rolesData?.items || []).map((role) => ({
                  value: role.id,
                  label: `${role.name}${role.description ? ` — ${role.description}` : ""}`,
                })),
              ]}
              disabled={user.is_superuser}
            />
            {user.role && user.role.permissions.length > 0 && (
              <div>
                <p className="mb-2 text-sm font-medium text-[var(--color-text-secondary)]">
                  Разрешения текущей роли:
                </p>
                <div className="flex flex-wrap gap-2">
                  {user.role.permissions.map((perm) => (
                    <Badge key={perm.id} variant="secondary">
                      {perm.code}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="secondary" onClick={() => router.push(ROUTES.USERS)}>
            Отмена
          </Button>
          <Button type="submit" isLoading={isUpdating}>
            Сохранить
          </Button>
        </div>
      </form>

      {/* Delete confirmation modal */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Удалить пользователя?"
        description={`Вы уверены, что хотите удалить пользователя "${getUserName()}"? Это действие нельзя отменить.`}
        confirmText="Удалить"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
}

