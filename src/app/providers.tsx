"use client";

import { ThemeProvider, QueryProvider, AuthProvider } from "@/providers";
import { Toaster } from "sonner";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <AuthProvider>
        <ThemeProvider>
          {children}
          <Toaster
            position="top-right"
            richColors
            closeButton
            toastOptions={{
              style: {
                background: "var(--color-bg-elevated)",
                color: "var(--color-text-primary)",
                border: "1px solid var(--color-border)",
              },
            }}
          />
        </ThemeProvider>
      </AuthProvider>
    </QueryProvider>
  );
}

