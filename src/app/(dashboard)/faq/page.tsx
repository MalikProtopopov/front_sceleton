"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useFAQList, useDeleteFAQ } from "@/features/faq";
import { Button, Table, Pagination, Badge, ConfirmModal, Select, FilterBar, type Column } from "@/shared/ui";
import { ROUTES } from "@/shared/config";
import { formatDate } from "@/shared/lib";
import type { FAQ, FAQFilterParams } from "@/entities/faq";
import { FAQ_CATEGORIES } from "@/entities/faq";

export default function FAQPage() {
  const router = useRouter();
  const [filters, setFilters] = useState<FAQFilterParams>({
    page: 1,
    pageSize: 20,
  });
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedFAQ, setSelectedFAQ] = useState<FAQ | null>(null);

  const { data, isLoading } = useFAQList(filters);
  const { mutate: deleteFAQ, isPending: isDeleting } = useDeleteFAQ();

  const handleFiltersChange = (newFilters: Partial<FAQFilterParams>) => {
    setFilters((prev) => ({
      ...prev,
      ...newFilters,
      page: newFilters.page || 1,
    }));
  };

  const handleResetFilters = () => {
    setFilters({ page: 1, pageSize: 20 });
  };

  const handleDeleteClick = (faq: FAQ) => {
    setSelectedFAQ(faq);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (selectedFAQ) {
      deleteFAQ(selectedFAQ.id);
      setDeleteModalOpen(false);
      setSelectedFAQ(null);
    }
  };

  const getFAQQuestion = (faq: FAQ): string => {
    const ruLocale = faq.locales?.find((l) => l.locale === "ru");
    return ruLocale?.question || faq.locales?.[0]?.question || "Без вопроса";
  };

  const getCategoryLabel = (category: string | null): string => {
    if (!category) return "—";
    const cat = FAQ_CATEGORIES.find((c) => c.value === category);
    return cat?.label || category;
  };

  const columns: Column<FAQ>[] = [
    {
      key: "question",
      header: "Вопрос",
      render: (faq) => (
        <div className="max-w-lg">
          <p className="font-medium text-[var(--color-text-primary)] line-clamp-2">
            {getFAQQuestion(faq)}
          </p>
        </div>
      ),
    },
    {
      key: "category",
      header: "Категория",
      width: "160px",
      render: (faq) => (
        <span className="text-[var(--color-text-secondary)]">
          {getCategoryLabel(faq.category)}
        </span>
      ),
    },
    {
      key: "is_published",
      header: "Статус",
      width: "120px",
      render: (faq) => (
        <Badge variant={faq.is_published ? "success" : "secondary"}>
          {faq.is_published ? "Опубликован" : "Черновик"}
        </Badge>
      ),
    },
    {
      key: "sort_order",
      header: "Порядок",
      width: "100px",
      render: (faq) => (
        <span className="text-[var(--color-text-secondary)]">{faq.sort_order}</span>
      ),
    },
    {
      key: "created_at",
      header: "Создан",
      width: "120px",
      render: (faq) => (
        <span className="text-[var(--color-text-secondary)]">{formatDate(faq.created_at)}</span>
      ),
    },
    {
      key: "actions",
      header: "",
      width: "120px",
      render: (faq) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              router.push(ROUTES.FAQ_EDIT(faq.id));
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
              handleDeleteClick(faq);
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
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">FAQ</h1>
          <p className="text-[var(--color-text-secondary)]">
            Часто задаваемые вопросы
          </p>
        </div>
        <Button
          onClick={() => router.push(ROUTES.FAQ_NEW)}
          leftIcon={<Plus className="h-4 w-4" />}
        >
          Создать FAQ
        </Button>
      </div>

      {/* Filters */}
      <FilterBar onReset={handleResetFilters}>
        <Select
          label="Категория"
          value={filters.category || ""}
          onChange={(e) => handleFiltersChange({ category: e.target.value || undefined })}
          options={[
            { value: "", label: "Все категории" },
            ...FAQ_CATEGORIES.map((c) => ({ value: c.value, label: c.label })),
          ]}
          className="w-48"
        />
        <Select
          label="Статус"
          value={filters.isPublished === undefined ? "" : String(filters.isPublished)}
          onChange={(e) => 
            handleFiltersChange({ 
              isPublished: e.target.value === "" ? undefined : e.target.value === "true" 
            })
          }
          options={[
            { value: "", label: "Все статусы" },
            { value: "true", label: "Опубликован" },
            { value: "false", label: "Черновик" },
          ]}
          className="w-48"
        />
      </FilterBar>

      {/* Table */}
      <Table
        data={data?.items || []}
        columns={columns}
        keyExtractor={(faq) => faq.id}
        isLoading={isLoading}
        emptyMessage="FAQ не найдены"
        onRowClick={(faq) => router.push(ROUTES.FAQ_EDIT(faq.id))}
      />

      {/* Pagination */}
      {data && data.total > 0 && (
        <Pagination
          page={filters.page || 1}
          pageSize={filters.pageSize || 20}
          total={data.total}
          onPageChange={(page) => handleFiltersChange({ page })}
          onPageSizeChange={(pageSize) => handleFiltersChange({ pageSize, page: 1 })}
        />
      )}

      {/* Delete confirmation modal */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Удалить FAQ?"
        description={`Вы уверены, что хотите удалить FAQ "${selectedFAQ ? getFAQQuestion(selectedFAQ) : ""}"? Это действие нельзя отменить.`}
        confirmText="Удалить"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
}
