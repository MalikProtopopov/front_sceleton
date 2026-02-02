"use client";

import { useState, useEffect } from "react";
import { Button } from "../../Button";
import { Input } from "../../Input";
import { Select } from "../../Select";
import { ModalBody, ModalFooter } from "../../Modal";
import type { BlockEditorProps } from "../ContentBlocksManager";
import type { DeviceType, LinkBlockMetadata, LinkIcon } from "@/entities/content-block";

const DEVICE_OPTIONS = [
  { value: "both", label: "Все устройства" },
  { value: "desktop", label: "Только десктоп" },
  { value: "mobile", label: "Только мобильные" },
];

const ICON_OPTIONS = [
  { value: "website", label: "Веб-сайт" },
  { value: "telegram", label: "Telegram" },
  { value: "instagram", label: "Instagram" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "facebook", label: "Facebook" },
  { value: "twitter", label: "X (Twitter)" },
  { value: "youtube", label: "YouTube" },
  { value: "tiktok", label: "TikTok" },
  { value: "email", label: "Email" },
  { value: "phone", label: "Телефон" },
  { value: "other", label: "Другое" },
];

export function LinkBlockEditor({ block, onSubmit, onCancel, isLoading }: BlockEditorProps) {
  const [title, setTitle] = useState(block?.title || "");
  const [linkUrl, setLinkUrl] = useState(block?.link_url || "");
  const [linkLabel, setLinkLabel] = useState(block?.link_label || "");
  const [icon, setIcon] = useState<LinkIcon>(
    (block?.block_metadata as LinkBlockMetadata)?.icon || "website"
  );
  const [deviceType, setDeviceType] = useState<DeviceType>(block?.device_type || "both");

  useEffect(() => {
    if (block) {
      setTitle(block.title || "");
      setLinkUrl(block.link_url || "");
      setLinkLabel(block.link_label || "");
      const metadata = block.block_metadata as LinkBlockMetadata | null;
      setIcon(metadata?.icon || "website");
      setDeviceType(block.device_type || "both");
    }
  }, [block]);

  // Auto-detect icon from URL
  useEffect(() => {
    const url = linkUrl.toLowerCase();
    if (url.includes("t.me") || url.includes("telegram")) {
      setIcon("telegram");
    } else if (url.includes("instagram.com")) {
      setIcon("instagram");
    } else if (url.includes("linkedin.com")) {
      setIcon("linkedin");
    } else if (url.includes("facebook.com") || url.includes("fb.com")) {
      setIcon("facebook");
    } else if (url.includes("twitter.com") || url.includes("x.com")) {
      setIcon("twitter");
    } else if (url.includes("youtube.com") || url.includes("youtu.be")) {
      setIcon("youtube");
    } else if (url.includes("tiktok.com")) {
      setIcon("tiktok");
    } else if (url.startsWith("mailto:")) {
      setIcon("email");
    } else if (url.startsWith("tel:")) {
      setIcon("phone");
    }
  }, [linkUrl]);

  const handleSubmit = () => {
    const metadata: LinkBlockMetadata = { icon };

    onSubmit({
      title: title.trim() || null,
      link_url: linkUrl.trim() || null,
      link_label: linkLabel.trim() || null,
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
            placeholder="Заголовок блока со ссылкой"
          />

          <Input
            label="URL ссылки"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            placeholder="https://... или tel:... или mailto:..."
            required
          />

          <Input
            label="Текст ссылки"
            value={linkLabel}
            onChange={(e) => setLinkLabel(e.target.value)}
            placeholder="Текст, отображаемый на кнопке/ссылке"
            required
          />

          <Select
            label="Иконка"
            value={icon}
            onChange={(e) => setIcon(e.target.value as LinkIcon)}
            options={ICON_OPTIONS}
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
        <Button onClick={handleSubmit} disabled={isLoading || !linkUrl.trim() || !linkLabel.trim()}>
          {isLoading ? "Сохранение..." : block ? "Сохранить" : "Добавить"}
        </Button>
      </ModalFooter>
    </>
  );
}
