"use client";

import { useState } from "react";
import { Plus, Trash2, Search } from "lucide-react";
import { Button, Input, Select, Badge } from "@/shared/ui";
import { useProductAnalogs, useCreateProductAnalog, useDeleteProductAnalog } from "../model/useProducts";
import { useProductsList } from "../model/useProducts";
import { ANALOG_RELATION_LABELS } from "@/entities/product";
import type { AnalogRelation } from "@/entities/product";

interface ProductAnalogsEditorProps {
  productId: string;
}

const RELATION_OPTIONS = Object.entries(ANALOG_RELATION_LABELS).map(([value, label]) => ({
  value,
  label,
}));

const RELATION_VARIANT: Record<AnalogRelation, "success" | "warning" | "error"> = {
  equivalent: "success",
  better: "warning",
  worse: "error",
};

export function ProductAnalogsEditor({ productId }: ProductAnalogsEditorProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedProductId, setSelectedProductId] = useState("");
  const [relation, setRelation] = useState<AnalogRelation>("equivalent");
  const [notes, setNotes] = useState("");

  const { data: analogs, isLoading } = useProductAnalogs(productId);
  const { mutate: createAnalog, isPending: isCreating } = useCreateProductAnalog(productId);
  const { mutate: deleteAnalog } = useDeleteProductAnalog(productId);

  const { data: searchResults } = useProductsList(
    search.length >= 2 ? { search, pageSize: 10 } : undefined,
  );

  const handleAdd = () => {
    if (!selectedProductId) return;
    createAnalog(
      {
        analog_product_id: selectedProductId,
        relation,
        notes: notes || null,
      },
      {
        onSuccess: () => {
          setIsAdding(false);
          setSelectedProductId("");
          setSearch("");
          setNotes("");
          setRelation("equivalent");
        },
      },
    );
  };

  const filteredResults = (searchResults?.items || []).filter(
    (p) => p.id !== productId && !analogs?.some((a) => a.analog_product_id === p.id),
  );

  if (isLoading) return null;

  return (
    <div className="space-y-4">
      {(!analogs || analogs.length === 0) && !isAdding && (
        <p className="text-sm text-[var(--color-text-muted)] italic py-4 text-center">
          Аналоги не добавлены
        </p>
      )}

      {analogs?.map((analog) => (
        <div
          key={analog.analog_product_id}
          className="flex items-center justify-between rounded-lg border border-[var(--color-border)] px-4 py-3"
        >
          <div className="flex items-center gap-3">
            <div>
              <p className="text-sm font-medium text-[var(--color-text-primary)]">
                {analog.title}
              </p>
              <p className="text-xs text-[var(--color-text-muted)]">{analog.sku}</p>
            </div>
            <Badge variant={RELATION_VARIANT[analog.relation]}>
              {ANALOG_RELATION_LABELS[analog.relation]}
            </Badge>
            {analog.notes && (
              <span className="text-xs text-[var(--color-text-secondary)]">{analog.notes}</span>
            )}
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => deleteAnalog(analog.analog_product_id)}
            className="h-8 w-8 text-[var(--color-error)]"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}

      {isAdding && (
        <div className="space-y-3 rounded-lg border border-[var(--color-border)] p-4">
          <div className="relative">
            <Input
              label="Поиск товара"
              placeholder="Введите название или артикул..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setSelectedProductId("");
              }}
              leftIcon={<Search className="h-4 w-4" />}
            />
            {search.length >= 2 && filteredResults.length > 0 && !selectedProductId && (
              <div className="absolute left-0 right-0 top-full z-10 mt-1 max-h-48 overflow-y-auto rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-primary)] shadow-lg">
                {filteredResults.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      setSelectedProductId(p.id);
                      setSearch(`${p.title} (${p.sku})`);
                    }}
                    className="w-full px-3 py-2 text-left text-sm hover:bg-[var(--color-bg-hover)]"
                  >
                    <span className="font-medium">{p.title}</span>
                    <span className="ml-2 text-[var(--color-text-muted)]">{p.sku}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <Select
              label="Тип связи"
              value={relation}
              onChange={(e) => setRelation(e.target.value as AnalogRelation)}
              options={RELATION_OPTIONS}
              className="w-48"
            />
            <Input
              label="Примечание"
              placeholder="Необязательно"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="flex-1"
            />
          </div>

          <div className="flex gap-2">
            <Button
              type="button"
              size="sm"
              onClick={handleAdd}
              isLoading={isCreating}
              disabled={!selectedProductId}
            >
              Добавить аналог
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={() => setIsAdding(false)}>
              Отмена
            </Button>
          </div>
        </div>
      )}

      {!isAdding && (
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => setIsAdding(true)}
          leftIcon={<Plus className="h-4 w-4" />}
        >
          Добавить аналог
        </Button>
      )}
    </div>
  );
}
