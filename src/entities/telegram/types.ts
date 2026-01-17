export interface TelegramIntegration {
  id: string;
  tenant_id: string;
  bot_username: string | null;
  owner_chat_id: number | null;
  webhook_url: string | null;
  is_webhook_active: boolean;
  is_active: boolean;
  welcome_message: string | null;
  created_at: string;
  updated_at: string;
  bot_token_masked: string | null;
}

export interface CreateTelegramIntegrationDto {
  bot_token: string;
  owner_chat_id?: number;
  welcome_message?: string;
}

export interface UpdateTelegramIntegrationDto {
  bot_token?: string;
  owner_chat_id?: number;
  is_active?: boolean;
  welcome_message?: string;
}

export interface TestMessageResponse {
  success: boolean;
  message: string;
  chat_id: number | null;
}

export interface WebhookUrlResponse {
  webhook_url: string;
  is_configured: boolean;
  message: string | null;
}

export interface WebhookResponse {
  success: boolean;
  message: string;
}

