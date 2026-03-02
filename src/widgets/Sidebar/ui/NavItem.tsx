"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Lock } from "lucide-react";
import { cn } from "@/shared/lib";

export interface NavItemProps {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  collapsed?: boolean;
  /** Feature unavailable but can_request — show lock, gray, click redirects to billing */
  disabled?: boolean;
  /** When disabled: click navigates to billing (or custom handler) */
  onDisabledClick?: () => void;
  /** Tooltip when disabled, e.g. "Доступно в расширенном тарифе" */
  disabledTooltip?: string;
  /** Only highlight on exact pathname match (no prefix matching) */
  exact?: boolean;
}

export function NavItem({ href, icon: Icon, label, collapsed, disabled, onDisabledClick, disabledTooltip, exact }: NavItemProps) {
  const pathname = usePathname();
  const isActive = !disabled && (exact ? pathname === href : pathname === href || pathname.startsWith(href + "/"));

  if (disabled) {
    const tooltip = disabledTooltip ?? "Доступно в расширенном тарифе";
    const content = (
      <>
        <Lock className="h-5 w-5 flex-shrink-0 text-[var(--color-text-muted)]" />
        {!collapsed && <span className="text-sm font-medium text-[var(--color-text-muted)]">{label}</span>}
      </>
    );

    if (onDisabledClick) {
      return (
        <button
          type="button"
          onClick={onDisabledClick}
          className={cn(
            "group flex w-full items-center gap-3 rounded-[var(--radius-md)] px-3 py-2.5 text-left transition-colors duration-[var(--transition-fast)]",
            "text-[var(--color-text-muted)] hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text-primary)]",
            collapsed && "justify-center px-2",
          )}
          title={tooltip}
        >
          {content}
        </button>
      );
    }

    return (
      <span
        className={cn(
          "group flex items-center gap-3 rounded-[var(--radius-md)] px-3 py-2.5 cursor-not-allowed opacity-60",
          collapsed && "justify-center px-2",
        )}
        title={collapsed ? tooltip : undefined}
      >
        {content}
      </span>
    );
  }

  return (
    <Link
      href={href}
      className={cn(
        "group flex items-center gap-3 rounded-[var(--radius-md)] px-3 py-2.5 transition-colors duration-[var(--transition-fast)]",
        isActive
          ? "bg-[var(--color-accent-primary)] text-white"
          : "text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text-primary)]",
        collapsed && "justify-center px-2",
      )}
      title={collapsed ? label : undefined}
    >
      <Icon className={cn("h-5 w-5 flex-shrink-0", isActive && "text-white")} />
      {!collapsed && <span className="text-sm font-medium">{label}</span>}
    </Link>
  );
}
