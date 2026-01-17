"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { LoginForm } from "@/features/auth";
import { useAuth } from "@/providers";
import { ROUTES } from "@/shared/config";
import { Spinner } from "@/shared/ui";

export default function LoginPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

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
          <h1 className="text-3xl font-bold text-[var(--color-text-primary)]">
            Mediann
          </h1>
          <p className="mt-2 text-[var(--color-text-secondary)]">
            Административная панель
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
          © {new Date().getFullYear()} Mediann. Все права защищены.
        </p>
      </div>
    </div>
  );
}

