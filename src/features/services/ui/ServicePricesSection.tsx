"use client";

import { useState, useEffect } from "react";
import { Pencil, Trash2, Plus, X } from "lucide-react";
import {
  Button,
  Input,
  Select,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Modal,
  ModalBody,
  ModalFooter,
  ConfirmModal,
} from "@/shared/ui";
import {
  useAddServicePrice,
  useUpdateServicePrice,
  useDeleteServicePrice,
  useAddServiceTag,
  useDeleteServiceTag,
} from "../model/useServices";
import type {
  Service,
  ServicePrice,
  ServiceTag,
  ServiceCurrency,
} from "@/entities/service";

const SUPPORTED_LOCALES = [
  { value: "ru", label: "Русский" },
  { value: "en", label: "English" },
];

const SUPPORTED_CURRENCIES: { value: ServiceCurrency; label: string }[] = [
  { value: "RUB", label: "RUB" },
  { value: "USD", label: "USD" },
];

// =============================================
// Price Modal
// =============================================
interface PriceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { locale: string; price: number; currency: ServiceCurrency }) => void;
  price?: ServicePrice | null;
  isLoading?: boolean;
  existingLocales: string[];
}

function PriceModal({ isOpen, onClose, onSubmit, price, isLoading, existingLocales }: PriceModalProps) {
  const [locale, setLocale] = useState(price?.locale || existingLocales[0] || "ru");
  const [priceValue, setPriceValue] = useState(price?.price?.toString() || "");
  const [currency, setCurrency] = useState<ServiceCurrency>(price?.currency || "RUB");
  const [error, setError] = useState("");

  useEffect(() => {
    if (price) {
      setLocale(price.locale);
      setPriceValue(price.price?.toString() || "");
      setCurrency(price.currency || "RUB");
      setError("");
    } else {
      setLocale(existingLocales[0] || "ru");
      setPriceValue("");
      setCurrency("RUB");
      setError("");
    }
  }, [price, existingLocales]);

  const handleSubmit = () => {
    const numValue = parseFloat(priceValue);
    if (isNaN(numValue) || numValue < 0) {
      setError("Введите корректную цену");
      return;
    }
    setError("");
    onSubmit({ locale, price: numValue, currency });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={price ? "Редактировать цену" : "Добавить цену"}
      size="sm"
    >
      <ModalBody>
        <div className="space-y-4">
          <Select
            label="Локаль"
            value={locale}
            onChange={(e) => setLocale(e.target.value)}
            options={SUPPORTED_LOCALES.filter((l) => existingLocales.includes(l.value))}
            disabled={!!price}
          />
          <Input
            label="Цена"
            type="number"
            step="0.01"
            min="0"
            value={priceValue}
            onChange={(e) => setPriceValue(e.target.value)}
            error={error}
            required
          />
          <Select
            label="Валюта"
            value={currency}
            onChange={(e) => setCurrency(e.target.value as ServiceCurrency)}
            options={SUPPORTED_CURRENCIES}
          />
        </div>
      </ModalBody>
      <ModalFooter>
        <Button variant="secondary" onClick={onClose} disabled={isLoading}>
          Отмена
        </Button>
        <Button onClick={handleSubmit} isLoading={isLoading}>
          {price ? "Сохранить" : "Добавить"}
        </Button>
      </ModalFooter>
    </Modal>
  );
}

// =============================================
// Prices Content
// =============================================
interface PricesContentProps {
  serviceId: string;
  prices: ServicePrice[];
  existingLocales: string[];
}

function PricesContent({ serviceId, prices, existingLocales }: PricesContentProps) {
  const [priceModalOpen, setPriceModalOpen] = useState(false);
  const [editingPrice, setEditingPrice] = useState<ServicePrice | null>(null);
  const [deletingPrice, setDeletingPrice] = useState<ServicePrice | null>(null);

  const addPrice = useAddServicePrice(serviceId);
  const updatePrice = useUpdateServicePrice(serviceId);
  const deletePrice = useDeleteServicePrice(serviceId);

  const handleAddPrice = (data: { locale: string; price: number; currency: ServiceCurrency }) => {
    addPrice.mutate(data, {
      onSuccess: () => {
        setPriceModalOpen(false);
      },
    });
  };

  const handleUpdatePrice = (data: { locale: string; price: number; currency: ServiceCurrency }) => {
    if (!editingPrice) return;
    updatePrice.mutate(
      { priceId: editingPrice.id, data: { price: data.price, currency: data.currency } },
      {
        onSuccess: () => {
          setEditingPrice(null);
        },
      }
    );
  };

  const handleDeletePrice = () => {
    if (!deletingPrice) return;
    deletePrice.mutate(deletingPrice.id, {
      onSuccess: () => {
        setDeletingPrice(null);
      },
    });
  };

  const pricesByLocale = prices.reduce<Record<string, ServicePrice[]>>((acc, price) => {
    const existing = acc[price.locale] ?? [];
    acc[price.locale] = [...existing, price];
    return acc;
  }, {});

  return (
    <>
      <div className="space-y-4">
        {existingLocales.map((locale) => {
          const localePrices = pricesByLocale[locale] || [];
          const localeLabel = SUPPORTED_LOCALES.find((l) => l.value === locale)?.label || locale;

          return (
            <div key={locale} className="space-y-2">
              <div className="text-sm font-medium text-[var(--color-text-secondary)]">
                {localeLabel}
              </div>
              {localePrices.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {localePrices.map((price) => (
                    <div
                      key={price.id}
                      className="flex items-center gap-2 rounded-lg bg-[var(--color-bg-secondary)] px-3 py-2 text-sm"
                    >
                      <span className="font-medium">
                        {price.price.toLocaleString("ru-RU", { minimumFractionDigits: 2 })} {price.currency}
                      </span>
                      <button
                        type="button"
                        onClick={() => setEditingPrice(price)}
                        className="text-[var(--color-text-muted)] hover:text-[var(--color-accent-primary)]"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeletingPrice(price)}
                        className="text-[var(--color-text-muted)] hover:text-[var(--color-error)]"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-[var(--color-text-muted)]">
                  Цены не заданы
                </div>
              )}
            </div>
          );
        })}

        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => setPriceModalOpen(true)}
        >
          <Plus className="mr-1 h-4 w-4" />
          Добавить цену
        </Button>
      </div>

      <PriceModal
        isOpen={priceModalOpen}
        onClose={() => setPriceModalOpen(false)}
        onSubmit={handleAddPrice}
        isLoading={addPrice.isPending}
        existingLocales={existingLocales}
      />

      <PriceModal
        isOpen={!!editingPrice}
        onClose={() => setEditingPrice(null)}
        onSubmit={handleUpdatePrice}
        price={editingPrice}
        isLoading={updatePrice.isPending}
        existingLocales={existingLocales}
      />

      <ConfirmModal
        isOpen={!!deletingPrice}
        onClose={() => setDeletingPrice(null)}
        onConfirm={handleDeletePrice}
        title="Удалить цену?"
        description={`Вы уверены, что хотите удалить цену ${deletingPrice?.price} ${deletingPrice?.currency}?`}
        confirmText="Удалить"
        variant="danger"
        isLoading={deletePrice.isPending}
      />
    </>
  );
}

// =============================================
// Tags Content
// =============================================
interface TagsContentProps {
  serviceId: string;
  tags: ServiceTag[];
  existingLocales: string[];
}

function TagsContent({ serviceId, tags, existingLocales }: TagsContentProps) {
  const [newTag, setNewTag] = useState("");
  const [selectedLocale, setSelectedLocale] = useState(existingLocales[0] || "ru");
  const [deletingTag, setDeletingTag] = useState<ServiceTag | null>(null);

  const addTag = useAddServiceTag(serviceId);
  const deleteTag = useDeleteServiceTag(serviceId);

  const handleAddTag = () => {
    const trimmedTag = newTag.trim();
    if (!trimmedTag) return;

    addTag.mutate(
      { locale: selectedLocale, tag: trimmedTag },
      {
        onSuccess: () => {
          setNewTag("");
        },
      }
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleDeleteTag = () => {
    if (!deletingTag) return;
    deleteTag.mutate(deletingTag.id, {
      onSuccess: () => {
        setDeletingTag(null);
      },
    });
  };

  const tagsByLocale = tags.reduce<Record<string, ServiceTag[]>>((acc, tag) => {
    const existing = acc[tag.locale] ?? [];
    acc[tag.locale] = [...existing, tag];
    return acc;
  }, {});

  return (
    <>
      <div className="space-y-4">
        {existingLocales.map((locale) => {
          const localeTags = tagsByLocale[locale] || [];
          const localeLabel = SUPPORTED_LOCALES.find((l) => l.value === locale)?.label || locale;

          return (
            <div key={locale} className="space-y-2">
              <div className="text-sm font-medium text-[var(--color-text-secondary)]">
                {localeLabel}
              </div>
              {localeTags.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {localeTags.map((tag) => (
                    <span
                      key={tag.id}
                      className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-accent-primary)]/10 px-3 py-1 text-sm text-[var(--color-accent-primary)]"
                    >
                      {tag.tag}
                      <button
                        type="button"
                        onClick={() => setDeletingTag(tag)}
                        className="rounded-full hover:bg-[var(--color-accent-primary)]/20"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </span>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-[var(--color-text-muted)]">
                  Теги не заданы
                </div>
              )}
            </div>
          );
        })}

        <div className="flex items-end gap-2">
          <Select
            label="Локаль"
            value={selectedLocale}
            onChange={(e) => setSelectedLocale(e.target.value)}
            options={SUPPORTED_LOCALES.filter((l) => existingLocales.includes(l.value))}
            className="w-32"
          />
          <Input
            label="Новый тег"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Введите тег и нажмите Enter"
            className="flex-1"
          />
          <Button
            type="button"
            variant="secondary"
            onClick={handleAddTag}
            disabled={!newTag.trim() || addTag.isPending}
            isLoading={addTag.isPending}
          >
            <Plus className="mr-1 h-4 w-4" />
            Добавить
          </Button>
        </div>
      </div>

      <ConfirmModal
        isOpen={!!deletingTag}
        onClose={() => setDeletingTag(null)}
        onConfirm={handleDeleteTag}
        title="Удалить тег?"
        description={`Вы уверены, что хотите удалить тег "${deletingTag?.tag}"?`}
        confirmText="Удалить"
        variant="danger"
        isLoading={deleteTag.isPending}
      />
    </>
  );
}

// =============================================
// Main Export
// =============================================
interface ServicePricesSectionProps {
  service?: Service;
  isEditing: boolean;
  existingLocales: string[];
}

export function ServicePricesSection({
  service,
  isEditing,
  existingLocales,
}: ServicePricesSectionProps) {
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Цены</CardTitle>
        </CardHeader>
        <CardContent>
          {isEditing && service ? (
            <PricesContent
              serviceId={service.id}
              prices={service.prices || []}
              existingLocales={existingLocales}
            />
          ) : (
            <p className="text-sm text-[var(--color-text-muted)]">
              Сохраните услугу, чтобы добавить цены
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Теги</CardTitle>
        </CardHeader>
        <CardContent>
          {isEditing && service ? (
            <TagsContent
              serviceId={service.id}
              tags={service.tags || []}
              existingLocales={existingLocales}
            />
          ) : (
            <p className="text-sm text-[var(--color-text-muted)]">
              Сохраните услугу, чтобы добавить теги
            </p>
          )}
        </CardContent>
      </Card>
    </>
  );
}
