"use client";

import { useState } from "react";
import { Plus, Trash2, Pencil, X, Check } from "lucide-react";
import { Button, Input, Select, Spinner } from "@/shared/ui";
import {
  useVariantPrices,
  useCreateVariantPrice,
  useUpdateVariantPrice,
  useDeleteVariantPrice,
  useVariantsList,
} from "../model/useVariants";
import { PRICE_TYPE_LABELS } from "@/entities/product";
import type { VariantPrice, PriceType } from "@/entities/product";

interface VariantPricesEditorProps {
  productId: string;
  canEdit?: boolean;
}

const PRICE_TYPE_OPTIONS = Object.entries(PRICE_TYPE_LABELS).map(([value, label]) => ({
  value,
  label,
}));

const CURRENCY_OPTIONS = [
  { value: "RUB", label: "RUB" },
  { value: "USD", label: "USD" },
  { value: "EUR", label: "EUR" },
];

type FormState = {
  price_type: PriceType;
  amount: number | "";
  currency: string;
  valid_from: string;
  valid_to: string;
};

const emptyForm: FormState = {
  price_type: "regular",
  amount: 0,
  currency: "RUB",
  valid_from: "",
  valid_to: "",
};

export function VariantPricesEditor({ productId, canEdit = true }: VariantPricesEditorProps) {
  const { data: variants = [], isLoading } = useVariantsList(productId);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);

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
      <Select
        label="Выберите вариант"
        value={activeVariantId}
        onChange={(e) => setSelectedVariantId(e.target.value)}
        options={variantOptions}
      />
      {activeVariantId && (
        <SingleVariantPrices
          productId={productId}
          variantId={activeVariantId}
          canEdit={canEdit}
        />
      )}
    </div>
  );
}

function SingleVariantPrices({
  productId,
  variantId,
  canEdit,
}: {
  productId: string;
  variantId: string;
  canEdit: boolean;
}) {
  const { data: prices = [], isLoading } = useVariantPrices(productId, variantId);
  const { mutate: createPrice, isPending: isCreating } = useCreateVariantPrice(productId, variantId);
  const { mutate: updatePrice, isPending: isUpdating } = useUpdateVariantPrice(productId, variantId);
  const { mutate: deletePrice } = useDeleteVariantPrice(productId, variantId);

  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);

  const handleAdd = () => {
    createPrice(
      {
        price_type: form.price_type,
        amount: typeof form.amount === "number" ? form.amount : 0,
        currency: form.currency,
        valid_from: form.valid_from || null,
        valid_to: form.valid_to || null,
      },
      {
        onSuccess: () => {
          setIsAdding(false);
          setForm(emptyForm);
        },
      },
    );
  };

  const handleUpdate = () => {
    if (!editingId) return;
    updatePrice(
      {
        priceId: editingId,
        data: {
          price_type: form.price_type,
          amount: typeof form.amount === "number" ? form.amount : 0,
          currency: form.currency,
          valid_from: form.valid_from || null,
          valid_to: form.valid_to || null,
        },
      },
      { onSuccess: () => setEditingId(null) },
    );
  };

  const startEdit = (price: VariantPrice) => {
    setEditingId(price.id);
    setForm({
      price_type: price.price_type,
      amount: parseFloat(price.amount),
      currency: price.currency,
      valid_from: price.valid_from || "",
      valid_to: price.valid_to || "",
    });
  };

  if (isLoading) {
    return <p className="text-sm text-[var(--color-text-muted)] py-2 text-center">Загрузка...</p>;
  }

  const renderForm = (onSave: () => void, isSaving: boolean) => (
    <div className="flex flex-wrap items-end gap-3 rounded-lg border border-[var(--color-border)] p-4">
      <Select
        label="Тип"
        value={form.price_type}
        onChange={(e) => setForm({ ...form, price_type: e.target.value as PriceType })}
        options={PRICE_TYPE_OPTIONS}
        className="w-36"
      />
      <Input
        label="Сумма"
        type="number"
        step="0.01"
        min="0"
        value={form.amount === "" ? "" : form.amount}
        onChange={(e) =>
          setForm({ ...form, amount: e.target.value === "" ? "" : parseFloat(e.target.value) || 0 })
        }
        className="w-32"
      />
      <Select
        label="Валюта"
        value={form.currency}
        onChange={(e) => setForm({ ...form, currency: e.target.value })}
        options={CURRENCY_OPTIONS}
        className="w-24"
      />
      <Input
        label="Действует с"
        type="date"
        value={form.valid_from}
        onChange={(e) => setForm({ ...form, valid_from: e.target.value })}
        className="w-40"
      />
      <Input
        label="Действует до"
        type="date"
        value={form.valid_to}
        onChange={(e) => setForm({ ...form, valid_to: e.target.value })}
        className="w-40"
      />
      <div className="flex gap-2">
        <Button type="button" size="icon" onClick={onSave} isLoading={isSaving} className="h-9 w-9">
          <Check className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => {
            setIsAdding(false);
            setEditingId(null);
          }}
          className="h-9 w-9"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );

  return (
    <div className="space-y-3">
      {prices.length === 0 && !isAdding && (
        <p className="text-sm text-[var(--color-text-muted)] italic py-2 text-center">
          Цены не добавлены
        </p>
      )}

      {prices.map((price) =>
        editingId === price.id ? (
          <div key={price.id}>{renderForm(handleUpdate, isUpdating)}</div>
        ) : (
          <div
            key={price.id}
            className="flex items-center justify-between rounded-lg border border-[var(--color-border)] px-4 py-3"
          >
            <div className="flex items-center gap-4">
              <span className="rounded bg-[var(--color-bg-secondary)] px-2 py-1 text-xs font-medium text-[var(--color-text-secondary)]">
                {PRICE_TYPE_LABELS[price.price_type]}
              </span>
              <span className="text-lg font-semibold text-[var(--color-text-primary)]">
                {parseFloat(price.amount).toLocaleString("ru-RU")} {price.currency}
              </span>
              {(price.valid_from || price.valid_to) && (
                <span className="text-xs text-[var(--color-text-muted)]">
                  {price.valid_from || "..."} — {price.valid_to || "..."}
                </span>
              )}
            </div>
            {canEdit && (
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" onClick={() => startEdit(price)} className="h-8 w-8">
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => deletePrice(price.id)}
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
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => {
            setIsAdding(true);
            setForm(emptyForm);
          }}
          leftIcon={<Plus className="h-4 w-4" />}
        >
          Добавить цену
        </Button>
      )}
    </div>
  );
}
