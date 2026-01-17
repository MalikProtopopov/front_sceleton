import { apiClient } from "@/shared/api";
import { API_ENDPOINTS } from "@/shared/config";
import type {
  TelegramIntegration,
  CreateTelegramIntegrationDto,
  UpdateTelegramIntegrationDto,
  TestMessageResponse,
  WebhookUrlResponse,
  WebhookResponse,
} from "@/entities/telegram";

export const telegramApi = {
  // Get current integration settings
  getIntegration: () =>
    apiClient.get<TelegramIntegration | null>(API_ENDPOINTS.TELEGRAM.INTEGRATION),

  // Create or update integration (POST)
  createIntegration: (data: CreateTelegramIntegrationDto) =>
    apiClient.post<TelegramIntegration>(API_ENDPOINTS.TELEGRAM.INTEGRATION, data),

  // Update integration (PATCH)
  updateIntegration: (data: UpdateTelegramIntegrationDto) =>
    apiClient.patch<TelegramIntegration>(API_ENDPOINTS.TELEGRAM.INTEGRATION, data),

  // Delete integration
  deleteIntegration: () =>
    apiClient.delete(API_ENDPOINTS.TELEGRAM.INTEGRATION),

  // Send test message
  sendTestMessage: (chatId?: number) =>
    apiClient.post<TestMessageResponse>(API_ENDPOINTS.TELEGRAM.TEST, {
      chat_id: chatId,
    }),

  // Get webhook URL
  getWebhookUrl: () =>
    apiClient.get<WebhookUrlResponse>(API_ENDPOINTS.TELEGRAM.WEBHOOK_URL),

  // Set webhook
  setWebhook: (webhookUrl: string) =>
    apiClient.post<WebhookResponse>(API_ENDPOINTS.TELEGRAM.WEBHOOK, {
      webhook_url: webhookUrl,
    }),

  // Remove webhook
  removeWebhook: () =>
    apiClient.delete<WebhookResponse>(API_ENDPOINTS.TELEGRAM.WEBHOOK),
};

// Query keys for React Query
export const telegramKeys = {
  all: ["telegram"] as const,
  integration: () => [...telegramKeys.all, "integration"] as const,
  webhookUrl: () => [...telegramKeys.all, "webhook-url"] as const,
};

