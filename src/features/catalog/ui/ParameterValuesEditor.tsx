"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, X, Check } from "lucide-react";
import { Button, Input, Badge } from "@/shared/ui";
import {
  useAddParameterValue,
  useUpdateParameterValue,
  useDeleteParameterValue,
} from "../model/useParameters";
import type { ParameterValue } from "@/entities/product";

interface ParameterValuesEditorProps {
  parameterId: string;
  values: ParameterValue[];
  readOnly?: boolean;
}

export function ParameterValuesEditor({
  parameterId,
  values,
  readOnly,
}: ParameterValuesEditorProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [newCode, setNewCode] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState("");
  const [editCode, setEditCode] = useState("");

  const addValue = useAddParameterValue(parameterId);
  const updateValue = useUpdateParameterValue(parameterId);
  const deleteValue = useDeleteParameterValue(parameterId);

  const handleAdd = () => {
    if (!newLabel.trim()) return;
    addValue.mutate(
      { label: newLabel.trim(), code: newCode.trim() || undefined },
      {
        onSuccess: () => {
          setNewLabel("");
          setNewCode("");
          setIsAdding(false);
        },
      },
    );
  };

  const handleStartEdit = (value: ParameterValue) => {
    setEditingId(value.id);
    setEditLabel(value.label);
    setEditCode(value.code || "");
  };

  const handleSaveEdit = () => {
    if (!editingId || !editLabel.trim()) return;
    updateValue.mutate(
      { valueId: editingId, data: { label: editLabel.trim(), code: editCode.trim() || undefined } },
      { onSuccess: () => setEditingId(null) },
    );
  };

  const handleDelete = (valueId: string) => {
    deleteValue.mutate(valueId);
  };

  return (
    <div className="space-y-3">
      {/* Header row */}
      <div className="grid grid-cols-[1fr_120px_80px_60px_80px_72px] gap-2 text-xs font-medium uppercase text-[var(--color-text-muted)] px-1">
        <span>Метка</span>
        <span>Slug</span>
        <span>Код</span>
        <span>Поряд.</span>
        <span>Статус</span>
        <span />
      </div>

      {values.length === 0 && !isAdding && (
        <p className="text-sm text-[var(--color-text-muted)] italic py-4 text-center">
          Значения не добавлены
        </p>
      )}

      {values.map((v) => (
        <div key={v.id} className="grid grid-cols-[1fr_120px_80px_60px_80px_72px] gap-2 items-center">
          {editingId === v.id ? (
            <>
              <Input
                value={editLabel}
                onChange={(e) => setEditLabel(e.target.value)}
                placeholder="Метка"
              />
              <span className="text-sm text-[var(--color-text-muted)] truncate">{v.slug}</span>
              <Input
                value={editCode}
                onChange={(e) => setEditCode(e.target.value)}
                placeholder="Код"
              />
              <span className="text-sm text-center">{v.sort_order}</span>
              <Badge variant={v.is_active ? "success" : "secondary"}>
                {v.is_active ? "Акт." : "Выкл."}
              </Badge>
              <div className="flex gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={handleSaveEdit}
                  disabled={updateValue.isPending}
                  className="h-8 w-8 text-[var(--color-success)]"
                >
                  <Check className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setEditingId(null)}
                  className="h-8 w-8"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </>
          ) : (
            <>
              <span className="text-sm font-medium truncate">{v.label}</span>
              <span className="text-sm text-[var(--color-text-muted)] truncate">{v.slug}</span>
              <span className="text-sm text-[var(--color-text-muted)]">{v.code || "—"}</span>
              <span className="text-sm text-center">{v.sort_order}</span>
              <Badge variant={v.is_active ? "success" : "secondary"}>
                {v.is_active ? "Акт." : "Выкл."}
              </Badge>
              {!readOnly && (
                <div className="flex gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleStartEdit(v)}
                    className="h-8 w-8"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(v.id)}
                    disabled={deleteValue.isPending}
                    className="h-8 w-8 text-[var(--color-error)]"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      ))}

      {/* Add new row */}
      {isAdding && (
        <div className="grid grid-cols-[1fr_120px_80px_60px_80px_72px] gap-2 items-center">
          <Input
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
            placeholder="Метка *"
            autoFocus
          />
          <span />
          <Input
            value={newCode}
            onChange={(e) => setNewCode(e.target.value)}
            placeholder="Код"
          />
          <span />
          <span />
          <div className="flex gap-1">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleAdd}
              disabled={addValue.isPending || !newLabel.trim()}
              className="h-8 w-8 text-[var(--color-success)]"
            >
              <Check className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => { setIsAdding(false); setNewLabel(""); setNewCode(""); }}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {!readOnly && !isAdding && (
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => setIsAdding(true)}
          leftIcon={<Plus className="h-4 w-4" />}
        >
          Добавить значение
        </Button>
      )}
    </div>
  );
}
