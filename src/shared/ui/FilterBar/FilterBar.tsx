"use client";

import { ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "@/shared/lib";
import { Button } from "../Button";

interface FilterBarProps {
  children: ReactNode;
  onReset?: () => void;
  resetLabel?: string;
  className?: string;
}

/**
 * Unified filter bar component for consistent styling across pages
 * Renders filters in a responsive grid layout
 */
export function FilterBar({ 
  children, 
  onReset, 
  resetLabel = "Сбросить",
  className 
}: FilterBarProps) {
  return (
    <div 
      className={cn(
        "rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-bg-primary)] p-4",
        className
      )}
    >
      <div className="flex flex-wrap items-end gap-4">
        {children}
        {onReset && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onReset}
            className="h-11 text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]"
          >
            <X className="mr-1 h-4 w-4" />
            {resetLabel}
          </Button>
        )}
      </div>
    </div>
  );
}

interface FilterGroupProps {
  label?: string;
  children: ReactNode;
  className?: string;
}

/**
 * Groups related filter controls with an optional label
 */
export function FilterGroup({ label, children, className }: FilterGroupProps) {
  return (
    <div className={cn("flex flex-col", className)}>
      {label && (
        <label className="mb-2 text-sm font-medium text-[var(--color-text-secondary)]">
          {label}
        </label>
      )}
      {children}
    </div>
  );
}

