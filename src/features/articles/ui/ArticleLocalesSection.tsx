"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { UseFormReturn } from "react-hook-form";
import { Globe, Trash2 } from "lucide-react";
import {
  Button,
  Input,
  Textarea,
  Select,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Badge,
  ConfirmModal,
  ContentBlocksManager,
  TextBlockEditor,
  ImageBlockEditor,
  VideoBlockEditor,
  GalleryBlockEditor,
  LinkBlockEditor,
  ResultBlockEditor,
  type BlockEditorProps,
} from "@/shared/ui";
import { generateSlug } from "@/shared/lib";
import {
  useCreateArticleLocale,
  useUpdateArticleLocale,
  useDeleteArticleLocale,
  useArticleContentBlocks,
  useCreateArticleContentBlock,
  useUpdateArticleContentBlock,
  useDeleteArticleContentBlock,
  useReorderArticleContentBlocks,
} from "../model/useArticles";
import type { CreateContentBlockDto, UpdateContentBlockDto } from "@/entities/content-block";
import type { Article, ArticleLocale, CreateArticleLocaleDto, UpdateArticleLocaleDto } from "@/entities/article";
import type { CreateArticleFormValues } from "./ArticleForm";

const SUPPORTED_LOCALES = [
  { value: "ru", label: "Русский" },
  { value: "en", label: "English" },
];

interface ArticleLocalesSectionProps {
  isEditing: boolean;
  article?: Article;
  form: UseFormReturn<CreateArticleFormValues>;
}

export function ArticleLocalesSection({ isEditing, article, form }: ArticleLocalesSectionProps) {
  const [activeLocaleTab, setActiveLocaleTab] = useState<string>("ru");
  const [deletingLocaleId, setDeletingLocaleId] = useState<string | null>(null);
  const [editingLocales, setEditingLocales] = useState<Record<string, Partial<ArticleLocale>>>({});
  const isLocalesInitialized = useRef(false);
  const [selectedBlocksLocale, setSelectedBlocksLocale] = useState("ru");

  // Locale management hooks (only meaningful in edit mode)
  const createLocale = useCreateArticleLocale(article?.id || "");
  const updateLocale = useUpdateArticleLocale(article?.id || "");
  const deleteLocale = useDeleteArticleLocale(article?.id || "");

  // Content blocks (edit mode)
  const { data: contentBlocks = [], isLoading: isLoadingBlocks } = useArticleContentBlocks(
    article?.id || "",
    undefined
  );

  const createContentBlock = useCreateArticleContentBlock(article?.id || "");
  const updateContentBlock = useUpdateArticleContentBlock(article?.id || "");
  const deleteContentBlock = useDeleteArticleContentBlock(article?.id || "");
  const reorderContentBlocks = useReorderArticleContentBlocks(article?.id || "");

  const locales = isEditing ? [] : form.watch("locales");
  const articleLocales = isEditing ? (article?.locales || []) : [];

  useEffect(() => {
    if (isEditing && article?.locales && !isLocalesInitialized.current) {
      const initialState: Record<string, Partial<ArticleLocale>> = {};
      article.locales.forEach((locale) => {
        initialState[locale.id] = { ...locale };
      });
      setEditingLocales(initialState);
      isLocalesInitialized.current = true;

      const firstLocale = article.locales[0];
      if (firstLocale) {
        setActiveLocaleTab(firstLocale.locale);
      }
    }
  }, [isEditing, article?.locales]);

  useEffect(() => {
    if (isEditing && article?.locales && isLocalesInitialized.current) {
      article.locales.forEach((locale) => {
        if (!editingLocales[locale.id]) {
          setEditingLocales((prev) => ({
            ...prev,
            [locale.id]: { ...locale },
          }));
        }
      });
    }
  }, [isEditing, article?.locales, editingLocales]);

  // --- Edit-mode locale handlers ---

  const handleLocaleFieldChange = useCallback((localeId: string, field: keyof ArticleLocale, value: string | null) => {
    setEditingLocales((prev) => ({
      ...prev,
      [localeId]: {
        ...prev[localeId],
        [field]: value,
      },
    }));
  }, []);

  const handleSaveLocale = useCallback(async (localeId: string) => {
    if (updateLocale.isPending) return;

    const localeData = editingLocales[localeId];
    if (!localeData) return;
    const localeCode = localeData.locale ?? article?.locales?.find((l) => l.id === localeId)?.locale;
    if (!localeCode) return;

    const apiData: UpdateArticleLocaleDto = {
      locale: localeCode,
      title: localeData.title,
      slug: localeData.slug,
      excerpt: localeData.excerpt ?? undefined,
    };

    await updateLocale.mutateAsync({ localeId, data: apiData });
  }, [editingLocales, updateLocale, article?.locales]);

  const handleAddLocale = useCallback(async (localeCode: string) => {
    const apiData: CreateArticleLocaleDto = {
      locale: localeCode,
      title: "",
      slug: "",
    };
    await createLocale.mutateAsync(apiData);
    setActiveLocaleTab(localeCode);
  }, [createLocale]);

  const handleDeleteLocale = useCallback(async () => {
    if (!deletingLocaleId) return;
    await deleteLocale.mutateAsync(deletingLocaleId);
    setDeletingLocaleId(null);
    const remainingLocales = articleLocales.filter((l) => l.id !== deletingLocaleId);
    const firstRemaining = remainingLocales[0];
    if (firstRemaining) {
      setActiveLocaleTab(firstRemaining.locale);
    }
  }, [deletingLocaleId, deleteLocale, articleLocales]);

  // --- Create-mode locale helpers ---

  const addLocale = (locale: string) => {
    const existingLocales = locales.map((l) => l.locale);
    if (!existingLocales.includes(locale)) {
      form.setValue("locales", [
        ...locales,
        { locale, title: "", slug: "", excerpt: "" },
      ]);
    }
  };

  const removeLocale = (index: number) => {
    if (locales.length > 1) {
      form.setValue(
        "locales",
        locales.filter((_, i) => i !== index),
      );
    }
  };

  // --- Content block handlers ---

  const handleCreateContentBlock = async (data: CreateContentBlockDto) => { await createContentBlock.mutateAsync(data); };
  const handleUpdateContentBlock = async (blockId: string, data: UpdateContentBlockDto) => { await updateContentBlock.mutateAsync({ blockId, data }); };
  const handleDeleteContentBlock = async (blockId: string) => { await deleteContentBlock.mutateAsync(blockId); };
  const handleReorderContentBlocks = async (blockIds: string[]) => { await reorderContentBlocks.mutateAsync({ locale: selectedBlocksLocale, block_ids: blockIds }); };

  const renderBlockEditor = (props: BlockEditorProps) => {
    switch (props.blockType) {
      case "text": return <TextBlockEditor {...props} />;
      case "image": return <ImageBlockEditor {...props} />;
      case "video": return <VideoBlockEditor {...props} />;
      case "gallery": return <GalleryBlockEditor {...props} />;
      case "link": return <LinkBlockEditor {...props} />;
      case "result": return <ResultBlockEditor {...props} />;
      default: return null;
    }
  };

  // Available locales for the "add language" dropdown
  const existingLocaleCodes = isEditing
    ? articleLocales.map((l) => l.locale)
    : locales.map((l) => l.locale);

  const availableLocales = SUPPORTED_LOCALES.filter(
    (l) => !existingLocaleCodes.includes(l.value),
  );

  return (
    <>
      {/* Localizations card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-[var(--color-text-muted)]" />
              <CardTitle>Локализации</CardTitle>
              <Badge variant="outline">
                {isEditing ? articleLocales.length : locales.length}{" "}
                {(isEditing ? articleLocales.length : locales.length) === 1 ? "язык" : "языка"}
              </Badge>
            </div>
            {availableLocales.length > 0 && (
              <Select
                value=""
                onChange={(e) => {
                  if (e.target.value) {
                    if (isEditing) {
                      handleAddLocale(e.target.value);
                    } else {
                      addLocale(e.target.value);
                    }
                  }
                }}
                options={[{ value: "", label: "Добавить язык" }, ...availableLocales]}
                minWidth="180px"
              />
            )}
          </div>
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <Tabs value={activeLocaleTab} onValueChange={setActiveLocaleTab}>
              <div className="mb-4 flex items-center gap-2">
                <span className="text-sm text-[var(--color-text-muted)]">Редактирование:</span>
                <TabsList>
                  {articleLocales.map((locale) => (
                    <TabsTrigger key={locale.id} value={locale.locale}>
                      <span className="font-medium">{locale.locale.toUpperCase()}</span>
                      <span className="ml-1.5 hidden sm:inline text-[var(--color-text-muted)]">
                        {SUPPORTED_LOCALES.find((l) => l.value === locale.locale)?.label}
                      </span>
                      {articleLocales.length > 1 && (
                        <span
                          role="button"
                          tabIndex={0}
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeletingLocaleId(locale.id);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.stopPropagation();
                              setDeletingLocaleId(locale.id);
                            }
                          }}
                          className="ml-2 text-[var(--color-text-muted)] hover:text-[var(--color-error)] cursor-pointer"
                          title="Удалить локализацию"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </span>
                      )}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>

              {articleLocales.map((locale) => {
                const localeData = editingLocales[locale.id] || locale;

                return (
                  <TabsContent key={locale.id} value={locale.locale}>
                    <div className="space-y-4">
                      <Input
                        label="Заголовок"
                        placeholder="Введите заголовок"
                        value={localeData.title || ""}
                        onChange={(e) => {
                          handleLocaleFieldChange(locale.id, "title", e.target.value);
                          if (!localeData.slug || localeData.slug === generateSlug(locale.title || "")) {
                            handleLocaleFieldChange(locale.id, "slug", generateSlug(e.target.value));
                          }
                        }}
                        required
                      />

                      <Input
                        label="Slug"
                        placeholder="article-slug"
                        value={localeData.slug || ""}
                        onChange={(e) => handleLocaleFieldChange(locale.id, "slug", e.target.value)}
                        required
                      />

                      <Textarea
                        label="Краткое описание"
                        placeholder="Краткое описание статьи..."
                        value={localeData.excerpt || ""}
                        onChange={(e) => handleLocaleFieldChange(locale.id, "excerpt", e.target.value)}
                      />

                      <div className="flex justify-end border-t border-[var(--color-border)] pt-4">
                        <Button
                          type="button"
                          onClick={() => handleSaveLocale(locale.id)}
                          isLoading={updateLocale.isPending}
                        >
                          Сохранить локаль
                        </Button>
                      </div>
                    </div>
                  </TabsContent>
                );
              })}
            </Tabs>
          ) : (
            <Tabs defaultValue={locales[0]?.locale || "ru"}>
              <div className="mb-4 flex items-center gap-2">
                <span className="text-sm text-[var(--color-text-muted)]">Редактирование:</span>
                <TabsList>
                  {locales.map((locale, index) => (
                    <TabsTrigger key={locale.locale} value={locale.locale}>
                      <span className="font-medium">{locale.locale.toUpperCase()}</span>
                      <span className="ml-1.5 hidden sm:inline text-[var(--color-text-muted)]">
                        {SUPPORTED_LOCALES.find((l) => l.value === locale.locale)?.label}
                      </span>
                      {locales.length > 1 && (
                        <span
                          role="button"
                          tabIndex={0}
                          onClick={(e) => {
                            e.stopPropagation();
                            removeLocale(index);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.stopPropagation();
                              removeLocale(index);
                            }
                          }}
                          className="ml-2 text-[var(--color-text-muted)] hover:text-[var(--color-error)] cursor-pointer"
                        >
                          ×
                        </span>
                      )}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>

              {locales.map((locale, index) => (
                <TabsContent key={locale.locale} value={locale.locale}>
                  <div className="space-y-4">
                    <input type="hidden" {...form.register(`locales.${index}.locale`)} />

                    <Input
                      label="Заголовок"
                      placeholder="Введите заголовок"
                      {...form.register(`locales.${index}.title`, {
                        onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
                          const slug = generateSlug(e.target.value);
                          form.setValue(`locales.${index}.slug`, slug);
                        },
                      })}
                      error={form.formState.errors.locales?.[index]?.title?.message}
                      required
                    />

                    <Input
                      label="Slug"
                      placeholder="article-slug"
                      {...form.register(`locales.${index}.slug`)}
                      error={form.formState.errors.locales?.[index]?.slug?.message}
                      required
                    />

                    <Textarea
                      label="Краткое описание"
                      placeholder="Краткое описание статьи..."
                      {...form.register(`locales.${index}.excerpt`)}
                      error={form.formState.errors.locales?.[index]?.excerpt?.message}
                    />
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          )}
        </CardContent>
      </Card>

      {/* Content Blocks (edit mode only) */}
      {isEditing && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-4">
              <CardTitle>Контент-блоки</CardTitle>
              <Select
                value={selectedBlocksLocale}
                onChange={(e) => setSelectedBlocksLocale(e.target.value)}
                options={SUPPORTED_LOCALES}
                minWidth="150px"
              />
            </div>
          </CardHeader>
          <CardContent>
            {isLoadingBlocks ? (
              <div className="py-8 text-center text-sm text-[var(--color-text-muted)]">Загрузка блоков...</div>
            ) : (
              <ContentBlocksManager
                blocks={contentBlocks}
                locale={selectedBlocksLocale}
                isEditing={true}
                onCreateBlock={handleCreateContentBlock}
                onUpdateBlock={handleUpdateContentBlock}
                onDeleteBlock={handleDeleteContentBlock}
                onReorderBlocks={handleReorderContentBlocks}
                isCreating={createContentBlock.isPending}
                isUpdating={updateContentBlock.isPending}
                isDeleting={deleteContentBlock.isPending}
                renderBlockEditor={renderBlockEditor}
                title=""
              />
            )}
          </CardContent>
        </Card>
      )}

      {/* Delete locale confirmation modal */}
      <ConfirmModal
        isOpen={!!deletingLocaleId}
        onClose={() => setDeletingLocaleId(null)}
        onConfirm={handleDeleteLocale}
        title="Удалить локализацию?"
        description="Вы уверены, что хотите удалить эту локализацию? Это действие нельзя отменить."
        confirmText="Удалить"
        variant="danger"
        isLoading={deleteLocale.isPending}
      />
    </>
  );
}
