"use client";

import { forwardRef } from "react";
import { cn } from "@/shared/lib";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, hint, id, ...props }, ref) => {
    const textareaId = id || label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={textareaId}
            className="mb-2 block text-sm font-medium text-[var(--color-text-secondary)]"
          >
            {label}
            {props.required && <span className="ml-1 text-[var(--color-error)]">*</span>}
          </label>
        )}
        <textarea
          id={textareaId}
          className={cn(
            "min-h-[120px] w-full rounded-[var(--radius-md)] border bg-[var(--color-bg-primary)] px-4 py-3 text-[var(--color-text-primary)] transition-colors duration-[var(--transition-fast)]",
            "placeholder:text-[var(--color-text-muted)]",
            "hover:border-[var(--color-border-hover)]",
            "focus:border-[var(--color-accent-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent-primary)]",
            "disabled:cursor-not-allowed disabled:opacity-50",
            "resize-y",
            error
              ? "border-[var(--color-error)] focus:border-[var(--color-error)] focus:ring-[var(--color-error)]"
              : "border-[var(--color-border)]",
            className,
          )}
          ref={ref}
          {...props}
        />
        {error && <p className="mt-1 text-sm text-[var(--color-error)]">{error}</p>}
        {hint && !error && <p className="mt-1 text-sm text-[var(--color-text-muted)]">{hint}</p>}
      </div>
    );
  },
);

Textarea.displayName = "Textarea";

