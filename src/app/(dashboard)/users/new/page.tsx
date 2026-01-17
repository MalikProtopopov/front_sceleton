"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCreateUser, useRoles } from "@/features/users";
import { Button, Input, Select, Card, CardHeader, CardTitle, CardContent, Spinner } from "@/shared/ui";
import { ROUTES } from "@/shared/config";
import type { CreateUserDto } from "@/entities/user";

export default function NewUserPage() {
  const router = useRouter();
  const { data: rolesData, isLoading: rolesLoading } = useRoles();
  const { mutate: createUser, isPending } = useCreateUser();

  const [formData, setFormData] = useState<CreateUserDto>({
    email: "",
    password: "",
    first_name: "",
    last_name: "",
    role_id: "",
    is_active: true,
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
                    label: role.name,
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

