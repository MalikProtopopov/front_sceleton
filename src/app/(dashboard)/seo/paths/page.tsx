"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Plus, Download } from "lucide-react";
import { useSEORoutes, useDeleteSEORoute } from "@/features/seo";
import { SEORouteFilters, SEORoutesTable, SEORouteModal } from "@/features/seo/ui";
import { Button, ConfirmModal } from "@/shared/ui";
import { downloadExport } from "@/shared/lib";
import type { SortDirection } from "@/shared/ui";
import type { SEORoute, SEORouteFilterParams } from "@/entities/seo";

export default function SEORoutesPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [selectedRoute, setSelectedRoute] = useState<SEORoute | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const [filters, setFilters] = useState<SEORouteFilterParams>(() => ({
    locale: searchParams.get("locale") || undefined,
    include_in_sitemap:
      searchParams.get("sitemap") === "true"
        ? true
        : searchParams.get("sitemap") === "false"
          ? false
          : undefined,
    robots_index:
      searchParams.get("index") === "true"
        ? true
        : searchParams.get("index") === "false"
          ? false
          : undefined,
    robots_follow:
      searchParams.get("follow") === "true"
        ? true
        : searchParams.get("follow") === "false"
          ? false
          : undefined,
  }));
  const [searchTerm, setSearchTerm] = useState(() => searchParams.get("search") || "");

  const [sortBy, setSortBy] = useState<string | null>(() => searchParams.get("sortBy") || null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(() => {
    const dir = searchParams.get("sortDir");
    return dir === "asc" || dir === "desc" ? dir : null;
  });

  const { data: routes, isLoading } = useSEORoutes();
  const { mutate: deleteRoute, isPending: isDeleting } = useDeleteSEORoute();

  useEffect(() => {
    const params = new URLSearchParams();
    if (searchTerm) params.set("search", searchTerm);
    if (filters.locale) params.set("locale", filters.locale);
    if (filters.include_in_sitemap !== undefined)
      params.set("sitemap", String(filters.include_in_sitemap));
    if (filters.robots_index !== undefined) params.set("index", String(filters.robots_index));
    if (filters.robots_follow !== undefined) params.set("follow", String(filters.robots_follow));
    if (sortBy) params.set("sortBy", sortBy);
    if (sortDirection) params.set("sortDir", sortDirection);

    const newUrl = params.toString() ? `?${params.toString()}` : window.location.pathname;
    router.replace(newUrl, { scroll: false });
  }, [filters, searchTerm, sortBy, sortDirection, router]);

  const filteredRoutes = useMemo(() => {
    if (!routes) return [];

    let result = routes.filter((route) => {
      if (searchTerm && !route.path.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      if (filters.locale && route.locale !== filters.locale) {
        return false;
      }
      if (
        filters.include_in_sitemap !== undefined &&
        route.include_in_sitemap !== filters.include_in_sitemap
      ) {
        return false;
      }
      if (filters.robots_index !== undefined && route.robots_index !== filters.robots_index) {
        return false;
      }
      if (filters.robots_follow !== undefined && route.robots_follow !== filters.robots_follow) {
        return false;
      }
      return true;
    });

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

  const handleEditClick = (route: SEORoute) => {
    setSelectedRoute(route);
    setEditModalOpen(true);
  };

  const handleCreateClick = () => {
    setSelectedRoute(null);
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

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await downloadExport("seo_routes", "csv");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">SEO Маршруты</h1>
          <p className="text-[var(--color-text-secondary)]">Управление мета-тегами страниц</p>
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
          <Button onClick={handleCreateClick} leftIcon={<Plus className="h-4 w-4" />}>
            Добавить маршрут
          </Button>
        </div>
      </div>

      <SEORouteFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        filters={filters}
        onFiltersChange={setFilters}
        onReset={handleResetFilters}
      />

      <SEORoutesTable
        routes={filteredRoutes}
        isLoading={isLoading}
        sortBy={sortBy}
        sortDirection={sortDirection}
        onSort={handleSort}
        onEdit={handleEditClick}
        onDelete={handleDeleteClick}
      />

      <SEORouteModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        route={selectedRoute}
        routes={routes || []}
      />

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
