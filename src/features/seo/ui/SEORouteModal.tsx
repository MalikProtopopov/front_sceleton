"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { Code, AlertCircle } from "lucide-react";
import { Button, Modal, ModalBody, ModalFooter, Input, Textarea, Select } from "@/shared/ui";
import { useUpsertSEORoute } from "../model/useSEO";
import type { SEORoute, CreateSEORouteDto } from "@/entities/seo";
import { SITEMAP_CHANGEFREQ_OPTIONS } from "@/entities/seo";

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
      "contactType": "customer service",
    },
  },
  breadcrumb: {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Главная",
        "item": "https://example.com",
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Раздел",
        "item": "https://example.com/section",
      },
    ],
  },
  service: {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": "Service Name",
    "description": "Service description",
    "provider": {
      "@type": "Organization",
      "name": "Company Name",
    },
    "areaServed": {
      "@type": "Country",
      "name": "Russia",
    },
  },
  article: {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "Article Title",
    "description": "Article description",
    "author": {
      "@type": "Person",
      "name": "Author Name",
    },
    "datePublished": new Date().toISOString().split("T")[0],
    "publisher": {
      "@type": "Organization",
      "name": "Company Name",
      "logo": {
        "@type": "ImageObject",
        "url": "https://example.com/logo.png",
      },
    },
  },
} as const;

type TemplateKey = keyof typeof STRUCTURED_DATA_TEMPLATES;

const INITIAL_FORM_DATA: CreateSEORouteDto = {
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
};

interface SEORouteModalProps {
  isOpen: boolean;
  onClose: () => void;
  route: SEORoute | null;
  routes: SEORoute[];
}

export function SEORouteModal({ isOpen, onClose, route, routes }: SEORouteModalProps) {
  const isCreating = !route;
  const { mutate: upsertRoute, isPending: isSaving } = useUpsertSEORoute();

  const [formData, setFormData] = useState<CreateSEORouteDto>(INITIAL_FORM_DATA);
  const [jsonError, setJsonError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    if (route) {
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
    } else {
      setFormData(INITIAL_FORM_DATA);
    }
    setJsonError(null);
  }, [isOpen, route]);

  const conflictingRoute = useMemo(() => {
    if (!routes || !formData.path || !formData.locale) return null;

    const existing = routes.find(
      (r) => r.path === formData.path && r.locale === formData.locale,
    );

    if (existing && route && existing.id === route.id) {
      return null;
    }

    return existing || null;
  }, [routes, formData.path, formData.locale, route]);

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

  const handleStructuredDataChange = useCallback(
    (value: string) => {
      setFormData((prev) => ({ ...prev, structured_data: value }));
      setJsonError(validateJson(value));
    },
    [validateJson],
  );

  const handleTemplateSelect = useCallback((templateKey: string) => {
    if (!templateKey) return;
    const template = STRUCTURED_DATA_TEMPLATES[templateKey as TemplateKey];
    if (template) {
      const jsonString = JSON.stringify(template, null, 2);
      setFormData((prev) => ({ ...prev, structured_data: jsonString }));
      setJsonError(null);
    }
  }, []);

  const handleFormatJson = useCallback(() => {
    if (!formData.structured_data) return;
    try {
      const parsed = JSON.parse(formData.structured_data);
      const formatted = JSON.stringify(parsed, null, 2);
      setFormData((prev) => ({ ...prev, structured_data: formatted }));
      setJsonError(null);
    } catch {
      // Keep current value if invalid
    }
  }, [formData.structured_data]);

  const handleSave = () => {
    const error = validateJson(formData.structured_data || "");
    if (error) {
      setJsonError(error);
      return;
    }
    upsertRoute(formData);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
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
                      <li>
                        <span className="text-[var(--color-text-muted)]">Meta Title:</span>{" "}
                        {conflictingRoute.meta_title || "—"}
                      </li>
                      <li>
                        <span className="text-[var(--color-text-muted)]">Canonical:</span>{" "}
                        {conflictingRoute.canonical_url || "—"}
                      </li>
                      <li>
                        <span className="text-[var(--color-text-muted)]">Robots:</span>{" "}
                        {conflictingRoute.robots_index ? "Index" : "NoIndex"},{" "}
                        {conflictingRoute.robots_follow ? "Follow" : "NoFollow"}
                      </li>
                      <li>
                        <span className="text-[var(--color-text-muted)]">Sitemap:</span>{" "}
                        {conflictingRoute.include_in_sitemap ? "Да" : "Нет"}
                      </li>
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
              onChange={(e) =>
                setFormData({ ...formData, robots_follow: e.target.value === "true" })
              }
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
              onChange={(e) =>
                setFormData({ ...formData, include_in_sitemap: e.target.value === "true" })
              }
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
                <p className="mb-2 text-xs font-medium uppercase text-[var(--color-text-muted)]">
                  Предпросмотр
                </p>
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
        <Button variant="secondary" onClick={onClose}>
          Отмена
        </Button>
        <Button onClick={handleSave} isLoading={isSaving}>
          Сохранить
        </Button>
      </ModalFooter>
    </Modal>
  );
}
