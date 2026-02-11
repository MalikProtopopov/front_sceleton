"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, AlertCircle } from "lucide-react";
import { Button, Input } from "@/shared/ui";
import { useResetPassword } from "@/features/auth";
import { ROUTES } from "@/shared/config";

const schema = z
  .object({
    new_password: z.string().min(8, "Минимум 8 символов"),
    confirm_password: z.string().min(1, "Подтвердите пароль"),
  })
  .refine((data) => data.new_password === data.confirm_password, {
    message: "Пароли не совпадают",
    path: ["confirm_password"],
  });

type FormValues = z.infer<typeof schema>;

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const { mutate: resetPassword, isPending } = useResetPassword();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { new_password: "", confirm_password: "" },
  });

  const onSubmit = (data: FormValues) => {
    if (!token) return;
    resetPassword({ token, new_password: data.new_password });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--color-bg-secondary)] p-4">
      <div className="w-full max-w-md">
        {/* Logo / Brand */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-[var(--color-text-primary)]">Mediann</h1>
          <p className="mt-2 text-[var(--color-text-secondary)]">Административная панель</p>
        </div>

        {/* Card */}
        <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-bg-primary)] p-8 shadow-[var(--shadow-lg)]">
          {!token ? (
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-error)]/10">
                <AlertCircle className="h-7 w-7 text-[var(--color-error)]" />
              </div>
              <h2 className="mb-2 text-xl font-semibold text-[var(--color-text-primary)]">
                Недействительная ссылка
              </h2>
              <p className="mb-6 text-sm text-[var(--color-text-secondary)]">
                Ссылка для сброса пароля недействительна или устарела. Запросите новую ссылку.
              </p>
              <Link
                href={ROUTES.FORGOT_PASSWORD}
                className="text-sm text-[var(--color-primary)] hover:underline"
              >
                Запросить новую ссылку
              </Link>
            </div>
          ) : (
            <>
              <h2 className="mb-2 text-xl font-semibold text-[var(--color-text-primary)]">
                Новый пароль
              </h2>
              <p className="mb-6 text-sm text-[var(--color-text-secondary)]">
                Придумайте новый пароль для вашей учётной записи.
              </p>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <Input
                  label="Новый пароль"
                  type="password"
                  placeholder="••••••••"
                  autoComplete="new-password"
                  error={errors.new_password?.message}
                  hint="Минимум 8 символов"
                  {...register("new_password")}
                />

                <Input
                  label="Подтверждение пароля"
                  type="password"
                  placeholder="••••••••"
                  autoComplete="new-password"
                  error={errors.confirm_password?.message}
                  {...register("confirm_password")}
                />

                <Button type="submit" className="w-full" isLoading={isPending}>
                  Сменить пароль
                </Button>
              </form>
            </>
          )}

          <div className="mt-4 text-center">
            <Link
              href={ROUTES.LOGIN}
              className="inline-flex items-center gap-2 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
            >
              <ArrowLeft className="h-4 w-4" />
              Вернуться к входу
            </Link>
          </div>
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-sm text-[var(--color-text-muted)]">
          © {new Date().getFullYear()} Mediann. Все права защищены.
        </p>
      </div>
    </div>
  );
}
