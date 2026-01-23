"use client";

import { forwardRef } from "react";
import { cn } from "@/shared/lib";

export interface SwitchProps {
  id?: string;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  label?: string;
  description?: string;
  className?: string;
}

export const Switch = forwardRef<HTMLButtonElement, SwitchProps>(
  ({ id, checked, onChange, disabled, label, description, className }, ref) => {
    const handleClick = () => {
      if (!disabled && onChange) {
        onChange(!checked);
      }
    };

    return (
      <div className={cn("flex items-start gap-3", className)}>
        <button
          ref={ref}
          id={id}
          type="button"
          role="switch"
          aria-checked={checked}
          disabled={disabled}
          onClick={handleClick}
          className={cn(
            "relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent-primary)] focus-visible:ring-offset-2",
            checked
              ? "bg-[var(--color-accent-primary)]"
              : "bg-[var(--color-bg-secondary)] border border-[var(--color-border)]",
            disabled && "cursor-not-allowed opacity-50"
          )}
        >
          <span
            className={cn(
              "pointer-events-none absolute block h-5 w-5 rounded-full bg-white shadow-lg transition-all",
              "top-1/2 -translate-y-1/2",
              checked ? "left-[22px]" : "left-[2px]"
            )}
          />
        </button>
        {(label || description) && (
          <div className="flex flex-col gap-0.5">
            {label && (
              <label
                htmlFor={id}
                className={cn(
                  "text-sm font-medium text-[var(--color-text-primary)] cursor-pointer",
                  disabled && "cursor-not-allowed opacity-50"
                )}
                onClick={handleClick}
              >
                {label}
              </label>
            )}
            {description && (
              <span className="text-sm text-[var(--color-text-muted)]">{description}</span>
            )}
          </div>
        )}
      </div>
    );
  }
);

Switch.displayName = "Switch";

