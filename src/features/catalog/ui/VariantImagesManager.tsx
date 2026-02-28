"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Trash2, Upload } from "lucide-react";
import { Button, Select, Spinner } from "@/shared/ui";
import {
  useVariantsList,
  useVariantImages,
  useUploadVariantImage,
  useDeleteVariantImage,
} from "../model/useVariants";
import { getMediaUrl } from "@/shared/lib";
import type { ProductImage } from "@/entities/product";

interface VariantImagesManagerProps {
  productId: string;
  productImages?: ProductImage[];
  canEdit?: boolean;
}

export function VariantImagesManager({
  productId,
  productImages = [],
  canEdit = true,
}: VariantImagesManagerProps) {
  const { data: variants = [], isLoading } = useVariantsList(productId);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Spinner size="lg" />
      </div>
    );
  }

  if (variants.length === 0) {
    return (
      <p className="text-sm text-[var(--color-text-muted)] italic py-4 text-center">
        Сначала создайте варианты
      </p>
    );
  }

  const variantOptions = variants.map((v) => ({ value: v.id, label: `${v.title} (${v.sku})` }));
  const activeVariantId = selectedVariantId || variants[0]?.id;

  return (
    <div className="space-y-4">
      <Select
        label="Выберите вариант"
        value={activeVariantId}
        onChange={(e) => setSelectedVariantId(e.target.value)}
        options={variantOptions}
      />
      {activeVariantId && (
        <SingleVariantImages
          productId={productId}
          variantId={activeVariantId}
          productImages={productImages}
          canEdit={canEdit}
        />
      )}
    </div>
  );
}

function SingleVariantImages({
  productId,
  variantId,
  productImages,
  canEdit,
}: {
  productId: string;
  variantId: string;
  productImages: ProductImage[];
  canEdit: boolean;
}) {
  const { data: images = [], isLoading } = useVariantImages(productId, variantId);
  const { mutate: uploadImage, isPending: isUploading } = useUploadVariantImage(
    productId,
    variantId,
  );
  const { mutate: deleteImage } = useDeleteVariantImage(productId, variantId);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      acceptedFiles.forEach((file) => {
        uploadImage({ file });
      });
    },
    [uploadImage],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [".jpeg", ".jpg", ".png", ".webp", ".gif"] },
    maxSize: 10 * 1024 * 1024,
    disabled: !canEdit,
  });

  const sorted = [...images].sort((a, b) => a.sort_order - b.sort_order);

  if (isLoading) {
    return <p className="text-sm text-[var(--color-text-muted)] py-2 text-center">Загрузка...</p>;
  }

  return (
    <div className="space-y-4">
      {/* Upload area */}
      {canEdit && (
        <div
          {...getRootProps()}
          className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-colors ${
            isDragActive
              ? "border-[var(--color-primary)] bg-[var(--color-primary)]/5"
              : "border-[var(--color-border)] hover:border-[var(--color-primary)]/50"
          } ${isUploading ? "pointer-events-none opacity-60" : ""}`}
        >
          <input {...getInputProps()} />
          {isUploading ? (
            <Spinner size="sm" />
          ) : (
            <>
              <Upload className="mb-2 h-8 w-8 text-[var(--color-text-muted)]" />
              <p className="text-sm text-[var(--color-text-muted)]">
                {isDragActive
                  ? "Отпустите файлы..."
                  : "Перетащите изображения или нажмите для выбора"}
              </p>
              <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                JPG, PNG, WebP, GIF · до 10 МБ
              </p>
            </>
          )}
        </div>
      )}

      {/* Variant images */}
      {sorted.length > 0 && (
        <div>
          <h4 className="mb-2 text-sm font-medium text-[var(--color-text-primary)]">
            Изображения варианта
          </h4>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {sorted.map((img) => (
              <div
                key={img.id}
                className="group relative aspect-square overflow-hidden rounded-lg border border-[var(--color-border)]"
              >
                <img
                  src={getMediaUrl(img.url)}
                  alt={img.alt || ""}
                  className="h-full w-full object-cover"
                />
                {img.is_cover && (
                  <span className="absolute left-1 top-1 rounded bg-amber-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
                    COVER
                  </span>
                )}
                {canEdit && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                    <Button
                      variant="danger"
                      size="icon"
                      onClick={() => deleteImage(img.id)}
                      className="h-8 w-8"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {sorted.length === 0 && (
        <div>
          <p className="text-sm text-[var(--color-text-muted)] italic text-center">
            У варианта нет собственных изображений
          </p>
          {productImages.length > 0 && (
            <div className="mt-3">
              <p className="mb-2 text-xs text-[var(--color-text-muted)]">
                Используются изображения продукта:
              </p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 opacity-60">
                {productImages
                  .sort((a, b) => a.sort_order - b.sort_order)
                  .slice(0, 4)
                  .map((img) => (
                    <div
                      key={img.id}
                      className="aspect-square overflow-hidden rounded-md border border-[var(--color-border)]"
                    >
                      <img
                        src={getMediaUrl(img.url)}
                        alt={img.alt || ""}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
