"use client";

import { useState, useEffect } from "react";
import { Button } from "../../Button";
import { Input } from "../../Input";
import { Select } from "../../Select";
import { ModalBody, ModalFooter } from "../../Modal";
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

          <Input
            label="URL изображения"
            value={mediaUrl}
            onChange={(e) => setMediaUrl(e.target.value)}
            placeholder="https://... или /media/..."
            required
          />

          {mediaUrl && (
            <div className="rounded-lg border border-[var(--color-border)] p-2">
              <img
                src={mediaUrl.startsWith("/") ? `${process.env.NEXT_PUBLIC_API_URL || ""}${mediaUrl}` : mediaUrl}
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
    </>
  );
}
