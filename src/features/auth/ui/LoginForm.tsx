"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AlertCircle } from "lucide-react";
import { Button, Input } from "@/shared/ui";
import { useLogin } from "../model/useAuth";

const loginSchema = z.object({
  email: z.string().min(1, "Email обязателен").email("Неверный формат email"),
  password: z.string().min(1, "Пароль обязателен"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const { mutate: login, isPending, error, reset } = useLogin();

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

  const onSubmit = (data: LoginFormValues) => {
    // Reset previous error before new attempt
    reset();
    login(data);
  };

  // Extract error message
  const errorMessage = error
    ? error instanceof Error
      ? error.message
      : "Неверный email или пароль"
    : null;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Error banner */}
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

      <Button type="submit" className="w-full" isLoading={isPending}>
        Войти
      </Button>
    </form>
  );
}

