"use client";

import { useState } from "react";
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
  History,
  Key,
  Files,
} from "lucide-react";
import { cn } from "@/shared/lib";
import { ROUTES } from "@/shared/config";
import { NavItem } from "./NavItem";
import { NavGroup } from "./NavGroup";

interface NavItemData {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}

interface NavGroupData {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  items: NavItemData[];
}

interface NavSection {
  label: string;
  items: (NavItemData | NavGroupData)[];
}

function isNavGroup(item: NavItemData | NavGroupData): item is NavGroupData {
  return 'items' in item;
}

const navigation: NavSection[] = [
  {
    label: "Контент",
    items: [
      { href: ROUTES.ARTICLES, icon: FileText, label: "Статьи" },
      { href: ROUTES.CASES, icon: FolderOpen, label: "Кейсы" },
      { href: ROUTES.FAQ, icon: HelpCircle, label: "FAQ" },
      { href: ROUTES.SERVICES, icon: Briefcase, label: "Услуги" },
      { href: ROUTES.DOCUMENTS, icon: Files, label: "Документы" },
    ],
  },
  {
    label: "Команда и компания",
    items: [
      { href: ROUTES.TEAM, icon: Users, label: "Команда" },
      { href: ROUTES.REVIEWS, icon: Star, label: "Отзывы" },
      { href: ROUTES.COMPANY, icon: Building, label: "О компании" },
    ],
  },
  {
    label: "Медиа и заявки",
    items: [
      { href: ROUTES.MEDIA, icon: Image, label: "Медиатека" },
      { href: ROUTES.LEADS, icon: MessageSquare, label: "Заявки" },
    ],
  },
  {
    label: "Администрирование",
    items: [
      { href: ROUTES.SEO, icon: Search, label: "SEO" },
      {
        icon: Shield,
        label: "Пользователи",
        items: [
          { href: ROUTES.USERS, icon: Shield, label: "Пользователи" },
          { href: ROUTES.ROLES, icon: Key, label: "Роли" },
        ],
      },
      { href: ROUTES.AUDIT, icon: History, label: "Журнал аудита" },
      { href: ROUTES.SETTINGS, icon: Settings, label: "Настройки" },
    ],
  },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);

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
        {navigation.map((section) => (
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

