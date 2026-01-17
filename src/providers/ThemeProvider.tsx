"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useSyncExternalStore } from "react";

type Theme = "light" | "dark" | "system";
type ResolvedTheme = "light" | "dark";

interface ThemeContextValue {
  theme: Theme;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

const STORAGE_KEY = "theme";

function getSystemTheme(): ResolvedTheme {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

// External store for theme - avoids setState in effects
function createThemeStore() {
  let theme: Theme = "light";
  const listeners = new Set<() => void>();
  let initialized = false;

  return {
    getSnapshot(): Theme {
      if (!initialized && typeof window !== "undefined") {
        const stored = localStorage.getItem(STORAGE_KEY) as Theme | null;
        if (stored && ["light", "dark", "system"].includes(stored)) {
          theme = stored;
        }
        initialized = true;
      }
      return theme;
    },

    getServerSnapshot(): Theme {
      return "light";
    },

    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },

    setTheme(newTheme: Theme) {
      theme = newTheme;
      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEY, newTheme);
      }
      listeners.forEach((listener) => listener());
    },
  };
}

const themeStore = createThemeStore();

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const mountedRef = useRef(false);
  
  const theme = useSyncExternalStore(
    themeStore.subscribe,
    themeStore.getSnapshot,
    themeStore.getServerSnapshot,
  );

  const resolvedTheme = useMemo<ResolvedTheme>(() => {
    if (theme === "system") {
      return typeof window !== "undefined" ? getSystemTheme() : "light";
    }
    return theme;
  }, [theme]);

  // Apply theme to document - only side effect, no setState
  useEffect(() => {
    mountedRef.current = true;
    document.documentElement.setAttribute("data-theme", resolvedTheme);
  }, [resolvedTheme]);

  // Listen for system theme changes
  useEffect(() => {
    if (theme !== "system") return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => {
      document.documentElement.setAttribute("data-theme", getSystemTheme());
    };

    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, [theme]);

  const setTheme = useCallback((newTheme: Theme) => {
    themeStore.setTheme(newTheme);
  }, []);

  const value = useMemo(
    () => ({ theme, resolvedTheme, setTheme }),
    [theme, resolvedTheme, setTheme],
  );

  // Prevent hydration mismatch by rendering nothing on server
  // The store's getServerSnapshot returns "light", matching what we'd render
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
}
