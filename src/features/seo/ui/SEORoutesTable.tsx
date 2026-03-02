"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import {
  Pencil,
  Trash2,
  Globe,
  X,
  Map,
  Eye,
  EyeOff,
  History,
  Link2,
  Link2Off,
  FileJson,
  FileSpreadsheet,
} from "lucide-react";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button, Table, Badge, type Column, type SortDirection } from "@/shared/ui";
import { formatDate } from "@/shared/lib";
import { seoApi, seoKeys } from "../api/seoApi";
import type { SEORoute } from "@/entities/seo";

interface SEORoutesTableProps {
  routes: SEORoute[];
  isLoading: boolean;
  sortBy: string | null;
  sortDirection: SortDirection;
  onSort: (column: string, direction: SortDirection) => void;
  onEdit: (route: SEORoute) => void;
  onDelete: (route: SEORoute) => void;
}

export function SEORoutesTable({
  routes,
  isLoading,
  sortBy,
  sortDirection,
  onSort,
  onEdit,
  onDelete,
}: SEORoutesTableProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const queryClient = useQueryClient();

  const bulkUpdateMutation = useMutation({
    mutationFn: async ({
      ids,
      updates,
    }: {
      ids: string[];
      updates: { include_in_sitemap?: boolean; robots_index?: boolean; robots_follow?: boolean };
    }) => {
      const results = await Promise.allSettled(
        ids.map((id) => seoApi.updateRoute(id, updates)),
      );
      const succeeded = results.filter((r) => r.status === "fulfilled").length;
      const failed = results.filter((r) => r.status === "rejected").length;
      return { succeeded, failed, total: ids.length };
    },
    onSuccess: ({ succeeded, failed, total }) => {
      queryClient.invalidateQueries({ queryKey: seoKeys.routes() });
      setSelectedIds([]);
      if (failed === 0) {
        toast.success(`Обновлено ${succeeded} из ${total} маршрутов`);
      } else {
        toast.warning(`Обновлено ${succeeded} из ${total} маршрутов (${failed} ошибок)`);
      }
    },
    onError: () => {
      toast.error("Не удалось выполнить массовое обновление");
    },
  });

  const handleSelectRow = useCallback((id: string, selected: boolean) => {
    setSelectedIds((prev) => (selected ? [...prev, id] : prev.filter((i) => i !== id)));
  }, []);

  const handleSelectAll = useCallback(
    (selected: boolean) => {
      setSelectedIds(selected ? routes.map((r) => r.id) : []);
    },
    [routes],
  );

  const handleClearSelection = useCallback(() => {
    setSelectedIds([]);
  }, []);

  const handleBulkToggleSitemap = useCallback(
    (include: boolean) => {
      bulkUpdateMutation.mutate({ ids: selectedIds, updates: { include_in_sitemap: include } });
    },
    [selectedIds, bulkUpdateMutation],
  );

  const handleBulkToggleIndex = useCallback(
    (index: boolean) => {
      bulkUpdateMutation.mutate({ ids: selectedIds, updates: { robots_index: index } });
    },
    [selectedIds, bulkUpdateMutation],
  );

  const handleBulkToggleFollow = useCallback(
    (follow: boolean) => {
      bulkUpdateMutation.mutate({ ids: selectedIds, updates: { robots_follow: follow } });
    },
    [selectedIds, bulkUpdateMutation],
  );

  const handleExportSelected = useCallback(
    (format: "csv" | "json") => {
      const selectedRoutes = routes.filter((r) => selectedIds.includes(r.id));
      if (selectedRoutes.length === 0) return;

      const timestamp = new Date().toISOString().split("T")[0];
      const filename = `seo_routes_${timestamp}.${format}`;

      if (format === "json") {
        const blob = new Blob([JSON.stringify(selectedRoutes, null, 2)], {
          type: "application/json",
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } else {
        const headers = [
          "path",
          "locale",
          "meta_title",
          "meta_description",
          "canonical_url",
          "robots_index",
          "robots_follow",
          "include_in_sitemap",
          "sitemap_priority",
          "updated_at",
        ];
        const rows = selectedRoutes.map((r) =>
          [
            r.path,
            r.locale,
            `"${(r.meta_title || "").replace(/"/g, '""')}"`,
            `"${(r.meta_description || "").replace(/"/g, '""')}"`,
            r.canonical_url || "",
            r.robots_index ? "true" : "false",
            r.robots_follow ? "true" : "false",
            r.include_in_sitemap ? "true" : "false",
            String(r.sitemap_priority),
            r.updated_at,
          ].join(","),
        );
        const csv = [headers.join(","), ...rows].join("\n");
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }

      toast.success(`Экспортировано ${selectedRoutes.length} маршрутов`);
    },
    [routes, selectedIds],
  );

  const columns: Column<SEORoute>[] = [
    {
      key: "path",
      header: "Путь",
      render: (route) => (
        <div className="flex items-center gap-2">
          <Globe className="h-4 w-4 text-[var(--color-text-muted)]" />
          <span className="font-medium text-[var(--color-text-primary)]">{route.path}</span>
          <Badge variant="secondary">{route.locale}</Badge>
        </div>
      ),
    },
    {
      key: "meta_title",
      header: "Meta Title",
      render: (route) => (
        <p className="max-w-xs text-[var(--color-text-secondary)] line-clamp-1">
          {route.meta_title || "—"}
        </p>
      ),
    },
    {
      key: "robots",
      header: "Индексация",
      width: "120px",
      render: (route) => (
        <Badge variant={route.robots_index ? "success" : "secondary"}>
          {route.robots_index ? "Index" : "NoIndex"}
        </Badge>
      ),
    },
    {
      key: "sitemap",
      header: "Sitemap",
      width: "100px",
      render: (route) => (
        <span className="text-[var(--color-text-secondary)]">
          {route.include_in_sitemap ? `${route.sitemap_priority}` : "—"}
        </span>
      ),
    },
    {
      key: "updated_at",
      header: "Обновлен",
      width: "120px",
      sortable: true,
      render: (route) => (
        <span className="text-[var(--color-text-secondary)]">{formatDate(route.updated_at)}</span>
      ),
    },
    {
      key: "actions",
      header: "",
      width: "130px",
      render: (route) => (
        <div className="flex items-center justify-end gap-1">
          <Link
            href={`/audit?resourceType=seo_route&resourceId=${route.id}`}
            onClick={(e) => e.stopPropagation()}
            title="История изменений"
          >
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <History className="h-4 w-4" />
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(route);
            }}
            className="h-8 w-8"
            title="Редактировать"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(route);
            }}
            className="h-8 w-8 text-[var(--color-error)] hover:text-[var(--color-error)]"
            title="Удалить"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <>
      {selectedIds.length > 0 && (
        <div className="sticky top-0 z-10 flex items-center justify-between gap-4 rounded-lg border border-[var(--color-accent-primary)] bg-[var(--color-accent-primary)]/5 p-3">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-[var(--color-text-primary)]">
              Выбрано: {selectedIds.length}
            </span>
            <Button variant="ghost" size="sm" onClick={handleClearSelection}>
              <X className="h-4 w-4 mr-1" />
              Отменить
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleBulkToggleSitemap(true)}
              leftIcon={<Map className="h-4 w-4" />}
              isLoading={bulkUpdateMutation.isPending}
            >
              В Sitemap
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleBulkToggleSitemap(false)}
              leftIcon={<Map className="h-4 w-4" />}
              isLoading={bulkUpdateMutation.isPending}
            >
              Из Sitemap
            </Button>
            <div className="h-6 w-px bg-[var(--color-border)]" />
            <Button
              variant="primary"
              size="sm"
              onClick={() => handleBulkToggleIndex(true)}
              leftIcon={<Eye className="h-4 w-4" />}
              isLoading={bulkUpdateMutation.isPending}
            >
              Index
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleBulkToggleIndex(false)}
              leftIcon={<EyeOff className="h-4 w-4" />}
              isLoading={bulkUpdateMutation.isPending}
            >
              NoIndex
            </Button>
            <div className="h-6 w-px bg-[var(--color-border)]" />
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleBulkToggleFollow(true)}
              leftIcon={<Link2 className="h-4 w-4" />}
              isLoading={bulkUpdateMutation.isPending}
            >
              Follow
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleBulkToggleFollow(false)}
              leftIcon={<Link2Off className="h-4 w-4" />}
              isLoading={bulkUpdateMutation.isPending}
            >
              NoFollow
            </Button>
            <div className="h-6 w-px bg-[var(--color-border)]" />
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleExportSelected("csv")}
              leftIcon={<FileSpreadsheet className="h-4 w-4" />}
            >
              CSV
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleExportSelected("json")}
              leftIcon={<FileJson className="h-4 w-4" />}
            >
              JSON
            </Button>
          </div>
        </div>
      )}

      <Table
        data={routes}
        columns={columns}
        keyExtractor={(route) => route.id}
        isLoading={isLoading}
        emptyMessage="SEO маршруты не найдены"
        onRowClick={onEdit}
        selectedRows={selectedIds}
        onSelectRow={handleSelectRow}
        onSelectAll={handleSelectAll}
        sortBy={sortBy}
        sortDirection={sortDirection}
        onSort={onSort}
      />
    </>
  );
}
