"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/shared/lib";

export interface NavItemProps {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  collapsed?: boolean;
  /** Grayed-out item that is not clickable (feature available on request) */
  disabled?: boolean;
  /** Optional badge text shown next to the label */
  badge?: string;
  /** Only highlight on exact pathname match (no prefix matching) */
  exact?: boolean;
}

export function NavItem({ href, icon: Icon, label, collapsed, disabled, badge, exact }: NavItemProps) {
  const pathname = usePathname();
  const isActive = !disabled && (exact ? pathname === href : pathname === href || pathname.startsWith(href + "/"));

  if (disabled) {
    return (
      <span
        className={cn(
          "group flex items-center gap-3 rounded-[var(--radius-md)] px-3 py-2.5 cursor-not-allowed opacity-50",
          collapsed && "justify-center px-2",
        )}
        title={collapsed ? `${label} — По запросу` : undefined}
      >
        <Icon className="h-5 w-5 flex-shrink-0 text-[var(--color-text-muted)]" />
        {!collapsed && (
          <span className="flex flex-1 items-center gap-2 text-sm font-medium text-[var(--color-text-muted)]">
            {label}
            {badge && (
              <span className="ml-auto whitespace-nowrap rounded-full bg-[var(--color-bg-secondary)] px-2 py-0.5 text-[10px] font-medium text-[var(--color-text-muted)]">
                {badge}
              </span>
            )}
          </span>
        )}
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
