"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/shared/lib";

export interface NavGroupProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  items: {
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    label: string;
  }[];
  collapsed?: boolean;
}

export function NavGroup({ icon: Icon, label, items, collapsed }: NavGroupProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(() => {
    // Автоматически открывать, если один из дочерних элементов активен
    return items.some(item => pathname === item.href || pathname.startsWith(item.href + "/"));
  });

  const isActive = items.some(item => pathname === item.href || pathname.startsWith(item.href + "/"));

  if (collapsed) {
    // В свернутом режиме показываем иконку родительского элемента
    // При клике переходим на первый дочерний элемент
    const firstItem = items[0];
    if (!firstItem) return null;
    return (
      <Link
        href={firstItem.href}
        className={cn(
          "group flex items-center justify-center rounded-[var(--radius-md)] px-2 py-2.5 transition-colors duration-[var(--transition-fast)]",
          isActive
            ? "bg-[var(--color-accent-primary)] text-white"
            : "text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text-primary)]",
        )}
        title={label}
      >
        <Icon className={cn("h-5 w-5 flex-shrink-0", isActive && "text-white")} />
      </Link>
    );
  }

  return (
    <div>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "group flex w-full items-center gap-3 rounded-[var(--radius-md)] px-3 py-2.5 transition-colors duration-[var(--transition-fast)]",
          isActive
            ? "bg-[var(--color-accent-primary)] text-white"
            : "text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text-primary)]",
        )}
      >
        <Icon className={cn("h-5 w-5 flex-shrink-0", isActive && "text-white")} />
        <span className="flex-1 text-left text-sm font-medium">{label}</span>
        {isOpen ? (
          <ChevronDown className={cn("h-4 w-4 transition-transform", isActive && "text-white")} />
        ) : (
          <ChevronRight className={cn("h-4 w-4 transition-transform", isActive && "text-white")} />
        )}
      </button>
      {isOpen && (
        <div className="ml-4 mt-1 space-y-1 border-l-2 border-[var(--color-border)] pl-3">
          {items.map((item) => {
            const ItemIcon = item.icon;
            const itemIsActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group flex items-center gap-3 rounded-[var(--radius-md)] px-3 py-2 transition-colors duration-[var(--transition-fast)]",
                  itemIsActive
                    ? "bg-[var(--color-accent-primary)]/10 text-[var(--color-accent-primary)]"
                    : "text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text-primary)]",
                )}
              >
                <ItemIcon className={cn("h-4 w-4 flex-shrink-0", itemIsActive && "text-[var(--color-accent-primary)]")} />
                <span className="text-sm font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

