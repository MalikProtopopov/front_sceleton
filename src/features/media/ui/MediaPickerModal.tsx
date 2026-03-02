"use client";

import { useState, useCallback } from "react";
import { Upload, Image as ImageIcon } from "lucide-react";
import { useDropzone } from "react-dropzone";
import { useFiles, useUploadFile } from "../model/useMedia";
import { FileCard } from "./FileCard";
import {
  Modal,
  ModalBody,
  ModalFooter,
  Button,
  Pagination,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Spinner,
} from "@/shared/ui";
import { cn } from "@/shared/lib";
import type { FileAsset, FileFilterParams } from "@/entities/file";
import { SUPPORTED_IMAGE_TYPES } from "@/entities/file";
import { MAX_IMAGE_SIZE } from "@/shared/config";

interface MediaPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (file: FileAsset) => void;
  /** Filter to show only images */
  imagesOnly?: boolean;
  /** Modal title */
  title?: string;
}

export function MediaPickerModal({
  isOpen,
  onClose,
  onSelect,
  imagesOnly = true,
  title = "Выбрать изображение",
}: MediaPickerModalProps) {
  const [activeTab, setActiveTab] = useState<string>("library");
  const [filters, setFilters] = useState<FileFilterParams>({
    page: 1,
    pageSize: 12,
  });

  const { data, isLoading } = useFiles(filters);
  const { mutateAsync: uploadFile, isPending: isUploading } = useUploadFile();

  // Filter images on client if imagesOnly is true
  const files = data?.items?.filter((file) => {
    if (!imagesOnly) return true;
    return (
      SUPPORTED_IMAGE_TYPES.includes(file.mime_type) ||
      file.mime_type?.startsWith("image/")
    );
  }) || [];

  const handleSelect = (file: FileAsset) => {
    onSelect(file);
    onClose();
  };

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  // Upload dropzone
  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;

      try {
        const uploadedFile = await uploadFile({ file, folder: "content" });
        // Select the uploaded file immediately
        onSelect(uploadedFile);
        onClose();
      } catch (error) {
        // Error is handled by useUploadFile hook (shows toast)
        console.error("Upload failed:", error);
      }
    },
    [uploadFile, onSelect, onClose]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg"],
    },
    maxFiles: 1,
    maxSize: MAX_IMAGE_SIZE,
    disabled: isUploading,
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="2xl"
      className="z-[60]"
      closeOnOverlayClick={false}
    >
      <ModalBody className="p-0">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col h-full">
          <div className="border-b border-[var(--color-border)] px-6 pt-2">
            <TabsList>
              <TabsTrigger value="library">
                <ImageIcon className="mr-2 h-4 w-4" />
                Медиатека
              </TabsTrigger>
              <TabsTrigger value="upload">
                <Upload className="mr-2 h-4 w-4" />
                Загрузить
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="library" className="flex-1 px-6 pb-4 mt-0">
            {isLoading ? (
              <div className="flex min-h-[300px] items-center justify-center">
                <Spinner size="lg" />
              </div>
            ) : files.length === 0 ? (
              <div className="flex min-h-[300px] flex-col items-center justify-center text-center">
                <ImageIcon className="h-12 w-12 text-[var(--color-text-muted)] opacity-50" />
                <p className="mt-4 text-[var(--color-text-secondary)]">
                  {imagesOnly ? "Нет изображений в медиатеке" : "Нет файлов в медиатеке"}
                </p>
                <Button
                  variant="secondary"
                  className="mt-4"
                  onClick={() => setActiveTab("upload")}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Загрузить файл
                </Button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
                  {files.map((file) => (
                    <FileCard
                      key={file.id}
                      file={file}
                      selectable
                      onSelect={handleSelect}
                    />
                  ))}
                </div>

                {data && data.total > filters.pageSize! && (
                  <div className="mt-4 flex justify-center">
                    <Pagination
                      page={filters.page || 1}
                      pageSize={filters.pageSize || 12}
                      total={data.total}
                      onPageChange={handlePageChange}
                      showPageSize={false}
                      showTotal={false}
                    />
                  </div>
                )}
              </>
            )}
          </TabsContent>

          <TabsContent value="upload" className="flex-1 px-6 pb-4 mt-0">
            <div
              {...getRootProps()}
              className={cn(
                "flex min-h-[300px] cursor-pointer flex-col items-center justify-center rounded-[var(--radius-lg)] border-2 border-dashed p-8 transition-colors",
                isDragActive
                  ? "border-[var(--color-accent-primary)] bg-[var(--color-accent-primary)]/5"
                  : "border-[var(--color-border)] hover:border-[var(--color-border-hover)] hover:bg-[var(--color-bg-secondary)]",
                isUploading && "pointer-events-none opacity-50"
              )}
            >
              <input {...getInputProps()} />
              {isUploading ? (
                <div className="flex flex-col items-center gap-4">
                  <Spinner size="lg" />
                  <p className="text-[var(--color-text-secondary)]">
                    Загрузка...
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-4 text-center">
                  <div
                    className={cn(
                      "flex h-14 w-14 items-center justify-center rounded-full",
                      isDragActive
                        ? "bg-[var(--color-accent-primary)]/10"
                        : "bg-[var(--color-bg-secondary)]"
                    )}
                  >
                    <Upload
                      className={cn(
                        "h-6 w-6",
                        isDragActive
                          ? "text-[var(--color-accent-primary)]"
                          : "text-[var(--color-text-muted)]"
                      )}
                    />
                  </div>
                  <div>
                    <p className="text-[var(--color-text-primary)]">
                      {isDragActive
                        ? "Отпустите файл здесь"
                        : "Перетащите изображение сюда"}
                    </p>
                    <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                      или нажмите для выбора • PNG, JPG, GIF, WebP до 10MB
                    </p>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </ModalBody>

      <ModalFooter>
        <Button variant="secondary" onClick={onClose}>
          Отмена
        </Button>
      </ModalFooter>
    </Modal>
  );
}
