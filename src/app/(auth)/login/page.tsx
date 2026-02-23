"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { LoginForm, TenantPicker, useSelectTenant } from "@/features/auth";
import { useAuth } from "@/providers";
import { ROUTES } from "@/shared/config";
import { Spinner } from "@/shared/ui";
import { useTenantStore } from "@/shared/model/useTenantStore";
import type { TenantOption } from "@/entities/user";

type LoginScreen = "login" | "select-tenant";

export default function LoginPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const { name: tenantName, logoUrl } = useTenantStore();

  const [screen, setScreen] = useState<LoginScreen>("login");
  const [tenantOptions, setTenantOptions] = useState<TenantOption[]>([]);
  // selection_token kept only in a ref — never in localStorage
  const selectionTokenRef = useRef<string>("");

  const selectTenant = useSelectTenant();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace(ROUTES.ARTICLES);
    }
  }, [isAuthenticated, isLoading, router]);

  const handleTenantSelection = useCallback(
    (tenants: TenantOption[], selectionToken: string) => {
      setTenantOptions(tenants);
      selectionTokenRef.current = selectionToken;
      setScreen("select-tenant");
    },
    [],
  );

  const handleTenantPick = useCallback(
    (tenantId: string) => {
      const selectedMeta = tenantOptions.find((t) => t.tenant_id === tenantId);
      selectTenant.mutate({
        request: {
          selection_token: selectionTokenRef.current,
          tenant_id: tenantId,
        },
        tenantMeta: selectedMeta,
      });
    },
    [selectTenant, tenantOptions],
  );

  const handleBackToLogin = useCallback(() => {
    selectionTokenRef.current = "";
    setTenantOptions([]);
    setScreen("login");
  }, []);

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
      {screen === "select-tenant" ? (
        <TenantPicker
          tenants={tenantOptions}
          isLoading={selectTenant.isPending}
          onSelect={handleTenantPick}
          onBack={handleBackToLogin}
        />
      ) : (
        <div className="w-full max-w-md">
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
              Административная панель
            </p>
          </div>

          <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-bg-primary)] p-8 shadow-[var(--shadow-lg)]">
            <h2 className="mb-6 text-xl font-semibold text-[var(--color-text-primary)]">
              Вход в систему
            </h2>
            <LoginForm onTenantSelection={handleTenantSelection} />
          </div>

          <p className="mt-6 text-center text-sm text-[var(--color-text-muted)]">
            &copy; {new Date().getFullYear()} {tenantName || "Mediann"}. Все права защищены.
          </p>
        </div>
      )}
    </div>
  );
}
