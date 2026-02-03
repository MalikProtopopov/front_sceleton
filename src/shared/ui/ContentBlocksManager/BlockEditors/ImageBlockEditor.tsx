"use client";

import { useState, useEffect } from "react";
import { ImageIcon } from "lucide-react";
import { Button } from "../../Button";
import { Input } from "../../Input";
import { Select } from "../../Select";
import { ModalBody, ModalFooter } from "../../Modal";
import { MediaPickerModal } from "@/features/media";
import { getFileContentUrl, getMediaUrl } from "@/shared/lib";
import type { BlockEditorProps } from "../ContentBlocksManager";
import type { DeviceType, ImageBlockMetadata } from "@/entities/content-block";

const DEVICE_OPTIONS = [
  { value: "both", label: "Все устройства" },
  { value: "desktop", label: "Только десктоп" },
  { value: "mobile", label: "Только мобильные" },
];

export function ImageBlockEditor({ block, onSubmit, onCancel, isLoading }: BlockEditorProps) {
  const [title, setTitle] = useState(block?.title || "");
  const [mediaUrl, setMediaUrl] = useState(block?.media_url || "");
  const [alt, setAlt] = useState((block?.block_metadata as ImageBlockMetadata)?.alt || "");
  const [caption, setCaption] = useState((block?.block_metadata as ImageBlockMetadata)?.caption || "");
  const [deviceType, setDeviceType] = useState<DeviceType>(block?.device_type || "both");
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);

  useEffect(() => {
    if (block) {
      setTitle(block.title || "");
      setMediaUrl(block.media_url || "");
      const metadata = block.block_metadata as ImageBlockMetadata | null;
      setAlt(metadata?.alt || "");
      setCaption(metadata?.caption || "");
      setDeviceType(block.device_type || "both");
    }
  }, [block]);

  const handleSubmit = () => {
    const metadata: ImageBlockMetadata = {};
    if (alt.trim()) metadata.alt = alt.trim();
    if (caption.trim()) metadata.caption = caption.trim();

    onSubmit({
      title: title.trim() || null,
      media_url: mediaUrl.trim() || null,
      device_type: deviceType,
      block_metadata: Object.keys(metadata).length > 0 ? metadata : null,
    });
  };

  const handleMediaSelect = (file: import("@/entities/file").FileAsset) => {
    setMediaUrl(getFileContentUrl(file));
    if (file.alt_text) {
      setAlt(file.alt_text);
    }
    setMediaPickerOpen(false);
  };

  return (
    <>
      <ModalBody>
        <div className="space-y-4">
          <Input
            label="Заголовок (опционально)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Заголовок блока"
          />

          <div>
            <label className="mb-2 block text-sm font-medium text-[var(--color-text-primary)]">
              Изображение <span className="text-[var(--color-error)]">*</span>
            </label>
            <div className="flex gap-2">
              <Input
                value={mediaUrl}
                onChange={(e) => setMediaUrl(e.target.value)}
                placeholder="https://... или /media/..."
                className="flex-1"
              />
              <Button
                type="button"
                variant="secondary"
                onClick={() => setMediaPickerOpen(true)}
              >
                <ImageIcon className="mr-2 h-4 w-4" />
                Выбрать
              </Button>
            </div>
          </div>

          {mediaUrl && (
            <div className="rounded-lg border border-[var(--color-border)] p-2">
              <img
                src={getMediaUrl(mediaUrl)}
                alt={alt || "Preview"}
                className="h-32 w-auto object-contain mx-auto"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            </div>
          )}

          <Input
            label="Alt-текст"
            value={alt}
            onChange={(e) => setAlt(e.target.value)}
            placeholder="Описание изображения для SEO"
          />

          <Input
            label="Подпись"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Подпись под изображением"
          />

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
        <Button onClick={handleSubmit} disabled={isLoading || !mediaUrl.trim()}>
          {isLoading ? "Сохранение..." : block ? "Сохранить" : "Добавить"}
        </Button>
      </ModalFooter>

      <MediaPickerModal
        isOpen={mediaPickerOpen}
        onClose={() => setMediaPickerOpen(false)}
        onSelect={handleMediaSelect}
        imagesOnly
        title="Выбрать изображение"
      />
    </>
  );
}
