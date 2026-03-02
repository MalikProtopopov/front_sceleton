"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers";
import { Sidebar } from "@/widgets/Sidebar";
import { Header } from "@/widgets/Header";
import { Spinner, TenantInactivePage, ErrorBoundary } from "@/shared/ui";
import { ErrorModal } from "@/shared/ui/ErrorModal";
import { ROUTES } from "@/shared/config";
import { useErrorStore } from "@/shared/model/useErrorStore";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const isTenantInactive = useErrorStore((s) => s.isTenantInactive);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace(ROUTES.LOGIN);
    }
  }, [isAuthenticated, isLoading, router]);

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

  if (isTenantInactive) {
    return <TenantInactivePage />;
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg-secondary)]">
      <Sidebar />
      <Header />
      <main className="ml-[var(--sidebar-width)] pt-[var(--header-height)]">
        <div className="p-6">
          <ErrorBoundary>{children}</ErrorBoundary>
        </div>
      </main>
      <ErrorModal />
    </div>
  );
}

