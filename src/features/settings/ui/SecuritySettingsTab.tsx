"use client";

import { useState } from "react";
import { useChangePassword } from "../model/useSettings";
import { Button, Input, Card, CardHeader, CardTitle, CardContent } from "@/shared/ui";

export function SecuritySettingsTab() {
  const { mutate: changePassword, isPending: isChangingPassword } = useChangePassword();

  const [passwordForm, setPasswordForm] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const handleChangePassword = () => {
    setPasswordError(null);

    if (passwordForm.new_password.length < 8) {
      setPasswordError("Новый пароль должен содержать минимум 8 символов");
      return;
    }

    if (passwordForm.new_password !== passwordForm.confirm_password) {
      setPasswordError("Пароли не совпадают");
      return;
    }

    changePassword(
      {
        current_password: passwordForm.current_password,
        new_password: passwordForm.new_password,
      },
      {
        onSuccess: () => {
          setPasswordForm({
            current_password: "",
            new_password: "",
            confirm_password: "",
          });
        },
      }
    );
  };

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Изменение пароля</CardTitle>
      </CardHeader>
      <CardContent className="max-w-md space-y-4">
        <Input
          label="Текущий пароль"
          type="password"
          value={passwordForm.current_password}
          onChange={(e) => setPasswordForm({ ...passwordForm, current_password: e.target.value })}
          placeholder="Введите текущий пароль"
          required
        />
        <Input
          label="Новый пароль"
          type="password"
          value={passwordForm.new_password}
          onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })}
          placeholder="Минимум 8 символов"
          required
        />
        <Input
          label="Подтверждение пароля"
          type="password"
          value={passwordForm.confirm_password}
          onChange={(e) => setPasswordForm({ ...passwordForm, confirm_password: e.target.value })}
          placeholder="Повторите новый пароль"
          error={passwordError || undefined}
          required
        />
        <div className="flex justify-end pt-4">
          <Button
            onClick={handleChangePassword}
            isLoading={isChangingPassword}
            disabled={
              !passwordForm.current_password ||
              !passwordForm.new_password ||
              !passwordForm.confirm_password
            }
          >
            Изменить пароль
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
