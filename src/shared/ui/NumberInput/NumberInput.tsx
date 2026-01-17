"use client";

import { forwardRef, type ChangeEvent, type KeyboardEvent } from "react";
import { cn } from "@/shared/lib";

export interface NumberInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type" | "onChange" | "min" | "max" | "value"> {
  label?: string;
  error?: string;
  hint?: string;
  min?: number;
  max?: number;
  value?: number | null;
  onChange?: (value: number | null | undefined) => void;
}

/**
 * NumberInput - A specialized number input component
 * 
 * Features:
 * - Only allows numeric input (no letters)
 * - Enforces min/max constraints
 * - Shows validation feedback
 * 
 * Default range: 0-1000 (for sort_order fields)
 */
export const NumberInput = forwardRef<HTMLInputElement, NumberInputProps>(
  (
    {
      className,
      label,
      error,
      hint,
      id,
      min = 0,
      max = 1000,
      value,
      onChange,
      ...props
    },
    ref
  ) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

    // Handle input change - only allow valid numbers
    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value;

      // Allow empty value - pass null instead of undefined for better react-hook-form compatibility
      if (inputValue === "") {
        onChange?.(null as any);
        return;
      }

      // Parse as integer
      const numValue = parseInt(inputValue, 10);

      // Only update if it's a valid number
      if (!isNaN(numValue)) {
        // Clamp value to min/max range
        const clampedValue = Math.min(Math.max(numValue, min), max);
        onChange?.(clampedValue);
      }
    };

    // Prevent non-numeric key input
    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
      // Allow: backspace, delete, tab, escape, enter, arrows
      const allowedKeys = [
        "Backspace",
        "Delete",
        "Tab",
        "Escape",
        "Enter",
        "ArrowLeft",
        "ArrowRight",
        "ArrowUp",
        "ArrowDown",
        "Home",
        "End",
      ];

      if (allowedKeys.includes(e.key)) {
        return;
      }

      // Allow Ctrl/Cmd + A, C, V, X
      if ((e.ctrlKey || e.metaKey) && ["a", "c", "v", "x"].includes(e.key.toLowerCase())) {
        return;
      }

      // Block non-numeric keys
      if (!/^\d$/.test(e.key)) {
        e.preventDefault();
      }
    };

    // Validate current value
    const numericValue = typeof value === "number" ? value : typeof value === "string" ? parseInt(value, 10) : undefined;
    const isOutOfRange = numericValue !== undefined && (numericValue < min || numericValue > max);
    const displayError = error || (isOutOfRange ? `Значение должно быть от ${min} до ${max}` : undefined);

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="mb-2 block text-sm font-medium text-[var(--color-text-secondary)]"
          >
            {label}
            {props.required && <span className="ml-1 text-[var(--color-error)]">*</span>}
          </label>
        )}
        <input
          id={inputId}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          value={value === null || value === undefined ? "" : value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          className={cn(
            "h-11 w-full rounded-[var(--radius-md)] border bg-[var(--color-bg-primary)] px-4 text-[var(--color-text-primary)] transition-colors duration-[var(--transition-fast)]",
            "placeholder:text-[var(--color-text-muted)]",
            "hover:border-[var(--color-border-hover)]",
            "focus:border-[var(--color-accent-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent-primary)]",
            "disabled:cursor-not-allowed disabled:opacity-50",
            displayError
              ? "border-[var(--color-error)] focus:border-[var(--color-error)] focus:ring-[var(--color-error)]"
              : "border-[var(--color-border)]",
            className
          )}
          ref={ref}
          {...props}
        />
        {displayError && <p className="mt-1 text-sm text-[var(--color-error)]">{displayError}</p>}
        {hint && !displayError && <p className="mt-1 text-sm text-[var(--color-text-muted)]">{hint}</p>}
      </div>
    );
  }
);

NumberInput.displayName = "NumberInput";

