"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { Button, Input } from "@/shared/ui";
import { useCreateProductAliases, useDeleteProductAlias } from "../model/useProducts";
import type { ProductAlias } from "@/entities/product";

interface ProductAliasesEditorProps {
  productId: string;
  aliases: ProductAlias[];
}

export function ProductAliasesEditor({ productId, aliases }: ProductAliasesEditorProps) {
  const [newAlias, setNewAlias] = useState("");
  const { mutate: createAliases, isPending: isCreating } = useCreateProductAliases(productId);
  const { mutate: deleteAlias } = useDeleteProductAlias(productId);

  const handleAdd = () => {
    const values = newAlias
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (!values.length) return;
    createAliases(
      { aliases: values },
      { onSuccess: () => setNewAlias("") },
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAdd();
    }
  };

  return (
    <div className="space-y-4">
      {aliases.length === 0 && (
        <p className="text-sm text-[var(--color-text-muted)] italic py-2 text-center">
          Псевдонимы не добавлены
        </p>
      )}

      <div className="flex flex-wrap gap-2">
        {aliases.map((alias) => (
          <span
            key={alias.id}
            className="inline-flex items-center gap-1 rounded-full bg-[var(--color-bg-secondary)] px-3 py-1 text-sm text-[var(--color-text-primary)]"
          >
            {alias.alias}
            <button
              onClick={() => deleteAlias(alias.id)}
              className="ml-1 rounded-full p-0.5 text-[var(--color-text-muted)] hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-error)]"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
      </div>

      <div className="flex items-end gap-3">
        <Input
          label="Добавить псевдонимы"
          placeholder="Введите через запятую..."
          value={newAlias}
          onChange={(e) => setNewAlias(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1"
        />
        <Button
          type="button"
          size="sm"
          onClick={handleAdd}
          isLoading={isCreating}
          disabled={!newAlias.trim()}
          leftIcon={<Plus className="h-4 w-4" />}
        >
          Добавить
        </Button>
      </div>
    </div>
  );
}
