"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { User, LogOut, Settings, ChevronDown } from "lucide-react";
import { useAuth } from "@/providers";
import { useLogout } from "@/features/auth";
import { ROUTES } from "@/shared/config";
import { cn } from "@/shared/lib";

export function UserMenu() {
  const { user } = useAuth();
  const { mutate: logout, isPending } = useLogout();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close menu on Escape
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  if (!user) return null;

  const displayName = user.first_name
    ? `${user.first_name} ${user.last_name || ""}`.trim()
    : user.email;

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-2 rounded-[var(--radius-md)] px-3 py-2 transition-colors",
          "hover:bg-[var(--color-bg-hover)]",
          isOpen && "bg-[var(--color-bg-hover)]",
        )}
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-accent-primary)] text-white">
          <User className="h-4 w-4" />
        </div>
        <span className="hidden text-sm font-medium text-[var(--color-text-primary)] md:inline">
          {displayName}
        </span>
        <ChevronDown
          className={cn(
            "h-4 w-4 text-[var(--color-text-muted)] transition-transform",
            isOpen && "rotate-180",
          )}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full z-50 mt-2 min-w-[200px] rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-bg-primary)] py-1 shadow-[var(--shadow-lg)]">
          {/* User info */}
          <div className="border-b border-[var(--color-border)] px-4 py-3">
            <p className="text-sm font-medium text-[var(--color-text-primary)]">{displayName}</p>
            <p className="text-xs text-[var(--color-text-muted)]">{user.email}</p>
            {user.role && (
              <p className="mt-1 text-xs text-[var(--color-accent-primary)]">{user.role.name}</p>
            )}
          </div>

          {/* Menu items */}
          <div className="py-1">
            <Link
              href={ROUTES.SETTINGS}
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2 px-4 py-2 text-sm text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text-primary)]"
            >
              <Settings className="h-4 w-4" />
              Настройки
            </Link>
            <button
              onClick={() => {
                setIsOpen(false);
                logout();
              }}
              disabled={isPending}
              className="flex w-full items-center gap-2 px-4 py-2 text-sm text-[var(--color-error)] hover:bg-[var(--color-error-bg)]"
            >
              <LogOut className="h-4 w-4" />
              {isPending ? "Выход..." : "Выйти"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

