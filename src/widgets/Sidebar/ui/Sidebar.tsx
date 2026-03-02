"use client";

import { useState, useMemo } from "react";
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
} from "lucide-react";
import { cn } from "@/shared/lib";
import { ROUTES } from "@/shared/config";
import { useAuth } from "@/features/auth";
import { useEnabledFeatures } from "@/features/tenants";
import type { FeatureCatalogItem } from "@/entities/tenant";
import { NavItem } from "./NavItem";
import { NavGroup } from "./NavGroup";
import { TenantSwitcher } from "./TenantSwitcher";

interface NavItemData {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  feature?: string;
  exact?: boolean;
}

interface NavGroupData {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  items: NavItemData[];
  feature?: string; // Optional feature flag requirement
}

interface NavSection {
  label: string;
  items: (NavItemData | NavGroupData)[];
}

function isNavGroup(item: NavItemData | NavGroupData): item is NavGroupData {
  return 'items' in item;
}

// Platform section (only for superusers)
const platformNavigation: NavSection = {
  label: "Платформа",
  items: [
    { href: ROUTES.PLATFORM_DASHBOARD, icon: LayoutDashboard, label: "Дашборд", exact: true },
    { href: ROUTES.TENANTS, icon: Building2, label: "Проекты" },
    { href: ROUTES.PLATFORM_PLANS, icon: CreditCard, label: "Тарифы" },
    { href: ROUTES.PLATFORM_MODULES, icon: Puzzle, label: "Модули" },
    { href: ROUTES.PLATFORM_BUNDLES, icon: Package, label: "Бандлы" },
    { href: ROUTES.PLATFORM_REQUESTS, icon: ArrowUpCircle, label: "Заявки" },
  ],
};

// Navigation with feature flags
const navigation: NavSection[] = [
  {
    label: "Контент",
    items: [
      { href: ROUTES.ARTICLES, icon: FileText, label: "Статьи", feature: "blog_module" },
      { href: ROUTES.CASES, icon: FolderOpen, label: "Кейсы", feature: "cases_module" },
      { href: ROUTES.FAQ, icon: HelpCircle, label: "Вопросы и ответы", feature: "faq_module" },
      { href: ROUTES.SERVICES, icon: Briefcase, label: "Услуги", feature: "services_module" },
      { href: ROUTES.DOCUMENTS, icon: Files, label: "Документы" }, // Always visible
    ],
  },
  {
    label: "Каталог",
    items: [
      { href: ROUTES.UOM, icon: Ruler, label: "Ед. измерения", feature: "catalog_module" },
      { href: ROUTES.CATEGORIES, icon: FolderTree, label: "Категории", feature: "catalog_module" },
      { href: ROUTES.PARAMETERS, icon: SlidersHorizontal, label: "Параметры", feature: "catalog_module" },
      { href: ROUTES.PRODUCTS, icon: Package, label: "Товары", feature: "catalog_module" },
    ],
  },
  {
    label: "Команда и компания",
    items: [
      { href: ROUTES.TEAM, icon: Users, label: "Команда", feature: "team_module" },
      { href: ROUTES.REVIEWS, icon: Star, label: "Отзывы", feature: "reviews_module" },
      { href: ROUTES.COMPANY, icon: Building, label: "О компании" }, // Always visible
    ],
  },
  {
    label: "Медиа и заявки",
    items: [
      { href: ROUTES.MEDIA, icon: Image, label: "Медиатека" }, // Always visible
      { href: ROUTES.LEADS, icon: MessageSquare, label: "Заявки" }, // Always visible
    ],
  },
  {
    label: "Администрирование",
    items: [
      {
        icon: Search,
        label: "SEO",
        feature: "seo_advanced",
        items: [
          { href: ROUTES.SEO, icon: Globe, label: "Paths" },
          { href: ROUTES.SEO_REDIRECTS, icon: ArrowRight, label: "Редиректы" },
        ],
      },
      {
        icon: Shield,
        label: "Пользователи",
        items: [
          { href: ROUTES.USERS, icon: Shield, label: "Пользователи" },
          { href: ROUTES.ROLES, icon: Key, label: "Роли" },
        ],
      },
      { href: ROUTES.AUDIT, icon: History, label: "Журнал аудита" }, // Always visible
      { href: ROUTES.SETTINGS, icon: Settings, label: "Настройки" }, // Always visible
    ],
  },
  {
    label: "Биллинг",
    items: [
      { href: ROUTES.BILLING, icon: CreditCard, label: "Мой тариф" },
      { href: ROUTES.BILLING_PLANS, icon: LayoutGrid, label: "Каталог тарифов" },
      { href: ROUTES.BILLING_REQUESTS, icon: ArrowUpCircle, label: "Заявки" },
    ],
  },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const { user } = useAuth();
  const { data: featuresData } = useEnabledFeatures();

  // Check if user is superuser (platform owner)
  const isSuperuser = user?.is_superuser || false;

  // Get enabled features
  const enabledFeatures = featuresData?.enabled_features ?? [];
  const allFeaturesEnabled = featuresData?.all_features_enabled ?? false;
  const featuresCatalog: FeatureCatalogItem[] = featuresData?.features ?? [];

  // Build a map from feature name to catalog item
  const catalogMap = useMemo(() => {
    const map = new Map<string, FeatureCatalogItem>();
    featuresCatalog.forEach((f) => map.set(f.name, f));
    return map;
  }, [featuresCatalog]);

  // Determine feature visibility: "show" | "disabled" (can_request) | "hidden"
  type FeatureVisibility = "show" | "disabled" | "hidden";
  const getFeatureVisibility = (feature?: string): FeatureVisibility => {
    if (!feature) return "show";
    if (isSuperuser || allFeaturesEnabled) return "show";
    if (enabledFeatures.includes(feature)) return "show";
    // Check catalog for can_request
    const catalogItem = catalogMap.get(feature);
    if (catalogItem && !catalogItem.enabled && catalogItem.can_request) return "disabled";
    return "hidden";
  };

  // Filter navigation based on feature flags — include "disabled" items grayed out
  const filteredNavigation = useMemo(() => {
    return navigation.map((section) => ({
      ...section,
      items: section.items
        .filter((item) => {
          if (isNavGroup(item)) {
            const vis = getFeatureVisibility(item.feature);
            if (vis === "hidden") return false;
            const visibleItems = item.items.filter((subItem) =>
              getFeatureVisibility(subItem.feature) !== "hidden"
            );
            return visibleItems.length > 0;
          }
          return getFeatureVisibility(item.feature) !== "hidden";
        })
        .map((item) => {
          if (isNavGroup(item)) {
            return {
              ...item,
              items: item.items.filter((subItem) =>
                getFeatureVisibility(subItem.feature) !== "hidden"
              ),
              _disabled: getFeatureVisibility(item.feature) === "disabled",
            };
          }
          return {
            ...item,
            _disabled: getFeatureVisibility(item.feature) === "disabled",
          };
        }),
    })).filter((section) => section.items.length > 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabledFeatures, allFeaturesEnabled, isSuperuser, catalogMap]);

  // Build navigation with conditional platform section
  const fullNavigation = isSuperuser 
    ? [platformNavigation, ...filteredNavigation] 
    : filteredNavigation;

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-[var(--color-border)] bg-[var(--color-bg-primary)] transition-all duration-[var(--transition-normal)]",
        collapsed ? "w-[var(--sidebar-collapsed-width)]" : "w-[var(--sidebar-width)]",
      )}
    >
      {/* Tenant header — replaces the old logo block */}
      <TenantSwitcher collapsed={collapsed} />

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-3">
        {fullNavigation.map((section) => (
          <div key={section.label} className="mb-6">
            {!collapsed && (
              <h3 className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
                {section.label}
              </h3>
            )}
            <div className="space-y-1">
              {section.items.map((item, index) => {
                const isDisabled = "_disabled" in item && item._disabled;
                if (isNavGroup(item)) {
                  return (
                    <NavGroup
                      key={`${item.label}-${index}`}
                      icon={item.icon}
                      label={item.label}
                      items={item.items}
                      collapsed={collapsed}
                    />
                  );
                }
                return (
                  <NavItem
                    key={item.href}
                    href={item.href}
                    icon={item.icon}
                    label={item.label}
                    collapsed={collapsed}
                    disabled={!!isDisabled}
                    badge={isDisabled ? "По запросу" : undefined}
                    exact={item.exact}
                  />
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Collapse toggle */}
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

