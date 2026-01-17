"use client";

import { useState } from "react";
import { Download, User } from "lucide-react";
import { useAuditLogs } from "@/features/audit";
import { useUsersList } from "@/features/users";
import {
  Button,
  Table,
  Pagination,
  Badge,
  Select,
  Input,
  FilterBar,
  Modal,
  ModalBody,
  type Column,
} from "@/shared/ui";
import { formatDateTime, downloadExport } from "@/shared/lib";
import type { AuditLog, AuditFilterParams } from "@/entities/audit";
import { AUDIT_RESOURCE_TYPES, AUDIT_ACTIONS } from "@/entities/audit";

function getActionLabel(action: string): string {
  const found = AUDIT_ACTIONS.find((a) => a.value === action);
  return found?.label || action;
}

function getResourceLabel(resourceType: string): string {
  const found = AUDIT_RESOURCE_TYPES.find((r) => r.value === resourceType);
  return found?.label || resourceType;
}

function getActionBadgeVariant(action: string): "success" | "warning" | "error" | "info" | "secondary" {
  switch (action) {
    case "create":
      return "success";
    case "update":
      return "info";
    case "delete":
      return "error";
    case "publish":
    case "approve":
      return "success";
    case "unpublish":
    case "reject":
      return "warning";
    default:
      return "secondary";
  }
}

interface ChangesModalProps {
  isOpen: boolean;
  onClose: () => void;
  changes: Record<string, { old: unknown; new: unknown }> | null;
}

function ChangesModal({ isOpen, onClose, changes }: ChangesModalProps) {
  if (!changes) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Изменения" size="lg">
      <ModalBody>
        <div className="space-y-4">
          {Object.entries(changes).map(([field, change]) => (
            <div key={field} className="rounded-lg border border-[var(--color-border)] p-3">
              <p className="mb-2 font-medium text-[var(--color-text-primary)]">{field}</p>
              <div className="grid gap-2 text-sm">
                <div>
                  <span className="text-[var(--color-text-muted)]">Было: </span>
                  <code className="rounded bg-[var(--color-bg-secondary)] px-1 text-[var(--color-error)]">
                    {JSON.stringify(change.old)}
                  </code>
                </div>
                <div>
                  <span className="text-[var(--color-text-muted)]">Стало: </span>
                  <code className="rounded bg-[var(--color-bg-secondary)] px-1 text-[var(--color-success)]">
                    {JSON.stringify(change.new)}
                  </code>
                </div>
              </div>
            </div>
          ))}
        </div>
      </ModalBody>
    </Modal>
  );
}

export default function AuditPage() {
  const [filters, setFilters] = useState<AuditFilterParams>({
    page: 1,
    pageSize: 25,
  });
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const { data, isLoading } = useAuditLogs(filters);
  const { data: usersData } = useUsersList({ pageSize: 100 });

  const handleFiltersChange = (newFilters: Partial<AuditFilterParams>) => {
    setFilters((prev) => ({
      ...prev,
      ...newFilters,
      page: newFilters.page || 1,
    }));
  };

  const handleResetFilters = () => {
    setFilters({ page: 1, pageSize: 25 });
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await downloadExport("audit_logs", "csv", {
        dateFrom: filters.dateFrom,
        dateTo: filters.dateTo,
        resourceType: filters.resourceType,
        action: filters.action,
      });
    } finally {
      setIsExporting(false);
    }
  };

  const userOptions = usersData?.items.map((user) => ({
    value: user.id,
    label: `${user.first_name} ${user.last_name} (${user.email})`,
  })) || [];

  const columns: Column<AuditLog>[] = [
    {
      key: "timestamp",
      header: "Дата и время",
      width: "180px",
      render: (log) => (
        <span className="text-sm text-[var(--color-text-secondary)]">
          {formatDateTime(log.timestamp)}
        </span>
      ),
    },
    {
      key: "user",
      header: "Пользователь",
      width: "200px",
      render: (log) => (
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-bg-secondary)]">
            <User className="h-4 w-4 text-[var(--color-text-muted)]" />
          </div>
          <div>
            <p className="text-sm font-medium text-[var(--color-text-primary)]">
              {log.user?.name || "Система"}
            </p>
            {log.user?.email && (
              <p className="text-xs text-[var(--color-text-muted)]">{log.user.email}</p>
            )}
          </div>
        </div>
      ),
    },
    {
      key: "action",
      header: "Действие",
      width: "140px",
      render: (log) => (
        <Badge variant={getActionBadgeVariant(log.action)}>
          {getActionLabel(log.action)}
        </Badge>
      ),
    },
    {
      key: "resource",
      header: "Ресурс",
      render: (log) => (
        <div>
          <p className="text-sm text-[var(--color-text-secondary)]">
            {getResourceLabel(log.resource_type)}
          </p>
          {log.resource_name && (
            <p className="text-sm font-medium text-[var(--color-text-primary)] line-clamp-1">
              {log.resource_name}
            </p>
          )}
        </div>
      ),
    },
    {
      key: "status",
      header: "Статус",
      width: "100px",
      render: (log) => (
        <Badge variant={log.status === "success" ? "success" : "error"}>
          {log.status === "success" ? "OK" : "Ошибка"}
        </Badge>
      ),
    },
    {
      key: "changes",
      header: "",
      width: "100px",
      render: (log) => (
        log.changes && Object.keys(log.changes).length > 0 ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedLog(log);
            }}
          >
            Изменения
          </Button>
        ) : null
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Журнал аудита</h1>
          <p className="text-[var(--color-text-secondary)]">
            История всех действий в системе
          </p>
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

      {/* Filters */}
      <FilterBar onReset={handleResetFilters}>
        {userOptions.length > 0 && (
          <Select
            label="Пользователь"
            value={filters.userId || ""}
            onChange={(e) => handleFiltersChange({ userId: e.target.value || undefined })}
            options={[{ value: "", label: "Все пользователи" }, ...userOptions]}
            className="w-64"
          />
        )}
        <Select
          label="Тип ресурса"
          value={filters.resourceType || ""}
          onChange={(e) => handleFiltersChange({ resourceType: e.target.value || undefined })}
          options={[{ value: "", label: "Все ресурсы" }, ...AUDIT_RESOURCE_TYPES]}
          className="w-48"
        />
        <Select
          label="Действие"
          value={filters.action || ""}
          onChange={(e) => handleFiltersChange({ action: e.target.value || undefined })}
          options={[{ value: "", label: "Все действия" }, ...AUDIT_ACTIONS]}
          className="w-48"
        />
        <Input
          label="С даты"
          type="date"
          value={filters.dateFrom || ""}
          onChange={(e) => handleFiltersChange({ dateFrom: e.target.value || undefined })}
          className="w-44"
        />
        <Input
          label="По дату"
          type="date"
          value={filters.dateTo || ""}
          onChange={(e) => handleFiltersChange({ dateTo: e.target.value || undefined })}
          className="w-44"
        />
      </FilterBar>

      {/* Table */}
      <Table
        data={data?.items || []}
        columns={columns}
        keyExtractor={(log) => log.id}
        isLoading={isLoading}
        emptyMessage="Записи не найдены"
      />

      {/* Pagination */}
      {data && data.total > 0 && (
        <Pagination
          page={filters.page || 1}
          pageSize={filters.pageSize || 25}
          total={data.total}
          onPageChange={(page) => handleFiltersChange({ page })}
          onPageSizeChange={(pageSize) => handleFiltersChange({ pageSize, page: 1 })}
        />
      )}

      {/* Changes Modal */}
      <ChangesModal
        isOpen={!!selectedLog}
        onClose={() => setSelectedLog(null)}
        changes={selectedLog?.changes || null}
      />
    </div>
  );
}

