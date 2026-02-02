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

export function TextBlockEditor({ block, onSubmit, onCancel, isLoading }: BlockEditorProps) {
  const [title, setTitle] = useState(block?.title || "");
  const [content, setContent] = useState(block?.content || "");
  const [deviceType, setDeviceType] = useState<DeviceType>(block?.device_type || "both");

  useEffect(() => {
    if (block) {
      setTitle(block.title || "");
      setContent(block.content || "");
      setDeviceType(block.device_type || "both");
    }
  }, [block]);

  const handleSubmit = () => {
    onSubmit({
      title: title.trim() || null,
      content: content || null,
      device_type: deviceType,
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

          <div>
            <label className="mb-2 block text-sm font-medium text-[var(--color-text-primary)]">
              Текст (HTML)
            </label>
            <RichTextEditor
              value={content}
              onChange={setContent}
              placeholder="Введите текст..."
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
        <Button onClick={handleSubmit} disabled={isLoading || !content.trim()}>
          {isLoading ? "Сохранение..." : block ? "Сохранить" : "Добавить"}
        </Button>
      </ModalFooter>
    </>
  );
}
