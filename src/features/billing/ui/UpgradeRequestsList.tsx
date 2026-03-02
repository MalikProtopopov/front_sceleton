"use client";

import { Badge, Table } from "@/shared/ui";
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

const columns: Column<UpgradeRequest>[] = [
  {
    key: "created_at",
    header: "Дата",
    sortable: true,
    render: (row) => formatDateTime(row.created_at),
  },
  {
    key: "request_type",
    header: "Тип",
    render: (row) => requestTypeLabels[row.request_type] ?? row.request_type,
  },
  {
    key: "target",
    header: "Что запрошено",
    render: (row) => (
      <span className="font-medium">{getTargetName(row)}</span>
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
    key: "reviewed_at",
    header: "Рассмотрена",
    render: (row) => (row.reviewed_at ? formatDateTime(row.reviewed_at) : "—"),
  },
];

interface UpgradeRequestsListProps {
  requests: UpgradeRequest[];
  isLoading?: boolean;
}

export function UpgradeRequestsList({ requests, isLoading }: UpgradeRequestsListProps) {
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
