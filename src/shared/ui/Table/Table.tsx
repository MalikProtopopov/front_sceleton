"use client";

import { useState } from "react";
import { ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";
import { cn } from "@/shared/lib";
import { Spinner } from "../Spinner";
import { SkeletonTableRow } from "../Skeleton";

export type SortDirection = "asc" | "desc" | null;

export interface Column<T> {
  key: string;
  header: string;
  sortable?: boolean;
  width?: string;
  render?: (row: T, index: number) => React.ReactNode;
}

export interface TableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyExtractor: (row: T) => string;
  isLoading?: boolean;
  emptyMessage?: string;
  sortBy?: string | null;
  sortDirection?: SortDirection;
  onSort?: (column: string, direction: SortDirection) => void;
  onRowClick?: (row: T) => void;
  selectedRows?: string[];
  onSelectRow?: (id: string, selected: boolean) => void;
  onSelectAll?: (selected: boolean) => void;
  className?: string;
}

export function Table<T extends object>({
  data,
  columns,
  keyExtractor,
  isLoading = false,
  emptyMessage = "Нет данных",
  sortBy = null,
  sortDirection = null,
  onSort,
  onRowClick,
  selectedRows = [],
  onSelectRow,
  onSelectAll,
  className,
}: TableProps<T>) {
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);

  const handleSort = (column: Column<T>) => {
    if (!column.sortable || !onSort) return;

    let newDirection: SortDirection = "asc";
    if (sortBy === column.key) {
      if (sortDirection === "asc") {
        newDirection = "desc";
      } else if (sortDirection === "desc") {
        newDirection = null;
      }
    }
    onSort(column.key, newDirection);
  };

  const allSelected = data.length > 0 && selectedRows.length === data.length;
  const someSelected = selectedRows.length > 0 && selectedRows.length < data.length;

  return (
    <div className={cn("overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-bg-primary)]", className)}>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[var(--color-border)] bg-[var(--color-bg-secondary)]">
              {onSelectRow && (
                <th className="w-12 px-4 py-3">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    ref={(el) => {
                      if (el) el.indeterminate = someSelected;
                    }}
                    onChange={(e) => onSelectAll?.(e.target.checked)}
                    className="h-4 w-4 appearance-none rounded border-[var(--color-border)] bg-[var(--color-bg-primary)] accent-[var(--color-accent-primary)] checked:bg-[var(--color-accent-primary)]"
                  />
                </th>
              )}
              {columns.map((column) => (
                <th
                  key={column.key}
                  style={{ width: column.width }}
                  className={cn(
                    "px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary)]",
                    column.sortable && "cursor-pointer select-none hover:text-[var(--color-text-primary)]",
                  )}
                  onClick={() => handleSort(column)}
                >
                  <div className="flex items-center gap-2">
                    {column.header}
                    {column.sortable && (
                      <span className="flex-shrink-0">
                        {sortBy === column.key ? (
                          sortDirection === "asc" ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : sortDirection === "desc" ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronsUpDown className="h-4 w-4 opacity-50" />
                          )
                        ) : (
                          <ChevronsUpDown className="h-4 w-4 opacity-50" />
                        )}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              // Loading skeleton
              Array.from({ length: 5 }).map((_, i) => (
                <SkeletonTableRow key={i} columns={columns.length + (onSelectRow ? 1 : 0)} />
              ))
            ) : data.length === 0 ? (
              // Empty state
              <tr>
                <td
                  colSpan={columns.length + (onSelectRow ? 1 : 0)}
                  className="px-4 py-12 text-center"
                >
                  <div className="flex flex-col items-center gap-2">
                    <p className="text-[var(--color-text-muted)]">{emptyMessage}</p>
                  </div>
                </td>
              </tr>
            ) : (
              // Data rows
              data.map((row, index) => {
                const id = keyExtractor(row);
                const isSelected = selectedRows.includes(id);
                const isHovered = hoveredRow === id;

                return (
                  <tr
                    key={id}
                    className={cn(
                      "border-b border-[var(--color-border)] transition-colors last:border-b-0",
                      onRowClick && "cursor-pointer",
                      isSelected
                        ? "bg-[var(--color-accent-primary)]/5"
                        : isHovered
                        ? "bg-[var(--color-bg-hover)]"
                        : "",
                    )}
                    onClick={() => onRowClick?.(row)}
                    onMouseEnter={() => setHoveredRow(id)}
                    onMouseLeave={() => setHoveredRow(null)}
                  >
                    {onSelectRow && (
                      <td className="w-12 px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => onSelectRow(id, e.target.checked)}
                          className="h-4 w-4 appearance-none rounded border-[var(--color-border)] bg-[var(--color-bg-primary)] accent-[var(--color-accent-primary)] checked:bg-[var(--color-accent-primary)]"
                        />
                      </td>
                    )}
                    {columns.map((column) => (
                      <td
                        key={column.key}
                        className="px-4 py-3 text-sm text-[var(--color-text-primary)]"
                      >
                        {column.render
                          ? column.render(row, index)
                          : ((row as Record<string, unknown>)[column.key] as React.ReactNode)}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Simple loading overlay variant
export function TableLoadingOverlay({ isLoading }: { isLoading: boolean }) {
  if (!isLoading) return null;

  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center bg-[var(--color-bg-primary)]/50">
      <Spinner size="lg" />
    </div>
  );
}

