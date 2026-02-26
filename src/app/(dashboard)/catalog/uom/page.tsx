"use client";

import { useState } from "react";
import { Plus, Pencil } from "lucide-react";
import { useUomsList, useCreateUom, useUpdateUom } from "@/features/catalog";
import {
  Button,
  Badge,
  Input,
  Switch,
  Modal,
  Spinner,
  type Column,
  Table,
} from "@/shared/ui";
import { usePermissions } from "@/shared/hooks/usePermissions";
import type { UOM, CreateUOMDto, UpdateUOMDto } from "@/entities/product";

interface UomFormValues {
  name: string;
  code: string;
  symbol: string;
  is_active: boolean;
}

const emptyForm: UomFormValues = { name: "", code: "", symbol: "", is_active: true };

export default function UomPage() {
  const { can } = usePermissions();
  const { data: uoms, isLoading } = useUomsList();
  const createUom = useCreateUom();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<UomFormValues>(emptyForm);

  const updateUom = useUpdateUom(editingId || "");

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (uom: UOM) => {
    setEditingId(uom.id);
    setForm({
      name: uom.name,
      code: uom.code,
      symbol: uom.symbol || "",
      is_active: uom.is_active,
    });
    setModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      const dto: UpdateUOMDto = {
        name: form.name,
        code: form.code,
        symbol: form.symbol || null,
        is_active: form.is_active,
      };
      updateUom.mutate(dto, { onSuccess: () => setModalOpen(false) });
    } else {
      const dto: CreateUOMDto = {
        name: form.name,
        code: form.code,
        symbol: form.symbol || undefined,
      };
      createUom.mutate(dto, { onSuccess: () => setModalOpen(false) });
    }
  };

  const isSaving = createUom.isPending || updateUom.isPending;

  const columns: Column<UOM>[] = [
    {
      key: "name",
      header: "Название",
      render: (uom) => (
        <span className="font-medium text-[var(--color-text-primary)]">{uom.name}</span>
      ),
    },
    {
      key: "code",
      header: "Код",
      width: "120px",
      render: (uom) => (
        <span className="text-sm text-[var(--color-text-secondary)]">{uom.code}</span>
      ),
    },
    {
      key: "symbol",
      header: "Символ",
      width: "100px",
      render: (uom) => (
        <span className="text-sm text-[var(--color-text-secondary)]">{uom.symbol || "—"}</span>
      ),
    },
    {
      key: "is_active",
      header: "Статус",
      width: "100px",
      render: (uom) => (
        <Badge variant={uom.is_active ? "success" : "secondary"}>
          {uom.is_active ? "Активна" : "Выкл."}
        </Badge>
      ),
    },
    {
      key: "actions",
      header: "",
      width: "60px",
      render: (uom) =>
        can("catalog", "update") ? (
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              openEdit(uom);
            }}
            className="h-8 w-8"
          >
            <Pencil className="h-4 w-4" />
          </Button>
        ) : null,
    },
  ];

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
            Единицы измерения
          </h1>
          <p className="text-[var(--color-text-secondary)]">
            Справочник единиц измерения для товаров и параметров
          </p>
        </div>
        {can("catalog", "create") && (
          <Button onClick={openCreate} leftIcon={<Plus className="h-4 w-4" />}>
            Добавить
          </Button>
        )}
      </div>

      <Table
        data={uoms || []}
        columns={columns}
        keyExtractor={(uom) => uom.id}
        emptyMessage="Единицы измерения не найдены"
      />

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? "Редактировать единицу" : "Новая единица измерения"}
        size="sm"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Название *"
            placeholder="Килограмм"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            required
          />
          <div className="grid gap-4 grid-cols-2">
            <Input
              label="Код *"
              placeholder="kg"
              value={form.code}
              onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
              required
            />
            <Input
              label="Символ"
              placeholder="кг"
              value={form.symbol}
              onChange={(e) => setForm((f) => ({ ...f, symbol: e.target.value }))}
            />
          </div>
          {editingId && (
            <div className="flex items-center gap-3">
              <Switch
                checked={form.is_active}
                onChange={(checked: boolean) => setForm((f) => ({ ...f, is_active: checked }))}
              />
              <span className="text-sm text-[var(--color-text-primary)]">Активна</span>
            </div>
          )}
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>
              Отмена
            </Button>
            <Button type="submit" isLoading={isSaving}>
              {editingId ? "Сохранить" : "Создать"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
