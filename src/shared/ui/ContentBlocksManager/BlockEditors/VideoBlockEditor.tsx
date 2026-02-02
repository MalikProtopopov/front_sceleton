"use client";

import { useState, useEffect } from "react";
import { Button } from "../../Button";
import { Input } from "../../Input";
import { Select } from "../../Select";
import { ModalBody, ModalFooter } from "../../Modal";
import type { BlockEditorProps } from "../ContentBlocksManager";
import type { DeviceType, VideoBlockMetadata, VideoProvider } from "@/entities/content-block";

const DEVICE_OPTIONS = [
  { value: "both", label: "Все устройства" },
  { value: "desktop", label: "Только десктоп" },
  { value: "mobile", label: "Только мобильные" },
];

const PROVIDER_OPTIONS = [
  { value: "youtube", label: "YouTube" },
  { value: "rutube", label: "RuTube" },
  { value: "vimeo", label: "Vimeo" },
  { value: "other", label: "Другой" },
];

export function VideoBlockEditor({ block, onSubmit, onCancel, isLoading }: BlockEditorProps) {
  const [title, setTitle] = useState(block?.title || "");
  const [mediaUrl, setMediaUrl] = useState(block?.media_url || "");
  const [thumbnailUrl, setThumbnailUrl] = useState(block?.thumbnail_url || "");
  const [provider, setProvider] = useState<VideoProvider>(
    (block?.block_metadata as VideoBlockMetadata)?.provider || "youtube"
  );
  const [deviceType, setDeviceType] = useState<DeviceType>(block?.device_type || "both");

  useEffect(() => {
    if (block) {
      setTitle(block.title || "");
      setMediaUrl(block.media_url || "");
      setThumbnailUrl(block.thumbnail_url || "");
      const metadata = block.block_metadata as VideoBlockMetadata | null;
      setProvider(metadata?.provider || "youtube");
      setDeviceType(block.device_type || "both");
    }
  }, [block]);

  // Auto-detect provider from URL
  useEffect(() => {
    if (mediaUrl.includes("youtube.com") || mediaUrl.includes("youtu.be")) {
      setProvider("youtube");
    } else if (mediaUrl.includes("rutube.ru")) {
      setProvider("rutube");
    } else if (mediaUrl.includes("vimeo.com")) {
      setProvider("vimeo");
    }
  }, [mediaUrl]);

  const handleSubmit = () => {
    const metadata: VideoBlockMetadata = { provider };

    onSubmit({
      title: title.trim() || null,
      media_url: mediaUrl.trim() || null,
      thumbnail_url: thumbnailUrl.trim() || null,
      device_type: deviceType,
      block_metadata: metadata,
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
            placeholder="Заголовок видео"
          />

          <Input
            label="URL видео"
            value={mediaUrl}
            onChange={(e) => setMediaUrl(e.target.value)}
            placeholder="https://www.youtube.com/watch?v=..."
            required
          />

          <Select
            label="Платформа"
            value={provider}
            onChange={(e) => setProvider(e.target.value as VideoProvider)}
            options={PROVIDER_OPTIONS}
          />

          <Input
            label="URL превью (опционально)"
            value={thumbnailUrl}
            onChange={(e) => setThumbnailUrl(e.target.value)}
            placeholder="https://... (если не указано, будет автоматически)"
          />

          {thumbnailUrl && (
            <div className="rounded-lg border border-[var(--color-border)] p-2">
              <img
                src={thumbnailUrl}
                alt="Video thumbnail"
                className="h-24 w-auto object-contain mx-auto"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            </div>
          )}

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
