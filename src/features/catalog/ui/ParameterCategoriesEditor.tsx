"use client";

import { useState, useEffect } from "react";
import { Save } from "lucide-react";
import { Button } from "@/shared/ui";
import { TREE_INDENT_PER_LEVEL } from "@/shared/config";
import { useCategoriesTree } from "../model/useCategories";
import { useSetParameterCategories } from "../model/useParameters";
import type { Category } from "@/entities/product";

interface ParameterCategoriesEditorProps {
  parameterId: string;
  categoryIds: string[];
  readOnly?: boolean;
}

export function ParameterCategoriesEditor({
  parameterId,
  categoryIds,
  readOnly,
}: ParameterCategoriesEditorProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set(categoryIds));
  const { data: categoriesData } = useCategoriesTree();
  const setCategories = useSetParameterCategories(parameterId);

  useEffect(() => {
    setSelected(new Set(categoryIds));
  }, [categoryIds]);

  const allCategories = categoriesData?.items || [];

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSave = () => {
    setCategories.mutate({ category_ids: Array.from(selected) });
  };

  const hasChanges = (() => {
    const orig = new Set(categoryIds);
    if (orig.size !== selected.size) return true;
    for (const id of selected) {
      if (!orig.has(id)) return true;
    }
    return false;
  })();

  const roots = allCategories.filter((c) => !c.parent_id);
  const childrenOf = (parentId: string) => allCategories.filter((c) => c.parent_id === parentId);

  const renderCategory = (cat: Category, depth = 0) => {
    const children = childrenOf(cat.id);
    return (
      <div key={cat.id}>
        <label
          className="flex items-center gap-2 py-1 cursor-pointer hover:bg-[var(--color-bg-hover)] rounded px-2"
          style={{ paddingLeft: `${depth * TREE_INDENT_PER_LEVEL + 8}px` }}
        >
          <input
            type="checkbox"
            checked={selected.has(cat.id)}
            onChange={() => toggle(cat.id)}
            disabled={readOnly}
            className="rounded border-[var(--color-border)]"
          />
          <span className="text-sm text-[var(--color-text-primary)]">
            {cat.title}
          </span>
          {!cat.is_active && (
            <span className="text-xs text-[var(--color-text-muted)]">(скрыта)</span>
          )}
        </label>
        {children.map((child) => renderCategory(child, depth + 1))}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {allCategories.length === 0 ? (
        <p className="text-sm text-[var(--color-text-muted)] italic py-4 text-center">
          Категории не найдены
        </p>
      ) : (
        <div className="max-h-[400px] overflow-y-auto border border-[var(--color-border)] rounded-lg p-2">
          {roots.map((cat) => renderCategory(cat))}
        </div>
      )}

      {!readOnly && hasChanges && (
        <div className="flex justify-end">
          <Button
            type="button"
            size="sm"
            onClick={handleSave}
            isLoading={setCategories.isPending}
            leftIcon={<Save className="h-4 w-4" />}
          >
            Сохранить привязки
          </Button>
        </div>
      )}
    </div>
  );
}
