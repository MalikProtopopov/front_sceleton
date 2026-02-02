"use client";

import { useState, useEffect } from "react";
import { Button } from "../../Button";
import { Input } from "../../Input";
import { Select } from "../../Select";
import { RichTextEditor } from "../../RichTextEditor";
import { ModalBody, ModalFooter } from "../../Modal";
import type { BlockEditorProps } from "../ContentBlocksManager";
import type { DeviceType } from "@/entities/content-block";

const DEVICE_OPTIONS = [
  { value: "both", label: "Все устройства" },
  { value: "desktop", label: "Только десктоп" },
  { value: "mobile", label: "Только мобильные" },
];

export function ResultBlockEditor({ block, onSubmit, onCancel, isLoading }: BlockEditorProps) {
  const [title, setTitle] = useState(block?.title || "");
  const [content, setContent] = useState(block?.content || "");
  const [mediaUrl, setMediaUrl] = useState(block?.media_url || "");
  const [linkUrl, setLinkUrl] = useState(block?.link_url || "");
  const [linkLabel, setLinkLabel] = useState(block?.link_label || "");
  const [deviceType, setDeviceType] = useState<DeviceType>(block?.device_type || "both");

  useEffect(() => {
    if (block) {
      setTitle(block.title || "");
      setContent(block.content || "");
      setMediaUrl(block.media_url || "");
      setLinkUrl(block.link_url || "");
      setLinkLabel(block.link_label || "");
      setDeviceType(block.device_type || "both");
    }
  }, [block]);

  const handleSubmit = () => {
    onSubmit({
      title: title.trim() || null,
      content: content || null,
      media_url: mediaUrl.trim() || null,
      link_url: linkUrl.trim() || null,
      link_label: linkLabel.trim() || null,
      device_type: deviceType,
    });
  };

  return (
    <>
      <ModalBody>
        <div className="space-y-4">
          <Input
            label="Заголовок"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Заголовок результата"
            required
          />

          <div>
            <label className="mb-2 block text-sm font-medium text-[var(--color-text-primary)]">
              Описание результата
            </label>
            <RichTextEditor
              value={content}
              onChange={setContent}
              placeholder="Опишите результат..."
            />
          </div>

          <Input
            label="URL медиа (опционально)"
            value={mediaUrl}
            onChange={(e) => setMediaUrl(e.target.value)}
            placeholder="https://... или /media/..."
          />

          {mediaUrl && (
            <div className="rounded-lg border border-[var(--color-border)] p-2">
              <img
                src={mediaUrl.startsWith("/") ? `${process.env.NEXT_PUBLIC_API_URL || ""}${mediaUrl}` : mediaUrl}
                alt="Preview"
                className="h-24 w-auto object-contain mx-auto"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="URL кнопки (опционально)"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="https://..."
            />
            <Input
              label="Текст кнопки"
              value={linkLabel}
              onChange={(e) => setLinkLabel(e.target.value)}
              placeholder="Подробнее"
              disabled={!linkUrl.trim()}
            />
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
        <Button onClick={handleSubmit} disabled={isLoading || !title.trim()}>
          {isLoading ? "Сохранение..." : block ? "Сохранить" : "Добавить"}
        </Button>
      </ModalFooter>
    </>
  );
}
