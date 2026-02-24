"use client";

import { useState } from "react";
import { Plus, Trash2, Save } from "lucide-react";
import { Button, Input } from "@/shared/ui";
import { useBulkUpdateChars } from "../model/useProducts";
import type { ProductChar, BulkCharsDto } from "@/entities/product";

interface ProductCharsEditorProps {
  productId: string;
  chars: ProductChar[];
}

interface CharRow {
  id?: string;
  name: string;
  value_text: string;
  isNew?: boolean;
  isDeleted?: boolean;
  isDirty?: boolean;
}

export function ProductCharsEditor({ productId, chars }: ProductCharsEditorProps) {
  const [rows, setRows] = useState<CharRow[]>(
    chars.map((c) => ({ id: c.id, name: c.name, value_text: c.value_text })),
  );
  const { mutate: bulkUpdate, isPending } = useBulkUpdateChars(productId);

  const addRow = () => {
    setRows((prev) => [...prev, { name: "", value_text: "", isNew: true }]);
  };

  const updateRow = (index: number, field: "name" | "value_text", value: string) => {
    setRows((prev) =>
      prev.map((r, i) =>
        i === index ? { ...r, [field]: value, isDirty: !r.isNew ? true : r.isDirty } : r,
      ),
    );
  };

  const deleteRow = (index: number) => {
    setRows((prev) =>
      prev.map((r, i) => {
        if (i !== index) return r;
        if (r.isNew) return { ...r, isDeleted: true };
        return { ...r, isDeleted: !r.isDeleted };
      }),
    );
  };

  const handleSave = () => {
    const dto: BulkCharsDto = {};

    const created = rows.filter((r) => r.isNew && !r.isDeleted && r.name && r.value_text);
    if (created.length) {
      dto.created = created.map((r) => ({ name: r.name, value_text: r.value_text }));
    }

    const updated = rows.filter((r) => r.isDirty && !r.isNew && !r.isDeleted && r.id);
    if (updated.length) {
      dto.updated = updated.map((r) => ({
        id: r.id!,
        name: r.name,
        value_text: r.value_text,
      }));
    }

    const deleted = rows.filter((r) => r.isDeleted && !r.isNew && r.id);
    if (deleted.length) {
      dto.deleted = deleted.map((r) => r.id!);
    }

    if (!dto.created?.length && !dto.updated?.length && !dto.deleted?.length) return;

    bulkUpdate(dto, {
      onSuccess: () => {
        setRows((prev) =>
          prev
            .filter((r) => !r.isDeleted)
            .map((r) => ({ ...r, isNew: false, isDirty: false })),
        );
      },
    });
  };

  const visibleRows = rows.filter((r) => !(r.isNew && r.isDeleted));
  const hasChanges = rows.some((r) => r.isNew || r.isDirty || r.isDeleted);

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        {visibleRows.length === 0 && (
          <p className="text-sm text-[var(--color-text-muted)] italic py-4 text-center">
            Характеристики не добавлены
          </p>
        )}
        {visibleRows.map((row) => {
          const realIndex = rows.indexOf(row);
          return (
            <div
              key={realIndex}
              className={`flex items-center gap-3 ${row.isDeleted ? "opacity-40" : ""}`}
            >
              <Input
                placeholder="Название"
                value={row.name}
                onChange={(e) => updateRow(realIndex, "name", e.target.value)}
                disabled={row.isDeleted}
                className="flex-1"
              />
              <Input
                placeholder="Значение"
                value={row.value_text}
                onChange={(e) => updateRow(realIndex, "value_text", e.target.value)}
                disabled={row.isDeleted}
                className="flex-1"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => deleteRow(realIndex)}
                className={`h-9 w-9 flex-shrink-0 ${row.isDeleted ? "text-[var(--color-success)]" : "text-[var(--color-error)]"}`}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          );
        })}
      </div>

      <div className="flex items-center gap-3">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={addRow}
          leftIcon={<Plus className="h-4 w-4" />}
        >
          Добавить
        </Button>
        {hasChanges && (
          <Button
            type="button"
            size="sm"
            onClick={handleSave}
            isLoading={isPending}
            leftIcon={<Save className="h-4 w-4" />}
          >
            Сохранить характеристики
          </Button>
        )}
      </div>
    </div>
  );
}
