"use client";

import { useState, useEffect } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Button,
  Select,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  ContentBlocksManager,
  TextBlockEditor,
  ImageBlockEditor,
  VideoBlockEditor,
  GalleryBlockEditor,
  LinkBlockEditor,
  ResultBlockEditor,
  type BlockEditorProps,
} from "@/shared/ui";
import { useUploadServiceImage, useDeleteServiceImage } from "@/features/images";
import {
  useServiceContentBlocks,
  useCreateServiceContentBlock,
  useUpdateServiceContentBlock,
  useDeleteServiceContentBlock,
  useReorderServiceContentBlocks,
} from "../model/useServices";
import type { CreateContentBlockDto, UpdateContentBlockDto } from "@/entities/content-block";
import type {
  Service,
  CreateServiceDto,
  UpdateServiceDto,
} from "@/entities/service";
import { ServiceBasicFields } from "./ServiceBasicFields";
import { ServicePricesSection } from "./ServicePricesSection";
import { ServiceLocalesSection } from "./ServiceLocalesSection";

const SUPPORTED_LOCALES = [
  { value: "ru", label: "Русский" },
  { value: "en", label: "English" },
];

// Validation schema for create form (minimal locale)
const createLocaleSchema = z.object({
  locale: z.string().min(1, "Локаль обязательна"),
  title: z.string().min(1, "Название обязательно").max(255, "Максимум 255 символов"),
  slug: z.string().min(1, "Slug обязателен").regex(/^[a-z0-9-]+$/, "Только a-z, 0-9 и дефис"),
  short_description: z.string().max(500, "Максимум 500 символов").optional().nullable(),
});

const createServiceSchema = z.object({
  icon: z.string().max(10, "Максимум 10 символов").optional(),
  is_published: z.boolean().optional(),
  sort_order: z.number().min(0).optional().nullable(),
  locales: z.array(createLocaleSchema).min(1, "Нужна хотя бы одна локализация"),
});

const editServiceSchema = z.object({
  icon: z.string().max(10, "Максимум 10 символов").optional(),
  is_published: z.boolean().optional(),
  sort_order: z.number().min(0).optional().nullable(),
});

export type CreateServiceFormValues = z.infer<typeof createServiceSchema>;

interface ServiceFormProps {
  service?: Service;
  onSubmit: (data: CreateServiceDto | UpdateServiceDto) => void;
  isSubmitting?: boolean;
}

export function ServiceForm({ service, onSubmit, isSubmitting = false }: ServiceFormProps) {
  const isEditing = !!service;
  const [imageUrl, setImageUrl] = useState<string | null>(service?.cover_image_url || null);

  const uploadImage = useUploadServiceImage(service?.id || "");
  const deleteImage = useDeleteServiceImage(service?.id || "");

  const [selectedBlocksLocale, setSelectedBlocksLocale] = useState("ru");

  const { data: contentBlocks = [], isLoading: isLoadingBlocks } = useServiceContentBlocks(
    service?.id || "",
    undefined
  );

  const createContentBlock = useCreateServiceContentBlock(service?.id || "");
  const updateContentBlock = useUpdateServiceContentBlock(service?.id || "");
  const deleteContentBlock = useDeleteServiceContentBlock(service?.id || "");
  const reorderContentBlocks = useReorderServiceContentBlocks(service?.id || "");

  const form = useForm<CreateServiceFormValues>({
    resolver: zodResolver(isEditing ? editServiceSchema : createServiceSchema) as unknown as Resolver<CreateServiceFormValues>,
    defaultValues: isEditing
      ? { icon: service?.icon || "", is_published: service?.is_published ?? false, sort_order: service?.sort_order ?? null, locales: [] }
      : { icon: "", is_published: false, sort_order: null, locales: [{ locale: "ru", title: "", slug: "", short_description: "" }] },
  });

  useEffect(() => {
    if (isEditing && service) {
      form.reset({
        icon: service.icon || "",
        is_published: service.is_published ?? false,
        sort_order: service.sort_order ?? null,
        locales: [],
      });
    }
  }, [service, isEditing, form]);

  useEffect(() => {
    if (service?.cover_image_url !== imageUrl) {
      setImageUrl(service?.cover_image_url || null);
    }
  }, [service?.cover_image_url, imageUrl]);

  const handleFormSubmit = (data: CreateServiceFormValues) => {
    if (isEditing) {
      const { locales: _, ...editData } = data;
      const payload: UpdateServiceDto = {
        ...editData,
        icon: editData.icon || undefined,
        sort_order: editData.sort_order ?? undefined,
        version: service!.version,
      };
      onSubmit(payload);
    } else {
      const payload: CreateServiceDto = {
        ...data,
        icon: data.icon || undefined,
        sort_order: data.sort_order ?? undefined,
        locales: data.locales.map((l) => ({
          locale: l.locale,
          title: l.title,
          slug: l.slug,
          short_description: l.short_description || undefined,
        })),
      };
      onSubmit(payload);
    }
  };

  const handleImageUpload = async (file: File) => {
    const result = await uploadImage.mutateAsync(file);
    setImageUrl(result.cover_image_url);
  };

  const handleImageDelete = async () => {
    await deleteImage.mutateAsync();
    setImageUrl(null);
  };

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

  const existingLocaleCodes = isEditing
    ? service.locales.map((l) => l.locale)
    : (form.watch("locales") || []).map((l) => l.locale);

  return (
    <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
      <ServiceBasicFields
        form={form}
        service={service}
        imageUrl={imageUrl}
        onImageUpload={handleImageUpload}
        onImageDelete={handleImageDelete}
        isEditing={isEditing}
      />

      <ServiceLocalesSection
        service={service}
        isEditing={isEditing}
        form={form}
      />

      <ServicePricesSection
        service={service}
        isEditing={isEditing}
        existingLocales={existingLocaleCodes}
      />

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

      <div className="flex justify-end gap-4">
        <Button type="button" variant="secondary" onClick={() => window.history.back()}>
          Отмена
        </Button>
        <Button type="submit" isLoading={isSubmitting}>
          {isEditing ? "Сохранить" : "Создать"}
        </Button>
      </div>
    </form>
  );
}
