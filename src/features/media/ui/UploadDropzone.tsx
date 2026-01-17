"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, X, FileUp } from "lucide-react";
import { cn, formatFileSize } from "@/shared/lib";
import { Button, Spinner } from "@/shared/ui";
import { useUploadFile } from "../model/useMedia";

interface UploadDropzoneProps {
  folder?: string;
  onUploadComplete?: () => void;
  maxFiles?: number;
  maxSize?: number; // in bytes
  accept?: Record<string, string[]>;
}

interface QueuedFile {
  file: File;
  status: "pending" | "uploading" | "done" | "error";
  error?: string;
}

export function UploadDropzone({
  folder,
  onUploadComplete,
  maxFiles = 10,
  maxSize = 10 * 1024 * 1024, // 10MB default
  accept = {
    "image/*": [".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg"],
    "application/pdf": [".pdf"],
  },
}: UploadDropzoneProps) {
  const [queue, setQueue] = useState<QueuedFile[]>([]);
  const { mutateAsync: uploadFile } = useUploadFile();

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      // Add files to queue
      const newQueue = acceptedFiles.map((file) => ({
        file,
        status: "pending" as const,
      }));
      setQueue((prev) => [...prev, ...newQueue]);

      // Upload files sequentially
      for (const item of newQueue) {
        setQueue((prev) =>
          prev.map((q) =>
            q.file === item.file ? { ...q, status: "uploading" as const } : q,
          ),
        );

        try {
          await uploadFile({ file: item.file, folder });
          setQueue((prev) =>
            prev.map((q) =>
              q.file === item.file ? { ...q, status: "done" as const } : q,
            ),
          );
        } catch (error) {
          setQueue((prev) =>
            prev.map((q) =>
              q.file === item.file
                ? {
                    ...q,
                    status: "error" as const,
                    error: error instanceof Error ? error.message : "Upload failed",
                  }
                : q,
            ),
          );
        }
      }

      onUploadComplete?.();
    },
    [uploadFile, folder, onUploadComplete],
  );

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept,
    maxFiles,
    maxSize,
  });

  const removeFromQueue = (file: File) => {
    setQueue((prev) => prev.filter((q) => q.file !== file));
  };

  const clearQueue = () => {
    setQueue([]);
  };

  const hasQueue = queue.length > 0;

  return (
    <div className="space-y-4">
      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={cn(
          "flex min-h-[200px] cursor-pointer flex-col items-center justify-center rounded-[var(--radius-lg)] border-2 border-dashed p-8 transition-colors",
          isDragActive && !isDragReject
            ? "border-[var(--color-accent-primary)] bg-[var(--color-accent-primary)]/5"
            : isDragReject
            ? "border-[var(--color-error)] bg-[var(--color-error-bg)]"
            : "border-[var(--color-border)] hover:border-[var(--color-border-hover)] hover:bg-[var(--color-bg-secondary)]",
        )}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-4 text-center">
          <div
            className={cn(
              "flex h-14 w-14 items-center justify-center rounded-full",
              isDragActive ? "bg-[var(--color-accent-primary)]/10" : "bg-[var(--color-bg-secondary)]",
            )}
          >
            <Upload
              className={cn(
                "h-6 w-6",
                isDragActive ? "text-[var(--color-accent-primary)]" : "text-[var(--color-text-muted)]",
              )}
            />
          </div>
          <div>
            <p className="text-[var(--color-text-primary)]">
              {isDragActive ? "Отпустите файлы здесь" : "Перетащите файлы сюда"}
            </p>
            <p className="mt-1 text-sm text-[var(--color-text-muted)]">
              или нажмите для выбора • Максимум {maxFiles} файлов до {formatFileSize(maxSize)}
            </p>
          </div>
        </div>
      </div>

      {/* Upload queue */}
      {hasQueue && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-[var(--color-text-secondary)]">
              Очередь загрузки
            </h4>
            <Button variant="ghost" size="sm" onClick={clearQueue}>
              Очистить
            </Button>
          </div>
          <div className="max-h-[300px] space-y-2 overflow-y-auto">
            {queue.map((item, index) => (
              <div
                key={`${item.file.name}-${index}`}
                className="flex items-center gap-3 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-primary)] p-3"
              >
                <FileUp className="h-5 w-5 flex-shrink-0 text-[var(--color-text-muted)]" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-[var(--color-text-primary)]">
                    {item.file.name}
                  </p>
                  <p className="text-xs text-[var(--color-text-muted)]">
                    {formatFileSize(item.file.size)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {item.status === "uploading" && <Spinner size="sm" />}
                  {item.status === "done" && (
                    <span className="text-sm text-[var(--color-success)]">✓</span>
                  )}
                  {item.status === "error" && (
                    <span className="text-sm text-[var(--color-error)]" title={item.error}>
                      ✗
                    </span>
                  )}
                  {(item.status === "pending" || item.status === "error") && (
                    <button
                      onClick={() => removeFromQueue(item.file)}
                      className="text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

