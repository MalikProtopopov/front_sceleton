"use client";

import { useState } from "react";
import {
  Plus,
  Trash2,
  Pencil,
  X,
  Check,
  ChevronDown,
  ChevronRight,
  GripVertical,
} from "lucide-react";
import { Button, Input, Select, Switch, ConfirmModal } from "@/shared/ui";
import {
  useOptionGroups,
  useCreateOptionGroup,
  useUpdateOptionGroup,
  useDeleteOptionGroup,
  useCreateOptionValue,
  useUpdateOptionValue,
  useDeleteOptionValue,
} from "../model/useVariants";
import { OPTION_DISPLAY_TYPE_LABELS } from "@/entities/product";
import { transliterate } from "@/shared/lib";
import type {
  OptionGroup,
  OptionValue,
  OptionDisplayType,
  OptionGroupCreate,
  OptionValueCreate,
} from "@/entities/product";

interface OptionGroupsEditorProps {
  productId: string;
  canEdit?: boolean;
}

const DISPLAY_TYPE_OPTIONS = Object.entries(OPTION_DISPLAY_TYPE_LABELS).map(([value, label]) => ({
  value,
  label,
}));

interface GroupFormState {
  title: string;
  slug: string;
  display_type: OptionDisplayType;
  is_required: boolean;
}

const emptyGroupForm: GroupFormState = {
  title: "",
  slug: "",
  display_type: "dropdown",
  is_required: true,
};

interface ValueFormState {
  title: string;
  slug: string;
  color_hex: string;
  image_url: string;
}

const emptyValueForm: ValueFormState = { title: "", slug: "", color_hex: "", image_url: "" };

export function OptionGroupsEditor({ productId, canEdit = true }: OptionGroupsEditorProps) {
  const { data: groups = [], isLoading } = useOptionGroups(productId);
  const { mutate: createGroup, isPending: isCreatingGroup } = useCreateOptionGroup(productId);
  const { mutate: updateGroup, isPending: isUpdatingGroup } = useUpdateOptionGroup(productId);
  const { mutate: deleteGroup } = useDeleteOptionGroup(productId);

  const [expandedGroupId, setExpandedGroupId] = useState<string | null>(null);
  const [isAddingGroup, setIsAddingGroup] = useState(false);
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [groupForm, setGroupForm] = useState<GroupFormState>(emptyGroupForm);
  const [autoSlug, setAutoSlug] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const handleTitleChange = (title: string) => {
    setGroupForm((prev) => ({
      ...prev,
      title,
      ...(autoSlug ? { slug: transliterate(title) } : {}),
    }));
  };

  const handleCreateGroup = () => {
    const data: OptionGroupCreate = {
      title: groupForm.title,
      slug: groupForm.slug,
      display_type: groupForm.display_type,
      is_required: groupForm.is_required,
    };
    createGroup(data, {
      onSuccess: () => {
        setIsAddingGroup(false);
        setGroupForm(emptyGroupForm);
        setAutoSlug(true);
      },
    });
  };

  const startEditGroup = (group: OptionGroup) => {
    setEditingGroupId(group.id);
    setGroupForm({
      title: group.title,
      slug: group.slug,
      display_type: group.display_type,
      is_required: group.is_required,
    });
    setAutoSlug(false);
  };

  const handleUpdateGroup = () => {
    if (!editingGroupId) return;
    updateGroup(
      {
        groupId: editingGroupId,
        data: {
          title: groupForm.title,
          slug: groupForm.slug,
          display_type: groupForm.display_type,
          is_required: groupForm.is_required,
        },
      },
      { onSuccess: () => setEditingGroupId(null) },
    );
  };

  const cancelGroupEdit = () => {
    setIsAddingGroup(false);
    setEditingGroupId(null);
    setGroupForm(emptyGroupForm);
    setAutoSlug(true);
  };

  const renderGroupForm = (onSave: () => void, isSaving: boolean) => (
    <div className="rounded-lg border border-[var(--color-border)] p-4 space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <Input
          label="Название *"
          placeholder="Цвет, Размер, Тарифный план..."
          value={groupForm.title}
          onChange={(e) => handleTitleChange(e.target.value)}
        />
        <Input
          label="Slug *"
          placeholder="color"
          value={groupForm.slug}
          onChange={(e) => setGroupForm({ ...groupForm, slug: e.target.value })}
          onFocus={() => setAutoSlug(false)}
        />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Select
          label="Отображение"
          value={groupForm.display_type}
          onChange={(e) =>
            setGroupForm({ ...groupForm, display_type: e.target.value as OptionDisplayType })
          }
          options={DISPLAY_TYPE_OPTIONS}
        />
        <div className="flex items-center gap-3 sm:pt-7">
          <Switch
            checked={groupForm.is_required}
            onChange={(checked: boolean) => setGroupForm({ ...groupForm, is_required: checked })}
          />
          <span className="text-sm text-[var(--color-text-primary)]">Обязательная</span>
        </div>
      </div>
      <div className="flex gap-2 pt-1">
        <Button size="sm" onClick={onSave} isLoading={isSaving} disabled={!groupForm.title || !groupForm.slug}>
          {editingGroupId ? "Сохранить" : "Создать"}
        </Button>
        <Button variant="ghost" size="sm" onClick={cancelGroupEdit}>
          Отмена
        </Button>
      </div>
    </div>
  );

  if (isLoading) {
    return <p className="text-sm text-[var(--color-text-muted)] py-4 text-center">Загрузка...</p>;
  }

  return (
    <div className="space-y-4">
      {groups.length === 0 && !isAddingGroup && (
        <p className="text-sm text-[var(--color-text-muted)] italic py-4 text-center">
          Группы опций не добавлены
        </p>
      )}

      {groups.map((group) =>
        editingGroupId === group.id ? (
          <div key={group.id}>{renderGroupForm(handleUpdateGroup, isUpdatingGroup)}</div>
        ) : (
          <GroupCard
            key={group.id}
            group={group}
            productId={productId}
            isExpanded={expandedGroupId === group.id}
            onToggle={() =>
              setExpandedGroupId((prev) => (prev === group.id ? null : group.id))
            }
            onEdit={() => startEditGroup(group)}
            onDelete={() => setDeleteConfirm(group.id)}
            canEdit={canEdit}
          />
        ),
      )}

      {isAddingGroup && renderGroupForm(handleCreateGroup, isCreatingGroup)}

      {!isAddingGroup && !editingGroupId && canEdit && (
        <Button
          variant="secondary"
          size="sm"
          onClick={() => {
            setIsAddingGroup(true);
            setGroupForm(emptyGroupForm);
            setAutoSlug(true);
          }}
          leftIcon={<Plus className="h-4 w-4" />}
        >
          Добавить группу опций
        </Button>
      )}

      <ConfirmModal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={() => {
          if (deleteConfirm) deleteGroup(deleteConfirm);
          setDeleteConfirm(null);
        }}
        title="Удалить группу опций?"
        description="Все значения группы и связанные варианты будут затронуты."
        confirmText="Удалить"
        variant="danger"
      />
    </div>
  );
}

function GroupCard({
  group,
  productId,
  isExpanded,
  onToggle,
  onEdit,
  onDelete,
  canEdit,
}: {
  group: OptionGroup;
  productId: string;
  isExpanded: boolean;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
  canEdit: boolean;
}) {
  return (
    <div className="rounded-lg border border-[var(--color-border)] overflow-hidden">
      <div
        className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-[var(--color-bg-secondary)] transition-colors"
        onClick={onToggle}
      >
        <div className="flex items-center gap-3">
          {canEdit && <GripVertical className="h-4 w-4 text-[var(--color-text-muted)]" />}
          {isExpanded ? (
            <ChevronDown className="h-4 w-4 text-[var(--color-text-muted)]" />
          ) : (
            <ChevronRight className="h-4 w-4 text-[var(--color-text-muted)]" />
          )}
          <div>
            <span className="font-medium text-[var(--color-text-primary)]">{group.title}</span>
            <span className="ml-2 text-xs text-[var(--color-text-muted)]">
              ({OPTION_DISPLAY_TYPE_LABELS[group.display_type]})
            </span>
          </div>
          <span className="rounded bg-[var(--color-bg-secondary)] px-2 py-0.5 text-xs text-[var(--color-text-secondary)]">
            {group.values.length} {group.values.length === 1 ? "значение" : "значений"}
          </span>
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

      {isExpanded && (
        <div className="border-t border-[var(--color-border)] px-4 py-3">
          <ValuesInlineEditor
            productId={productId}
            group={group}
            canEdit={canEdit}
          />
        </div>
      )}
    </div>
  );
}

function ValuesInlineEditor({
  productId,
  group,
  canEdit,
}: {
  productId: string;
  group: OptionGroup;
  canEdit: boolean;
}) {
  const { mutate: createValue, isPending: isCreating } = useCreateOptionValue(
    productId,
    group.id,
  );
  const { mutate: updateValue, isPending: isUpdating } = useUpdateOptionValue(
    productId,
    group.id,
  );
  const { mutate: deleteValue } = useDeleteOptionValue(productId, group.id);

  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ValueFormState>(emptyValueForm);
  const [autoSlug, setAutoSlug] = useState(true);

  const isColorSwatch = group.display_type === "color_swatch";

  const handleTitleChange = (title: string) => {
    setForm((prev) => ({
      ...prev,
      title,
      ...(autoSlug ? { slug: transliterate(title) } : {}),
    }));
  };

  const handleCreate = () => {
    const data: OptionValueCreate = {
      title: form.title,
      slug: form.slug || undefined,
      color_hex: form.color_hex || null,
      image_url: form.image_url || null,
    };
    createValue(data, {
      onSuccess: () => {
        setIsAdding(false);
        setForm(emptyValueForm);
        setAutoSlug(true);
      },
    });
  };

  const startEdit = (value: OptionValue) => {
    setEditingId(value.id);
    setForm({
      title: value.title,
      slug: value.slug,
      color_hex: value.color_hex || "",
      image_url: value.image_url || "",
    });
    setAutoSlug(false);
  };

  const handleUpdate = () => {
    if (!editingId) return;
    updateValue(
      {
        valueId: editingId,
        data: {
          title: form.title,
          slug: form.slug,
          color_hex: form.color_hex || null,
          image_url: form.image_url || null,
        },
      },
      { onSuccess: () => setEditingId(null) },
    );
  };

  const sorted = [...group.values].sort((a, b) => a.sort_order - b.sort_order);

  const renderForm = (onSave: () => void, isSaving: boolean) => (
    <div className="flex flex-wrap items-end gap-2 rounded-md border border-[var(--color-border)] p-3">
      <Input
        label="Название"
        placeholder="Красный"
        value={form.title}
        onChange={(e) => handleTitleChange(e.target.value)}
        className="w-36"
      />
      <Input
        label="Slug"
        placeholder="red"
        value={form.slug}
        onChange={(e) => setForm({ ...form, slug: e.target.value })}
        onFocus={() => setAutoSlug(false)}
        className="w-28"
      />
      {isColorSwatch && (
        <Input
          label="Цвет"
          type="color"
          value={form.color_hex || "#000000"}
          onChange={(e) => setForm({ ...form, color_hex: e.target.value })}
          className="w-20"
        />
      )}
      <div className="flex gap-1">
        <Button
          size="icon"
          onClick={onSave}
          isLoading={isSaving}
          disabled={!form.title}
          className="h-9 w-9"
        >
          <Check className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            setIsAdding(false);
            setEditingId(null);
            setForm(emptyValueForm);
            setAutoSlug(true);
          }}
          className="h-9 w-9"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );

  return (
    <div className="space-y-2">
      {sorted.length === 0 && !isAdding && (
        <p className="text-xs text-[var(--color-text-muted)] italic">Нет значений</p>
      )}
      {sorted.map((value) =>
        editingId === value.id ? (
          <div key={value.id}>{renderForm(handleUpdate, isUpdating)}</div>
        ) : (
          <div
            key={value.id}
            className="flex items-center justify-between rounded-md border border-[var(--color-border)] px-3 py-2"
          >
            <div className="flex items-center gap-2">
              {isColorSwatch && value.color_hex && (
                <span
                  className="inline-block h-5 w-5 rounded-full border border-[var(--color-border)]"
                  style={{ backgroundColor: value.color_hex }}
                />
              )}
              <span className="text-sm font-medium text-[var(--color-text-primary)]">
                {value.title}
              </span>
              <span className="text-xs text-[var(--color-text-muted)]">/{value.slug}</span>
            </div>
            {canEdit && (
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => startEdit(value)}
                  className="h-7 w-7"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => deleteValue(value.id)}
                  className="h-7 w-7 text-[var(--color-error)]"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            )}
          </div>
        ),
      )}

      {isAdding && renderForm(handleCreate, isCreating)}

      {!isAdding && !editingId && canEdit && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setIsAdding(true);
            setForm(emptyValueForm);
            setAutoSlug(true);
          }}
          leftIcon={<Plus className="h-3.5 w-3.5" />}
          className="mt-1"
        >
          Добавить значение
        </Button>
      )}
    </div>
  );
}
