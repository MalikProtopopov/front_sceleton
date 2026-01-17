"use client";

import { forwardRef, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/shared/lib";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  /** Icon to display on the left side of the input */
  leftIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, error, hint, id, leftIcon, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");
    const isPassword = type === "password";

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
        <div className="relative">
          {leftIcon && (
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]">
              {leftIcon}
            </span>
          )}
          <input
            id={inputId}
            type={isPassword && showPassword ? "text" : type}
            className={cn(
              "h-11 w-full rounded-[var(--radius-md)] border bg-[var(--color-bg-primary)] px-4 text-[var(--color-text-primary)] transition-colors duration-[var(--transition-fast)]",
              "placeholder:text-[var(--color-text-muted)]",
              "hover:border-[var(--color-border-hover)]",
              "focus:border-[var(--color-accent-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent-primary)]",
              "disabled:cursor-not-allowed disabled:opacity-50",
              error
                ? "border-[var(--color-error)] focus:border-[var(--color-error)] focus:ring-[var(--color-error)]"
                : "border-[var(--color-border)]",
              leftIcon && "pl-10",
              isPassword && "pr-11",
              className,
            )}
            ref={ref}
            {...props}
          />
          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          )}
        </div>
        {error && <p className="mt-1 text-sm text-[var(--color-error)]">{error}</p>}
        {hint && !error && <p className="mt-1 text-sm text-[var(--color-text-muted)]">{hint}</p>}
      </div>
    );
  },
);

Input.displayName = "Input";

