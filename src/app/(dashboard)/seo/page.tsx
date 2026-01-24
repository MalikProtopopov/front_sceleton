"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, Globe, Download } from "lucide-react";
import { useSEORoutes, useDeleteSEORoute, useUpsertSEORoute } from "@/features/seo";
import { Button, Table, Badge, ConfirmModal, Modal, ModalBody, ModalFooter, Input, Textarea, Select, type Column } from "@/shared/ui";
import { formatDate, downloadExport } from "@/shared/lib";
import type { SEORoute, CreateSEORouteDto } from "@/entities/seo";
import { SITEMAP_CHANGEFREQ_OPTIONS } from "@/entities/seo";

export default function SEORoutesPage() {
  const [selectedRoute, setSelectedRoute] = useState<SEORoute | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const { data: routes, isLoading } = useSEORoutes();
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
  });

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
    });
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
    });
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
      render: (route) => (
        <span className="text-[var(--color-text-secondary)]">{formatDate(route.updated_at)}</span>
      ),
    },
    {
      key: "actions",
      header: "",
      width: "100px",
      render: (route) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              handleEditClick(route);
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
              handleDeleteClick(route);
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

      {/* Table */}
      <Table
        data={routes || []}
        columns={columns}
        keyExtractor={(route) => route.id}
        isLoading={isLoading}
        emptyMessage="SEO маршруты не найдены"
        onRowClick={handleEditClick}
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
