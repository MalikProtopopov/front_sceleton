"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, GripVertical } from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "../../Button";
import { Input } from "../../Input";
import { Select } from "../../Select";
import { ModalBody, ModalFooter } from "../../Modal";
import { cn } from "@/shared/lib";
import type { BlockEditorProps } from "../ContentBlocksManager";
import type { DeviceType, GalleryBlockMetadata, GalleryImage } from "@/entities/content-block";

const DEVICE_OPTIONS = [
  { value: "both", label: "Все устройства" },
  { value: "desktop", label: "Только десктоп" },
  { value: "mobile", label: "Только мобильные" },
];

// Sortable image item
interface SortableImageItemProps {
  image: GalleryImage & { id: string };
  index: number;
  onChange: (index: number, field: keyof GalleryImage, value: string) => void;
  onRemove: (index: number) => void;
}

function SortableImageItem({ image, index, onChange, onRemove }: SortableImageItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: image.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-start gap-3 rounded-lg border border-[var(--color-border)] p-3",
        "bg-[var(--color-bg-secondary)]",
        isDragging && "opacity-50 shadow-lg"
      )}
    >
      <button
        type="button"
        className="mt-2 cursor-grab touch-none text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-5 w-5" />
      </button>

      <div className="flex-1 space-y-2">
        <Input
          label="URL изображения"
          value={image.url}
          onChange={(e) => onChange(index, "url", e.target.value)}
          placeholder="https://... или /media/..."
          required
        />
        <Input
          label="Alt-текст"
          value={image.alt || ""}
          onChange={(e) => onChange(index, "alt", e.target.value)}
          placeholder="Описание изображения"
        />
      </div>

      {image.url && (
        <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded border border-[var(--color-border)]">
          <img
            src={image.url.startsWith("/") ? `${process.env.NEXT_PUBLIC_API_URL || ""}${image.url}` : image.url}
            alt={image.alt || "Preview"}
            className="h-full w-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64' fill='%23666'%3E%3Crect width='64' height='64' fill='%23f0f0f0'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' font-size='10'%3EError%3C/text%3E%3C/svg%3E";
            }}
          />
        </div>
      )}

      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={() => onRemove(index)}
        className="mt-2 h-8 w-8 hover:text-[var(--color-error)]"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}

export function GalleryBlockEditor({ block, onSubmit, onCancel, isLoading }: BlockEditorProps) {
  const [title, setTitle] = useState(block?.title || "");
  const [images, setImages] = useState<(GalleryImage & { id: string })[]>(() => {
    const metadata = block?.block_metadata as GalleryBlockMetadata | null;
    return (
      metadata?.images?.map((img, i) => ({ ...img, id: `img-${i}-${Date.now()}` })) || []
    );
  });
  const [deviceType, setDeviceType] = useState<DeviceType>(block?.device_type || "both");

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => {
    if (block) {
      setTitle(block.title || "");
      const metadata = block.block_metadata as GalleryBlockMetadata | null;
      setImages(
        metadata?.images?.map((img, i) => ({ ...img, id: `img-${i}-${Date.now()}` })) || []
      );
      setDeviceType(block.device_type || "both");
    }
  }, [block]);

  const handleAddImage = () => {
    setImages([...images, { id: `img-${Date.now()}`, url: "", alt: "" }]);
  };

  const handleImageChange = (index: number, field: keyof GalleryImage, value: string) => {
    const newImages = [...images];
    (newImages[index] as unknown as Record<string, string>)[field] = value;
    setImages(newImages);
  };

  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = images.findIndex((img) => img.id === active.id);
      const newIndex = images.findIndex((img) => img.id === over.id);
      setImages(arrayMove(images, oldIndex, newIndex));
    }
  };

  const handleSubmit = () => {
    const validImages = images.filter((img) => img.url.trim());
    const metadata: GalleryBlockMetadata = {
      images: validImages.map(({ url, alt, device_type }) => ({
        url: url.trim(),
        alt: alt?.trim(),
        device_type,
      })),
    };

    onSubmit({
      title: title.trim() || null,
      device_type: deviceType,
      block_metadata: metadata,
    });
  };

  const validImagesCount = images.filter((img) => img.url.trim()).length;

  return (
    <>
      <ModalBody>
        <div className="space-y-4">
          <Input
            label="Заголовок (опционально)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Заголовок галереи"
          />

          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="text-sm font-medium text-[var(--color-text-primary)]">
                Изображения ({validImagesCount})
              </label>
              <Button type="button" variant="secondary" size="sm" onClick={handleAddImage}>
                <Plus className="mr-1 h-4 w-4" />
                Добавить
              </Button>
            </div>

            {images.length === 0 ? (
              <div className="rounded-lg border border-dashed border-[var(--color-border)] p-8 text-center">
                <p className="text-sm text-[var(--color-text-muted)]">
                  Нет изображений. Добавьте первое изображение.
                </p>
              </div>
            ) : (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={images.map((img) => img.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-2 max-h-80 overflow-y-auto">
                    {images.map((image, index) => (
                      <SortableImageItem
                        key={image.id}
                        image={image}
                        index={index}
                        onChange={handleImageChange}
                        onRemove={handleRemoveImage}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            )}
          </div>

          <Select
            label="Устройства"
            value={deviceType}
            onChange={(e) => setDeviceType(e.target.value as DeviceType)}
            options={DEVICE_OPTIONS}
          />
        </div>
      </ModalBody>
      <ModalFooter>
        <Button variant="secondary" onClick={onCancel} disabled={isLoading}>
          Отмена
        </Button>
        <Button onClick={handleSubmit} disabled={isLoading || validImagesCount === 0}>
          {isLoading ? "Сохранение..." : block ? "Сохранить" : "Добавить"}
        </Button>
      </ModalFooter>
    </>
  );
}
