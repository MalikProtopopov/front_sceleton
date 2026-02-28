"use client";

import { useState, useMemo } from "react";
import { Plus, Trash2, Pencil, Eye } from "lucide-react";
import { Button, Input, Switch, Select, Spinner } from "@/shared/ui";
import {
  useVariantsList,
  useVariantInclusions,
  useCreateVariantInclusion,
  useUpdateVariantInclusion,
  useDeleteVariantInclusion,
} from "../model/useVariants";
import type {
  ProductVariant,
  VariantInclusion,
  VariantInclusionCreate,
} from "@/entities/product";

interface VariantInclusionsEditorProps {
  productId: string;
  canEdit?: boolean;
}

interface FormState {
  title: string;
  description: string;
  is_included: boolean;
  group: string;
  icon: string;
  sort_order: number;
}

const emptyForm: FormState = {
  title: "",
  description: "",
  is_included: true,
  group: "",
  icon: "",
  sort_order: 0,
};

export function VariantInclusionsEditor({ productId, canEdit = true }: VariantInclusionsEditorProps) {
  const { data: variants = [], isLoading } = useVariantsList(productId);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
  const [showComparison, setShowComparison] = useState(false);

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Spinner size="lg" />
      </div>
    );
  }

  if (variants.length === 0) {
    return (
      <p className="text-sm text-[var(--color-text-muted)] italic py-4 text-center">
        Сначала создайте варианты
      </p>
    );
  }

  const variantOptions = variants.map((v) => ({ value: v.id, label: `${v.title} (${v.sku})` }));
  const activeVariantId = selectedVariantId || variants[0]?.id;

  return (
    <div className="space-y-4">
      <div className="flex items-end gap-4">
        <div className="flex-1">
          <Select
            label="Выберите вариант"
            value={activeVariantId}
            onChange={(e) => setSelectedVariantId(e.target.value)}
            options={variantOptions}
          />
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setShowComparison(!showComparison)}
          leftIcon={<Eye className="h-4 w-4" />}
        >
          {showComparison ? "Скрыть сравнение" : "Сравнительная таблица"}
        </Button>
      </div>

      {showComparison ? (
        <ComparisonTable variants={variants} />
      ) : (
        activeVariantId && (
          <SingleVariantInclusions
            productId={productId}
            variantId={activeVariantId}
            canEdit={canEdit}
          />
        )
      )}
    </div>
  );
}

function SingleVariantInclusions({
  productId,
  variantId,
  canEdit,
}: {
  productId: string;
  variantId: string;
  canEdit: boolean;
}) {
  const { data: inclusions = [], isLoading } = useVariantInclusions(productId, variantId);
  const { mutate: createInclusion, isPending: isCreating } = useCreateVariantInclusion(
    productId,
    variantId,
  );
  const { mutate: updateInclusion, isPending: isUpdating } = useUpdateVariantInclusion(
    productId,
    variantId,
  );
  const { mutate: deleteInclusion } = useDeleteVariantInclusion(productId, variantId);

  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);

  const handleAdd = () => {
    const data: VariantInclusionCreate = {
      title: form.title,
      description: form.description || undefined,
      is_included: form.is_included,
      group: form.group || undefined,
      icon: form.icon || undefined,
      sort_order: form.sort_order,
    };
    createInclusion(data, {
      onSuccess: () => {
        setIsAdding(false);
        setForm(emptyForm);
      },
    });
  };

  const startEdit = (inc: VariantInclusion) => {
    setEditingId(inc.id);
    setForm({
      title: inc.title,
      description: inc.description || "",
      is_included: inc.is_included,
      group: inc.group || "",
      icon: inc.icon || "",
      sort_order: inc.sort_order,
    });
  };

  const handleUpdate = () => {
    if (!editingId) return;
    updateInclusion(
      {
        inclusionId: editingId,
        data: {
          title: form.title,
          description: form.description || null,
          is_included: form.is_included,
          group: form.group || null,
          icon: form.icon || null,
          sort_order: form.sort_order,
        },
      },
      { onSuccess: () => setEditingId(null) },
    );
  };

  if (isLoading) {
    return <p className="text-sm text-[var(--color-text-muted)] py-2 text-center">Загрузка...</p>;
  }

  const sorted = [...inclusions].sort((a, b) => a.sort_order - b.sort_order);

  const renderForm = (onSave: () => void, isSaving: boolean) => (
    <div className="rounded-lg border border-[var(--color-border)] p-4 space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <Input
          label="Название *"
          placeholder="Доступ к материалам"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
        />
        <Input
          label="Группа"
          placeholder="Обучение"
          value={form.group}
          onChange={(e) => setForm({ ...form, group: e.target.value })}
        />
      </div>
      <Input
        label="Описание"
        placeholder="Подробное описание..."
        value={form.description}
        onChange={(e) => setForm({ ...form, description: e.target.value })}
      />
      <div className="grid gap-3 sm:grid-cols-3">
        <Input
          label="Иконка"
          placeholder="check, star..."
          value={form.icon}
          onChange={(e) => setForm({ ...form, icon: e.target.value })}
        />
        <Input
          label="Порядок"
          type="number"
          min="0"
          value={form.sort_order}
          onChange={(e) => setForm({ ...form, sort_order: parseInt(e.target.value, 10) || 0 })}
        />
        <div className="flex items-center gap-2 sm:pt-7">
          <Switch
            checked={form.is_included}
            onChange={(checked: boolean) => setForm({ ...form, is_included: checked })}
          />
          <span className="text-sm text-[var(--color-text-primary)]">Включено</span>
        </div>
      </div>
      <div className="flex gap-2">
        <Button size="sm" onClick={onSave} isLoading={isSaving} disabled={!form.title}>
          {editingId ? "Сохранить" : "Добавить"}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setIsAdding(false);
            setEditingId(null);
            setForm(emptyForm);
          }}
        >
          Отмена
        </Button>
      </div>
    </div>
  );

  return (
    <div className="space-y-3">
      {sorted.length === 0 && !isAdding && (
        <p className="text-sm text-[var(--color-text-muted)] italic py-2 text-center">
          Включения не добавлены
        </p>
      )}

      {sorted.map((inc) =>
        editingId === inc.id ? (
          <div key={inc.id}>{renderForm(handleUpdate, isUpdating)}</div>
        ) : (
          <div
            key={inc.id}
            className="flex items-center justify-between rounded-lg border border-[var(--color-border)] px-4 py-3"
          >
            <div className="flex items-center gap-3">
              <span
                className={`text-lg ${inc.is_included ? "text-green-500" : "text-[var(--color-text-muted)]"}`}
              >
                {inc.is_included ? "✓" : "✗"}
              </span>
              <div>
                <span className="text-sm font-medium text-[var(--color-text-primary)]">
                  {inc.title}
                </span>
                {inc.group && (
                  <span className="ml-2 text-xs text-[var(--color-text-muted)]">
                    [{inc.group}]
                  </span>
                )}
                {inc.description && (
                  <p className="text-xs text-[var(--color-text-muted)]">{inc.description}</p>
                )}
              </div>
            </div>
            {canEdit && (
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => startEdit(inc)}
                  className="h-8 w-8"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => deleteInclusion(inc.id)}
                  className="h-8 w-8 text-[var(--color-error)]"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        ),
      )}

      {isAdding && renderForm(handleAdd, isCreating)}

      {!isAdding && !editingId && canEdit && (
        <Button
          variant="secondary"
          size="sm"
          onClick={() => {
            setIsAdding(true);
            setForm(emptyForm);
          }}
          leftIcon={<Plus className="h-4 w-4" />}
        >
          Добавить включение
        </Button>
      )}
    </div>
  );
}

function ComparisonTable({ variants }: { variants: ProductVariant[] }) {
  const allInclusionTitles = useMemo(() => {
    const titles = new Set<string>();
    for (const v of variants) {
      for (const inc of v.inclusions) {
        titles.add(inc.title);
      }
    }
    return Array.from(titles);
  }, [variants]);

  if (allInclusionTitles.length === 0) {
    return (
      <p className="text-sm text-[var(--color-text-muted)] italic py-4 text-center">
        Нет данных для сравнения. Добавьте включения к вариантам.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-[var(--color-border)]">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-[var(--color-bg-secondary)]">
            <th className="px-4 py-3 text-left font-medium text-[var(--color-text-secondary)]">
              Включение
            </th>
            {variants.map((v) => (
              <th
                key={v.id}
                className="px-4 py-3 text-center font-medium text-[var(--color-text-secondary)]"
              >
                {v.title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {allInclusionTitles.map((title) => (
            <tr key={title} className="border-t border-[var(--color-border)]">
              <td className="px-4 py-2 text-[var(--color-text-primary)]">{title}</td>
              {variants.map((v) => {
                const inc = v.inclusions.find((i) => i.title === title);
                return (
                  <td key={v.id} className="px-4 py-2 text-center">
                    {inc ? (
                      <span
                        className={`text-lg ${inc.is_included ? "text-green-500" : "text-[var(--color-text-muted)]"}`}
                      >
                        {inc.is_included ? "✓" : "—"}
                      </span>
                    ) : (
                      <span className="text-[var(--color-text-muted)]">—</span>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
