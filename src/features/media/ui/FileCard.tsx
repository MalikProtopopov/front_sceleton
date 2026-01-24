"use client";

import { useState } from "react";
import Image from "next/image";
import { File, Image as ImageIcon, FileText, Film, Music, Trash2, Copy, Check } from "lucide-react";
import { cn, formatFileSize, formatDate } from "@/shared/lib";
import { Button } from "@/shared/ui";
import type { FileAsset } from "@/entities/file";
import { SUPPORTED_IMAGE_TYPES } from "@/entities/file";

interface FileCardProps {
  file: FileAsset;
  isSelected?: boolean;
  onSelect?: (file: FileAsset) => void;
  onDelete?: (file: FileAsset) => void;
  selectable?: boolean;
}

export function FileCard({
  file,
  isSelected = false,
  onSelect,
  onDelete,
  selectable = false,
}: FileCardProps) {
  const [copied, setCopied] = useState(false);
  const isImage = SUPPORTED_IMAGE_TYPES.includes(file.mime_type);

  const handleCopyUrl = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(file.file_url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClick = () => {
    if (selectable && onSelect) {
      onSelect(file);
    }
  };

  // Determine which icon to render based on mime type
  const renderFileIcon = () => {
    const iconClass = "h-12 w-12 text-[var(--color-text-muted)]";
    if (file.mime_type.startsWith("image/")) return <ImageIcon className={iconClass} />;
    if (file.mime_type.startsWith("video/")) return <Film className={iconClass} />;
    if (file.mime_type.startsWith("audio/")) return <Music className={iconClass} />;
    if (file.mime_type.includes("pdf") || file.mime_type.includes("document")) return <FileText className={iconClass} />;
    return <File className={iconClass} />;
  };

  return (
    <div
      onClick={handleClick}
      className={cn(
        "group relative overflow-hidden rounded-[var(--radius-lg)] border bg-[var(--color-bg-primary)] transition-all duration-[var(--transition-normal)]",
        selectable && "cursor-pointer",
        isSelected
          ? "border-[var(--color-accent-primary)] ring-2 ring-[var(--color-accent-primary)]"
          : "border-[var(--color-border)] hover:border-[var(--color-border-hover)]",
      )}
    >
      {/* Preview area */}
      <div className="relative aspect-square overflow-hidden bg-[var(--color-bg-secondary)]">
        {isImage ? (
          <Image
            src={file.file_url}
            alt={file.alt_text || file.original_filename}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            {renderFileIcon()}
          </div>
        )}

        {/* Selection indicator */}
        {selectable && isSelected && (
          <div className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-[var(--color-accent-primary)] text-white">
            <Check className="h-4 w-4" />
          </div>
        )}

        {/* Action buttons overlay */}
        <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/50 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          <Button
            variant="secondary"
            size="icon"
            className="h-9 w-9 bg-white/90 hover:bg-white"
            onClick={handleCopyUrl}
            title="Скопировать URL"
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </Button>
          {onDelete && (
            <Button
              variant="danger"
              size="icon"
              className="h-9 w-9"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(file);
              }}
              title="Удалить"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* File info */}
      <div className="p-3">
        <p
          className="truncate text-sm font-medium text-[var(--color-text-primary)]"
          title={file.original_filename}
        >
          {file.original_filename}
        </p>
        <div className="mt-1 flex items-center gap-2 text-xs text-[var(--color-text-muted)]">
          <span>{formatFileSize(file.file_size)}</span>
          <span>•</span>
          <span>{formatDate(file.created_at)}</span>
        </div>
      </div>
    </div>
  );
}
