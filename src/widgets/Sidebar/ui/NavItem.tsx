"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Lock } from "lucide-react";
import { cn } from "@/shared/lib";
import type { SidebarItemReason } from "@/entities/tenant";

export interface NavItemProps {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  collapsed?: boolean;
  /** Only highlight on exact pathname match (no prefix matching) */
  exact?: boolean;
  /** Item is not accessible */
  locked?: boolean;
  /** Why the item is locked */
  reason?: SidebarItemReason;
  /** Click handler for locked billing items (redirect to billing) */
  onLockedClick?: () => void;
}

const REASON_TOOLTIPS: Record<string, string> = {
  billing: "Доступно в расширенном тарифе",
  role: "Нет прав. Обратитесь к администратору",
  "billing+role": "Модуль не в тарифе и нет прав роли",
};

export function NavItem({
  href,
  icon: Icon,
  label,
  collapsed,
  exact,
  locked,
  reason,
  onLockedClick,
}: NavItemProps) {
  const pathname = usePathname();
  const isActive =
    !locked &&
    (exact
      ? pathname === href
      : pathname === href || pathname.startsWith(href + "/"));

  const tooltip = reason ? REASON_TOOLTIPS[reason] : undefined;
  const isBillingLocked = locked && (reason === "billing" || reason === "billing+role");
  const isRoleLocked = locked && reason === "role";

  // ── Billing-locked: gold accent, clickable → billing ──
  if (isBillingLocked && onLockedClick) {
    return (
      <button
        type="button"
        onClick={onLockedClick}
        className={cn(
          "group relative flex w-full items-center gap-3 rounded-[var(--radius-md)] px-3 py-2.5 text-left",
          "border border-amber-400/40 bg-amber-50/50 transition-all duration-200",
          "hover:border-amber-400/70 hover:bg-amber-50/80 hover:shadow-[0_0_8px_rgba(251,191,36,0.15)]",
          "dark:border-amber-500/30 dark:bg-amber-950/20",
          "dark:hover:border-amber-500/50 dark:hover:bg-amber-950/30",
          collapsed && "justify-center px-2",
        )}
        title={collapsed ? `${label} — ${tooltip}` : tooltip}
      >
        <div className="relative flex-shrink-0">
          <Icon className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          <Lock className="absolute -bottom-1 -right-1.5 h-3 w-3 text-amber-500 dark:text-amber-400" />
        </div>
        {!collapsed && (
          <span className="flex flex-1 items-center gap-2 text-sm font-medium text-amber-700 dark:text-amber-300">
            {label}
            <span className="ml-auto flex h-5 items-center rounded-full bg-amber-100 px-1.5 text-[10px] font-semibold uppercase tracking-wide text-amber-600 dark:bg-amber-900/40 dark:text-amber-400">
              Pro
            </span>
          </span>
        )}
      </button>
    );
  }

  // ── Role-locked: gray, not clickable ──
  if (isRoleLocked) {
    return (
      <span
        className={cn(
          "group flex items-center gap-3 rounded-[var(--radius-md)] px-3 py-2.5 opacity-40 cursor-not-allowed select-none",
          collapsed && "justify-center px-2",
        )}
        title={collapsed ? `${label} — ${tooltip}` : tooltip}
      >
        <div className="relative flex-shrink-0">
          <Icon className="h-5 w-5 text-[var(--color-text-muted)]" />
          <Lock className="absolute -bottom-1 -right-1.5 h-3 w-3 text-[var(--color-text-muted)]" />
        </div>
        {!collapsed && (
          <span className="text-sm font-medium text-[var(--color-text-muted)]">
            {label}
          </span>
        )}
      </span>
    );
  }

  // ── Generic locked fallback (billing+role without handler) ──
  if (locked) {
    return (
      <span
        className={cn(
          "group flex items-center gap-3 rounded-[var(--radius-md)] px-3 py-2.5 opacity-50 cursor-not-allowed select-none",
          collapsed && "justify-center px-2",
        )}
        title={collapsed ? `${label} — ${tooltip}` : tooltip}
      >
        <Lock className="h-5 w-5 flex-shrink-0 text-[var(--color-text-muted)]" />
        {!collapsed && (
          <span className="text-sm font-medium text-[var(--color-text-muted)]">
            {label}
          </span>
        )}
      </span>
    );
  }

  // ── Normal active/inactive link ──
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
