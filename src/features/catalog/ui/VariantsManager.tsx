"use client";

import { useState } from "react";
import {
  Plus,
  Trash2,
  Pencil,
  Zap,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { Button, Input, Switch, Badge, ConfirmModal, Spinner } from "@/shared/ui";
import {
  useVariantsList,
  useCreateVariant,
  useUpdateVariant,
  useDeleteVariant,
  useGenerateVariants,
  useOptionGroups,
} from "../model/useVariants";
import { transliterate } from "@/shared/lib";
import type {
  ProductVariant,
  VariantCreate,
} from "@/entities/product";

interface VariantsManagerProps {
  productId: string;
  canEdit?: boolean;
}

interface VariantFormState {
  sku: string;
  slug: string;
  title: string;
  description: string;
  is_default: boolean;
  is_active: boolean;
  stock_quantity: number | "";
  weight: number | "";
  option_value_ids: string[];
}

const emptyForm: VariantFormState = {
  sku: "",
  slug: "",
  title: "",
  description: "",
  is_default: false,
  is_active: true,
  stock_quantity: "",
  weight: "",
  option_value_ids: [],
};

export function VariantsManager({ productId, canEdit = true }: VariantsManagerProps) {
  const { data: variants = [], isLoading } = useVariantsList(productId);
  const { data: groups = [] } = useOptionGroups(productId);
  const { mutate: createVariant, isPending: isCreating } = useCreateVariant(productId);
  const { mutate: updateVariant, isPending: isUpdating } = useUpdateVariant(productId);
  const { mutate: deleteVariant } = useDeleteVariant(productId);
  const { mutate: generateVariants, isPending: isGenerating } = useGenerateVariants(productId);

  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<VariantFormState>(emptyForm);
  const [autoSlug, setAutoSlug] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showGenerate, setShowGenerate] = useState(false);
  const [genGroupIds, setGenGroupIds] = useState<string[]>([]);
  const [genBasePrice, setGenBasePrice] = useState<number | "">("");

  const handleTitleChange = (title: string) => {
    setForm((prev) => ({
      ...prev,
      title,
      ...(autoSlug ? { slug: transliterate(title) } : {}),
    }));
  };

  const handleCreate = () => {
    const data: VariantCreate = {
      sku: form.sku,
      slug: form.slug,
      title: form.title,
      description: form.description || undefined,
      is_default: form.is_default,
      is_active: form.is_active,
      stock_quantity: form.stock_quantity === "" ? null : form.stock_quantity,
      weight: form.weight === "" ? null : form.weight,
      option_value_ids: form.option_value_ids.length ? form.option_value_ids : undefined,
    };
    createVariant(data, {
      onSuccess: () => {
        setIsAdding(false);
        setForm(emptyForm);
        setAutoSlug(true);
      },
    });
  };

  const startEdit = (v: ProductVariant) => {
    setEditingId(v.id);
    setForm({
      sku: v.sku,
      slug: v.slug,
      title: v.title,
      description: v.description || "",
      is_default: v.is_default,
      is_active: v.is_active,
      stock_quantity: v.stock_quantity ?? "",
      weight: v.weight ? parseFloat(v.weight) : "",
      option_value_ids: v.option_values.map((ov) => ov.id),
    });
    setAutoSlug(false);
  };

  const handleUpdate = () => {
    if (!editingId) return;
    updateVariant(
      {
        variantId: editingId,
        data: {
          sku: form.sku,
          slug: form.slug,
          title: form.title,
          description: form.description || null,
          is_default: form.is_default,
          is_active: form.is_active,
          stock_quantity: form.stock_quantity === "" ? null : form.stock_quantity,
          weight: form.weight === "" ? null : form.weight,
          option_value_ids: form.option_value_ids.length ? form.option_value_ids : undefined,
        },
      },
      { onSuccess: () => setEditingId(null) },
    );
  };

  const cancelEdit = () => {
    setIsAdding(false);
    setEditingId(null);
    setForm(emptyForm);
    setAutoSlug(true);
  };

  const handleGenerate = () => {
    if (genGroupIds.length === 0) return;
    generateVariants(
      {
        option_group_ids: genGroupIds,
        base_price: genBasePrice === "" ? null : genBasePrice,
      },
      {
        onSuccess: () => {
          setShowGenerate(false);
          setGenGroupIds([]);
          setGenBasePrice("");
        },
      },
    );
  };

  const toggleGenGroup = (groupId: string) => {
    setGenGroupIds((prev) =>
      prev.includes(groupId) ? prev.filter((id) => id !== groupId) : [...prev, groupId],
    );
  };

  const renderForm = (onSave: () => void, isSaving: boolean) => (
    <div className="rounded-lg border border-[var(--color-border)] p-4 space-y-3">
      <div className="grid gap-3 sm:grid-cols-3">
        <Input
          label="Название *"
          placeholder="Красный XL"
          value={form.title}
          onChange={(e) => handleTitleChange(e.target.value)}
        />
        <Input
          label="SKU *"
          placeholder="WP-2000-RED-XL"
          value={form.sku}
          onChange={(e) => setForm({ ...form, sku: e.target.value })}
        />
        <Input
          label="Slug"
          placeholder="red-xl"
          value={form.slug}
          onChange={(e) => setForm({ ...form, slug: e.target.value })}
          onFocus={() => setAutoSlug(false)}
        />
      </div>
      <Input
        label="Описание"
        placeholder="Описание варианта..."
        value={form.description}
        onChange={(e) => setForm({ ...form, description: e.target.value })}
      />
      <div className="grid gap-3 sm:grid-cols-2">
        <Input
          label="Остаток на складе"
          type="number"
          min="0"
          value={form.stock_quantity === "" ? "" : form.stock_quantity}
          onChange={(e) =>
            setForm({
              ...form,
              stock_quantity: e.target.value === "" ? "" : parseInt(e.target.value, 10) || 0,
            })
          }
        />
        <Input
          label="Вес (кг)"
          type="number"
          step="0.01"
          min="0"
          value={form.weight === "" ? "" : form.weight}
          onChange={(e) =>
            setForm({
              ...form,
              weight: e.target.value === "" ? "" : parseFloat(e.target.value) || 0,
            })
          }
        />
      </div>
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <Switch
            checked={form.is_active}
            onChange={(checked: boolean) => setForm({ ...form, is_active: checked })}
          />
          <span className="text-sm text-[var(--color-text-primary)]">Активен</span>
        </div>
        <div className="flex items-center gap-2">
          <Switch
            checked={form.is_default}
            onChange={(checked: boolean) => setForm({ ...form, is_default: checked })}
          />
          <span className="text-sm text-[var(--color-text-primary)]">По умолчанию</span>
        </div>
      </div>
      <div className="flex gap-2 pt-1">
        <Button
          size="sm"
          onClick={onSave}
          isLoading={isSaving}
          disabled={!form.title || !form.sku}
        >
          {editingId ? "Сохранить" : "Создать"}
        </Button>
        <Button variant="ghost" size="sm" onClick={cancelEdit}>
          Отмена
        </Button>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Generate panel */}
      {showGenerate && (
        <div className="rounded-lg border border-[var(--color-primary)]/30 bg-[var(--color-bg-secondary)] p-4 space-y-3">
          <h4 className="text-sm font-semibold text-[var(--color-text-primary)]">
            Генерация вариантов
          </h4>
          <p className="text-xs text-[var(--color-text-muted)]">
            Выберите группы опций для генерации декартова произведения вариантов.
          </p>
          {groups.length === 0 ? (
            <p className="text-sm text-[var(--color-text-muted)] italic">
              Сначала создайте группы опций с значениями
            </p>
          ) : (
            <div className="space-y-2">
              {groups.map((g) => (
                <label key={g.id} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="rounded border-[var(--color-border)]"
                    checked={genGroupIds.includes(g.id)}
                    onChange={() => toggleGenGroup(g.id)}
                  />
                  <span className="text-sm text-[var(--color-text-primary)]">
                    {g.title}
                    <span className="text-[var(--color-text-muted)]"> ({g.values.length} значений)</span>
                  </span>
                </label>
              ))}
            </div>
          )}
          <Input
            label="Базовая цена (опционально)"
            type="number"
            step="0.01"
            min="0"
            value={genBasePrice === "" ? "" : genBasePrice}
            onChange={(e) =>
              setGenBasePrice(e.target.value === "" ? "" : parseFloat(e.target.value) || 0)
            }
            className="w-48"
          />
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={handleGenerate}
              isLoading={isGenerating}
              disabled={genGroupIds.length === 0}
              leftIcon={<Zap className="h-4 w-4" />}
            >
              Сгенерировать
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setShowGenerate(false)}>
              Отмена
            </Button>
          </div>
        </div>
      )}

      {/* Actions */}
      {!isAdding && !editingId && canEdit && (
        <div className="flex gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              setIsAdding(true);
              setForm(emptyForm);
              setAutoSlug(true);
            }}
            leftIcon={<Plus className="h-4 w-4" />}
          >
            Добавить вариант
          </Button>
          {groups.length > 0 && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowGenerate(true)}
              leftIcon={<Zap className="h-4 w-4" />}
              disabled={showGenerate}
            >
              Сгенерировать
            </Button>
          )}
        </div>
      )}

      {isAdding && renderForm(handleCreate, isCreating)}

      {/* Variants list */}
      {variants.length === 0 && !isAdding && (
        <p className="text-sm text-[var(--color-text-muted)] italic py-4 text-center">
          Вариантов пока нет
        </p>
      )}

      {variants.map((variant) =>
        editingId === variant.id ? (
          <div key={variant.id}>{renderForm(handleUpdate, isUpdating)}</div>
        ) : (
          <VariantRow
            key={variant.id}
            variant={variant}
            isExpanded={expandedId === variant.id}
            onToggle={() =>
              setExpandedId((prev) => (prev === variant.id ? null : variant.id))
            }
            onEdit={() => startEdit(variant)}
            onDelete={() => setDeleteConfirm(variant.id)}
            canEdit={canEdit}
          />
        ),
      )}

      <ConfirmModal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={() => {
          if (deleteConfirm) deleteVariant(deleteConfirm);
          setDeleteConfirm(null);
        }}
        title="Удалить вариант?"
        description="Вариант и все его данные (цены, включения, изображения) будут удалены."
        confirmText="Удалить"
        variant="danger"
      />
    </div>
  );
}

function VariantRow({
  variant,
  isExpanded,
  onToggle,
  onEdit,
  onDelete,
  canEdit,
}: {
  variant: ProductVariant;
  isExpanded: boolean;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
  canEdit: boolean;
}) {
  const regularPrice = variant.prices.find((p) => p.price_type === "regular");

  return (
    <div className="rounded-lg border border-[var(--color-border)] overflow-hidden">
      <div
        className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-[var(--color-bg-secondary)] transition-colors"
        onClick={onToggle}
      >
        <div className="flex items-center gap-3">
          {isExpanded ? (
            <ChevronDown className="h-4 w-4 text-[var(--color-text-muted)]" />
          ) : (
            <ChevronRight className="h-4 w-4 text-[var(--color-text-muted)]" />
          )}
          <div className="flex items-center gap-2">
            <span className="font-medium text-[var(--color-text-primary)]">{variant.title}</span>
            {variant.is_default && <Badge variant="primary">По умолчанию</Badge>}
            <Badge variant={variant.is_active ? "success" : "secondary"}>
              {variant.is_active ? "Активен" : "Скрыт"}
            </Badge>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
            <span className="text-xs text-[var(--color-text-muted)]">SKU: {variant.sku}</span>
            {regularPrice && (
              <span className="font-medium text-[var(--color-text-primary)]">
                {parseFloat(regularPrice.amount).toLocaleString("ru-RU")} {regularPrice.currency}
              </span>
            )}
            {variant.stock_quantity != null && (
              <span className="text-xs text-[var(--color-text-muted)]">
                Остаток: {variant.stock_quantity}
              </span>
            )}
          </div>
          {canEdit && (
            <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
              <Button variant="ghost" size="icon" onClick={onEdit} className="h-8 w-8">
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={onDelete}
                className="h-8 w-8 text-[var(--color-error)]"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>

      {isExpanded && (
        <div className="border-t border-[var(--color-border)] px-4 py-3 space-y-2">
          {variant.option_values.length > 0 && (
            <div>
              <span className="text-xs font-medium text-[var(--color-text-muted)]">Опции: </span>
              {variant.option_values.map((ov) => (
                <span
                  key={ov.id}
                  className="mr-2 inline-flex items-center gap-1 rounded bg-[var(--color-bg-secondary)] px-2 py-0.5 text-xs text-[var(--color-text-secondary)]"
                >
                  {ov.color_hex && (
                    <span
                      className="inline-block h-3 w-3 rounded-full border border-[var(--color-border)]"
                      style={{ backgroundColor: ov.color_hex }}
                    />
                  )}
                  {ov.title}
                </span>
              ))}
            </div>
          )}
          {variant.prices.length > 0 && (
            <div>
              <span className="text-xs font-medium text-[var(--color-text-muted)]">Цены: </span>
              {variant.prices.map((p) => (
                <span
                  key={p.id}
                  className="mr-2 text-xs text-[var(--color-text-secondary)]"
                >
                  {p.price_type}: {parseFloat(p.amount).toLocaleString("ru-RU")} {p.currency}
                </span>
              ))}
            </div>
          )}
          {variant.description && (
            <p className="text-xs text-[var(--color-text-muted)]">{variant.description}</p>
          )}
        </div>
      )}
    </div>
  );
}
