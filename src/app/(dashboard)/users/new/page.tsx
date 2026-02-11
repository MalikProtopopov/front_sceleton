"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Info } from "lucide-react";
import { useCreateUser, useRoles } from "@/features/users";
import { Button, Input, Select, Switch, Card, CardHeader, CardTitle, CardContent, Spinner } from "@/shared/ui";
import { ROUTES } from "@/shared/config";
import { getRoleLabel } from "@/entities/user";
import type { CreateUserDto } from "@/entities/user";

export default function NewUserPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tenantId = searchParams.get("tenant_id") || undefined;

  const { data: rolesData, isLoading: rolesLoading } = useRoles(tenantId);
  const { mutate: createUser, isPending } = useCreateUser(tenantId);

  const [formData, setFormData] = useState<CreateUserDto>({
    email: "",
    password: "",
    first_name: "",
    last_name: "",
    role_id: "",
    is_active: true,
    send_credentials: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.email) {
      newErrors.email = "Email обязателен";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Неверный формат email";
    }

    if (!formData.password) {
      newErrors.password = "Пароль обязателен";
    } else if (formData.password.length < 8) {
      newErrors.password = "Минимум 8 символов";
    }

    if (!formData.first_name) {
      newErrors.first_name = "Имя обязательно";
    }

    if (!formData.last_name) {
      newErrors.last_name = "Фамилия обязательна";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      createUser({
        ...formData,
        role_id: formData.role_id || undefined,
      });
    }
  };

  if (rolesLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Новый пользователь</h1>
        <p className="text-[var(--color-text-secondary)]">Создайте нового пользователя системы</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Учетные данные</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              error={errors.email}
              required
            />
            <Input
              label="Пароль"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              error={errors.password}
              required
              hint="Минимум 8 символов"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Личные данные</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Input
                label="Имя"
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                error={errors.first_name}
                required
              />
              <Input
                label="Фамилия"
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                error={errors.last_name}
                required
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Права доступа</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Select
                label="Роль"
                value={formData.role_id || ""}
                onChange={(e) => setFormData({ ...formData, role_id: e.target.value })}
                options={[
                  { value: "", label: "Без роли" },
                  ...(rolesData?.items || []).map((role) => ({
                    value: role.id,
                    label: getRoleLabel(role.name),
                  })),
                ]}
              />
              <Select
                label="Статус"
                value={String(formData.is_active)}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.value === "true" })}
                options={[
                  { value: "true", label: "Активен" },
                  { value: "false", label: "Неактивен" },
                ]}
              />
            </div>
          </CardContent>
        </Card>

        {/* Welcome email / send_credentials */}
        <Card>
          <CardHeader>
            <CardTitle>Приглашение</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Switch
              checked={formData.send_credentials ?? true}
              onChange={(checked) => setFormData({ ...formData, send_credentials: checked })}
              label="Отправить приглашение по email"
              description="Пользователь получит email с уведомлением о создании учетной записи"
            />
            {formData.send_credentials && (
              <div className="flex items-start gap-3 rounded-lg border border-[var(--color-info)]/20 bg-[var(--color-info)]/5 p-4">
                <Info className="mt-0.5 h-5 w-5 shrink-0 text-[var(--color-info)]" />
                <div className="space-y-1 text-sm text-[var(--color-text-secondary)]">
                  <p>
                    <strong>Пароль не будет отправлен по email.</strong> Вам необходимо передать
                    пароль пользователю по другому каналу связи.
                  </p>
                  <p>
                    При первом входе пользователь будет обязан сменить пароль.
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="secondary" onClick={() => router.push(ROUTES.USERS)}>
            Отмена
          </Button>
          <Button type="submit" isLoading={isPending}>
            Создать
          </Button>
        </div>
      </form>
    </div>
  );
}
