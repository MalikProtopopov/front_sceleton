"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/providers";
import { Sidebar } from "@/widgets/Sidebar";
import { Header } from "@/widgets/Header";
import { Spinner, TenantInactivePage, FeatureDisabledNotice } from "@/shared/ui";
import { ROUTES } from "@/shared/config";
import { useGlobalErrors } from "@/shared/model/useGlobalErrors";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, isLoading } = useAuth();
  const isTenantInactive = useGlobalErrors((s) => s.isTenantInactive);
  const disabledFeature = useGlobalErrors((s) => s.disabledFeature);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace(ROUTES.LOGIN);
    }
  }, [isAuthenticated, isLoading, router]);

  // Force password change guard
  useEffect(() => {
    if (
      user &&
      "force_password_change" in user &&
      user.force_password_change === true &&
      pathname !== ROUTES.SETTINGS
    ) {
      router.replace(ROUTES.SETTINGS);
    }
  }, [user, pathname, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  // Full-screen overlay when tenant is deactivated
  if (isTenantInactive) {
    return <TenantInactivePage />;
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg-secondary)]">
      <Sidebar />
      <Header />
      <main className="ml-[var(--sidebar-width)] pt-[var(--header-height)]">
        <div className="p-6">
          {disabledFeature ? <FeatureDisabledNotice /> : children}
        </div>
      </main>
    </div>
  );
}

