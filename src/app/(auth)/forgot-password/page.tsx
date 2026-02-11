"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Mail } from "lucide-react";
import { Button, Input } from "@/shared/ui";
import { useForgotPassword } from "@/features/auth";
import { ROUTES } from "@/shared/config";

const schema = z.object({
  email: z.string().min(1, "Email обязателен").email("Неверный формат email"),
});

type FormValues = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const [submitted, setSubmitted] = useState(false);
  const { mutate: forgotPassword, isPending } = useForgotPassword();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "" },
  });

  const onSubmit = (data: FormValues) => {
    forgotPassword(data, {
      onSettled: () => setSubmitted(true),
    });
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
          {submitted ? (
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-success)]/10">
                <Mail className="h-7 w-7 text-[var(--color-success)]" />
              </div>
              <h2 className="mb-2 text-xl font-semibold text-[var(--color-text-primary)]">
                Проверьте почту
              </h2>
              <p className="mb-6 text-sm text-[var(--color-text-secondary)]">
                Если указанный email зарегистрирован в системе, мы отправили письмо с инструкциями по сбросу пароля.
              </p>
              <Link
                href={ROUTES.LOGIN}
                className="inline-flex items-center gap-2 text-sm text-[var(--color-primary)] hover:underline"
              >
                <ArrowLeft className="h-4 w-4" />
                Вернуться к входу
              </Link>
            </div>
          ) : (
            <>
              <h2 className="mb-2 text-xl font-semibold text-[var(--color-text-primary)]">
                Восстановление пароля
              </h2>
              <p className="mb-6 text-sm text-[var(--color-text-secondary)]">
                Введите email, указанный при регистрации. Мы отправим вам ссылку для сброса пароля.
              </p>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <Input
                  label="Email"
                  type="email"
                  placeholder="admin@example.com"
                  autoComplete="email"
                  error={errors.email?.message}
                  {...register("email")}
                />

                <Button type="submit" className="w-full" isLoading={isPending}>
                  Отправить ссылку
                </Button>
              </form>

              <div className="mt-4 text-center">
                <Link
                  href={ROUTES.LOGIN}
                  className="inline-flex items-center gap-2 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Вернуться к входу
                </Link>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-sm text-[var(--color-text-muted)]">
          © {new Date().getFullYear()} Mediann. Все права защищены.
        </p>
      </div>
    </div>
  );
}
