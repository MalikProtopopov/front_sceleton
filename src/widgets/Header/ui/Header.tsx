"use client";

import { Menu } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { UserMenu } from "./UserMenu";
import { cn } from "@/shared/lib";

interface HeaderProps {
  title?: string;
  className?: string;
}

export function Header({ title, className }: HeaderProps) {
  return (
    <header
      className={cn(
        "fixed right-0 top-0 z-30 flex h-[var(--header-height)] items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-bg-primary)] px-6",
        "left-[var(--sidebar-width)]",
        className,
      )}
    >
      {/* Left side */}
      <div className="flex items-center gap-4">
        <button className="rounded-[var(--radius-md)] p-2 text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)] md:hidden">
          <Menu className="h-5 w-5" />
        </button>
        {title && (
          <h1 className="text-lg font-semibold text-[var(--color-text-primary)]">{title}</h1>
        )}
      </div>

      {/* Right side */}
      <div className="flex items-center gap-4">
        <ThemeToggle />
        <UserMenu />
      </div>
    </header>
  );
}

