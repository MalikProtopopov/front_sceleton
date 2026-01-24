"use client";

import { useState, useEffect } from "react";
import {
  Bot,
  Send,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ExternalLink,
  RefreshCw,
  Trash2,
  Eye,
  EyeOff,
  HelpCircle,
} from "lucide-react";
import {
  useTelegramIntegration,
  useCreateTelegramIntegration,
  useUpdateTelegramIntegration,
  useDeleteTelegramIntegration,
  useSendTestMessage,
  useWebhookUrl,
  useSetWebhook,
  useRemoveWebhook,
} from "../model/useTelegramIntegration";
import {
  Button,
  Input,
  Textarea,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Switch,
  Spinner,
  ConfirmModal,
} from "@/shared/ui";

export function TelegramSettingsTab() {
  const { data: integration, isLoading } = useTelegramIntegration();
  const { data: webhookUrlData } = useWebhookUrl();
  const { mutate: createIntegration, isPending: isCreating } = useCreateTelegramIntegration();
  const { mutate: updateIntegration, isPending: isUpdating } = useUpdateTelegramIntegration();
  const { mutate: deleteIntegration, isPending: isDeleting } = useDeleteTelegramIntegration();
  const { mutate: sendTestMessage, isPending: isSendingTest } = useSendTestMessage();
  const { mutate: setWebhook, isPending: isSettingWebhook } = useSetWebhook();
  const { mutate: removeWebhook, isPending: isRemovingWebhook } = useRemoveWebhook();

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [showToken, setShowToken] = useState(false);

  // Form state
  const [botToken, setBotToken] = useState("");
  const [chatId, setChatId] = useState("");
  const [welcomeMessage, setWelcomeMessage] = useState("");
  const [isActive, setIsActive] = useState(true);

  // Populate form when integration loads
  useEffect(() => {
    if (integration) {
      setChatId(integration.owner_chat_id?.toString() || "");
      setWelcomeMessage(integration.welcome_message || "");
      setIsActive(integration.is_active);
    }
  }, [integration]);

  const handleSubmit = () => {
    if (integration) {
      // Update existing
      updateIntegration({
        ...(botToken && { bot_token: botToken }),
        owner_chat_id: chatId ? parseInt(chatId) : undefined,
        welcome_message: welcomeMessage || undefined,
        is_active: isActive,
      });
    } else {
      // Create new
      if (!botToken) return;
      createIntegration({
        bot_token: botToken,
        owner_chat_id: chatId ? parseInt(chatId) : undefined,
        welcome_message: welcomeMessage || undefined,
      });
    }
    setBotToken(""); // Clear token after submit
  };

  const handleTestMessage = () => {
    sendTestMessage(chatId ? parseInt(chatId) : undefined);
  };

  const handleDelete = () => {
    deleteIntegration();
    setDeleteModalOpen(false);
    setBotToken("");
    setChatId("");
    setWelcomeMessage("");
  };

  const handleReinstallWebhook = () => {
    if (webhookUrlData?.webhook_url) {
      setWebhook(webhookUrlData.webhook_url);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[200px] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  const isConfigured = !!integration;

  return (
    <div className="space-y-6">
      {/* Main Settings Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            Настройки Telegram бота
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Status toggle (only if configured) */}
          {isConfigured && (
            <Switch
              checked={isActive}
              onChange={setIsActive}
              label="Telegram уведомления"
              description="Включить или выключить отправку уведомлений в Telegram"
            />
          )}

          {/* Bot Token */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-[var(--color-text-secondary)]">
              Bot Token {!isConfigured && <span className="text-[var(--color-error)]">*</span>}
            </label>
            {isConfigured && integration?.bot_token_masked ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="flex h-11 flex-1 items-center rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-4">
                    <code className="text-sm text-[var(--color-text-muted)]">
                      {integration.bot_token_masked}
                    </code>
                  </div>
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                </div>
                {integration.bot_username && (
                  <p className="flex items-center gap-1 text-sm text-green-600">
                    <CheckCircle2 className="h-4 w-4" />
                    Бот @{integration.bot_username} подключен
                  </p>
                )}
                <div className="relative">
                  <Input
                    type={showToken ? "text" : "password"}
                    value={botToken}
                    onChange={(e) => setBotToken(e.target.value)}
                    placeholder="Введите новый токен для замены"
                  />
                  <button
                    type="button"
                    onClick={() => setShowToken(!showToken)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
                  >
                    {showToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            ) : (
              <div className="relative">
                <Input
                  type={showToken ? "text" : "password"}
                  value={botToken}
                  onChange={(e) => setBotToken(e.target.value)}
                  placeholder="123456789:ABC-DEF1234ghIkl-zyx57W2v1u123ew11"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowToken(!showToken)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
                >
                  {showToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            )}
            <p className="text-xs text-[var(--color-text-muted)]">
              Получите токен у @BotFather в Telegram
            </p>
          </div>

          {/* Chat ID */}
          <Input
            label="Chat ID владельца"
            type="text"
            value={chatId}
            onChange={(e) => setChatId(e.target.value.replace(/[^0-9-]/g, ""))}
            placeholder="123456789"
            hint="Ваш личный Chat ID для получения уведомлений"
          />

          {/* Welcome Message */}
          <Textarea
            label="Приветственное сообщение"
            value={welcomeMessage}
            onChange={(e) => setWelcomeMessage(e.target.value)}
            placeholder="Привет! Я бот для уведомлений о заявках."
            hint="Сообщение, которое бот отправит при команде /start"
            className="min-h-[80px]"
          />

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-3 border-t border-[var(--color-border)] pt-4">
            <Button
              onClick={handleSubmit}
              isLoading={isCreating || isUpdating}
              disabled={!isConfigured && !botToken}
            >
              {isConfigured ? "Сохранить изменения" : "Подключить бота"}
            </Button>

            {isConfigured && (
              <>
                <Button
                  variant="secondary"
                  onClick={handleTestMessage}
                  isLoading={isSendingTest}
                  disabled={!chatId}
                >
                  <Send className="mr-2 h-4 w-4" />
                  Тестовое сообщение
                </Button>

                <Button
                  variant="danger"
                  onClick={() => setDeleteModalOpen(true)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Удалить интеграцию
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Webhook Status (only if configured) */}
      {isConfigured && (
        <Card>
          <CardHeader>
            <CardTitle>Webhook</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Webhook Status */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-[var(--color-text-secondary)]">
                Статус:
              </span>
              {integration?.is_webhook_active ? (
                <span className="flex items-center gap-1 text-sm text-green-600">
                  <CheckCircle2 className="h-4 w-4" />
                  Активен
                </span>
              ) : (
                <span className="flex items-center gap-1 text-sm text-[var(--color-text-muted)]">
                  <XCircle className="h-4 w-4" />
                  Не настроен
                </span>
              )}
            </div>

            {/* Auto-setup info */}
            <p className="text-sm text-[var(--color-text-muted)]">
              Webhook устанавливается автоматически при подключении бота.
            </p>

            {/* Current webhook URL from integration */}
            {integration?.webhook_url && (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-[var(--color-text-secondary)]">
                  Текущий Webhook URL
                </label>
                <div className="flex h-11 items-center rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-4">
                  <code className="truncate text-sm text-[var(--color-text-muted)]">
                    {integration.webhook_url}
                  </code>
                </div>
              </div>
            )}

            {/* Webhook not configured warning */}
            {!integration?.is_webhook_active && webhookUrlData?.message && (
              <div className="flex items-start gap-2 rounded-lg bg-yellow-50 p-3 text-sm text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{webhookUrlData.message}</span>
              </div>
            )}

            {/* Webhook Actions */}
            <div className="flex flex-wrap gap-3">
              {webhookUrlData?.is_configured && (
                <Button
                  variant="secondary"
                  onClick={handleReinstallWebhook}
                  isLoading={isSettingWebhook}
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Переустановить webhook
                </Button>
              )}

              {integration?.is_webhook_active && (
                <Button
                  variant="secondary"
                  onClick={() => removeWebhook()}
                  isLoading={isRemovingWebhook}
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  Удалить webhook
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Instructions Card */}
      <Card>
        <CardHeader>
          <button
            type="button"
            onClick={() => setShowInstructions(!showInstructions)}
            className="flex w-full items-center justify-between"
          >
            <CardTitle className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5" />
              Инструкции по настройке
            </CardTitle>
            <span className="text-[var(--color-text-muted)]">
              {showInstructions ? "Скрыть" : "Показать"}
            </span>
          </button>
        </CardHeader>
        {showInstructions && (
          <CardContent className="space-y-6">
            {/* How to create bot */}
            <div>
              <h4 className="mb-2 font-medium text-[var(--color-text-primary)]">
                Как создать Telegram бота
              </h4>
              <ol className="list-inside list-decimal space-y-1 text-sm text-[var(--color-text-secondary)]">
                <li>
                  Откройте Telegram и найдите{" "}
                  <a
                    href="https://t.me/BotFather"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[var(--color-accent-primary)] hover:underline"
                  >
                    @BotFather
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </li>
                <li>Отправьте команду /newbot</li>
                <li>Введите имя бота (например, &quot;Мой Сайт Уведомления&quot;)</li>
                <li>Введите username бота (например, my_site_bot)</li>
                <li>Скопируйте токен из ответа BotFather</li>
              </ol>
            </div>

            {/* How to get Chat ID */}
            <div>
              <h4 className="mb-2 font-medium text-[var(--color-text-primary)]">
                Как узнать свой Chat ID
              </h4>
              <div className="space-y-3">
                <div>
                  <p className="mb-1 text-sm font-medium text-[var(--color-text-primary)]">
                    Способ 1: Через @userinfobot
                  </p>
                  <ol className="list-inside list-decimal space-y-1 text-sm text-[var(--color-text-secondary)]">
                    <li>
                      Найдите{" "}
                      <a
                        href="https://t.me/userinfobot"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[var(--color-accent-primary)] hover:underline"
                      >
                        @userinfobot
                        <ExternalLink className="h-3 w-3" />
                      </a>{" "}
                      в Telegram
                    </li>
                    <li>Отправьте /start</li>
                    <li>Бот покажет ваш Chat ID</li>
                  </ol>
                </div>
                <div>
                  <p className="mb-1 text-sm font-medium text-[var(--color-text-primary)]">
                    Способ 2: Через API
                  </p>
                  <ol className="list-inside list-decimal space-y-1 text-sm text-[var(--color-text-secondary)]">
                    <li>Напишите любое сообщение вашему боту</li>
                    <li>
                      Откройте в браузере:{" "}
                      <code className="rounded bg-[var(--color-bg-secondary)] px-1 text-xs">
                        https://api.telegram.org/bot&#123;TOKEN&#125;/getUpdates
                      </code>
                    </li>
                    <li>
                      Найдите{" "}
                      <code className="rounded bg-[var(--color-bg-secondary)] px-1 text-xs">
                        &quot;chat&quot;:&#123;&quot;id&quot;:123456789&#125;
                      </code>{" "}
                      в ответе
                    </li>
                  </ol>
                </div>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Удалить интеграцию?"
        description="Вы уверены, что хотите удалить Telegram интеграцию? Уведомления перестанут отправляться. Это действие нельзя отменить."
        confirmText="Удалить"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
}

