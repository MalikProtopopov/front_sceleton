"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  FileText,
  HelpCircle,
  Briefcase,
  FolderOpen,
  Users,
  Star,
  Image,
  MessageSquare,
  Search,
  Shield,
  Settings,
  ChevronLeft,
  ChevronRight,
  Building,
  Building2,
  History,
  Key,
  Files,
  Globe,
  ArrowRight,
  LayoutDashboard,
  Package,
  FolderTree,
  Ruler,
  SlidersHorizontal,
  CreditCard,
  LayoutGrid,
  ArrowUpCircle,
  Puzzle,
  Mail,
  ShoppingBag,
  Layers,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/shared/lib";
import { ROUTES } from "@/shared/config";
import { useAuth } from "@/features/auth";
import { useSidebar } from "@/features/tenants";
import type { SidebarItem } from "@/entities/tenant";
import { NavItem } from "./NavItem";
import { TenantSwitcher } from "./TenantSwitcher";

// ─── Icon resolver: API icon string → Lucide component ──────────────

const ICON_MAP: Record<string, LucideIcon> = {
  dashboard: LayoutDashboard,
  image: Image,
  article: FileText,
  briefcase: Briefcase,
  "folder-open": FolderOpen,
  layers: Layers,
  mail: Mail,
  "shopping-bag": ShoppingBag,
  search: Search,
  globe: Globe,
  "credit-card": CreditCard,
  "help-circle": HelpCircle,
  users: Users,
  star: Star,
  "message-square": MessageSquare,
  shield: Shield,
  settings: Settings,
  building: Building,
  building2: Building2,
  history: History,
  key: Key,
  files: Files,
  "arrow-right": ArrowRight,
  package: Package,
  "folder-tree": FolderTree,
  ruler: Ruler,
  "sliders-horizontal": SlidersHorizontal,
  "layout-grid": LayoutGrid,
  "arrow-up-circle": ArrowUpCircle,
  puzzle: Puzzle,
};

function resolveIcon(name: string): LucideIcon {
  return ICON_MAP[name] ?? LayoutDashboard;
}

// ─── Category grouping config ────────────────────────────────────────

const CATEGORY_CONFIG: Record<string, { label: string; order: number }> = {
  core: { label: "Главное", order: 0 },
  content: { label: "Контент", order: 1 },
  commerce: { label: "Каталог", order: 2 },
  company: { label: "Компания", order: 3 },
  crm: { label: "CRM", order: 4 },
  platform: { label: "Администрирование", order: 5 },
  billing: { label: "Биллинг", order: 6 },
};

interface SidebarSection {
  category: string;
  label: string;
  order: number;
  items: SidebarItem[];
}

function groupByCategory(items: SidebarItem[]): SidebarSection[] {
  const groups = new Map<string, SidebarSection>();
  for (const item of items) {
    if (!item.visible) continue;
    const cat = item.category;
    if (!groups.has(cat)) {
      const config = CATEGORY_CONFIG[cat] ?? { label: cat, order: 99 };
      groups.set(cat, { category: cat, label: config.label, order: config.order, items: [] });
    }
    groups.get(cat)!.items.push(item);
  }
  return Array.from(groups.values()).sort((a, b) => a.order - b.order);
}

// ─── Path mapping: API path → local route ────────────────────────────

function mapPath(apiPath: string): string {
  const MAP: Record<string, string> = {
    "/admin/dashboard": ROUTES.HOME,
    "/admin/media": ROUTES.MEDIA,
    "/admin/articles": ROUTES.ARTICLES,
    "/admin/cases": ROUTES.CASES,
    "/admin/services": ROUTES.SERVICES,
    "/admin/inquiries": ROUTES.LEADS,
    "/admin/products": ROUTES.PRODUCTS,
    "/admin/seo": ROUTES.SEO,
    "/admin/locales": ROUTES.SETTINGS,
    "/admin/billing": ROUTES.BILLING,
    "/admin/faq": ROUTES.FAQ,
    "/admin/documents": ROUTES.DOCUMENTS,
    "/admin/team": ROUTES.TEAM,
    "/admin/reviews": ROUTES.REVIEWS,
    "/admin/company": ROUTES.COMPANY,
    "/admin/users": ROUTES.USERS,
    "/admin/roles": ROUTES.ROLES,
    "/admin/audit": ROUTES.AUDIT,
    "/admin/settings": ROUTES.SETTINGS,
    "/admin/catalog": ROUTES.CATALOG,
    "/admin/catalog/uom": ROUTES.UOM,
    "/admin/catalog/categories": ROUTES.CATEGORIES,
    "/admin/catalog/parameters": ROUTES.PARAMETERS,
    "/admin/catalog/products": ROUTES.PRODUCTS,
  };
  return MAP[apiPath] ?? apiPath.replace("/admin", "");
}

// ─── Platform navigation (superuser only, hardcoded) ─────────────────

const PLATFORM_NAV = [
  { href: ROUTES.PLATFORM_DASHBOARD, icon: LayoutDashboard, label: "Дашборд", exact: true },
  { href: ROUTES.TENANTS, icon: Building2, label: "Проекты" },
  { href: ROUTES.PLATFORM_PLANS, icon: CreditCard, label: "Тарифы" },
  { href: ROUTES.PLATFORM_MODULES, icon: Puzzle, label: "Модули" },
  { href: ROUTES.PLATFORM_BUNDLES, icon: Package, label: "Бандлы" },
  { href: ROUTES.PLATFORM_REQUESTS, icon: ArrowUpCircle, label: "Заявки" },
];

// ─── Component ───────────────────────────────────────────────────────

export function Sidebar() {
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const { user } = useAuth();
  const { data: sidebarData, isLoading } = useSidebar();

  const isSuperuser = user?.is_superuser || false;
  const allAccess = sidebarData?.all_access ?? false;

  const sections = useMemo(() => {
    if (!sidebarData?.sections) return [];
    return groupByCategory(sidebarData.sections);
  }, [sidebarData]);

  const goToBilling = () => router.push(ROUTES.BILLING);

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-[var(--color-border)] bg-[var(--color-bg-primary)] transition-all duration-[var(--transition-normal)]",
        collapsed ? "w-[var(--sidebar-collapsed-width)]" : "w-[var(--sidebar-width)]",
      )}
    >
      <TenantSwitcher collapsed={collapsed} />

      <nav className="flex-1 overflow-y-auto p-3">
        {/* Platform section (superuser only) */}
        {isSuperuser && (
          <div className="mb-6">
            {!collapsed && (
              <h3 className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
                Платформа
              </h3>
            )}
            <div className="space-y-1">
              {PLATFORM_NAV.map((item) => (
                <NavItem
                  key={item.href}
                  href={item.href}
                  icon={item.icon}
                  label={item.label}
                  collapsed={collapsed}
                  exact={item.exact}
                />
              ))}
            </div>
          </div>
        )}

        {/* Loading skeleton */}
        {isLoading && !sidebarData && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-2">
                {!collapsed && (
                  <div className="mx-3 h-3 w-20 animate-pulse rounded bg-[var(--color-bg-hover)]" />
                )}
                {[1, 2].map((j) => (
                  <div
                    key={j}
                    className={cn(
                      "flex items-center gap-3 rounded-[var(--radius-md)] px-3 py-2.5",
                      collapsed && "justify-center px-2",
                    )}
                  >
                    <div className="h-5 w-5 animate-pulse rounded bg-[var(--color-bg-hover)]" />
                    {!collapsed && (
                      <div className="h-4 w-24 animate-pulse rounded bg-[var(--color-bg-hover)]" />
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}

        {/* Dynamic sections from API */}
        {sections.map((section) => (
          <div key={section.category} className="mb-6">
            {!collapsed && (
              <h3 className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
                {section.label}
              </h3>
            )}
            <div className="space-y-1">
              {section.items.map((item) => {
                const href = mapPath(item.path);
                const Icon = resolveIcon(item.icon);
                const isLocked = !allAccess && !item.accessible;
                const isBilling = item.reason === "billing" || item.reason === "billing+role";

                return (
                  <NavItem
                    key={item.name}
                    href={href}
                    icon={Icon}
                    label={item.title}
                    collapsed={collapsed}
                    locked={isLocked}
                    reason={item.reason}
                    onLockedClick={isBilling && isLocked ? goToBilling : undefined}
                    exact={item.name === "_dashboard"}
                  />
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <button
        onClick={() => setCollapsed(!collapsed)}
        className="flex h-12 items-center justify-center border-t border-[var(--color-border)] text-[var(--color-text-muted)] transition-colors hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text-primary)]"
        title={collapsed ? "Развернуть" : "Свернуть"}
      >
        {collapsed ? (
          <ChevronRight className="h-5 w-5" />
        ) : (
          <ChevronLeft className="h-5 w-5" />
        )}
      </button>
    </aside>
  );
}
