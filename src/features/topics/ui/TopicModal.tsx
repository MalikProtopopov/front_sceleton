"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2 } from "lucide-react";
import { useCreateTopic, useUpdateTopic } from "../model/useTopics";
import { Modal, ModalBody, ModalFooter, Button, Input, NumberInput, Textarea, Select, Tabs, Tab, SectionHeader } from "@/shared/ui";
import { generateSlug } from "@/shared/lib/transliterate";
import type { Topic, TopicLocale, CreateTopicDto, UpdateTopicDto } from "@/entities/topic";

interface TopicModalProps {
  isOpen: boolean;
  onClose: () => void;
  topic?: Topic;
}

const AVAILABLE_LOCALES = [
  { code: "ru", name: "Русский" },
  { code: "en", name: "English" },
  { code: "uz", name: "O'zbek" },
];

const getDefaultLocale = (locale: string): TopicLocale => ({
  locale,
  title: "",
  slug: "",
  description: "",
});

export function TopicModal({ isOpen, onClose, topic }: TopicModalProps) {
  const isEditing = !!topic;

  const [icon, setIcon] = useState<string>("");
  const [color, setColor] = useState<string>("");
  const [sortOrder, setSortOrder] = useState<number | null | undefined>(null);
  const [locales, setLocales] = useState<TopicLocale[]>([getDefaultLocale("ru")]);
  const [activeLocaleIndex, setActiveLocaleIndex] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { mutate: createTopic, isPending: isCreating } = useCreateTopic();
  const { mutate: updateTopic, isPending: isUpdating } = useUpdateTopic(topic?.id || "");

  const isPending = isCreating || isUpdating;

  const resetForm = () => {
    setIcon("");
    setColor("");
    setSortOrder(null);
    setLocales([getDefaultLocale("ru")]);
    setActiveLocaleIndex(0);
    setErrors({});
  };

  // Populate form when editing
  useEffect(() => {
    if (topic) {
      setIcon(topic.icon || "");
      setColor(topic.color || "");
      setSortOrder(topic.sort_order);
      setLocales(topic.locales.length > 0 ? topic.locales : [getDefaultLocale("ru")]);
      setActiveLocaleIndex(0);
    } else {
      resetForm();
    }
  }, [topic, isOpen]);

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validate each locale
    locales.forEach((locale, index) => {
      if (!locale.title.trim()) {
        newErrors[`locale_${index}_title`] = "Название обязательно";
      }
      if (!locale.slug.trim()) {
        newErrors[`locale_${index}_slug`] = "Slug обязателен";
      } else if (!/^[a-z0-9-]+$/.test(locale.slug)) {
        newErrors[`locale_${index}_slug`] = "Только строчные буквы, цифры и дефисы";
      }
    });

    const hasValidLocale = locales.some((l) => l.title.trim() && l.slug.trim());
    if (!hasValidLocale) {
      newErrors.locales = "Хотя бы одна локализация должна иметь название и slug";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    const filteredLocales = locales.filter((l) => l.title.trim() && l.slug.trim());

    if (isEditing && topic) {
      const data: UpdateTopicDto = {
        icon: icon || null,
        color: color || null,
        sort_order: sortOrder ?? 0,
        locales: filteredLocales,
        version: topic.version,
      };
      updateTopic(data, { onSuccess: handleClose });
    } else {
      const data: CreateTopicDto = {
        icon: icon || null,
        color: color || null,
        sort_order: sortOrder ?? 0,
        locales: filteredLocales,
      };
      createTopic(data, { onSuccess: handleClose });
    }
  };

  const updateLocale = (index: number, field: keyof TopicLocale, value: string) => {
    const newLocales = [...locales];
    const updatedLocale = { ...newLocales[index], [field]: value } as TopicLocale;
    
    // Auto-generate slug from title if title is being updated
    if (field === "title" && value.trim()) {
      updatedLocale.slug = generateSlug(value);
    }
    
    newLocales[index] = updatedLocale;
    setLocales(newLocales);
  };

  const addLocale = () => {
    const usedLocales = locales.map((l) => l.locale);
    const availableLocale = AVAILABLE_LOCALES.find((l) => !usedLocales.includes(l.code));
    if (availableLocale) {
      setLocales([...locales, getDefaultLocale(availableLocale.code)]);
      setActiveLocaleIndex(locales.length);
    }
  };

  const removeLocale = (index: number) => {
    if (locales.length <= 1) return;
    const newLocales = locales.filter((_, i) => i !== index);
    setLocales(newLocales);
    if (activeLocaleIndex >= newLocales.length) {
      setActiveLocaleIndex(newLocales.length - 1);
    }
  };

  const canAddLocale = locales.length < AVAILABLE_LOCALES.length;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={isEditing ? "Редактировать тему" : "Создать тему"}
      size="lg"
    >
      <ModalBody>
        <div className="space-y-6">
          {/* Basic info */}
          <div className="grid gap-4 md:grid-cols-3">
            <Input
              label="Иконка (emoji)"
              value={icon}
              onChange={(e) => setIcon(e.target.value)}
              placeholder="📰"
            />
            <Input
              label="Цвет"
              type="color"
              value={color || "#3B82F6"}
              onChange={(e) => setColor(e.target.value)}
            />
            <NumberInput
              label="Порядок сортировки"
              value={sortOrder}
              onChange={(value) => setSortOrder(value)}
            />
          </div>

          {/* Locales */}
          <div className="space-y-4">
            <SectionHeader
              title="Локализации"
              actions={
                canAddLocale ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={addLocale}
                    leftIcon={<Plus className="h-3.5 w-3.5" />}
                  >
                    Добавить
                  </Button>
                ) : undefined
              }
            />

            {errors.locales && (
              <p className="text-sm text-[var(--color-error)]">{errors.locales}</p>
            )}

            <Tabs
              activeIndex={activeLocaleIndex}
              onChange={setActiveLocaleIndex}
            >
              {locales.map((locale, index) => {
                const localeName = AVAILABLE_LOCALES.find((l) => l.code === locale.locale)?.name || locale.locale;
                return (
                  <Tab key={locale.locale} label={localeName}>
                    <div className="space-y-4 pt-4">
                      <div className="flex items-center justify-between">
                        <Select
                          label="Язык"
                          value={locale.locale}
                          onChange={(e) => updateLocale(index, "locale", e.target.value)}
                          options={AVAILABLE_LOCALES.filter(
                            (l) => l.code === locale.locale || !locales.some((loc) => loc.locale === l.code)
                          ).map((l) => ({
                            value: l.code,
                            label: l.name,
                          }))}
                          className="w-40"
                        />
                        {locales.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeLocale(index)}
                            className="text-[var(--color-error)] hover:text-[var(--color-error)]"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                      <Input
                        label="Название"
                        value={locale.title}
                        onChange={(e) => updateLocale(index, "title", e.target.value)}
                        placeholder="Технологии"
                        error={errors[`locale_${index}_title`]}
                        required
                      />
                      <Input
                        label="Slug (URL)"
                        value={locale.slug}
                        onChange={(e) => updateLocale(index, "slug", e.target.value.toLowerCase())}
                        placeholder="technology"
                        error={errors[`locale_${index}_slug`]}
                        required
                      />
                      <Textarea
                        label="Описание"
                        value={locale.description || ""}
                        onChange={(e) => updateLocale(index, "description", e.target.value)}
                        placeholder="Краткое описание темы..."
                        rows={3}
                      />
                    </div>
                  </Tab>
                );
              })}
            </Tabs>
          </div>
        </div>
      </ModalBody>

      <ModalFooter>
        <Button type="button" variant="secondary" onClick={handleClose}>
          Отмена
        </Button>
        <Button onClick={handleSubmit} isLoading={isPending}>
          {isEditing ? "Сохранить" : "Создать"}
        </Button>
      </ModalFooter>
    </Modal>
  );
}

