"use client";

import { useState, useCallback, useRef, useId } from "react";
import Image from "next/image";
import {
  Upload,
  X,
  Loader2,
  ImageIcon,
  AlertCircle,
  RefreshCw,
  Check,
  FileImage,
} from "lucide-react";
import { cn, formatFileSize, getMediaUrl } from "@/shared/lib";

// ============================================================================
// CONSTANTS
// ============================================================================

const SUPPORTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
] as const;

const SUPPORTED_EXTENSIONS = "JPEG, PNG, WebP, GIF";
const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_SIZE_TEXT = "10MB";

// ============================================================================
// TYPES
// ============================================================================

type UploadState = "idle" | "drag-over" | "uploading" | "success" | "error";

interface UploadedFileInfo {
  name: string;
  size: number;
  url: string;
}

interface ImageUploadProps {
  /** Entity ID - required for upload/delete endpoints */
  entityId?: string;
  /** Current image URL (if image already exists) */
  currentImageUrl?: string | null;
  /** Label for the upload field */
  label?: string;
  /** Upload handler - receives file and should return promise */
  onUpload: (file: File) => Promise<void>;
  /** Delete handler - should return promise */
  onDelete: () => Promise<void>;
  /** Called when image is successfully uploaded/deleted */
  onSuccess?: () => void;
  /** Disable the component */
  disabled?: boolean;
  /** Additional className for wrapper */
  className?: string;
  /** Help text shown below the component */
  helpText?: string;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function validateFile(file: File): { valid: boolean; error?: string } {
  // Check file type
  if (!SUPPORTED_IMAGE_TYPES.includes(file.type as typeof SUPPORTED_IMAGE_TYPES[number])) {
    return {
      valid: false,
      error: `Неподдерживаемый формат. Допустимые: ${SUPPORTED_EXTENSIONS}`,
    };
  }

  // Check file size
  if (file.size > MAX_IMAGE_SIZE) {
    return {
      valid: false,
      error: `Файл слишком большой (${formatFileSize(file.size)}). Максимум: ${MAX_SIZE_TEXT}`,
    };
  }

  return { valid: true };
}

function createPreviewUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// ============================================================================
// STYLES
// ============================================================================

const containerStyles = {
  base: cn(
    "relative w-full max-w-[520px]",
    "rounded-[var(--radius-lg)]",
    "border-2 border-dashed",
    "transition-all duration-200 ease-out",
    "overflow-hidden",
    "bg-[var(--color-bg-secondary)]"
  ),
  idle: cn(
    "border-[var(--color-border)]",
    "hover:border-[var(--color-border-hover)]",
    "hover:bg-[var(--color-bg-hover)]"
  ),
  dragOver: cn(
    "border-[var(--color-accent-primary)]",
    "bg-[var(--color-accent-primary)]/5",
    "scale-[1.01]"
  ),
  success: cn(
    "border-[var(--color-border)]",
    "bg-[var(--color-bg-primary)]",
    "border-solid"
  ),
  error: cn(
    "border-[var(--color-error)]",
    "bg-[var(--color-error)]/5"
  ),
  disabled: cn(
    "opacity-50",
    "cursor-not-allowed",
    "pointer-events-none"
  ),
};

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

interface IdleStateProps {
  isDragging: boolean;
  onSelectClick: () => void;
  inputId: string;
}

function IdleState({ isDragging, onSelectClick, inputId }: IdleStateProps) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 p-6 text-center">
      {/* Icon */}
      <div
        className={cn(
          "flex h-14 w-14 items-center justify-center rounded-full transition-all duration-200",
          isDragging
            ? "bg-[var(--color-accent-primary)]/20 text-[var(--color-accent-primary)] scale-110"
            : "bg-[var(--color-bg-elevated)] text-[var(--color-text-muted)]"
        )}
      >
        <ImageIcon className="h-6 w-6" />
      </div>

      {/* Text */}
      <div className="space-y-1">
        <p
          className={cn(
            "text-sm font-medium transition-colors",
            isDragging
              ? "text-[var(--color-accent-primary)]"
              : "text-[var(--color-text-primary)]"
          )}
        >
          {isDragging ? "Отпустите для загрузки" : "Перетащите изображение сюда"}
        </p>
        <p className="text-sm text-[var(--color-text-muted)]">
          или нажмите для выбора
        </p>
      </div>

      {/* Hint */}
      <p className="text-xs text-[var(--color-text-muted)]">
        1 файл • {SUPPORTED_EXTENSIONS} • до {MAX_SIZE_TEXT}
      </p>

      {/* Select Button */}
      {!isDragging && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onSelectClick();
          }}
          className={cn(
            "inline-flex items-center gap-2 rounded-[var(--radius-md)]",
            "bg-[var(--color-accent-primary)] px-4 py-2",
            "text-sm font-medium text-white",
            "transition-all duration-150",
            "hover:bg-[var(--color-accent-primary-hover)]",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent-primary)] focus-visible:ring-offset-2"
          )}
          aria-controls={inputId}
        >
          <Upload className="h-4 w-4" />
          Выбрать файл
        </button>
      )}
    </div>
  );
}

interface UploadingStateProps {
  previewUrl: string | null;
  fileName: string;
}

function UploadingState({ previewUrl, fileName }: UploadingStateProps) {
  return (
    <div className="relative h-full w-full">
      {/* Preview with overlay */}
      {previewUrl ? (
        <Image
          src={previewUrl}
          alt="Загрузка..."
          fill
          className="object-cover opacity-40"
          sizes="520px"
        />
      ) : (
        <div className="absolute inset-0 animate-pulse bg-[var(--color-bg-elevated)]" />
      )}

      {/* Loading overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/40 backdrop-blur-sm">
        <Loader2 className="h-10 w-10 animate-spin text-white" />
        <div className="text-center">
          <p className="text-sm font-medium text-white">Загрузка...</p>
          <p className="mt-1 max-w-[200px] truncate text-xs text-white/70">
            {fileName}
          </p>
        </div>
      </div>
    </div>
  );
}

interface SuccessStateProps {
  imageUrl: string;
  fileInfo: UploadedFileInfo | null;
  onReplace: () => void;
  onDelete: () => void;
  isDeleting: boolean;
}

function SuccessState({
  imageUrl,
  fileInfo,
  onReplace,
  onDelete,
  isDeleting,
}: SuccessStateProps) {
  return (
    <div className="flex h-full flex-col">
      {/* Image Preview - Fixed height */}
      <div className="relative h-[200px] w-full flex-shrink-0 overflow-hidden bg-[var(--color-bg-elevated)]">
        <Image
          src={imageUrl}
          alt="Превью"
          fill
          className="object-cover"
          sizes="520px"
          unoptimized={imageUrl.startsWith("http://") || imageUrl.startsWith("https://")}
        />

        {/* Gradient overlay at bottom for better text readability if needed */}
        <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-black/20 to-transparent" />
      </div>

      {/* Info Bar */}
      <div className="flex items-center gap-3 border-t border-[var(--color-border)] bg-[var(--color-bg-primary)] px-4 py-3">
        {/* File icon & info */}
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-success)]/10">
            <FileImage className="h-5 w-5 text-[var(--color-success)]" />
          </div>
          <div className="min-w-0 flex-1">
            {fileInfo ? (
              <>
                <p className="truncate text-sm font-medium text-[var(--color-text-primary)]">
                  {fileInfo.name}
                </p>
                <p className="flex items-center gap-2 text-xs text-[var(--color-text-muted)]">
                  <span>{formatFileSize(fileInfo.size)}</span>
                  <span className="inline-flex items-center gap-1 text-[var(--color-success)]">
                    <Check className="h-3 w-3" />
                    Загружено
                  </span>
                </p>
              </>
            ) : (
              <>
                <p className="text-sm font-medium text-[var(--color-text-primary)]">
                  Изображение загружено
                </p>
                <p className="flex items-center gap-1 text-xs text-[var(--color-success)]">
                  <Check className="h-3 w-3" />
                  Готово
                </p>
              </>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onReplace();
            }}
            disabled={isDeleting}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-[var(--radius-md)]",
              "border border-[var(--color-border)] bg-[var(--color-bg-primary)]",
              "px-3 py-1.5 text-sm font-medium text-[var(--color-text-primary)]",
              "transition-all duration-150",
              "hover:bg-[var(--color-bg-hover)] hover:border-[var(--color-border-hover)]",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent-primary)] focus-visible:ring-offset-1",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Заменить
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            disabled={isDeleting}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-[var(--radius-md)]",
              "border border-[var(--color-error)]/30 bg-[var(--color-error)]/5",
              "px-3 py-1.5 text-sm font-medium text-[var(--color-error)]",
              "transition-all duration-150",
              "hover:bg-[var(--color-error)]/10 hover:border-[var(--color-error)]/50",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-error)] focus-visible:ring-offset-1",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
          >
            {isDeleting ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <X className="h-3.5 w-3.5" />
            )}
            Удалить
          </button>
        </div>
      </div>
    </div>
  );
}

interface ErrorMessageProps {
  error: string;
  onRetry: () => void;
}

function ErrorMessage({ error, onRetry }: ErrorMessageProps) {
  return (
    <div className="mt-2 flex items-start gap-2 rounded-[var(--radius-md)] border border-[var(--color-error)]/20 bg-[var(--color-error-bg)] p-3">
      <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-[var(--color-error)]" />
      <div className="min-w-0 flex-1">
        <p className="text-sm text-[var(--color-error)]">{error}</p>
        <button
          type="button"
          onClick={onRetry}
          className={cn(
            "mt-1 text-sm font-medium text-[var(--color-error)]",
            "underline underline-offset-2",
            "transition-colors hover:text-[var(--color-error)]/80",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-error)]"
          )}
        >
          Попробовать снова
        </button>
      </div>
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function ImageUpload({
  entityId,
  currentImageUrl,
  label,
  onUpload,
  onDelete,
  onSuccess,
  disabled = false,
  className,
  helpText,
}: ImageUploadProps) {
  // Unique ID for accessibility
  const inputId = useId();

  // State
  const [state, setState] = useState<UploadState>(
    currentImageUrl ? "success" : "idle"
  );
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadedFileInfo, setUploadedFileInfo] = useState<UploadedFileInfo | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [pendingFileName, setPendingFileName] = useState<string>("");

  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Derived state
  const isDisabled = disabled || state === "uploading" || isDeleting;
  // Convert relative media URLs to absolute for Next.js Image component
  const displayImageUrl = previewUrl || (currentImageUrl ? getMediaUrl(currentImageUrl) : null);
  const showImage = state === "success" && displayImageUrl;

  // -------------------------------------------------------------------------
  // File Input Handlers
  // -------------------------------------------------------------------------

  const openFileDialog = useCallback(() => {
    if (isDisabled || !fileInputRef.current) return;

    // CRITICAL: Clear input value before opening to allow re-selecting the same file
    fileInputRef.current.value = "";
    fileInputRef.current.click();
  }, [isDisabled]);

  const handleFileSelect = useCallback(
    async (file: File) => {
      setError(null);

      // Validate file before anything else
      const validation = validateFile(file);
      if (!validation.valid) {
        setError(validation.error!);
        setState(currentImageUrl ? "success" : "idle");
        return;
      }

      // Create preview immediately for better UX
      setPendingFileName(file.name);
      try {
        const preview = await createPreviewUrl(file);
        setPreviewUrl(preview);
      } catch {
        // Preview creation failed, continue without preview
        setPreviewUrl(null);
      }

      // Start upload
      setState("uploading");

      try {
        await onUpload(file);

        // Success!
        setUploadedFileInfo({
          name: file.name,
          size: file.size,
          url: previewUrl || "",
        });
        setState("success");
        onSuccess?.();
      } catch (err) {
        // Error during upload
        setError(err instanceof Error ? err.message : "Ошибка загрузки файла");
        setState("error");
        setPreviewUrl(null);
        setPendingFileName("");
      }
    },
    [onUpload, onSuccess, currentImageUrl, previewUrl]
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        handleFileSelect(file);
      }
    },
    [handleFileSelect]
  );

  // -------------------------------------------------------------------------
  // Drag & Drop Handlers
  // -------------------------------------------------------------------------

  const handleDragEnter = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (isDisabled) return;

      // Only react to files being dragged
      if (e.dataTransfer.types.includes("Files")) {
        setState("drag-over");
      }
    },
    [isDisabled]
  );

  const handleDragLeave = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();

      // Make sure we're actually leaving the container, not just entering a child
      if (containerRef.current && !containerRef.current.contains(e.relatedTarget as Node)) {
        setState((prev) => (prev === "drag-over" ? (currentImageUrl ? "success" : "idle") : prev));
      }
    },
    [currentImageUrl]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (isDisabled) {
        setState(currentImageUrl ? "success" : "idle");
        return;
      }

      const files = Array.from(e.dataTransfer.files);
      const imageFile = files.find((f) =>
        SUPPORTED_IMAGE_TYPES.includes(f.type as typeof SUPPORTED_IMAGE_TYPES[number])
      );

      if (imageFile) {
        handleFileSelect(imageFile);
      } else if (files.length > 0) {
        setError(`Неподдерживаемый формат. Допустимые: ${SUPPORTED_EXTENSIONS}`);
        setState(currentImageUrl ? "success" : "error");
      } else {
        setState(currentImageUrl ? "success" : "idle");
      }
    },
    [isDisabled, handleFileSelect, currentImageUrl]
  );

  // -------------------------------------------------------------------------
  // Delete Handler
  // -------------------------------------------------------------------------

  const handleDelete = useCallback(async () => {
    if (isDeleting) return;

    setError(null);
    setIsDeleting(true);

    try {
      await onDelete();

      // Clear all image-related state
      setPreviewUrl(null);
      setUploadedFileInfo(null);
      setState("idle");
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка удаления файла");
    } finally {
      setIsDeleting(false);
    }
  }, [onDelete, onSuccess, isDeleting]);

  // -------------------------------------------------------------------------
  // Retry Handler
  // -------------------------------------------------------------------------

  const handleRetry = useCallback(() => {
    setError(null);
    setState(currentImageUrl ? "success" : "idle");
    openFileDialog();
  }, [currentImageUrl, openFileDialog]);

  // -------------------------------------------------------------------------
  // Container click handler (only for idle/error states)
  // -------------------------------------------------------------------------

  const handleContainerClick = useCallback(() => {
    if (state === "idle" || state === "drag-over") {
      openFileDialog();
    }
  }, [state, openFileDialog]);

  // -------------------------------------------------------------------------
  // Keyboard accessibility
  // -------------------------------------------------------------------------

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if ((state === "idle" || state === "drag-over") && (e.key === "Enter" || e.key === " ")) {
        e.preventDefault();
        openFileDialog();
      }
    },
    [state, openFileDialog]
  );

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------

  // Compute container height based on state
  const containerHeight = showImage ? "h-auto" : "h-[240px]";

  // Compute container styles based on state
  const containerStateStyles = (() => {
    if (isDisabled && state !== "uploading") return containerStyles.disabled;

    switch (state) {
      case "drag-over":
        return containerStyles.dragOver;
      case "success":
        return containerStyles.success;
      case "error":
        return containerStyles.error;
      default:
        return containerStyles.idle;
    }
  })();

  // Should the container be interactive (clickable)?
  const isContainerInteractive = state === "idle" || state === "drag-over";

  return (
    <div className={cn("w-full max-w-[520px]", className)}>
      {/* Label */}
      {label && (
        <label
          htmlFor={inputId}
          className="mb-2 block text-sm font-medium text-[var(--color-text-primary)]"
        >
          {label}
        </label>
      )}

      {/* Main Container */}
      <div
        ref={containerRef}
        role={isContainerInteractive ? "button" : undefined}
        tabIndex={isContainerInteractive && !isDisabled ? 0 : -1}
        aria-label={isContainerInteractive ? "Выбрать изображение" : undefined}
        aria-disabled={isDisabled}
        onClick={isContainerInteractive ? handleContainerClick : undefined}
        onKeyDown={isContainerInteractive ? handleKeyDown : undefined}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={cn(
          containerStyles.base,
          containerHeight,
          containerStateStyles,
          isContainerInteractive && !isDisabled && "cursor-pointer",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent-primary)] focus-visible:ring-offset-2"
        )}
      >
        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          id={inputId}
          type="file"
          accept={SUPPORTED_IMAGE_TYPES.join(",")}
          onChange={handleInputChange}
          className="sr-only"
          tabIndex={-1}
          aria-hidden="true"
        />

        {/* State-based Content */}
        {state === "uploading" ? (
          <UploadingState previewUrl={previewUrl} fileName={pendingFileName} />
        ) : showImage ? (
          <SuccessState
            imageUrl={displayImageUrl!}
            fileInfo={uploadedFileInfo}
            onReplace={openFileDialog}
            onDelete={handleDelete}
            isDeleting={isDeleting}
          />
        ) : (
          <IdleState
            isDragging={state === "drag-over"}
            onSelectClick={openFileDialog}
            inputId={inputId}
          />
        )}
      </div>

      {/* Error Message */}
      {error && <ErrorMessage error={error} onRetry={handleRetry} />}

      {/* Help Text */}
      {helpText && !error && (
        <p className="mt-2 text-xs text-[var(--color-text-muted)]">{helpText}</p>
      )}

      {/* Entity ID hint */}
      {!entityId && !disabled && (
        <p className="mt-2 text-xs text-[var(--color-text-muted)]">
          Сохраните запись, чтобы загрузить изображение
        </p>
      )}
    </div>
  );
}
