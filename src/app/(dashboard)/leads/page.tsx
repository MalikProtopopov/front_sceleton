"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, Mail, Phone, Globe, MapPin, Trash2, Search, Download, LayoutList, LayoutGrid } from "lucide-react";
import { useLeadsList, useDeleteLead, useUpdateLeadStatus, useInquiryForms, LeadsKanban } from "@/features/leads";
import { Button, Table, Pagination, Badge, ConfirmModal, Select, Input, FilterBar, type Column } from "@/shared/ui";
import { ROUTES } from "@/shared/config";
import { formatDateTime, downloadExport } from "@/shared/lib";
import type { Inquiry, InquiryFilterParams, InquiryStatus } from "@/entities/inquiry";
import { INQUIRY_STATUS_CONFIG } from "@/entities/inquiry";

export default function LeadsPage() {
  const router = useRouter();
  const [filters, setFilters] = useState<InquiryFilterParams>({
    page: 1,
    pageSize: 20,
  });
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Inquiry | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [viewMode, setViewMode] = useState<"table" | "kanban">("table");

  const { data, isLoading } = useLeadsList(filters);
  const { data: forms } = useInquiryForms();
  const { mutate: deleteLead, isPending: isDeleting } = useDeleteLead();
  const updateStatus = useUpdateLeadStatus(selectedLead?.id || "");

  const handleFiltersChange = (newFilters: Partial<InquiryFilterParams>) => {
    setFilters((prev) => ({
      ...prev,
      ...newFilters,
      page: newFilters.page || 1,
    }));
  };

  const handleResetFilters = () => {
    setFilters({ page: 1, pageSize: 20 });
  };

  const handleDeleteClick = (lead: Inquiry) => {
    setSelectedLead(lead);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (selectedLead) {
      deleteLead(selectedLead.id);
      setDeleteModalOpen(false);
      setSelectedLead(null);
    }
  };

  const handleStatusChange = (lead: Inquiry, status: InquiryStatus) => {
    setSelectedLead(lead);
    updateStatus.mutate(status);
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await downloadExport("inquiries", "csv", {
        status: filters.status,
        formId: filters.formId,
      });
    } finally {
      setIsExporting(false);
    }
  };

  const columns: Column<Inquiry>[] = [
    {
      key: "contact",
      header: "Контакт",
      render: (lead) => (
        <div>
          <p className="font-medium text-[var(--color-text-primary)]">{lead.name}</p>
          {lead.company && (
            <p className="text-sm text-[var(--color-text-muted)]">{lead.company}</p>
          )}
          <div className="mt-1 flex items-center gap-3 text-sm text-[var(--color-text-secondary)]">
            {lead.email && (
              <span className="flex items-center gap-1">
                <Mail className="h-3 w-3" />
                {lead.email}
              </span>
            )}
            {lead.phone && (
              <span className="flex items-center gap-1">
                <Phone className="h-3 w-3" />
                {lead.phone}
              </span>
            )}
          </div>
        </div>
      ),
    },
    {
      key: "message",
      header: "Сообщение",
      render: (lead) => (
        <p className="max-w-xs text-[var(--color-text-secondary)] line-clamp-2">
          {lead.message || "—"}
        </p>
      ),
    },
    {
      key: "source",
      header: "Источник",
      width: "140px",
      render: (lead) => (
        <div className="space-y-1 text-xs">
          {lead.utm_source && (
            <span className="flex items-center gap-1 text-[var(--color-text-secondary)]">
              <Globe className="h-3 w-3" />
              {lead.utm_source}
            </span>
          )}
          {lead.city && lead.country && (
            <span className="flex items-center gap-1 text-[var(--color-text-muted)]">
              <MapPin className="h-3 w-3" />
              {lead.city}, {lead.country}
            </span>
          )}
        </div>
      ),
    },
    {
      key: "status",
      header: "Статус",
      width: "140px",
      render: (lead) => (
        <div
          className="w-full max-w-[140px]"
          onClick={(e) => {
            // Stop row click when interacting with status select
            e.stopPropagation();
          }}
        >
        <Select
          value={lead.status}
            onChange={(e) => {
              handleStatusChange(lead, e.target.value as InquiryStatus);
            }}
          options={Object.entries(INQUIRY_STATUS_CONFIG).map(([value, { label }]) => ({
            value,
            label,
          }))}
            minWidth={undefined}
            className="h-9 text-sm"
        />
        </div>
      ),
    },
    {
      key: "created_at",
      header: "Дата",
      width: "140px",
      render: (lead) => (
        <span className="text-[var(--color-text-secondary)] text-sm">
          {formatDateTime(lead.created_at)}
        </span>
      ),
    },
    {
      key: "actions",
      header: "",
      width: "80px",
      render: (lead) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              router.push(ROUTES.LEAD_DETAIL(lead.id));
            }}
            className="h-8 w-8"
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteClick(lead);
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
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Лиды</h1>
          <p className="text-[var(--color-text-secondary)]">
            Управление заявками с сайта
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex rounded-lg border border-[var(--color-border)] p-1">
            <Button
              variant={viewMode === "table" ? "secondary" : "ghost"}
              size="icon"
              onClick={() => setViewMode("table")}
              className="h-8 w-8"
              title="Таблица"
            >
              <LayoutList className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "kanban" ? "secondary" : "ghost"}
              size="icon"
              onClick={() => setViewMode("kanban")}
              className="h-8 w-8"
              title="Канбан"
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
          </div>
          <Button
            variant="secondary"
            onClick={handleExport}
            isLoading={isExporting}
            leftIcon={<Download className="h-4 w-4" />}
          >
            Экспорт CSV
          </Button>
        </div>
      </div>

      {/* Stats */}
      {data && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {Object.entries(INQUIRY_STATUS_CONFIG).map(([status, config]) => {
            const count = data.items.filter((l) => l.status === status).length;
            return (
              <div
                key={status}
                className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-primary)] p-4"
              >
                <Badge variant={config.variant} className="mb-2">
                  {config.label}
                </Badge>
                <p className="text-2xl font-bold text-[var(--color-text-primary)]">{count}</p>
              </div>
            );
          })}
        </div>
      )}

      {/* Filters */}
      <FilterBar onReset={handleResetFilters}>
        <Input
          label="Поиск"
          type="search"
          placeholder="Поиск по имени, email..."
          value={filters.search || ""}
          onChange={(e) => handleFiltersChange({ search: e.target.value || undefined })}
          leftIcon={<Search className="h-4 w-4" />}
          className="w-64"
        />
        <Select
          label="Статус"
          value={filters.status || ""}
          onChange={(e) => handleFiltersChange({ status: (e.target.value || undefined) as InquiryStatus | undefined })}
          options={[
            { value: "", label: "Все статусы" },
            ...Object.entries(INQUIRY_STATUS_CONFIG).map(([value, { label }]) => ({ value, label })),
          ]}
          className="w-48"
        />
        {forms && forms.length > 0 && (
          <Select
            label="Форма"
            value={filters.formId || ""}
            onChange={(e) => handleFiltersChange({ formId: e.target.value || undefined })}
            options={[
              { value: "", label: "Все формы" },
              ...forms.map((f) => ({ value: f.id, label: f.name })),
            ]}
            className="w-48"
          />
        )}
      </FilterBar>

      {/* Content */}
      {viewMode === "table" ? (
        <>
          {/* Table */}
          <Table
            data={data?.items || []}
            columns={columns}
            keyExtractor={(lead) => lead.id}
            isLoading={isLoading}
            emptyMessage="Лиды не найдены"
            onRowClick={(lead) => router.push(ROUTES.LEAD_DETAIL(lead.id))}
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
        </>
      ) : (
        /* Kanban View - pass search and form filters, status is shown via columns */
        <LeadsKanban
          filters={{
            search: filters.search,
            formId: filters.formId,
          }}
        />
      )}

      {/* Delete confirmation modal */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Удалить лид?"
        description={`Вы уверены, что хотите удалить заявку от "${selectedLead?.name}"? Это действие нельзя отменить.`}
        confirmText="Удалить"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
}
