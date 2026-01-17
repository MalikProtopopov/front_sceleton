"use client";

import { ReactNode } from "react";
import { cn } from "@/shared/lib";

export interface SectionHeaderProps {
  /** Section title */
  title: string;
  /** Optional subtitle below title */
  subtitle?: string;
  /** Actions (buttons, selects) to display on the right */
  actions?: ReactNode;
  /** Additional content (e.g., tabs) below title but above actions row */
  children?: ReactNode;
  /** Additional className */
  className?: string;
}

/**
 * SectionHeader - A reusable component for section headers with actions
 * 
 * Features:
 * - Title always separate from actions
 * - Actions row with flex layout
 * - Proper spacing and alignment
 * - Responsive behavior
 */
export function SectionHeader({
  title,
  subtitle,
  actions,
  children,
  className,
}: SectionHeaderProps) {
  return (
    <div className={cn("space-y-3 w-full", className)}>
      {/* Title row */}
      <div>
        <h3 className="font-medium text-[var(--color-text-primary)]">{title}</h3>
        {subtitle && (
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">{subtitle}</p>
        )}
      </div>

      {/* Children (e.g., tabs) or Actions row */}
      {(children || actions) && (
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Left side: children (tabs, labels, etc.) */}
          {children && <div className="flex items-center gap-2 flex-1 min-w-0">{children}</div>}
          
          {/* Right side: actions (selectors, buttons) */}
          {actions && (
            <div className="flex items-center gap-2 flex-shrink-0">
              {actions}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

SectionHeader.displayName = "SectionHeader";

