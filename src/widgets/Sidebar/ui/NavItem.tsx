"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Lock } from "lucide-react";
import { cn } from "@/shared/lib";
import type { SidebarItemReason, SidebarLimitInfo } from "@/entities/tenant";

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
  /** Код права RBAC при reason role/billing+role, для подсказки */
  requiredPermission?: string | null;
  /** Limit usage info for inline badge */
  limitInfo?: SidebarLimitInfo | null;
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
  requiredPermission,
  limitInfo,
}: NavItemProps) {
  const pathname = usePathname();
  const roleTooltip = reason === "role" || reason === "billing+role"
    ? requiredPermission
      ? `Нет права «${requiredPermission}». Обратитесь к администратору`
      : REASON_TOOLTIPS[reason] ?? "Нет прав. Обратитесь к администратору"
    : undefined;
  const tooltip = roleTooltip ?? (reason ? REASON_TOOLTIPS[reason] : undefined);
  const isActive =
    !locked &&
    (exact
      ? pathname === href
      : pathname === href || pathname.startsWith(href + "/"));

  const isBillingLocked = locked && (reason === "billing" || reason === "billing+role");
  const isRoleLocked = locked && reason === "role";

  // ── Billing-locked: gold accent, clickable → billing (читаемый контраст) ──
  if (isBillingLocked && onLockedClick) {
    return (
      <button
        type="button"
        onClick={onLockedClick}
        className={cn(
          "group relative flex w-full items-center gap-3 rounded-[var(--radius-md)] px-3 py-2.5 text-left",
          "border-2 border-amber-500 bg-amber-100 transition-all duration-200",
          "hover:border-amber-600 hover:bg-amber-200 hover:shadow-md hover:shadow-amber-200/40",
          "dark:border-amber-500 dark:bg-amber-950/50 dark:text-amber-200",
          "dark:hover:border-amber-400 dark:hover:bg-amber-900/40",
          collapsed && "justify-center px-2",
        )}
        title={collapsed ? `${label} — ${tooltip}` : tooltip}
      >
        <div className="relative flex-shrink-0">
          <Icon className="h-5 w-5 text-amber-800 dark:text-amber-300" />
          <Lock className="absolute -bottom-1 -right-1.5 h-3 w-3 text-amber-700 dark:text-amber-400" />
        </div>
        {!collapsed && (
          <span className="flex flex-1 items-center gap-2 text-sm font-semibold text-amber-900 dark:text-amber-200">
            {label}
            <span className="ml-auto flex h-5 items-center rounded-full border border-amber-600/50 bg-amber-200 px-2 text-[10px] font-bold uppercase tracking-wide text-amber-800 dark:border-amber-500/50 dark:bg-amber-800/60 dark:text-amber-100">
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

  // ── Limit badge (only in expanded sidebar, for accessible items with a limit) ──
  const limitBadge = (() => {
    if (collapsed || !limitInfo || limitInfo.status === "not_available" || limitInfo.limit === null) return null;
    const { current, limit, status } = limitInfo;
    const badgeColors = {
      ok: "bg-[var(--color-bg-secondary)] text-[var(--color-text-muted)]",
      warning: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
      exceeded: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
      not_available: "",
    };
    return (
      <span className={cn("ml-auto flex-shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold tabular-nums leading-none", badgeColors[status])}>
        {current}/{limit}
      </span>
    );
  })();

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
      {!collapsed && (
        <span className="flex flex-1 items-center gap-2 text-sm font-medium">
          {label}
          {limitBadge}
        </span>
      )}
    </Link>
  );
}
