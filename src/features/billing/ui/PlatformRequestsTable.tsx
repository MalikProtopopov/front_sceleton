"use client";

import { Badge, Table, Button } from "@/shared/ui";
import { formatDateTime } from "@/shared/lib";
import type { UpgradeRequest, UpgradeRequestStatus } from "@/entities/billing";
import { requestTypeLabels, requestStatusLabels } from "../lib/billingConstants";
import type { Column } from "@/shared/ui/Table/Table";

const statusBadgeVariant: Record<UpgradeRequestStatus, "warning" | "success" | "error"> = {
  pending: "warning",
  approved: "success",
  rejected: "error",
};

function getTargetName(req: UpgradeRequest): string {
  return req.target_plan_name || req.target_module_name || req.target_bundle_name || "—";
}

interface PlatformRequestsTableProps {
  requests: UpgradeRequest[];
  isLoading?: boolean;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  isReviewing?: boolean;
}

export function PlatformRequestsTable({
  requests,
  isLoading,
  onApprove,
  onReject,
  isReviewing,
}: PlatformRequestsTableProps) {
  const columns: Column<UpgradeRequest>[] = [
    {
      key: "created_at",
      header: "Дата",
      sortable: true,
      render: (row) => formatDateTime(row.created_at),
    },
    {
      key: "tenant_id",
      header: "Организация",
      render: (row) => (
        <span className="text-xs text-[var(--color-text-muted)]">{row.tenant_id.slice(0, 8)}...</span>
      ),
    },
    {
      key: "request_type",
      header: "Тип",
      render: (row) => requestTypeLabels[row.request_type] ?? row.request_type,
    },
    {
      key: "target",
      header: "Цель",
      render: (row) => (
        <span className="font-medium">{getTargetName(row)}</span>
      ),
    },
    {
      key: "message",
      header: "Комментарий",
      render: (row) => (
        <span className="max-w-[200px] truncate text-sm text-[var(--color-text-secondary)]">
          {row.message || "—"}
        </span>
      ),
    },
    {
      key: "status",
      header: "Статус",
      render: (row) => (
        <Badge variant={statusBadgeVariant[row.status]}>
          {requestStatusLabels[row.status] ?? row.status}
        </Badge>
      ),
    },
    {
      key: "actions",
      header: "Действия",
      render: (row) =>
        row.status === "pending" ? (
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="primary"
              onClick={(e) => {
                e.stopPropagation();
                onApprove(row.id);
              }}
              disabled={isReviewing}
            >
              Одобрить
            </Button>
            <Button
              size="sm"
              variant="danger"
              onClick={(e) => {
                e.stopPropagation();
                onReject(row.id);
              }}
              disabled={isReviewing}
            >
              Отклонить
            </Button>
          </div>
        ) : (
          <span className="text-sm text-[var(--color-text-muted)]">
            {row.reviewed_at ? formatDateTime(row.reviewed_at) : "—"}
          </span>
        ),
    },
  ];

  return (
    <Table
      data={requests}
      columns={columns}
      keyExtractor={(row) => row.id}
      isLoading={isLoading}
      emptyMessage="Нет заявок"
    />
  );
}
