"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { AlertCircle } from "lucide-react";
import { Button, Input } from "@/shared/ui";
import { ROUTES } from "@/shared/config";
import { useLogin } from "../model/useAuth";
import type { TenantOption, TenantRedirectRequired } from "@/entities/user";

const loginSchema = z.object({
  email: z.string().min(1, "Email обязателен").email("Неверный формат email"),
  password: z.string().min(1, "Пароль обязателен"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

interface LoginFormProps {
  onTenantSelection?: (tenants: TenantOption[], selectionToken: string) => void;
  onTenantRedirect?: (data: TenantRedirectRequired) => void;
}

export function LoginForm({ onTenantSelection, onTenantRedirect }: LoginFormProps) {
  const { mutate: login, isPending, error, data, reset } = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  useEffect(() => {
    if (data?.status === "tenant_selection_required" && onTenantSelection) {
      onTenantSelection(data.tenants, data.selection_token);
    }
    if (data?.status === "tenant_redirect_required" && onTenantRedirect) {
      onTenantRedirect(data);
    }
  }, [data, onTenantSelection, onTenantRedirect]);

  const onSubmit = (formData: LoginFormValues) => {
    reset();
    login(formData);
  };

  const getErrorMessage = () => {
    if (!error) return null;
    if (error && typeof error === "object") {
      const axiosError = error as { response?: { status?: number; data?: { detail?: string; message?: string } }; message?: string };
      if (axiosError.response?.status === 401) return "Неверный email или пароль";
      if (axiosError.response?.data?.detail) return axiosError.response.data.detail;
      if (axiosError.response?.data?.message) return axiosError.response.data.message;
      if (axiosError.message && !axiosError.message.includes("status code")) return axiosError.message;
    }
    if (error instanceof Error) return error.message;
    return "Неверный email или пароль";
  };

  const errorMessage = getErrorMessage();

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {errorMessage && (
        <div className="flex items-center gap-3 rounded-lg border border-[var(--color-error)]/30 bg-[var(--color-error)]/10 p-4">
          <AlertCircle className="h-5 w-5 flex-shrink-0 text-[var(--color-error)]" />
          <p className="text-sm text-[var(--color-error)]">{errorMessage}</p>
        </div>
      )}

      <Input
        label="Email"
        type="email"
        placeholder="admin@example.com"
        autoComplete="email"
        error={errors.email?.message}
        {...register("email")}
      />

      <Input
        label="Пароль"
        type="password"
        placeholder="••••••••"
        autoComplete="current-password"
        error={errors.password?.message}
        {...register("password")}
      />

      <div className="flex items-center justify-between">
        <Link
          href={ROUTES.FORGOT_PASSWORD}
          className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] transition-colors"
        >
          Забыли пароль?
        </Link>
      </div>

      <Button type="submit" className="w-full" isLoading={isPending}>
        Войти
      </Button>
    </form>
  );
}

