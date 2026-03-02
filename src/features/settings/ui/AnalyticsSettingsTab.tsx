"use client";

import { useState, useEffect } from "react";
import { ImageIcon, Info } from "lucide-react";
import { useTenant, useUpdateTenantSettings } from "../model/useSettings";
import { buildFullSettingsPayload } from "../lib/buildFullSettingsPayload";
import { MediaPickerModal } from "@/features/media";
import { getFileContentUrl } from "@/shared/lib";
import type { UpdateTenantSettingsDto } from "@/entities/tenant";
import {
  Button,
  Input,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/shared/ui";

interface AnalyticsSettingsTabProps {
  tenantId: string;
}

export function AnalyticsSettingsTab({ tenantId }: AnalyticsSettingsTabProps) {
  const { data: tenant } = useTenant(tenantId);
  const { mutate: updateSettings, isPending: isUpdatingSettings } =
    useUpdateTenantSettings(tenantId);

  const [analyticsForm, setAnalyticsForm] = useState<UpdateTenantSettingsDto>({
    ga_tracking_id: "",
    ym_counter_id: "",
    default_og_image: "",
    yandex_verification_code: "",
    google_verification_code: "",
    google_verification_meta: "",
  });
  const [webmasterErrors, setWebmasterErrors] = useState<{
    yandex?: string;
    google_code?: string;
  }>({});
  const [ogImagePickerOpen, setOgImagePickerOpen] = useState(false);

  useEffect(() => {
    if (tenant?.settings) {
      setAnalyticsForm({
        ga_tracking_id: tenant.settings.ga_tracking_id || "",
        ym_counter_id: tenant.settings.ym_counter_id || "",
        default_og_image: tenant.settings.default_og_image || "",
        yandex_verification_code:
          tenant.settings.yandex_verification_code || "",
        google_verification_code:
          tenant.settings.google_verification_code || "",
        google_verification_meta:
          tenant.settings.google_verification_meta || "",
      });
    }
  }, [tenant]);

  const handleSaveAnalytics = () => {
    setWebmasterErrors({});
    const errors: { yandex?: string; google_code?: string } = {};

    if (
      analyticsForm.yandex_verification_code &&
      !/^yandex_[a-f0-9]+$/.test(analyticsForm.yandex_verification_code)
    ) {
      errors.yandex =
        "Формат: yandex_[hex], например: yandex_821edd51f146c052";
    }

    if (
      analyticsForm.google_verification_code &&
      !/^google[a-f0-9]+$/.test(analyticsForm.google_verification_code)
    ) {
      errors.google_code =
        "Формат: google[hex], например: google1234567890abcdef";
    }

    if (Object.keys(errors).length > 0) {
      setWebmasterErrors(errors);
      return;
    }

    updateSettings({
      ...buildFullSettingsPayload(tenant?.settings),
      ...analyticsForm,
      yandex_verification_code:
        analyticsForm.yandex_verification_code || null,
      google_verification_code:
        analyticsForm.google_verification_code || null,
      google_verification_meta:
        analyticsForm.google_verification_meta || null,
    });
  };

  return (
    <div className="mt-6 space-y-6">
      {/* Analytics Counters */}
      <Card>
        <CardHeader>
          <CardTitle>Настройки аналитики</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            label="Google Analytics ID"
            value={analyticsForm.ga_tracking_id || ""}
            onChange={(e) =>
              setAnalyticsForm({
                ...analyticsForm,
                ga_tracking_id: e.target.value,
              })
            }
            placeholder="G-XXXXXXXXXX"
          />
          <Input
            label="Yandex Metrika ID"
            value={analyticsForm.ym_counter_id || ""}
            onChange={(e) =>
              setAnalyticsForm({
                ...analyticsForm,
                ym_counter_id: e.target.value,
              })
            }
            placeholder="12345678"
          />
          <div>
            <label className="mb-2 block text-sm font-medium text-[var(--color-text-secondary)]">
              OG-изображение по умолчанию
            </label>
            <div className="flex gap-2">
              <Input
                value={analyticsForm.default_og_image || ""}
                onChange={(e) =>
                  setAnalyticsForm({
                    ...analyticsForm,
                    default_og_image: e.target.value,
                  })
                }
                placeholder="https://..."
                className="flex-1"
              />
              <Button
                type="button"
                variant="secondary"
                onClick={() => setOgImagePickerOpen(true)}
              >
                <ImageIcon className="mr-2 h-4 w-4" />
                Выбрать
              </Button>
            </div>
            <p className="mt-2 flex items-start gap-1.5 text-xs text-[var(--color-text-muted)]">
              <Info className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
              <span>
                Превью-изображение, которое отображается при публикации ссылки на
                ваш сайт в социальных сетях и мессенджерах (Telegram, Facebook,
                Twitter и др.). Рекомендуемый размер: 1200x630px.
              </span>
            </p>
            {analyticsForm.default_og_image && (
              <div className="mt-3 rounded-lg border border-[var(--color-border)] p-2">
                <img
                  src={analyticsForm.default_og_image}
                  alt="OG Preview"
                  className="h-32 w-auto object-contain mx-auto rounded"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              </div>
            )}
          </div>

          <MediaPickerModal
            isOpen={ogImagePickerOpen}
            onClose={() => setOgImagePickerOpen(false)}
            onSelect={(file) => {
              setAnalyticsForm({
                ...analyticsForm,
                default_og_image: getFileContentUrl(file),
              });
              setOgImagePickerOpen(false);
            }}
            imagesOnly
            title="Выбрать OG-изображение"
          />
        </CardContent>
      </Card>

      {/* Webmaster Verification */}
      <Card>
        <CardHeader>
          <CardTitle>Верификация в поисковых системах</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-[var(--color-text-muted)]">
            Подтвердите владение сайтом для поисковых систем. Коды можно получить
            в Яндекс.Вебмастере или Google Search Console.
          </p>

          <Input
            label="Яндекс.Вебмастер"
            value={analyticsForm.yandex_verification_code || ""}
            onChange={(e) => {
              setAnalyticsForm({
                ...analyticsForm,
                yandex_verification_code: e.target.value,
              });
              if (webmasterErrors.yandex)
                setWebmasterErrors((prev) => ({
                  ...prev,
                  yandex: undefined,
                }));
            }}
            placeholder="yandex_821edd51f146c052"
            hint="Название файла без расширения .html"
            error={webmasterErrors.yandex}
            maxLength={255}
          />

          <Input
            label="Google Search Console (файл)"
            value={analyticsForm.google_verification_code || ""}
            onChange={(e) => {
              setAnalyticsForm({
                ...analyticsForm,
                google_verification_code: e.target.value,
              });
              if (webmasterErrors.google_code)
                setWebmasterErrors((prev) => ({
                  ...prev,
                  google_code: undefined,
                }));
            }}
            placeholder="google1234567890abcdef"
            hint="Название файла без расширения .html"
            error={webmasterErrors.google_code}
            maxLength={255}
          />

          <Input
            label="Google Search Console (мета-тег)"
            value={analyticsForm.google_verification_meta || ""}
            onChange={(e) =>
              setAnalyticsForm({
                ...analyticsForm,
                google_verification_meta: e.target.value,
              })
            }
            placeholder="1234567890abcdef1234567890abcdef"
            hint="Значение атрибута content из мета-тега (альтернатива файлу)"
            maxLength={500}
          />

          <details className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-secondary)]">
            <summary className="cursor-pointer select-none px-4 py-3 text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]">
              <span className="ml-1">Как получить код верификации?</span>
            </summary>
            <div className="space-y-4 border-t border-[var(--color-border)] px-4 py-3 text-sm text-[var(--color-text-muted)]">
              <div>
                <p className="mb-1 font-medium text-[var(--color-text-secondary)]">
                  Яндекс.Вебмастер:
                </p>
                <ol className="list-decimal space-y-0.5 pl-5">
                  <li>
                    Откройте{" "}
                    <a
                      href="https://webmaster.yandex.ru/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[var(--color-accent-primary)] hover:underline"
                    >
                      webmaster.yandex.ru
                    </a>
                  </li>
                  <li>Добавьте ваш сайт</li>
                  <li>Выберите способ подтверждения «HTML-файл»</li>
                  <li>
                    Скопируйте название файла (например,{" "}
                    <code className="rounded bg-[var(--color-bg-tertiary)] px-1 py-0.5 text-xs">
                      yandex_821edd51f146c052.html
                    </code>
                    )
                  </li>
                  <li>
                    Уберите{" "}
                    <code className="rounded bg-[var(--color-bg-tertiary)] px-1 py-0.5 text-xs">
                      .html
                    </code>{" "}
                    и вставьте в поле выше
                  </li>
                </ol>
              </div>
              <div>
                <p className="mb-1 font-medium text-[var(--color-text-secondary)]">
                  Google Search Console (файл):
                </p>
                <ol className="list-decimal space-y-0.5 pl-5">
                  <li>
                    Откройте{" "}
                    <a
                      href="https://search.google.com/search-console"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[var(--color-accent-primary)] hover:underline"
                    >
                      Google Search Console
                    </a>
                  </li>
                  <li>Добавьте ресурс</li>
                  <li>Выберите «HTML-файл»</li>
                  <li>Скачайте файл и посмотрите его название</li>
                  <li>
                    Уберите{" "}
                    <code className="rounded bg-[var(--color-bg-tertiary)] px-1 py-0.5 text-xs">
                      .html
                    </code>{" "}
                    и вставьте в поле
                  </li>
                </ol>
              </div>
              <div>
                <p className="mb-1 font-medium text-[var(--color-text-secondary)]">
                  Google Search Console (мета-тег):
                </p>
                <ol className="list-decimal space-y-0.5 pl-5">
                  <li>
                    Откройте{" "}
                    <a
                      href="https://search.google.com/search-console"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[var(--color-accent-primary)] hover:underline"
                    >
                      Google Search Console
                    </a>
                  </li>
                  <li>Добавьте ресурс</li>
                  <li>Выберите «HTML-тег»</li>
                  <li>
                    Скопируйте значение из{" "}
                    <code className="rounded bg-[var(--color-bg-tertiary)] px-1 py-0.5 text-xs">
                      content=&quot;...&quot;
                    </code>
                  </li>
                  <li>Вставьте в поле</li>
                </ol>
              </div>
            </div>
          </details>
        </CardContent>
      </Card>

      {/* Save button */}
      <div className="flex justify-end">
        <Button onClick={handleSaveAnalytics} isLoading={isUpdatingSettings}>
          Сохранить
        </Button>
      </div>
    </div>
  );
}
