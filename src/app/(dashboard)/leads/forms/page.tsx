"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, FileText, Copy } from "lucide-react";
import { useInquiryForms, useDeleteInquiryForm } from "@/features/inquiry-forms";
import { Button, Table, Badge, ConfirmModal, type Column } from "@/shared/ui";
import { ROUTES } from "@/shared/config";
import { formatDateTime } from "@/shared/lib";
import type { InquiryForm } from "@/entities/inquiry-form";

export default function InquiryFormsPage() {
  const router = useRouter();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedForm, setSelectedForm] = useState<InquiryForm | null>(null);

  const { data: forms, isLoading } = useInquiryForms();
  const { mutate: deleteForm, isPending: isDeleting } = useDeleteInquiryForm();

  const handleDeleteClick = (form: InquiryForm) => {
    setSelectedForm(form);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (selectedForm) {
      deleteForm(selectedForm.id);
      setDeleteModalOpen(false);
      setSelectedForm(null);
    }
  };

  const handleCopySlug = (slug: string) => {
    navigator.clipboard.writeText(slug);
  };

  const columns: Column<InquiryForm>[] = [
    {
      key: "name",
      header: "Название",
      render: (form) => (
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--color-bg-secondary)]">
            <FileText className="h-5 w-5 text-[var(--color-text-muted)]" />
          </div>
          <div>
            <p className="font-medium text-[var(--color-text-primary)]">{form.name}</p>
            {form.description && (
              <p className="text-sm text-[var(--color-text-muted)] line-clamp-1">{form.description}</p>
            )}
          </div>
        </div>
      ),
    },
    {
      key: "slug",
      header: "Slug",
      width: "160px",
      render: (form) => (
        <div className="flex items-center gap-2">
          <code className="rounded bg-[var(--color-bg-secondary)] px-2 py-1 text-sm">{form.slug}</code>
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              handleCopySlug(form.slug);
            }}
            className="h-6 w-6"
          >
            <Copy className="h-3 w-3" />
          </Button>
        </div>
      ),
    },
    {
      key: "fields",
      header: "Полей",
      width: "100px",
      render: (form) => (
        <span className="text-[var(--color-text-secondary)]">
          {form.fields_config?.fields?.length || 0}
        </span>
      ),
    },
    {
      key: "is_active",
      header: "Статус",
      width: "120px",
      render: (form) => (
        <Badge variant={form.is_active ? "success" : "secondary"}>
          {form.is_active ? "Активна" : "Неактивна"}
        </Badge>
      ),
    },
    {
      key: "updated_at",
      header: "Обновлена",
      width: "140px",
      render: (form) => (
        <span className="text-sm text-[var(--color-text-muted)]">
          {formatDateTime(form.updated_at)}
        </span>
      ),
    },
    {
      key: "actions",
      header: "",
      width: "100px",
      render: (form) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              router.push(ROUTES.LEAD_FORM_EDIT(form.id));
            }}
            className="h-8 w-8"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteClick(form);
            }}
            className="h-8 w-8 text-[var(--color-error)] hover:text-[var(--color-error)]"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Формы заявок</h1>
          <p className="text-[var(--color-text-secondary)]">
            Управление конфигурацией форм обратной связи
          </p>
        </div>
        <Button
          onClick={() => router.push(ROUTES.LEAD_FORM_NEW)}
          leftIcon={<Plus className="h-4 w-4" />}
        >
          Создать форму
        </Button>
      </div>

      {/* Table */}
      <Table
        data={forms || []}
        columns={columns}
        keyExtractor={(form) => form.id}
        isLoading={isLoading}
        emptyMessage="Формы не найдены"
        onRowClick={(form) => router.push(ROUTES.LEAD_FORM_EDIT(form.id))}
      />

      {/* Delete confirmation modal */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Удалить форму?"
        description={`Вы уверены, что хотите удалить форму "${selectedForm?.name}"? Существующие заявки останутся, но потеряют связь с формой.`}
        confirmText="Удалить"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
}

