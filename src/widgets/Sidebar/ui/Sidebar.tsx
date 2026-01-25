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
} from "lucide-react";
import { cn } from "@/shared/lib";
import { ROUTES } from "@/shared/config";
import { useAuth } from "@/features/auth";
import { useEnabledFeatures } from "@/features/tenants";
import { NavItem } from "./NavItem";
import { NavGroup } from "./NavGroup";

interface NavItemData {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  feature?: string; // Optional feature flag requirement
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
    { href: ROUTES.TENANTS, icon: Building2, label: "Проекты" },
  ],
};

// Navigation with feature flags
const navigation: NavSection[] = [
  {
    label: "Контент",
    items: [
      { href: ROUTES.ARTICLES, icon: FileText, label: "Статьи", feature: "blog_module" },
      { href: ROUTES.CASES, icon: FolderOpen, label: "Кейсы", feature: "cases_module" },
      { href: ROUTES.FAQ, icon: HelpCircle, label: "FAQ", feature: "faq_module" },
      { href: ROUTES.SERVICES, icon: Briefcase, label: "Услуги" }, // Always visible
      { href: ROUTES.DOCUMENTS, icon: Files, label: "Документы" }, // Always visible
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
      { href: ROUTES.SEO, icon: Search, label: "SEO", feature: "seo_advanced" },
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

  // Filter function for nav items based on feature flags
  const isFeatureEnabled = (feature?: string): boolean => {
    // If no feature required, always show
    if (!feature) return true;
    // Superusers see everything
    if (isSuperuser || allFeaturesEnabled) return true;
    // Check if feature is in enabled list
    return enabledFeatures.includes(feature);
  };

  // Filter navigation based on feature flags
  const filteredNavigation = useMemo(() => {
    return navigation.map((section) => ({
      ...section,
      items: section.items
        .filter((item) => {
          if (isNavGroup(item)) {
            // Filter group items and only show group if it has visible items
            const visibleItems = item.items.filter((subItem) => 
              isFeatureEnabled(subItem.feature)
            );
            return visibleItems.length > 0 && isFeatureEnabled(item.feature);
          }
          return isFeatureEnabled(item.feature);
        })
        .map((item) => {
          if (isNavGroup(item)) {
            // Return group with filtered items
            return {
              ...item,
              items: item.items.filter((subItem) => isFeatureEnabled(subItem.feature)),
            };
          }
          return item;
        }),
    })).filter((section) => section.items.length > 0); // Remove empty sections
  }, [enabledFeatures, allFeaturesEnabled, isSuperuser]);

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
      {/* Logo */}
      <div
        className={cn(
          "flex h-[var(--header-height)] items-center border-b border-[var(--color-border)] px-4",
          collapsed && "justify-center px-2",
        )}
      >
        {collapsed ? (
          <span className="text-xl font-bold text-[var(--color-accent-primary)]">M</span>
        ) : (
          <span className="text-xl font-bold text-[var(--color-text-primary)]">
            Media<span className="text-[var(--color-accent-primary)]">nn</span>
          </span>
        )}
      </div>

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

