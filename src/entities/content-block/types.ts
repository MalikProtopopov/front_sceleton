// Content Block entity types

export type ContentBlockType = "text" | "image" | "video" | "gallery" | "link" | "result";
export type DeviceType = "mobile" | "desktop" | "both";

// Video providers
export type VideoProvider = "youtube" | "rutube" | "vimeo" | "other";

// Icon types for links
export type LinkIcon = "website" | "telegram" | "instagram" | "linkedin" | "facebook" | "twitter" | "youtube" | "tiktok" | "email" | "phone" | "other";

// Gallery image item
export interface GalleryImage {
  url: string;
  alt?: string;
  device_type?: DeviceType;
}

// Block metadata types
export interface TextBlockMetadata {
  // No additional metadata for text blocks
}

export interface ImageBlockMetadata {
  alt?: string;
  caption?: string;
}

export interface VideoBlockMetadata {
  provider?: VideoProvider;
}

export interface GalleryBlockMetadata {
  images: GalleryImage[];
}

export interface LinkBlockMetadata {
  icon?: LinkIcon;
}

export interface ResultBlockMetadata {
  // Result blocks use title, content, media_url, link_url, link_label directly
}

export type BlockMetadata =
  | TextBlockMetadata
  | ImageBlockMetadata
  | VideoBlockMetadata
  | GalleryBlockMetadata
  | LinkBlockMetadata
  | ResultBlockMetadata
  | Record<string, unknown>;

// Main ContentBlock interface
export interface ContentBlock {
  id: string;
  locale: string;
  block_type: ContentBlockType;
  sort_order: number;
  title: string | null;
  content: string | null;
  media_url: string | null;
  thumbnail_url: string | null;
  link_url: string | null;
  link_label: string | null;
  device_type: DeviceType | null;
  block_metadata: BlockMetadata | null;
}

// Request DTOs
export interface CreateContentBlockDto {
  locale: string;
  block_type: ContentBlockType;
  sort_order?: number;
  title?: string | null;
  content?: string | null;
  media_url?: string | null;
  thumbnail_url?: string | null;
  link_url?: string | null;
  link_label?: string | null;
  device_type?: DeviceType;
  block_metadata?: BlockMetadata | null;
}

export interface UpdateContentBlockDto {
  locale?: string;
  block_type?: ContentBlockType;
  sort_order?: number;
  title?: string | null;
  content?: string | null;
  media_url?: string | null;
  thumbnail_url?: string | null;
  link_url?: string | null;
  link_label?: string | null;
  device_type?: DeviceType;
  block_metadata?: BlockMetadata | null;
}

export interface ReorderContentBlocksDto {
  locale: string;
  block_ids: string[];
}

// Block type configuration for UI
export interface BlockTypeConfig {
  type: ContentBlockType;
  label: string;
  description: string;
  icon: string;
}

export const CONTENT_BLOCK_TYPES: BlockTypeConfig[] = [
  { type: "text", label: "Текст", description: "HTML-текст", icon: "text" },
  { type: "image", label: "Изображение", description: "Одно изображение", icon: "image" },
  { type: "video", label: "Видео", description: "YouTube, RuTube и др.", icon: "video" },
  { type: "gallery", label: "Галерея", description: "Слайдер изображений", icon: "gallery" },
  { type: "link", label: "Ссылка", description: "Кнопка/ссылка", icon: "link" },
  { type: "result", label: "Результат", description: "Блок результата", icon: "result" },
];

export const DEVICE_TYPES: { value: DeviceType; label: string }[] = [
  { value: "both", label: "Все устройства" },
  { value: "desktop", label: "Только десктоп" },
  { value: "mobile", label: "Только мобильные" },
];

export const VIDEO_PROVIDERS: { value: VideoProvider; label: string }[] = [
  { value: "youtube", label: "YouTube" },
  { value: "rutube", label: "RuTube" },
  { value: "vimeo", label: "Vimeo" },
  { value: "other", label: "Другой" },
];

export const LINK_ICONS: { value: LinkIcon; label: string }[] = [
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
