"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { notFound } from "next/navigation";
import { ArrowLeft, Trash2 } from "lucide-react";
import {
  ParameterForm,
  ParameterValuesEditor,
  ParameterCategoriesEditor,
  useParameter,
  useUpdateParameter,
  useDeleteParameter,
} from "@/features/catalog";
import {
  Button,
  Spinner,
  Badge,
  ConfirmModal,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/shared/ui";
import { usePermissions } from "@/shared/hooks/usePermissions";
import { PARAMETER_VALUE_TYPE_LABELS } from "@/entities/product";
import type { ParameterCreate, ParameterUpdate } from "@/entities/product";

export default function EditParameterPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { can } = usePermissions();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const { data: parameter, isLoading, error } = useParameter(id);
  const { mutate: updateParameter, isPending: isUpdating } = useUpdateParameter(id);
  const { mutate: deleteParameter, isPending: isDeleting } = useDeleteParameter();

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !parameter) {
    notFound();
  }

  const handleSubmit = (data: ParameterCreate | ParameterUpdate) => {
    updateParameter(data as ParameterUpdate);
  };

  const handleDelete = () => {
    deleteParameter(id);
    setDeleteModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="mt-1">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
                {parameter.name}
              </h1>
              <Badge variant="outline">
                {PARAMETER_VALUE_TYPE_LABELS[parameter.value_type]}
              </Badge>
              <Badge variant={parameter.is_active ? "success" : "secondary"}>
                {parameter.is_active ? "Активен" : "Скрыт"}
              </Badge>
            </div>
            <p className="mt-1 text-sm text-[var(--color-text-muted)]">
              Slug: {parameter.slug} · Scope: {parameter.scope}
              {parameter.is_filterable && " · Фильтруемый"}
            </p>
          </div>
        </div>
        {can("catalog", "delete") && (
          <Button
            variant="danger"
            onClick={() => setDeleteModalOpen(true)}
            leftIcon={<Trash2 className="h-4 w-4" />}
          >
            Деактивировать
          </Button>
        )}
      </div>

      {/* Section 1: Basic data */}
      <Card>
        <CardHeader>
          <CardTitle>Основные данные</CardTitle>
        </CardHeader>
        <CardContent>
          <ParameterForm parameter={parameter} onSubmit={handleSubmit} isSubmitting={isUpdating} />
        </CardContent>
      </Card>

      {/* Section 2: Values (only for enum) */}
      {parameter.value_type === "enum" && (
        <Card>
          <CardHeader>
            <CardTitle>Значения</CardTitle>
          </CardHeader>
          <CardContent>
            <ParameterValuesEditor
              parameterId={id}
              values={parameter.values || []}
              readOnly={!can("catalog", "update")}
            />
          </CardContent>
        </Card>
      )}

      {/* Section 3: Category binding */}
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Привязка к категориям</CardTitle>
            <p className="mt-1 text-sm text-[var(--color-text-muted)]">
              {parameter.scope === "category"
                ? "Параметр отображается в фильтрах только для привязанных категорий."
                : "Параметр глобальный — виден во всех категориях. Привязки определяют рекомендуемые категории."}
            </p>
          </div>
        </CardHeader>
        <CardContent>
          <ParameterCategoriesEditor
            parameterId={id}
            categoryIds={parameter.category_ids || []}
            readOnly={!can("catalog", "update")}
          />
        </CardContent>
      </Card>

      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Деактивировать параметр?"
        description={`Параметр "${parameter.name}" будет скрыт из фильтров и не будет доступен для новых товаров.`}
        confirmText="Деактивировать"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
}
