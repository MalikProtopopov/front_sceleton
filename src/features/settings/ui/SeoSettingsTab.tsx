"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2 } from "lucide-react";
import { useTenant, useUpdateTenantSettings } from "../model/useSettings";
import { buildFullSettingsPayload } from "../lib/buildFullSettingsPayload";
import type { SitemapStaticPage } from "@/entities/tenant";
import {
  Button,
  Input,
  Select,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Switch,
  Textarea,
} from "@/shared/ui";

const CHANGEFREQ_OPTIONS = [
  { value: "always", label: "Always" },
  { value: "hourly", label: "Hourly" },
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "yearly", label: "Yearly" },
  { value: "never", label: "Never" },
];

interface SeoSettingsTabProps {
  tenantId: string;
}

export function SeoSettingsTab({ tenantId }: SeoSettingsTabProps) {
  const { data: tenant } = useTenant(tenantId);
  const { mutate: updateSettings, isPending: isUpdatingSettings } =
    useUpdateTenantSettings(tenantId);

  const [seoForm, setSeoForm] = useState({
    site_url: "",
    allowed_domains: "" as string,
    robots_txt_custom_rules: "",
    indexnow_key: "",
    indexnow_enabled: false,
    llms_txt_enabled: false,
    llms_txt_custom_content: "",
  });
  const [sitemapPages, setSitemapPages] = useState<SitemapStaticPage[]>([]);
  const [siteUrlError, setSiteUrlError] = useState<string | null>(null);

  useEffect(() => {
    if (tenant?.settings) {
      setSeoForm({
        site_url: tenant.settings.site_url || "",
        allowed_domains: tenant.settings.allowed_domains?.join(", ") || "",
        robots_txt_custom_rules:
          tenant.settings.robots_txt_custom_rules || "",
        indexnow_key: tenant.settings.indexnow_key || "",
        indexnow_enabled: tenant.settings.indexnow_enabled ?? false,
        llms_txt_enabled: tenant.settings.llms_txt_enabled ?? false,
        llms_txt_custom_content:
          tenant.settings.llms_txt_custom_content || "",
      });
      setSitemapPages(tenant.settings.sitemap_static_pages || []);
    }
  }, [tenant]);

  const handleSaveSeo = () => {
    setSiteUrlError(null);

    if (seoForm.site_url && !/^https?:\/\/.+/.test(seoForm.site_url)) {
      setSiteUrlError("URL должен начинаться с http:// или https://");
      return;
    }

    const domainsArray = seoForm.allowed_domains
      .split(",")
      .map((d) => d.trim())
      .filter(Boolean);

    const validSitemapPages = sitemapPages.filter((p) => p.path.trim());

    updateSettings({
      ...buildFullSettingsPayload(tenant?.settings),
      site_url: seoForm.site_url || null,
      allowed_domains: domainsArray.length > 0 ? domainsArray : null,
      sitemap_static_pages:
        validSitemapPages.length > 0 ? validSitemapPages : null,
      robots_txt_custom_rules: seoForm.robots_txt_custom_rules || null,
      indexnow_key: seoForm.indexnow_key || null,
      indexnow_enabled: seoForm.indexnow_enabled,
      llms_txt_enabled: seoForm.llms_txt_enabled,
      llms_txt_custom_content: seoForm.llms_txt_custom_content || null,
    });
  };

  const handleAddSitemapPage = () => {
    setSitemapPages([
      ...sitemapPages,
      { path: "/", priority: 0.5, changefreq: "weekly" },
    ]);
  };

  const handleRemoveSitemapPage = (index: number) => {
    setSitemapPages(sitemapPages.filter((_, i) => i !== index));
  };

  const handleUpdateSitemapPage = (
    index: number,
    field: keyof SitemapStaticPage,
    value: string | number,
  ) => {
    setSitemapPages(
      sitemapPages.map((page, i) =>
        i === index ? { ...page, [field]: value } : page,
      ),
    );
  };

  return (
    <div className="mt-6 space-y-6">
      {/* Site URL */}
      <Card>
        <CardHeader>
          <CardTitle>URL сайта</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            label="Базовый URL клиентского сайта"
            value={seoForm.site_url}
            onChange={(e) => {
              setSeoForm({ ...seoForm, site_url: e.target.value });
              setSiteUrlError(null);
            }}
            placeholder="https://example.com"
            error={siteUrlError || undefined}
          />
          <p className="text-xs text-[var(--color-text-muted)]">
            Используется для генерации sitemap.xml и robots.txt. Укажите полный
            URL без слэша в конце, например: https://mediann.dev
          </p>
        </CardContent>
      </Card>

      {/* Allowed Domains */}
      <Card>
        <CardHeader>
          <CardTitle>Разрешённые домены</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            label="Домены (через запятую)"
            value={seoForm.allowed_domains}
            onChange={(e) =>
              setSeoForm({ ...seoForm, allowed_domains: e.target.value })
            }
            placeholder="example.com, www.example.com"
          />
          <p className="text-xs text-[var(--color-text-muted)]">
            Список разрешённых доменов для проверки base URL. Например:
            mediann.dev, www.mediann.dev
          </p>
        </CardContent>
      </Card>

      {/* Sitemap Static Pages */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Статические страницы Sitemap</CardTitle>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleAddSitemapPage}
              leftIcon={<Plus className="h-4 w-4" />}
            >
              Добавить
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {sitemapPages.length === 0 ? (
            <p className="text-sm text-[var(--color-text-muted)]">
              Нет статических страниц. Нажмите «Добавить» чтобы указать страницы
              для sitemap.
            </p>
          ) : (
            <div className="space-y-3">
              {sitemapPages.map((page, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 rounded-lg border border-[var(--color-border)] p-3"
                >
                  <div className="grid flex-1 gap-3 md:grid-cols-3">
                    <Input
                      label="Путь"
                      value={page.path}
                      onChange={(e) =>
                        handleUpdateSitemapPage(index, "path", e.target.value)
                      }
                      placeholder="/"
                    />
                    <Input
                      label="Приоритет (0–1)"
                      type="number"
                      value={String(page.priority)}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        if (!isNaN(val) && val >= 0 && val <= 1) {
                          handleUpdateSitemapPage(index, "priority", val);
                        }
                      }}
                      placeholder="0.5"
                    />
                    <Select
                      label="Частота обновления"
                      value={page.changefreq}
                      onChange={(e) =>
                        handleUpdateSitemapPage(
                          index,
                          "changefreq",
                          e.target.value,
                        )
                      }
                      options={CHANGEFREQ_OPTIONS}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveSitemapPage(index)}
                    className="mt-7 rounded p-1.5 text-[var(--color-error)] transition-colors hover:bg-[var(--color-bg-hover)]"
                    title="Удалить"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
          <p className="text-xs text-[var(--color-text-muted)]">
            Статические страницы попадут в sitemap.xml с указанным приоритетом и
            частотой обновления.
          </p>
        </CardContent>
      </Card>

      {/* Robots.txt Custom Rules */}
      <Card>
        <CardHeader>
          <CardTitle>Robots.txt — дополнительные правила</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            label="Пользовательские правила robots.txt"
            value={seoForm.robots_txt_custom_rules}
            onChange={(e) =>
              setSeoForm({
                ...seoForm,
                robots_txt_custom_rules: e.target.value,
              })
            }
            placeholder={"User-agent: *\nAllow: /"}
            rows={6}
          />
          <p className="text-xs text-[var(--color-text-muted)]">
            Дополнительные строки, которые будут добавлены в конец robots.txt.
            Максимум 5000 символов.
          </p>
        </CardContent>
      </Card>

      {/* IndexNow */}
      <Card>
        <CardHeader>
          <CardTitle>IndexNow</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Switch
            checked={seoForm.indexnow_enabled}
            onChange={(checked) =>
              setSeoForm({ ...seoForm, indexnow_enabled: checked })
            }
            label="Включить IndexNow"
            description="Мгновенное уведомление поисковиков об обновлённых страницах"
          />
          <Input
            label="IndexNow API Key"
            value={seoForm.indexnow_key}
            onChange={(e) =>
              setSeoForm({ ...seoForm, indexnow_key: e.target.value })
            }
            placeholder="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
            disabled={!seoForm.indexnow_enabled}
          />
        </CardContent>
      </Card>

      {/* llms.txt */}
      <Card>
        <CardHeader>
          <CardTitle>llms.txt</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Switch
            checked={seoForm.llms_txt_enabled}
            onChange={(checked) =>
              setSeoForm({ ...seoForm, llms_txt_enabled: checked })
            }
            label="Включить llms.txt"
            description="Файл для AI-моделей с описанием контента сайта"
          />
          <Textarea
            label="Содержимое llms.txt"
            value={seoForm.llms_txt_custom_content}
            onChange={(e) =>
              setSeoForm({
                ...seoForm,
                llms_txt_custom_content: e.target.value,
              })
            }
            placeholder="# Site description for LLMs..."
            rows={6}
            disabled={!seoForm.llms_txt_enabled}
          />
        </CardContent>
      </Card>

      {/* Save button */}
      <div className="flex justify-end">
        <Button onClick={handleSaveSeo} isLoading={isUpdatingSettings}>
          Сохранить
        </Button>
      </div>
    </div>
  );
}
