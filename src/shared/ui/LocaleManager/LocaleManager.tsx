"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, Globe } from "lucide-react";
import { cn } from "@/shared/lib";
import { canDeleteLocale, getAvailableLocalesForCreation } from "@/shared/lib/localeErrors";
import { Button } from "../Button";
import { Select } from "../Select";
import { Modal, ConfirmModal } from "../Modal";
import { Card, CardHeader, CardTitle, CardContent } from "../Card";
import { Badge } from "../Badge";

// ============================================================================
// TYPES
// ============================================================================

/**
 * Supported locales configuration
 */
export interface LocaleConfig {
  value: string;
  label: string;
}

/**
 * Base locale interface - extend this for specific entity locales
 */
export interface BaseLocale {
  id?: string;
  locale: string;
}

/**
 * Field configuration for locale form
 */
export interface LocaleFieldConfig {
  name: string;
  label: string;
  type: "text" | "textarea" | "richtext";
  required?: boolean;
  placeholder?: string;
  maxLength?: number;
  helpText?: string;
}

/**
 * LocaleManager component props
 */
export interface LocaleManagerProps<T extends BaseLocale> {
  /** List of existing locales */
  locales: T[];
  /** Supported locales configuration */
  supportedLocales: LocaleConfig[];
  /** Whether the resource is in edit mode (locales can be managed only in edit mode) */
  isEditing: boolean;
  /** Callback when a new locale is created */
  onCreateLocale: (data: Omit<T, "id">) => Promise<void>;
  /** Callback when a locale is updated */
  onUpdateLocale: (localeId: string, data: Partial<T>) => Promise<void>;
  /** Callback when a locale is deleted */
  onDeleteLocale: (localeId: string) => Promise<void>;
  /** Loading states */
  isCreating?: boolean;
  isUpdating?: boolean;
  isDeleting?: boolean;
  /** Custom render for locale form */
  renderLocaleForm: (props: LocaleFormRenderProps<T>) => React.ReactNode;
  /** Get display title for a locale */
  getLocaleDisplayTitle?: (locale: T) => string;
  /** Additional class name */
  className?: string;
}

export interface LocaleFormRenderProps<T extends BaseLocale> {
  locale: T | null;
  selectedLang: string;
  onSubmit: (data: Omit<T, "id">) => void;
  onCancel: () => void;
  isLoading: boolean;
  isEditing: boolean;
}

// ============================================================================
// LOCALE MANAGER COMPONENT
// ============================================================================

export function LocaleManager<T extends BaseLocale>({
  locales,
  supportedLocales,
  isEditing,
  onCreateLocale,
  onUpdateLocale,
  onDeleteLocale,
  isCreating = false,
  isUpdating = false,
  isDeleting = false,
  renderLocaleForm,
  getLocaleDisplayTitle,
  className,
}: LocaleManagerProps<T>) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedLang, setSelectedLang] = useState("");
  const [editingLocale, setEditingLocale] = useState<T | null>(null);
  const [deletingLocale, setDeletingLocale] = useState<T | null>(null);

  // Get existing locale codes
  const existingLocaleCodes = locales.map((l) => l.locale);

  // Get available locales for creation
  const availableLocales = getAvailableLocalesForCreation(
    supportedLocales.map((l) => l.value),
    existingLocaleCodes
  );

  // Check if locale can be deleted
  const canDelete = canDeleteLocale(locales.length);

  // Get locale label by code
  const getLocaleLabel = (code: string) => {
    return supportedLocales.find((l) => l.value === code)?.label || code.toUpperCase();
  };

  // Handlers
  const handleOpenCreateModal = (langCode: string) => {
    setSelectedLang(langCode);
    setShowCreateModal(true);
  };

  const handleCloseCreateModal = () => {
    setShowCreateModal(false);
    setSelectedLang("");
  };

  const handleCreateSubmit = async (data: Omit<T, "id">) => {
    await onCreateLocale(data);
    handleCloseCreateModal();
  };

  const handleOpenEditModal = (locale: T) => {
    setEditingLocale(locale);
  };

  const handleCloseEditModal = () => {
    setEditingLocale(null);
  };

  const handleUpdateSubmit = async (data: Omit<T, "id">) => {
    if (!editingLocale?.id) return;
    await onUpdateLocale(editingLocale.id, data as Partial<T>);
    handleCloseEditModal();
  };

  const handleDeleteConfirm = async () => {
    if (!deletingLocale?.id) return;
    await onDeleteLocale(deletingLocale.id);
    setDeletingLocale(null);
  };

  // Don't render in create mode
  if (!isEditing) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Локализации
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-[var(--color-text-muted)]">
            Сохраните запись, чтобы управлять локализациями
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className={className}>
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Локализации
            </CardTitle>
            {availableLocales.length > 0 && (
              <Select
                value=""
                onChange={(e) => {
                  if (e.target.value) {
                    handleOpenCreateModal(e.target.value);
                  }
                }}
                options={[
                  { value: "", label: "Добавить язык" },
                  ...availableLocales.map((code) => ({
                    value: code,
                    label: getLocaleLabel(code),
                  })),
                ]}
                minWidth="180px"
              />
            )}
          </div>
        </CardHeader>
        <CardContent>
          {locales.length === 0 ? (
            <div className="py-8 text-center">
              <Globe className="mx-auto h-12 w-12 text-[var(--color-text-muted)] opacity-50" />
              <p className="mt-2 text-sm text-[var(--color-text-muted)]">
                Нет локализаций. Добавьте первую локаль.
              </p>
              {availableLocales[0] && (
                <Button
                  variant="secondary"
                  size="sm"
                  className="mt-4"
                  onClick={() => handleOpenCreateModal(availableLocales[0] as string)}
                >
                  <Plus className="mr-1 h-4 w-4" />
                  Добавить локаль
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {locales.map((locale) => (
                <div
                  key={locale.id || locale.locale}
                  className={cn(
                    "flex items-center justify-between gap-4",
                    "rounded-lg border border-[var(--color-border)]",
                    "bg-[var(--color-bg-secondary)]",
                    "p-4"
                  )}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Badge variant="outline" className="flex-shrink-0 font-medium">
                      {locale.locale.toUpperCase()}
                    </Badge>
                    <div className="min-w-0">
                      <div className="font-medium text-[var(--color-text-primary)] truncate">
                        {getLocaleDisplayTitle
                          ? getLocaleDisplayTitle(locale)
                          : (locale as unknown as { title?: string }).title || getLocaleLabel(locale.locale)}
                      </div>
                      <div className="text-sm text-[var(--color-text-muted)]">
                        {getLocaleLabel(locale.locale)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleOpenEditModal(locale)}
                      className="h-8 w-8"
                      title="Редактировать"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeletingLocale(locale)}
                      disabled={!canDelete}
                      className={cn(
                        "h-8 w-8",
                        canDelete && "hover:text-[var(--color-error)]"
                      )}
                      title={canDelete ? "Удалить" : "Нельзя удалить последнюю локаль"}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!canDelete && locales.length > 0 && (
            <p className="mt-4 text-xs text-[var(--color-text-muted)]">
              Должна остаться хотя бы одна локализация
            </p>
          )}
        </CardContent>
      </Card>

      {/* Create Locale Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={handleCloseCreateModal}
        title={`Добавить локаль: ${getLocaleLabel(selectedLang)}`}
        size="lg"
      >
        {renderLocaleForm({
          locale: null,
          selectedLang,
          onSubmit: handleCreateSubmit,
          onCancel: handleCloseCreateModal,
          isLoading: isCreating,
          isEditing: false,
        })}
      </Modal>

      {/* Edit Locale Modal */}
      <Modal
        isOpen={!!editingLocale}
        onClose={handleCloseEditModal}
        title={`Редактировать локаль: ${editingLocale ? getLocaleLabel(editingLocale.locale) : ""}`}
        size="lg"
      >
        {editingLocale &&
          renderLocaleForm({
            locale: editingLocale,
            selectedLang: editingLocale.locale,
            onSubmit: handleUpdateSubmit,
            onCancel: handleCloseEditModal,
            isLoading: isUpdating,
            isEditing: true,
          })}
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deletingLocale}
        onClose={() => setDeletingLocale(null)}
        onConfirm={handleDeleteConfirm}
        title="Удалить локаль?"
        description={`Вы уверены, что хотите удалить локаль "${deletingLocale ? getLocaleLabel(deletingLocale.locale) : ""}"? Это действие нельзя отменить.`}
        confirmText="Удалить"
        variant="danger"
        isLoading={isDeleting}
      />
    </>
  );
}

