"use client";

import { Sun, Moon, Monitor } from "lucide-react";
import { useTheme } from "@/providers";
import { cn } from "@/shared/lib";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex items-center rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-1">
      <button
        onClick={() => setTheme("light")}
        className={cn(
          "rounded-[var(--radius-sm)] p-1.5 transition-colors",
          theme === "light"
            ? "bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] shadow-sm"
            : "text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]",
        )}
        title="Светлая тема"
      >
        <Sun className="h-4 w-4" />
      </button>
      <button
        onClick={() => setTheme("dark")}
        className={cn(
          "rounded-[var(--radius-sm)] p-1.5 transition-colors",
          theme === "dark"
            ? "bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] shadow-sm"
            : "text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]",
        )}
        title="Тёмная тема"
      >
        <Moon className="h-4 w-4" />
      </button>
      <button
        onClick={() => setTheme("system")}
        className={cn(
          "rounded-[var(--radius-sm)] p-1.5 transition-colors",
          theme === "system"
            ? "bg-[var(--color-bg-primary)] text-[var(--color-text-primary)] shadow-sm"
            : "text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]",
        )}
        title="Системная тема"
      >
        <Monitor className="h-4 w-4" />
      </button>
    </div>
  );
}

