"use client";

import { useEffect, useRef, useId, createContext, useContext } from "react";
import { X } from "lucide-react";
import { cn } from "@/shared/lib";
import { Button } from "../Button";

// ============================================================================
// TYPES
// ============================================================================

type ModalSize = "sm" | "md" | "lg" | "xl" | "2xl" | "full";

export interface ModalProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Callback when modal should close */
  onClose: () => void;
  /** Modal title in header */
  title?: string;
  /** Optional description below title */
  description?: string;
  /** Modal content - should use ModalBody and optionally ModalFooter */
  children: React.ReactNode;
  /** Modal width size */
  size?: ModalSize;
  /** Show close button in header */
  showCloseButton?: boolean;
  /** Close when clicking overlay */
  closeOnOverlayClick?: boolean;
  /** Close when pressing Escape */
  closeOnEscape?: boolean;
  /** Additional className for modal container */
  className?: string;
}

export interface ModalBodyProps {
  children: React.ReactNode;
  className?: string;
}

export interface ModalFooterProps {
  children: React.ReactNode;
  className?: string;
}

// ============================================================================
// CONTEXT
// ============================================================================

const ModalContext = createContext<{ onClose: () => void } | null>(null);

// Context hook for potential future use by compound components
export function useModalContext() {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error("Modal compound components must be used within Modal");
  }
  return context;
}

// ============================================================================
// SIZE CONFIGURATION
// ============================================================================

const sizeConfig: Record<ModalSize, string> = {
  sm: "max-w-[400px]",
  md: "max-w-[520px]",
  lg: "max-w-[640px]",
  xl: "max-w-[768px]",
  "2xl": "max-w-[900px]",
  full: "max-w-[calc(100vw-2rem)]",
};

// ============================================================================
// MODAL BODY COMPONENT
// ============================================================================

export function ModalBody({ children, className }: ModalBodyProps) {
  return (
    <div
      className={cn(
        // Scrollable body with proper padding
        "flex-1 overflow-y-auto overscroll-contain",
        "px-6 py-5",
        // Subtle scrollbar styling
        "scrollbar-thin scrollbar-thumb-[var(--color-border)] scrollbar-track-transparent",
        className
      )}
    >
      {children}
    </div>
  );
}

// ============================================================================
// MODAL FOOTER COMPONENT
// ============================================================================

export function ModalFooter({ children, className }: ModalFooterProps) {
  return (
    <div
      className={cn(
        // Fixed footer with border
        "flex-shrink-0",
        "border-t border-[var(--color-border)]",
        "bg-[var(--color-bg-primary)]",
        "px-6 py-4",
        // Responsive button layout
        "flex flex-col-reverse gap-3 sm:flex-row sm:justify-end",
        className
      )}
    >
      {children}
    </div>
  );
}

// ============================================================================
// MAIN MODAL COMPONENT
// ============================================================================

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  size = "lg",
  showCloseButton = true,
  closeOnOverlayClick = true,
  closeOnEscape = true,
  className,
}: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);
  const titleId = useId();
  const descriptionId = useId();

  // Store previously focused element and restore on close
  useEffect(() => {
    if (isOpen) {
      previousActiveElement.current = document.activeElement as HTMLElement;
    } else if (previousActiveElement.current) {
      previousActiveElement.current.focus();
      previousActiveElement.current = null;
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    if (!isOpen || !closeOnEscape) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose, closeOnEscape]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = "hidden";
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    } else {
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
    }
    return () => {
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
    };
  }, [isOpen]);

  // Focus trap and initial focus
  useEffect(() => {
    if (!isOpen || !contentRef.current) return;

    const content = contentRef.current;

    const getFocusableElements = () => {
      return content.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"]):not([disabled])'
      );
    };

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;

      const focusableElements = getFocusableElements();
      if (focusableElements.length === 0) return;

      const firstFocusable = focusableElements[0];
      const lastFocusable = focusableElements[focusableElements.length - 1];

      if (!firstFocusable || !lastFocusable) return;

      if (e.shiftKey) {
        if (document.activeElement === firstFocusable) {
          lastFocusable.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastFocusable) {
          firstFocusable.focus();
          e.preventDefault();
        }
      }
    };

    // Focus first focusable element (skip close button, find first input)
    const focusableElements = getFocusableElements();
    const firstInput = Array.from(focusableElements).find(
      (el) => el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.tagName === "SELECT"
    );
    (firstInput || focusableElements[0])?.focus();

    document.addEventListener("keydown", handleTab);
    return () => document.removeEventListener("keydown", handleTab);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (closeOnOverlayClick && e.target === overlayRef.current) {
      onClose();
    }
  };

  return (
    <ModalContext.Provider value={{ onClose }}>
      {/* Overlay */}
      <div
        ref={overlayRef}
        onClick={handleOverlayClick}
        className={cn(
          "fixed inset-0 z-50",
          "flex items-center justify-center",
          "bg-black/50 backdrop-blur-sm",
          "p-4 sm:p-6 lg:p-8",
          "animate-in fade-in duration-200"
        )}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        aria-describedby={description ? descriptionId : undefined}
      >
        {/* Modal Container */}
        <div
          ref={contentRef}
          className={cn(
            // Base styles
            "relative w-full",
            "flex flex-col",
            "rounded-[var(--radius-lg)]",
            "bg-[var(--color-bg-primary)]",
            "shadow-xl",
            // Animation
            "animate-in zoom-in-95 duration-200",
            // Max dimensions - critical for scroll behavior
            "max-h-[calc(100vh-2rem)] sm:max-h-[calc(100vh-3rem)] lg:max-h-[85vh]",
            // Size variant
            sizeConfig[size],
            className
          )}
        >
          {/* Header - Fixed */}
          {(title || showCloseButton) && (
            <div
              className={cn(
                "flex-shrink-0",
                "flex items-start justify-between gap-4",
                "border-b border-[var(--color-border)]",
                "px-6 py-4"
              )}
            >
              <div className="min-w-0 flex-1">
                {title && (
                  <h2
                    id={titleId}
                    className="text-lg font-semibold text-[var(--color-text-primary)] leading-tight"
                  >
                    {title}
                  </h2>
                )}
                {description && (
                  <p
                    id={descriptionId}
                    className="mt-1 text-sm text-[var(--color-text-secondary)]"
                  >
                    {description}
                  </p>
                )}
              </div>
              {showCloseButton && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="h-8 w-8 flex-shrink-0 -mr-2 -mt-1 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
                  aria-label="Закрыть"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          )}

          {/* Content - Children should use ModalBody and ModalFooter */}
          {children}
        </div>
      </div>
    </ModalContext.Provider>
  );
}

// ============================================================================
// CONFIRM MODAL - PRESET
// ============================================================================

export interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "default";
  isLoading?: boolean;
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Подтвердить",
  cancelText = "Отмена",
  variant = "default",
  isLoading = false,
}: ConfirmModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      description={description}
      size="sm"
    >
      <ModalFooter>
        <Button
          variant="secondary"
          onClick={onClose}
          disabled={isLoading}
          className="w-full sm:w-auto"
        >
          {cancelText}
        </Button>
        <Button
          variant={variant === "danger" ? "danger" : "primary"}
          onClick={onConfirm}
          isLoading={isLoading}
          className="w-full sm:w-auto"
        >
          {confirmText}
        </Button>
      </ModalFooter>
    </Modal>
  );
}
