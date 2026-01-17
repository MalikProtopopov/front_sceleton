import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { telegramApi, telegramKeys } from "../api/telegramApi";
import type {
  CreateTelegramIntegrationDto,
  UpdateTelegramIntegrationDto,
} from "@/entities/telegram";

// Get current integration
export function useTelegramIntegration() {
  return useQuery({
    queryKey: telegramKeys.integration(),
    queryFn: () => telegramApi.getIntegration(),
  });
}

// Get webhook URL
export function useWebhookUrl() {
  return useQuery({
    queryKey: telegramKeys.webhookUrl(),
    queryFn: () => telegramApi.getWebhookUrl(),
  });
}

// Create integration
export function useCreateTelegramIntegration() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTelegramIntegrationDto) =>
      telegramApi.createIntegration(data),
    onSuccess: (newIntegration) => {
      queryClient.setQueryData(telegramKeys.integration(), newIntegration);
      queryClient.invalidateQueries({ queryKey: telegramKeys.webhookUrl() });
      toast.success("Telegram бот успешно подключен!");
    },
    onError: (error) => {
      toast.error("Ошибка при подключении бота", {
        description: error.message,
      });
    },
  });
}

// Update integration
export function useUpdateTelegramIntegration() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateTelegramIntegrationDto) =>
      telegramApi.updateIntegration(data),
    onSuccess: (updatedIntegration) => {
      queryClient.setQueryData(telegramKeys.integration(), updatedIntegration);
      toast.success("Настройки Telegram обновлены!");
    },
    onError: (error) => {
      toast.error("Ошибка при обновлении настроек", {
        description: error.message,
      });
    },
  });
}

// Delete integration
export function useDeleteTelegramIntegration() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => telegramApi.deleteIntegration(),
    onSuccess: () => {
      queryClient.setQueryData(telegramKeys.integration(), null);
      queryClient.invalidateQueries({ queryKey: telegramKeys.webhookUrl() });
      toast.success("Telegram интеграция удалена!");
    },
    onError: (error) => {
      toast.error("Ошибка при удалении интеграции", {
        description: error.message,
      });
    },
  });
}

// Send test message
export function useSendTestMessage() {
  return useMutation({
    mutationFn: (chatId?: number) => telegramApi.sendTestMessage(chatId),
    onSuccess: (response) => {
      if (response.success) {
        toast.success("Тестовое сообщение отправлено!");
      } else {
        toast.error("Не удалось отправить сообщение", {
          description: response.message,
        });
      }
    },
    onError: (error) => {
      toast.error("Ошибка при отправке сообщения", {
        description: error.message,
      });
    },
  });
}

// Set webhook
export function useSetWebhook() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (webhookUrl: string) => telegramApi.setWebhook(webhookUrl),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: telegramKeys.integration() });
      queryClient.invalidateQueries({ queryKey: telegramKeys.webhookUrl() });
      toast.success("Webhook успешно установлен!");
    },
    onError: (error) => {
      toast.error("Ошибка при установке webhook", {
        description: error.message,
      });
    },
  });
}

// Remove webhook
export function useRemoveWebhook() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => telegramApi.removeWebhook(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: telegramKeys.integration() });
      queryClient.invalidateQueries({ queryKey: telegramKeys.webhookUrl() });
      toast.success("Webhook удален!");
    },
    onError: (error) => {
      toast.error("Ошибка при удалении webhook", {
        description: error.message,
      });
    },
  });
}

