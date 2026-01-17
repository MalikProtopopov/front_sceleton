"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers";
import { Sidebar } from "@/widgets/Sidebar";
import { Header } from "@/widgets/Header";
import { Spinner } from "@/shared/ui";
import { ROUTES } from "@/shared/config";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

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

  return (
    <div className="min-h-screen bg-[var(--color-bg-secondary)]">
      <Sidebar />
      <Header />
      <main className="ml-[var(--sidebar-width)] pt-[var(--header-height)]">
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}

