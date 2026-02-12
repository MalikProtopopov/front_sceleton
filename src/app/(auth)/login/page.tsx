"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { LoginForm } from "@/features/auth";
import { useAuth } from "@/providers";
import { ROUTES } from "@/shared/config";
import { Spinner } from "@/shared/ui";
import { useTenantStore } from "@/shared/model/useTenantStore";

export default function LoginPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const { name: tenantName, logoUrl } = useTenantStore();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace(ROUTES.ARTICLES);
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--color-bg-secondary)] p-4">
      <div className="w-full max-w-md">
        {/* Logo / Brand */}
        <div className="mb-8 text-center">
          {logoUrl ? (
            <img
              src={logoUrl}
              alt={tenantName || "Logo"}
              className="mx-auto mb-3 h-14 w-auto object-contain"
            />
          ) : (
            <h1 className="text-3xl font-bold text-[var(--color-text-primary)]">
              {tenantName || "Mediann"}
            </h1>
          )}
          <p className="mt-2 text-[var(--color-text-secondary)]">
            {tenantName ? "Административная панель" : "Административная панель"}
          </p>
        </div>

        {/* Login Card */}
        <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-bg-primary)] p-8 shadow-[var(--shadow-lg)]">
          <h2 className="mb-6 text-xl font-semibold text-[var(--color-text-primary)]">
            Вход в систему
          </h2>
          <LoginForm />
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-sm text-[var(--color-text-muted)]">
          © {new Date().getFullYear()} {tenantName || "Mediann"}. Все права защищены.
        </p>
      </div>
    </div>
  );
}

