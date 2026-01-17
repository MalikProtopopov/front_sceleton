"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Button,
  Input,
  Textarea,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/shared/ui";
import type { Role, Permission, CreateRoleDto, UpdateRoleDto } from "@/entities/user";

// Validation schema
const roleSchema = z.object({
  name: z.string().min(1, "Название обязательно").max(100, "Максимум 100 символов"),
  description: z.string().max(500, "Максимум 500 символов").optional(),
  permission_ids: z.array(z.string()),
});

type RoleFormValues = z.infer<typeof roleSchema>;

interface RoleFormProps {
  role?: Role;
  permissions: Permission[];
  onSubmit: (data: CreateRoleDto | UpdateRoleDto) => void;
  isSubmitting?: boolean;
}

// Group permissions by resource
function groupPermissions(permissions: Permission[]): Record<string, Permission[]> {
  return permissions.reduce((acc, permission) => {
    const resource = permission.resource || "other";
    if (!acc[resource]) {
      acc[resource] = [];
    }
    acc[resource].push(permission);
    return acc;
  }, {} as Record<string, Permission[]>);
}

// Resource labels
const RESOURCE_LABELS: Record<string, string> = {
  articles: "Статьи",
  cases: "Кейсы",
  faq: "FAQ",
  services: "Услуги",
  employees: "Сотрудники",
  reviews: "Отзывы",
  inquiries: "Заявки",
  media: "Медиатека",
  seo: "SEO",
  users: "Пользователи",
  roles: "Роли",
  settings: "Настройки",
  other: "Прочее",
};

// Action labels
const ACTION_LABELS: Record<string, string> = {
  read: "Просмотр",
  write: "Редактирование",
  delete: "Удаление",
  publish: "Публикация",
  manage: "Управление",
};

export function RoleForm({ role, permissions, onSubmit, isSubmitting = false }: RoleFormProps) {
  const isEditing = !!role;

  const defaultValues: RoleFormValues = {
    name: role?.name || "",
    description: role?.description || "",
    permission_ids: role?.permissions.map((p) => p.id) || [],
  };

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RoleFormValues>({
    resolver: zodResolver(roleSchema),
    defaultValues,
  });

  const handleFormSubmit = (data: RoleFormValues) => {
    const payload = {
      name: data.name,
      description: data.description || undefined,
      permission_ids: data.permission_ids,
    };
    onSubmit(payload);
  };

  const groupedPermissions = groupPermissions(permissions);

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle>Основная информация</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            label="Название роли"
            placeholder="Например: Редактор"
            {...register("name")}
            error={errors.name?.message}
            required
          />
          <Textarea
            label="Описание"
            placeholder="Описание роли и её назначения..."
            {...register("description")}
            error={errors.description?.message}
          />
        </CardContent>
      </Card>

      {/* Permissions */}
      <Card>
        <CardHeader>
          <CardTitle>Права доступа</CardTitle>
        </CardHeader>
        <CardContent>
          <Controller
            name="permission_ids"
            control={control}
            render={({ field }) => (
              <div className="space-y-6">
                {Object.entries(groupedPermissions).map(([resource, perms]) => (
                  <div key={resource} className="border-b border-[var(--color-border)] pb-4 last:border-0 last:pb-0">
                    <h4 className="mb-3 font-medium text-[var(--color-text-primary)]">
                      {RESOURCE_LABELS[resource] || resource}
                    </h4>
                    <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                      {perms.map((permission) => {
                        const isSelected = field.value.includes(permission.id);
                        return (
                          <label
                            key={permission.id}
                            className={`flex cursor-pointer items-center gap-2 rounded-lg border p-3 transition-colors ${
                              isSelected
                                ? "border-[var(--color-accent-primary)] bg-[var(--color-accent-primary)]/5"
                                : "border-[var(--color-border)] hover:bg-[var(--color-bg-hover)]"
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  field.onChange([...field.value, permission.id]);
                                } else {
                                  field.onChange(field.value.filter((id) => id !== permission.id));
                                }
                              }}
                              className="h-4 w-4 rounded border-[var(--color-border)] accent-[var(--color-accent-primary)]"
                            />
                            <div>
                              <p className="text-sm font-medium text-[var(--color-text-primary)]">
                                {ACTION_LABELS[permission.action] || permission.action}
                              </p>
                              {permission.description && (
                                <p className="text-xs text-[var(--color-text-muted)]">
                                  {permission.description}
                                </p>
                              )}
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          />
        </CardContent>
      </Card>

      {/* Submit button */}
      <div className="flex justify-end gap-4">
        <Button type="button" variant="secondary" onClick={() => window.history.back()}>
          Отмена
        </Button>
        <Button type="submit" isLoading={isSubmitting}>
          {isEditing ? "Сохранить" : "Создать"}
        </Button>
      </div>
    </form>
  );
}

