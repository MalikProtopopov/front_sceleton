"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, ArrowRight, ExternalLink, Search } from "lucide-react";
import { useRedirects, useDeleteRedirect, useCreateRedirect, useUpdateRedirect, useToggleRedirect } from "@/features/seo";
import { Button, Table, Pagination, Badge, ConfirmModal, Modal, ModalBody, ModalFooter, Input, Select, FilterBar, type Column, type SortDirection } from "@/shared/ui";
import type { SEORedirect, CreateRedirectDto, RedirectFilterParams } from "@/entities/seo";
import { REDIRECT_TYPE_OPTIONS } from "@/entities/seo";
import { formatDate } from "@/shared/lib";

export default function RedirectsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Initialize filters from URL params
  const [filters, setFilters] = useState<RedirectFilterParams>(() => ({
    page: parseInt(searchParams.get("page") || "1"),
    pageSize: parseInt(searchParams.get("pageSize") || "20"),
    isActive: searchParams.get("active") === "true" ? true : 
              searchParams.get("active") === "false" ? false : undefined,
    redirect_type: searchParams.get("type") ? parseInt(searchParams.get("type")!) : undefined,
  }));
  const [searchTerm, setSearchTerm] = useState(() => searchParams.get("search") || "");
  
  // Sorting state
  const [sortBy, setSortBy] = useState<string | null>(() => searchParams.get("sortBy") || null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(() => {
    const dir = searchParams.get("sortDir");
    return dir === "asc" || dir === "desc" ? dir : null;
  });

  const [selectedRedirect, setSelectedRedirect] = useState<SEORedirect | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  // Sync filters to URL
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchTerm) params.set("search", searchTerm);
    if (filters.page && filters.page > 1) params.set("page", String(filters.page));
    if (filters.pageSize && filters.pageSize !== 20) params.set("pageSize", String(filters.pageSize));
    if (filters.isActive !== undefined) params.set("active", String(filters.isActive));
    if (filters.redirect_type !== undefined) params.set("type", String(filters.redirect_type));
    if (sortBy) params.set("sortBy", sortBy);
    if (sortDirection) params.set("sortDir", sortDirection);
    
    const newUrl = params.toString() ? `?${params.toString()}` : window.location.pathname;
    router.replace(newUrl, { scroll: false });
  }, [filters, searchTerm, sortBy, sortDirection, router]);

  const { data, isLoading } = useRedirects(filters);

  // Sorting handler
  const handleSort = useCallback((column: string, direction: SortDirection) => {
    setSortBy(direction ? column : null);
    setSortDirection(direction);
  }, []);

  // Client-side filtering and sorting
  const filteredRedirects = useMemo(() => {
    if (!data?.items) return [];
    
    let result = data.items.filter((redirect) => {
      // Search by source_path
      if (searchTerm && !redirect.source_path.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      // Filter by redirect_type (client-side since API may not support it)
      if (filters.redirect_type !== undefined && redirect.redirect_type !== filters.redirect_type) {
        return false;
      }
      return true;
    });

    // Apply sorting
    if (sortBy && sortDirection) {
      result = [...result].sort((a, b) => {
        let aVal: string | number = "";
        let bVal: string | number = "";
        
        if (sortBy === "hit_count") {
          aVal = a.hit_count;
          bVal = b.hit_count;
        } else if (sortBy === "updated_at") {
          aVal = new Date(a.updated_at).getTime();
          bVal = new Date(b.updated_at).getTime();
        }
        
        if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
        if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [data?.items, searchTerm, filters.redirect_type, sortBy, sortDirection]);

  const handleResetFilters = () => {
    setFilters({ page: 1, pageSize: 20 });
    setSearchTerm("");
    setSortBy(null);
    setSortDirection(null);
  };
  const { mutate: deleteRedirect, isPending: isDeleting } = useDeleteRedirect();
  const { mutate: createRedirect, isPending: isCreating2 } = useCreateRedirect();
  const { mutate: updateRedirect, isPending: isUpdating } = useUpdateRedirect(selectedRedirect?.id || "");
  const { mutate: toggleRedirect } = useToggleRedirect();

  const [formData, setFormData] = useState<CreateRedirectDto>({
    source_path: "",
    target_url: "",
    redirect_type: 301,
    is_active: true,
  });

  const handleFiltersChange = (newFilters: Partial<RedirectFilterParams>) => {
    setFilters((prev) => ({
      ...prev,
      ...newFilters,
      page: newFilters.page || 1,
    }));
  };

  const handleEditClick = (redirect: SEORedirect) => {
    setSelectedRedirect(redirect);
    setFormData({
      source_path: redirect.source_path,
      target_url: redirect.target_url,
      redirect_type: redirect.redirect_type,
      is_active: redirect.is_active,
    });
    setIsCreating(false);
    setEditModalOpen(true);
  };

  const handleCreateClick = () => {
    setSelectedRedirect(null);
    setFormData({
      source_path: "",
      target_url: "",
      redirect_type: 301,
      is_active: true,
    });
    setIsCreating(true);
    setEditModalOpen(true);
  };

  const handleDeleteClick = (redirect: SEORedirect) => {
    setSelectedRedirect(redirect);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (selectedRedirect) {
      deleteRedirect(selectedRedirect.id);
      setDeleteModalOpen(false);
      setSelectedRedirect(null);
    }
  };

  const handleSave = () => {
    if (isCreating) {
      createRedirect(formData);
    } else if (selectedRedirect) {
      updateRedirect(formData);
    }
    setEditModalOpen(false);
  };

  const handleToggle = (redirect: SEORedirect) => {
    toggleRedirect({ id: redirect.id, isActive: !redirect.is_active });
  };

  const columns: Column<SEORedirect>[] = [
    {
      key: "source",
      header: "Источник",
      render: (redirect) => (
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm text-[var(--color-text-primary)]">{redirect.source_path}</span>
        </div>
      ),
    },
    {
      key: "target",
      header: "Цель",
      render: (redirect) => (
        <div className="flex items-center gap-2">
          <ArrowRight className="h-4 w-4 text-[var(--color-text-muted)]" />
          <a 
            href={redirect.target_url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-[var(--color-accent-primary)] hover:underline max-w-xs truncate"
            onClick={(e) => e.stopPropagation()}
          >
            {redirect.target_url}
          </a>
          <ExternalLink className="h-3 w-3 text-[var(--color-text-muted)]" />
        </div>
      ),
    },
    {
      key: "type",
      header: "Тип",
      width: "100px",
      render: (redirect) => (
        <Badge variant="secondary">{redirect.redirect_type}</Badge>
      ),
    },
    {
      key: "hit_count",
      header: "Хиты",
      width: "80px",
      sortable: true,
      render: (redirect) => (
        <span className="text-[var(--color-text-secondary)]">{redirect.hit_count}</span>
      ),
    },
    {
      key: "updated_at",
      header: "Обновлен",
      width: "110px",
      sortable: true,
      render: (redirect) => (
        <span className="text-[var(--color-text-secondary)]">{formatDate(redirect.updated_at)}</span>
      ),
    },
    {
      key: "is_active",
      header: "Статус",
      width: "100px",
      render: (redirect) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            handleToggle(redirect);
          }}
        >
          <Badge variant={redirect.is_active ? "success" : "secondary"}>
            {redirect.is_active ? "Активен" : "Выключен"}
          </Badge>
        </Button>
      ),
    },
    {
      key: "actions",
      header: "",
      width: "100px",
      render: (redirect) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              handleEditClick(redirect);
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
              handleDeleteClick(redirect);
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
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Редиректы</h1>
          <p className="text-[var(--color-text-secondary)]">
            Управление перенаправлениями URL
          </p>
        </div>
        <Button
          onClick={handleCreateClick}
          leftIcon={<Plus className="h-4 w-4" />}
        >
          Добавить редирект
        </Button>
      </div>

      {/* Filters */}
      <FilterBar onReset={handleResetFilters}>
        <Input
          label="Поиск по пути"
          type="search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="/old-page..."
          className="w-48"
          leftIcon={<Search className="h-4 w-4" />}
        />
        <Select
          label="Тип"
          value={filters.redirect_type === undefined ? "" : String(filters.redirect_type)}
          onChange={(e) => 
            handleFiltersChange({ 
              redirect_type: e.target.value === "" ? undefined : parseInt(e.target.value) 
            })
          }
          options={[
            { value: "", label: "Все" },
            ...REDIRECT_TYPE_OPTIONS.map((o) => ({ value: String(o.value), label: o.label })),
          ]}
        />
        <Select
          label="Статус"
          value={filters.isActive === undefined ? "" : String(filters.isActive)}
          onChange={(e) => 
            handleFiltersChange({ 
              isActive: e.target.value === "" ? undefined : e.target.value === "true" 
            })
          }
          options={[
            { value: "", label: "Все" },
            { value: "true", label: "Активные" },
            { value: "false", label: "Выключенные" },
          ]}
        />
      </FilterBar>

      {/* Table */}
      <Table
        data={filteredRedirects}
        columns={columns}
        keyExtractor={(redirect) => redirect.id}
        isLoading={isLoading}
        emptyMessage="Редиректы не найдены"
        onRowClick={handleEditClick}
        sortBy={sortBy}
        sortDirection={sortDirection}
        onSort={handleSort}
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

      {/* Edit/Create Modal */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title={isCreating ? "Новый редирект" : "Редактировать редирект"}
        size="lg"
      >
        <ModalBody>
          <div className="space-y-4">
            <Input
              label="Исходный путь"
              value={formData.source_path}
              onChange={(e) => setFormData({ ...formData, source_path: e.target.value })}
              placeholder="/old-page"
              required
            />
            <Input
              label="Целевой URL"
              value={formData.target_url}
              onChange={(e) => setFormData({ ...formData, target_url: e.target.value })}
              placeholder="https://example.com/new-page"
              required
            />
            <div className="grid gap-4 md:grid-cols-2">
              <Select
                label="Тип редиректа"
                value={String(formData.redirect_type)}
                onChange={(e) => setFormData({ ...formData, redirect_type: parseInt(e.target.value) })}
                options={REDIRECT_TYPE_OPTIONS.map((o) => ({ value: String(o.value), label: o.label }))}
              />
              <Select
                label="Статус"
                value={String(formData.is_active)}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.value === "true" })}
                options={[
                  { value: "true", label: "Активен" },
                  { value: "false", label: "Выключен" },
                ]}
              />
            </div>
          </div>
        </ModalBody>

        <ModalFooter>
          <Button variant="secondary" onClick={() => setEditModalOpen(false)}>
            Отмена
          </Button>
          <Button onClick={handleSave} isLoading={isCreating2 || isUpdating}>
            {isCreating ? "Создать" : "Сохранить"}
          </Button>
        </ModalFooter>
      </Modal>

      {/* Delete confirmation modal */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Удалить редирект?"
        description={`Вы уверены, что хотите удалить редирект с "${selectedRedirect?.source_path}"?`}
        confirmText="Удалить"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
}

