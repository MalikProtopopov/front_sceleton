"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Trash2, Star, Upload, ChevronUp, ChevronDown, Pencil } from "lucide-react";
import {
  useUploadProductImage,
  useUpdateProductImage,
  useDeleteProductImage,
  useReorderProductImages,
  useSetCoverImage,
} from "../model/useProducts";
import type { ProductImage } from "@/entities/product";
import { getMediaUrl } from "@/shared/lib";
import { MAX_IMAGE_SIZE } from "@/shared/config";

interface ProductImagesManagerProps {
  productId: string;
  images: ProductImage[];
}

export function ProductImagesManager({ productId, images }: ProductImagesManagerProps) {
  const { mutate: uploadImage, isPending: isUploading } = useUploadProductImage(productId);
  const { mutate: updateImage } = useUpdateProductImage(productId);
  const { mutate: deleteImage } = useDeleteProductImage(productId);
  const { mutate: setCover } = useSetCoverImage(productId);
  const { mutate: reorder } = useReorderProductImages(productId);

  const [editingAlt, setEditingAlt] = useState<string | null>(null);
  const [altValue, setAltValue] = useState("");

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
    maxSize: MAX_IMAGE_SIZE,
  });

  const sorted = [...images].sort((a, b) => a.sort_order - b.sort_order);

  const moveImage = (fromIndex: number, direction: "up" | "down") => {
    const toIndex = direction === "up" ? fromIndex - 1 : fromIndex + 1;
    if (toIndex < 0 || toIndex >= sorted.length) return;
    const newOrder = [...sorted];
    const temp = newOrder[fromIndex]!;
    newOrder[fromIndex] = newOrder[toIndex]!;
    newOrder[toIndex] = temp;
    reorder(newOrder.map((img) => img.id));
  };

  const startEditAlt = (img: ProductImage) => {
    setEditingAlt(img.id);
    setAltValue(img.alt || "");
  };

  const saveAlt = (imageId: string) => {
    updateImage({ imageId, data: { alt: altValue } });
    setEditingAlt(null);
  };

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors ${
          isDragActive
            ? "border-[var(--color-accent-primary)] bg-[var(--color-accent-primary)]/5"
            : "border-[var(--color-border)] hover:border-[var(--color-accent-primary)]"
        }`}
      >
        <input {...getInputProps()} />
        <Upload className="h-8 w-8 text-[var(--color-text-muted)] mb-2" />
        <p className="text-sm text-[var(--color-text-secondary)]">
          {isUploading
            ? "Загрузка..."
            : isDragActive
              ? "Отпустите для загрузки"
              : "Перетащите или нажмите для выбора"}
        </p>
        <p className="text-xs text-[var(--color-text-muted)] mt-1">
          JPEG, PNG, WebP, GIF. Макс. 10 МБ
        </p>
      </div>

      {sorted.length > 0 && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {sorted.map((img, index) => (
            <div
              key={img.id}
              className="group relative overflow-hidden rounded-lg border border-[var(--color-border)]"
            >
              <div className="aspect-square bg-[var(--color-bg-secondary)]">
                <img
                  src={getMediaUrl(img.url)}
                  alt={img.alt || ""}
                  className="h-full w-full object-cover"
                />
              </div>

              {img.is_cover && (
                <span className="absolute left-2 top-2 rounded bg-[var(--color-accent-primary)] px-1.5 py-0.5 text-xs font-medium text-white">
                  Обложка
                </span>
              )}

              <div className="absolute right-1 top-1 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                <button
                  onClick={() => moveImage(index, "up")}
                  disabled={index === 0}
                  className="rounded bg-black/60 p-1 text-white hover:bg-black/80 disabled:opacity-30"
                  title="Переместить выше"
                >
                  <ChevronUp className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => moveImage(index, "down")}
                  disabled={index === sorted.length - 1}
                  className="rounded bg-black/60 p-1 text-white hover:bg-black/80 disabled:opacity-30"
                  title="Переместить ниже"
                >
                  <ChevronDown className="h-3.5 w-3.5" />
                </button>
                {!img.is_cover && (
                  <button
                    onClick={() => setCover(img.id)}
                    className="rounded bg-black/60 p-1 text-white hover:bg-black/80"
                    title="Сделать обложкой"
                  >
                    <Star className="h-3.5 w-3.5" />
                  </button>
                )}
                <button
                  onClick={() => startEditAlt(img)}
                  className="rounded bg-black/60 p-1 text-white hover:bg-black/80"
                  title="Редактировать alt-текст"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => deleteImage(img.id)}
                  className="rounded bg-red-600/80 p-1 text-white hover:bg-red-600"
                  title="Удалить"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="px-2 py-1.5">
                {editingAlt === img.id ? (
                  <div className="flex gap-1">
                    <input
                      type="text"
                      value={altValue}
                      onChange={(e) => setAltValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") saveAlt(img.id);
                        if (e.key === "Escape") setEditingAlt(null);
                      }}
                      className="min-w-0 flex-1 rounded border border-[var(--color-border)] bg-[var(--color-bg-primary)] px-1.5 py-0.5 text-xs text-[var(--color-text-primary)] focus:border-[var(--color-accent-primary)] focus:outline-none"
                      placeholder="Alt-текст"
                      autoFocus
                    />
                    <button
                      onClick={() => saveAlt(img.id)}
                      className="rounded bg-[var(--color-accent-primary)] px-1.5 py-0.5 text-xs text-white"
                    >
                      OK
                    </button>
                  </div>
                ) : (
                  <p
                    className="cursor-pointer truncate text-xs text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]"
                    onClick={() => startEditAlt(img)}
                    title="Нажмите для редактирования alt-текста"
                  >
                    {img.alt || "Без alt-текста"}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
