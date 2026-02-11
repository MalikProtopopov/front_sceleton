"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, ArrowUpDown, ChevronRight } from "lucide-react";
import { Badge, Button, Input, Pagination, Select, Spinner } from "@/shared/ui";
import { ROUTES } from "@/shared/config";
import { usePlatformTenants } from "../model/usePlatform";
import type { TenantTableParams, TenantRow } from "@/entities/platform";

function timeAgo(dateStr: string | null): string {
  if (!dateStr) return "—";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}м назад`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}ч назад`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}д назад`;
  const months = Math.floor(days / 30);
  return `${months}мес назад`;
}

function daysSince(dateStr: string | null): number {
  if (!dateStr) return 999;
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
}

function getRowBorder(row: TenantRow): string {
  if (!row.is_active) return "opacity-60";
  if (row.inquiries_new > 0) return "border-l-4 border-[var(--color-error)]";
  if (daysSince(row.last_login_at) > 14) return "border-l-4 border-[var(--color-warning)]";
  return "";
}

const SORT_OPTIONS = [
  { value: "created_at", label: "По дате создания" },
  { value: "name", label: "По названию" },
  { value: "users_count", label: "По кол-ву пользователей" },
  { value: "content_count", label: "По кол-ву контента" },
  { value: "inquiries_total", label: "По кол-ву заявок" },
  { value: "last_login_at", label: "По последнему входу" },
  { value: "enabled_features_count", label: "По модулям" },
];

export function PlatformTenantsTable() {
  const router = useRouter();
  const [params, setParams] = useState<TenantTableParams>({
    page: 1,
    per_page: 25,
    sort_by: "created_at",
    sort_dir: "desc",
  });
  const [searchInput, setSearchInput] = useState("");
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { data, isLoading } = usePlatformTenants(params);

  const updateParams = (partial: Partial<TenantTableParams>) => {
    setParams((prev) => ({ ...prev, ...partial, page: partial.page || 1 }));
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchInput(value);
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => {
      updateParams({ search: value || undefined });
    }, 300);
  };

  const toggleSortDir = () => {
    updateParams({ sort_dir: params.sort_dir === "asc" ? "desc" : "asc" });
  };

  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-primary)]">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 border-b border-[var(--color-border)] p-4">
        <Input
          placeholder="Поиск по названию, slug, домену..."
          value={searchInput}
          onChange={handleSearchChange}
          leftIcon={<Search className="h-4 w-4" />}
          className="w-72"
        />
        <Select
          label=""
          value={params.sort_by || "created_at"}
          onChange={(e) => updateParams({ sort_by: e.target.value })}
          options={SORT_OPTIONS}
          className="w-56"
        />
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleSortDir}
          title={params.sort_dir === "asc" ? "По возрастанию" : "По убыванию"}
        >
          <ArrowUpDown className="h-4 w-4" />
          {params.sort_dir === "asc" ? "↑" : "↓"}
        </Button>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex min-h-[300px] items-center justify-center">
          <Spinner size="lg" />
        </div>
      ) : !data || data.items.length === 0 ? (
        <div className="flex min-h-[200px] items-center justify-center text-[var(--color-text-muted)]">
          Нет организаций
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--color-border)] text-left text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
                  <th className="px-4 py-3 min-w-[200px]">Организация</th>
                  <th className="px-4 py-3 w-20">Статус</th>
                  <th className="px-4 py-3 w-20">Польз.</th>
                  <th className="px-4 py-3 w-24">Контент</th>
                  <th className="px-4 py-3 w-28">Заявки</th>
                  <th className="px-4 py-3 w-20">Новые</th>
                  <th className="px-4 py-3 w-28">Посл. вход</th>
                  <th className="px-4 py-3 w-24">Модули</th>
                  <th className="px-4 py-3 w-14"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)]">
                {data.items.map((row) => (
                  <tr
                    key={row.id}
                    onClick={() => router.push(ROUTES.PLATFORM_TENANT_DETAIL(row.id))}
                    className={`cursor-pointer transition-colors hover:bg-[var(--color-bg-hover)] ${getRowBorder(row)}`}
                  >
                    <td className="px-4 py-3">
                      <div className="font-medium text-[var(--color-text-primary)]">{row.name}</div>
                      <div className="text-xs text-[var(--color-text-muted)]">{row.slug}</div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={row.is_active ? "success" : "error"}>
                        {row.is_active ? "Актив" : "Выкл"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-sm text-[var(--color-text-secondary)]">
                      {row.active_users_count}/{row.users_count}
                    </td>
                    <td className="px-4 py-3 text-sm text-[var(--color-text-secondary)]">
                      {row.content_count}
                    </td>
                    <td className="px-4 py-3 text-sm text-[var(--color-text-secondary)]">
                      {row.inquiries_total}
                      <span className="text-xs text-[var(--color-text-muted)]"> / {row.inquiries_this_month} мес</span>
                    </td>
                    <td className="px-4 py-3">
                      {row.inquiries_new > 0 ? (
                        <Badge variant="error">{row.inquiries_new}</Badge>
                      ) : (
                        <span className="text-sm text-[var(--color-text-muted)]">0</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-[var(--color-text-secondary)]">
                      {timeAgo(row.last_login_at)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-16 overflow-hidden rounded-full bg-[var(--color-bg-secondary)]">
                          <div
                            className="h-full rounded-full bg-[var(--color-accent-primary)]"
                            style={{ width: `${Math.round((row.enabled_features_count / 9) * 100)}%` }}
                          />
                        </div>
                        <span className="text-xs text-[var(--color-text-muted)]">
                          {row.enabled_features_count}/9
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <ChevronRight className="h-4 w-4 text-[var(--color-text-muted)]" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {data.pages > 1 && (
            <div className="border-t border-[var(--color-border)] p-4">
              <Pagination
                page={params.page || 1}
                pageSize={params.per_page || 25}
                total={data.total}
                onPageChange={(page) => updateParams({ page })}
                showPageSize={false}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}
