"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, Globe, Download, Code, AlertCircle, Search, X, Map, Eye, EyeOff, History, Link2, Link2Off, FileJson, FileSpreadsheet } from "lucide-react";
import Link from "next/link";
import { useSEORoutes, useDeleteSEORoute, useUpsertSEORoute, seoApi, seoKeys } from "@/features/seo";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button, Table, Badge, ConfirmModal, Modal, ModalBody, ModalFooter, Input, Textarea, Select, FilterBar, type Column, type SortDirection } from "@/shared/ui";
import { formatDate, downloadExport } from "@/shared/lib";
import type { SEORoute, CreateSEORouteDto, SEORouteFilterParams } from "@/entities/seo";
import { SITEMAP_CHANGEFREQ_OPTIONS } from "@/entities/seo";

// JSON-LD Templates
const STRUCTURED_DATA_TEMPLATES = {
  organization: {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Company Name",
    "url": "https://example.com",
    "logo": "https://example.com/logo.png",
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+7-xxx-xxx-xx-xx",
      "contactType": "customer service"
    }
  },
  breadcrumb: {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Главная",
        "item": "https://example.com"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Раздел",
        "item": "https://example.com/section"
      }
    ]
  },
  service: {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": "Service Name",
    "description": "Service description",
    "provider": {
      "@type": "Organization",
      "name": "Company Name"
    },
    "areaServed": {
      "@type": "Country",
      "name": "Russia"
    }
  },
  article: {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "Article Title",
    "description": "Article description",
    "author": {
      "@type": "Person",
      "name": "Author Name"
    },
    "datePublished": new Date().toISOString().split("T")[0],
    "publisher": {
      "@type": "Organization",
      "name": "Company Name",
      "logo": {
        "@type": "ImageObject",
        "url": "https://example.com/logo.png"
      }
    }
  }
} as const;

type TemplateKey = keyof typeof STRUCTURED_DATA_TEMPLATES;

export default function SEORoutesPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [selectedRoute, setSelectedRoute] = useState<SEORoute | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [jsonError, setJsonError] = useState<string | null>(null);

  // Initialize filters from URL params
  const [filters, setFilters] = useState<SEORouteFilterParams>(() => ({
    locale: searchParams.get("locale") || undefined,
    include_in_sitemap: searchParams.get("sitemap") === "true" ? true : 
                        searchParams.get("sitemap") === "false" ? false : undefined,
    robots_index: searchParams.get("index") === "true" ? true : 
                  searchParams.get("index") === "false" ? false : undefined,
    robots_follow: searchParams.get("follow") === "true" ? true : 
                   searchParams.get("follow") === "false" ? false : undefined,
  }));
  const [searchTerm, setSearchTerm] = useState(() => searchParams.get("search") || "");

  // Sorting state
  const [sortBy, setSortBy] = useState<string | null>(() => searchParams.get("sortBy") || null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(() => {
    const dir = searchParams.get("sortDir");
    return dir === "asc" || dir === "desc" ? dir : null;
  });

  // Multi-select state for bulk operations
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const queryClient = useQueryClient();
  const { data: routes, isLoading } = useSEORoutes();

  // Sync filters to URL
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchTerm) params.set("search", searchTerm);
    if (filters.locale) params.set("locale", filters.locale);
    if (filters.include_in_sitemap !== undefined) params.set("sitemap", String(filters.include_in_sitemap));
    if (filters.robots_index !== undefined) params.set("index", String(filters.robots_index));
    if (filters.robots_follow !== undefined) params.set("follow", String(filters.robots_follow));
    if (sortBy) params.set("sortBy", sortBy);
    if (sortDirection) params.set("sortDir", sortDirection);
    
    const newUrl = params.toString() ? `?${params.toString()}` : window.location.pathname;
    router.replace(newUrl, { scroll: false });
  }, [filters, searchTerm, sortBy, sortDirection, router]);

  // Bulk update mutation
  const bulkUpdateMutation = useMutation({
    mutationFn: async ({ ids, updates }: { ids: string[]; updates: { include_in_sitemap?: boolean; robots_index?: boolean; robots_follow?: boolean } }) => {
      const results = await Promise.allSettled(
        ids.map(id => seoApi.updateRoute(id, updates))
      );
      const succeeded = results.filter(r => r.status === "fulfilled").length;
      const failed = results.filter(r => r.status === "rejected").length;
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

  // Client-side filtering and sorting (API returns all routes)
  const filteredRoutes = useMemo(() => {
    if (!routes) return [];
    
    let result = routes.filter((route) => {
      // Search by path
      if (searchTerm && !route.path.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      // Filter by locale
      if (filters.locale && route.locale !== filters.locale) {
        return false;
      }
      // Filter by include_in_sitemap
      if (filters.include_in_sitemap !== undefined && route.include_in_sitemap !== filters.include_in_sitemap) {
        return false;
      }
      // Filter by robots_index
      if (filters.robots_index !== undefined && route.robots_index !== filters.robots_index) {
        return false;
      }
      // Filter by robots_follow
      if (filters.robots_follow !== undefined && route.robots_follow !== filters.robots_follow) {
        return false;
      }
      return true;
    });

    // Apply sorting
    if (sortBy && sortDirection) {
      result = [...result].sort((a, b) => {
        let aVal: string | number | boolean = "";
        let bVal: string | number | boolean = "";
        
        if (sortBy === "updated_at") {
          aVal = new Date(a.updated_at).getTime();
          bVal = new Date(b.updated_at).getTime();
        } else if (sortBy === "path") {
          aVal = a.path.toLowerCase();
          bVal = b.path.toLowerCase();
        }
        
        if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
        if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [routes, searchTerm, filters, sortBy, sortDirection]);

  // Selection handlers
  const handleSelectRow = useCallback((id: string, selected: boolean) => {
    setSelectedIds(prev => selected ? [...prev, id] : prev.filter(i => i !== id));
  }, []);

  const handleSelectAll = useCallback((selected: boolean) => {
    setSelectedIds(selected ? filteredRoutes.map(r => r.id) : []);
  }, [filteredRoutes]);

  const handleClearSelection = useCallback(() => {
    setSelectedIds([]);
  }, []);

  // Bulk action handlers
  const handleBulkToggleSitemap = useCallback((include: boolean) => {
    bulkUpdateMutation.mutate({ ids: selectedIds, updates: { include_in_sitemap: include } });
  }, [selectedIds, bulkUpdateMutation]);

  const handleBulkToggleIndex = useCallback((index: boolean) => {
    bulkUpdateMutation.mutate({ ids: selectedIds, updates: { robots_index: index } });
  }, [selectedIds, bulkUpdateMutation]);

  const handleBulkToggleFollow = useCallback((follow: boolean) => {
    bulkUpdateMutation.mutate({ ids: selectedIds, updates: { robots_follow: follow } });
  }, [selectedIds, bulkUpdateMutation]);

  // Export selected items
  const handleExportSelected = useCallback((format: "csv" | "json") => {
    const selectedRoutes = routes?.filter(r => selectedIds.includes(r.id)) || [];
    if (selectedRoutes.length === 0) return;

    const timestamp = new Date().toISOString().split("T")[0];
    const filename = `seo_routes_${timestamp}.${format}`;

    if (format === "json") {
      const blob = new Blob([JSON.stringify(selectedRoutes, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } else {
      const headers = ["path", "locale", "meta_title", "meta_description", "canonical_url", "robots_index", "robots_follow", "include_in_sitemap", "sitemap_priority", "updated_at"];
      const rows = selectedRoutes.map(r => [
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
      ].join(","));
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
  }, [routes, selectedIds]);

  // Sorting handler
  const handleSort = useCallback((column: string, direction: SortDirection) => {
    setSortBy(direction ? column : null);
    setSortDirection(direction);
  }, []);

  const handleResetFilters = () => {
    setFilters({});
    setSearchTerm("");
    setSortBy(null);
    setSortDirection(null);
  };
  const { mutate: deleteRoute, isPending: isDeleting } = useDeleteSEORoute();
  const { mutate: upsertRoute, isPending: isSaving } = useUpsertSEORoute();

  const [formData, setFormData] = useState<CreateSEORouteDto>({
    path: "",
    locale: "ru",
    title: "",
    meta_title: "",
    meta_description: "",
    meta_keywords: "",
    og_image: "",
    canonical_url: "",
    robots_index: true,
    robots_follow: true,
    sitemap_priority: undefined,
    sitemap_changefreq: "weekly",
    include_in_sitemap: true,
    structured_data: "",
  });

  // Check for conflicting route (same path + locale)
  const conflictingRoute = useMemo(() => {
    if (!routes || !formData.path || !formData.locale) return null;
    
    const existing = routes.find(
      (route) => route.path === formData.path && route.locale === formData.locale
    );
    
    // If editing existing route, don't show conflict for the same route
    if (existing && selectedRoute && existing.id === selectedRoute.id) {
      return null;
    }
    
    return existing || null;
  }, [routes, formData.path, formData.locale, selectedRoute]);

  // Validate JSON and return error message or null
  const validateJson = useCallback((value: string): string | null => {
    if (!value || value.trim() === "") return null;
    try {
      JSON.parse(value);
      return null;
    } catch (e) {
      if (e instanceof SyntaxError) {
        return `Невалидный JSON: ${e.message}`;
      }
      return "Невалидный JSON";
    }
  }, []);

  // Handle structured_data change with validation
  const handleStructuredDataChange = useCallback((value: string) => {
    setFormData(prev => ({ ...prev, structured_data: value }));
    setJsonError(validateJson(value));
  }, [validateJson]);

  // Apply JSON-LD template
  const handleTemplateSelect = useCallback((templateKey: string) => {
    if (!templateKey) return;
    const template = STRUCTURED_DATA_TEMPLATES[templateKey as TemplateKey];
    if (template) {
      const jsonString = JSON.stringify(template, null, 2);
      setFormData(prev => ({ ...prev, structured_data: jsonString }));
      setJsonError(null);
    }
  }, []);

  // Format JSON in textarea
  const handleFormatJson = useCallback(() => {
    if (!formData.structured_data) return;
    try {
      const parsed = JSON.parse(formData.structured_data);
      const formatted = JSON.stringify(parsed, null, 2);
      setFormData(prev => ({ ...prev, structured_data: formatted }));
      setJsonError(null);
    } catch {
      // Keep current value if invalid
    }
  }, [formData.structured_data]);

  const handleEditClick = (route: SEORoute) => {
    setSelectedRoute(route);
    setFormData({
      path: route.path,
      locale: route.locale,
      title: route.title || "",
      meta_title: route.meta_title || "",
      meta_description: route.meta_description || "",
      meta_keywords: route.meta_keywords || "",
      og_image: route.og_image || "",
      canonical_url: route.canonical_url || "",
      robots_index: route.robots_index,
      robots_follow: route.robots_follow,
      sitemap_priority: route.sitemap_priority ?? undefined,
      sitemap_changefreq: route.sitemap_changefreq || "weekly",
      include_in_sitemap: route.include_in_sitemap,
      structured_data: route.structured_data || "",
    });
    setJsonError(null);
    setIsCreating(false);
    setEditModalOpen(true);
  };

  const handleCreateClick = () => {
    setSelectedRoute(null);
    setFormData({
      path: "",
      locale: "ru",
      title: "",
      meta_title: "",
      meta_description: "",
      meta_keywords: "",
      og_image: "",
      canonical_url: "",
      robots_index: true,
      robots_follow: true,
      sitemap_priority: undefined,
      sitemap_changefreq: "weekly",
      include_in_sitemap: true,
      structured_data: "",
    });
    setJsonError(null);
    setIsCreating(true);
    setEditModalOpen(true);
  };

  const handleDeleteClick = (route: SEORoute) => {
    setSelectedRoute(route);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (selectedRoute) {
      deleteRoute(selectedRoute.id);
      setDeleteModalOpen(false);
      setSelectedRoute(null);
    }
  };

  const handleSave = () => {
    // Validate JSON before saving
    const error = validateJson(formData.structured_data || "");
    if (error) {
      setJsonError(error);
      return;
    }
    upsertRoute(formData);
    setEditModalOpen(false);
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await downloadExport("seo_routes", "csv");
    } finally {
      setIsExporting(false);
    }
  };

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
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
            >
              <History className="h-4 w-4" />
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              handleEditClick(route);
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
              handleDeleteClick(route);
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">SEO Маршруты</h1>
          <p className="text-[var(--color-text-secondary)]">
            Управление мета-тегами страниц
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            onClick={handleExport}
            isLoading={isExporting}
            leftIcon={<Download className="h-4 w-4" />}
          >
            Экспорт CSV
          </Button>
          <Button
            onClick={handleCreateClick}
            leftIcon={<Plus className="h-4 w-4" />}
          >
            Добавить маршрут
          </Button>
        </div>
      </div>

      {/* Filters */}
      <FilterBar onReset={handleResetFilters}>
        <Input
          label="Поиск по пути"
          type="search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="/about, /services..."
          className="w-48"
          leftIcon={<Search className="h-4 w-4" />}
        />
        <Select
          label="Локаль"
          value={filters.locale || ""}
          onChange={(e) => setFilters({ ...filters, locale: e.target.value || undefined })}
          options={[
            { value: "", label: "Все" },
            { value: "ru", label: "Русский" },
            { value: "en", label: "English" },
          ]}
        />
        <Select
          label="Sitemap"
          value={filters.include_in_sitemap === undefined ? "" : String(filters.include_in_sitemap)}
          onChange={(e) => setFilters({ 
            ...filters, 
            include_in_sitemap: e.target.value === "" ? undefined : e.target.value === "true" 
          })}
          options={[
            { value: "", label: "Все" },
            { value: "true", label: "Включен" },
            { value: "false", label: "Выключен" },
          ]}
        />
        <Select
          label="Индексация"
          value={filters.robots_index === undefined ? "" : String(filters.robots_index)}
          onChange={(e) => setFilters({ 
            ...filters, 
            robots_index: e.target.value === "" ? undefined : e.target.value === "true" 
          })}
          options={[
            { value: "", label: "Все" },
            { value: "true", label: "Index" },
            { value: "false", label: "NoIndex" },
          ]}
        />
        <Select
          label="Ссылки"
          value={filters.robots_follow === undefined ? "" : String(filters.robots_follow)}
          onChange={(e) => setFilters({ 
            ...filters, 
            robots_follow: e.target.value === "" ? undefined : e.target.value === "true" 
          })}
          options={[
            { value: "", label: "Все" },
            { value: "true", label: "Follow" },
            { value: "false", label: "NoFollow" },
          ]}
        />
      </FilterBar>

      {/* Bulk Actions Toolbar */}
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

      {/* Table */}
      <Table
        data={filteredRoutes}
        columns={columns}
        keyExtractor={(route) => route.id}
        isLoading={isLoading}
        emptyMessage="SEO маршруты не найдены"
        onRowClick={handleEditClick}
        selectedRows={selectedIds}
        onSelectRow={handleSelectRow}
        onSelectAll={handleSelectAll}
        sortBy={sortBy}
        sortDirection={sortDirection}
        onSort={handleSort}
      />

      {/* Edit/Create Modal */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title={isCreating ? "Новый SEO маршрут" : "Редактировать SEO маршрут"}
        size="xl"
      >
        <ModalBody>
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <Input
                label="URL путь"
                value={formData.path}
                onChange={(e) => setFormData({ ...formData, path: e.target.value })}
                placeholder="/about"
                required
              />
              <Select
                label="Локаль"
                value={formData.locale}
                onChange={(e) => setFormData({ ...formData, locale: e.target.value })}
                options={[
                  { value: "ru", label: "Русский" },
                  { value: "en", label: "English" },
                ]}
              />
            </div>

            {/* Conflict Warning */}
            {conflictingRoute && (
              <div className="rounded-lg border border-[var(--color-warning)]/30 bg-[var(--color-warning)]/5 p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 flex-shrink-0 text-[var(--color-warning)]" />
                  <div className="space-y-2">
                    <p className="font-medium text-[var(--color-warning)]">
                      Маршрут с этим путём и локалью уже существует
                    </p>
                    <p className="text-sm text-[var(--color-text-secondary)]">
                      При сохранении существующий маршрут будет перезаписан.
                    </p>
                    <div className="mt-3 rounded-md border border-[var(--color-border)] bg-[var(--color-bg-primary)] p-3 text-sm">
                      <p className="text-[var(--color-text-muted)]">Текущие значения:</p>
                      <ul className="mt-2 space-y-1 text-[var(--color-text-secondary)]">
                        <li><span className="text-[var(--color-text-muted)]">Meta Title:</span> {conflictingRoute.meta_title || "—"}</li>
                        <li><span className="text-[var(--color-text-muted)]">Canonical:</span> {conflictingRoute.canonical_url || "—"}</li>
                        <li><span className="text-[var(--color-text-muted)]">Robots:</span> {conflictingRoute.robots_index ? "Index" : "NoIndex"}, {conflictingRoute.robots_follow ? "Follow" : "NoFollow"}</li>
                        <li><span className="text-[var(--color-text-muted)]">Sitemap:</span> {conflictingRoute.include_in_sitemap ? "Да" : "Нет"}</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <h3 className="font-medium text-[var(--color-text-primary)]">Meta теги</h3>
              <Input
                label="Title"
                value={formData.title || ""}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Заголовок страницы"
              />
              <Input
                label="Meta Title"
                value={formData.meta_title || ""}
                onChange={(e) => setFormData({ ...formData, meta_title: e.target.value })}
                placeholder="SEO заголовок (до 60 символов)"
              />
              <Textarea
                label="Meta Description"
                value={formData.meta_description || ""}
                onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
                placeholder="SEO описание (до 160 символов)"
                className="min-h-[80px]"
              />
              <Input
                label="Meta Keywords"
                value={formData.meta_keywords || ""}
                onChange={(e) => setFormData({ ...formData, meta_keywords: e.target.value })}
                placeholder="ключевые, слова, через, запятую"
              />
            </div>

            <div className="space-y-4">
              <h3 className="font-medium text-[var(--color-text-primary)]">Open Graph</h3>
              <Input
                label="OG Image URL"
                value={formData.og_image || ""}
                onChange={(e) => setFormData({ ...formData, og_image: e.target.value })}
                placeholder="https://..."
              />
              <Input
                label="Canonical URL"
                value={formData.canonical_url || ""}
                onChange={(e) => setFormData({ ...formData, canonical_url: e.target.value })}
                placeholder="https://..."
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Select
                label="Индексация"
                value={String(formData.robots_index)}
                onChange={(e) => setFormData({ ...formData, robots_index: e.target.value === "true" })}
                options={[
                  { value: "true", label: "Index (разрешить)" },
                  { value: "false", label: "NoIndex (запретить)" },
                ]}
              />
              <Select
                label="Следование ссылкам"
                value={String(formData.robots_follow)}
                onChange={(e) => setFormData({ ...formData, robots_follow: e.target.value === "true" })}
                options={[
                  { value: "true", label: "Follow (разрешить)" },
                  { value: "false", label: "NoFollow (запретить)" },
                ]}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <Select
                label="В Sitemap"
                value={String(formData.include_in_sitemap)}
                onChange={(e) => setFormData({ ...formData, include_in_sitemap: e.target.value === "true" })}
                options={[
                  { value: "true", label: "Да" },
                  { value: "false", label: "Нет" },
                ]}
              />
              <Input
                label="Приоритет"
                type="number"
                step="0.1"
                min="0"
                max="1"
                value={formData.sitemap_priority ?? ""}
                onChange={(e) => {
                  const val = e.target.value;
                  setFormData({
                    ...formData,
                    sitemap_priority: val === "" ? undefined : parseFloat(val),
                  });
                }}
                placeholder="0.5"
              />
              <Select
                label="Частота обновления"
                value={formData.sitemap_changefreq || "weekly"}
                onChange={(e) => setFormData({ ...formData, sitemap_changefreq: e.target.value })}
                options={SITEMAP_CHANGEFREQ_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
              />
            </div>

            {/* Structured Data (JSON-LD) */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="flex items-center gap-2 font-medium text-[var(--color-text-primary)]">
                  <Code className="h-4 w-4" />
                  Structured Data (JSON-LD)
                </h3>
                <div className="flex items-center gap-2">
                  <Select
                    value=""
                    onChange={(e) => handleTemplateSelect(e.target.value)}
                    options={[
                      { value: "", label: "Шаблон..." },
                      { value: "organization", label: "Organization" },
                      { value: "breadcrumb", label: "BreadcrumbList" },
                      { value: "service", label: "Service" },
                      { value: "article", label: "Article" },
                    ]}
                    className="w-40"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleFormatJson}
                    disabled={!formData.structured_data}
                  >
                    Форматировать
                  </Button>
                </div>
              </div>
              
              <Textarea
                value={formData.structured_data || ""}
                onChange={(e) => handleStructuredDataChange(e.target.value)}
                placeholder='{"@context": "https://schema.org", "@type": "Organization", ...}'
                className="min-h-[200px] font-mono text-sm"
                error={jsonError || undefined}
              />
              
              {jsonError && (
                <div className="flex items-center gap-2 rounded-lg border border-[var(--color-error)]/30 bg-[var(--color-error)]/5 p-3 text-sm text-[var(--color-error)]">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  <span>{jsonError}</span>
                </div>
              )}

              {formData.structured_data && !jsonError && (
                <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-3">
                  <p className="mb-2 text-xs font-medium uppercase text-[var(--color-text-muted)]">Предпросмотр</p>
                  <pre className="overflow-x-auto text-xs text-[var(--color-text-secondary)]">
                    {(() => {
                      try {
                        return JSON.stringify(JSON.parse(formData.structured_data), null, 2);
                      } catch {
                        return formData.structured_data;
                      }
                    })()}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </ModalBody>

        <ModalFooter>
          <Button variant="secondary" onClick={() => setEditModalOpen(false)}>
            Отмена
          </Button>
          <Button onClick={handleSave} isLoading={isSaving}>
            Сохранить
          </Button>
        </ModalFooter>
      </Modal>

      {/* Delete confirmation modal */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Удалить SEO маршрут?"
        description={`Вы уверены, что хотите удалить SEO настройки для "${selectedRoute?.path}"?`}
        confirmText="Удалить"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
}
