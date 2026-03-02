import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAppMutation } from "@/shared/lib";
import { telegramApi, telegramKeys } from "../api/telegramApi";
import type {
  CreateTelegramIntegrationDto,
  UpdateTelegramIntegrationDto,
} from "@/entities/telegram";

export function useTelegramIntegration() {
  return useQuery({
    queryKey: telegramKeys.integration(),
    queryFn: () => telegramApi.getIntegration(),
  });
}

export function useWebhookUrl() {
  return useQuery({
    queryKey: telegramKeys.webhookUrl(),
    queryFn: () => telegramApi.getWebhookUrl(),
  });
}

export function useCreateTelegramIntegration() {
  const queryClient = useQueryClient();
  return useAppMutation({
    mutationFn: (data: CreateTelegramIntegrationDto) => telegramApi.createIntegration(data),
    successMessage: "Telegram бот успешно подключен!",
    errorMessage: "Ошибка при подключении бота",
    invalidateKeys: [telegramKeys.webhookUrl()],
    onSuccess: (newIntegration) => {
      queryClient.setQueryData(telegramKeys.integration(), newIntegration);
    },
  });
}

export function useUpdateTelegramIntegration() {
  const queryClient = useQueryClient();
  return useAppMutation({
    mutationFn: (data: UpdateTelegramIntegrationDto) => telegramApi.updateIntegration(data),
    successMessage: "Настройки Telegram обновлены!",
    errorMessage: "Ошибка при обновлении настроек",
    onSuccess: (updatedIntegration) => {
      queryClient.setQueryData(telegramKeys.integration(), updatedIntegration);
    },
  });
}

export function useDeleteTelegramIntegration() {
  const queryClient = useQueryClient();
  return useAppMutation({
    mutationFn: () => telegramApi.deleteIntegration(),
    successMessage: "Telegram интеграция удалена!",
    errorMessage: "Ошибка при удалении интеграции",
    invalidateKeys: [telegramKeys.webhookUrl()],
    onSuccess: () => {
      queryClient.setQueryData(telegramKeys.integration(), null);
    },
  });
}

export function useSendTestMessage() {
  return useAppMutation({
    mutationFn: (chatId?: number) => telegramApi.sendTestMessage(chatId),
    errorMessage: "Ошибка при отправке сообщения",
    onSuccess: (response) => {
      if (response.success) {
        toast.success("Тестовое сообщение отправлено!");
      } else {
        toast.error("Не удалось отправить сообщение", {
          description: response.message,
        });
      }
    },
  });
}

export function useSetWebhook() {
  return useAppMutation({
    mutationFn: (webhookUrl: string) => telegramApi.setWebhook(webhookUrl),
    successMessage: "Webhook успешно установлен!",
    errorMessage: "Ошибка при установке webhook",
    invalidateKeys: [telegramKeys.integration(), telegramKeys.webhookUrl()],
  });
}

export function useRemoveWebhook() {
  return useAppMutation({
    mutationFn: () => telegramApi.removeWebhook(),
    successMessage: "Webhook удален!",
    errorMessage: "Ошибка при удалении webhook",
    invalidateKeys: [telegramKeys.integration(), telegramKeys.webhookUrl()],
  });
}
