# Telegram Integration API

Документация по интеграции Telegram уведомлений для владельцев сайтов.

## Обзор

Система позволяет владельцу сайта (SITE_OWNER) получать уведомления о новых заявках в Telegram.

### Возможности

- Привязка Telegram бота к сайту
- Настройка chat_id владельца для уведомлений
- Автоматическая отправка уведомлений о новых заявках
- Тестовая отправка сообщений
- Webhook для валидации

### Архитектура

```
┌─────────────────────────────────────────────────────────┐
│                    Admin Panel                           │
│                 (Настройки Telegram)                     │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│                    Backend API                           │
│  POST /api/v1/telegram/integration                      │
│  GET  /api/v1/telegram/integration                      │
│  POST /api/v1/telegram/integration/test                 │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│                  Telegram Bot API                        │
│           api.telegram.org/bot{token}/...               │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│                Owner's Telegram Chat                     │
│            (Получение уведомлений о заявках)            │
└─────────────────────────────────────────────────────────┘
```

---

## API Endpoints

### Получить настройки интеграции

```http
GET /api/v1/telegram/integration
Authorization: Bearer {token}
```

**Response (200 OK):**

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "tenant_id": "550e8400-e29b-41d4-a716-446655440001",
  "bot_username": "my_company_bot",
  "owner_chat_id": 123456789,
  "webhook_url": "https://api.example.com/api/v1/telegram/webhook/abc123...",
  "is_webhook_active": true,
  "is_active": true,
  "welcome_message": "Привет! Я бот для уведомлений.",
  "created_at": "2026-01-15T10:00:00Z",
  "updated_at": "2026-01-15T10:00:00Z",
  "bot_token_masked": "••••••••:ABC-DEF1234ghIkl-zyx57W2v1u123ew11"
}
```

**Response (200 OK) - нет интеграции:**

```json
null
```

---

### Создать/обновить интеграцию

```http
POST /api/v1/telegram/integration
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**

```json
{
  "bot_token": "123456789:ABC-DEF1234ghIkl-zyx57W2v1u123ew11",
  "owner_chat_id": 123456789,
  "welcome_message": "Привет! Я бот для уведомлений о заявках."
}
```

| Поле | Тип | Обязательно | Описание |
|------|-----|-------------|----------|
| `bot_token` | string | Да | Токен бота от @BotFather |
| `owner_chat_id` | integer | Нет | Chat ID владельца для уведомлений |
| `welcome_message` | string | Нет | Сообщение для команды /start |

**Response (201 Created):**

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "tenant_id": "550e8400-e29b-41d4-a716-446655440001",
  "bot_username": "my_company_bot",
  "owner_chat_id": 123456789,
  "webhook_url": null,
  "is_webhook_active": false,
  "is_active": true,
  "welcome_message": "Привет! Я бот для уведомлений о заявках.",
  "created_at": "2026-01-15T10:00:00Z",
  "updated_at": "2026-01-15T10:00:00Z",
  "bot_token_masked": "••••••••:ABC-DEF1234ghIkl-zyx57W2v1u123ew11"
}
```

**Errors:**

- `400 Bad Request` - невалидный токен бота

```json
{
  "detail": "Invalid Telegram bot token: Could not validate token with Telegram"
}
```

---

### Обновить интеграцию

```http
PATCH /api/v1/telegram/integration
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**

```json
{
  "owner_chat_id": 987654321,
  "is_active": true
}
```

| Поле | Тип | Описание |
|------|-----|----------|
| `bot_token` | string | Новый токен (перевалидируется) |
| `owner_chat_id` | integer | Новый chat ID |
| `is_active` | boolean | Включить/выключить интеграцию |
| `welcome_message` | string | Новое приветственное сообщение |

**Response (200 OK):** То же, что и при создании.

---

### Удалить интеграцию

```http
DELETE /api/v1/telegram/integration
Authorization: Bearer {token}
```

**Response (204 No Content):** Пустой ответ.

---

### Отправить тестовое сообщение

```http
POST /api/v1/telegram/integration/test
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body (опционально):**

```json
{
  "chat_id": 123456789
}
```

Если `chat_id` не указан, используется `owner_chat_id` из настроек.

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Test message sent!",
  "chat_id": 123456789
}
```

**Response (200 OK) - ошибка:**

```json
{
  "success": false,
  "message": "No chat_id provided and owner_chat_id not configured",
  "chat_id": null
}
```

---

### Получить URL для webhook

```http
GET /api/v1/telegram/integration/webhook-url
Authorization: Bearer {token}
```

**Response (200 OK):**

```json
{
  "webhook_url": "https://api.example.com/api/v1/telegram/webhook/abc123def456...",
  "is_configured": true,
  "message": null
}
```

**Response (200 OK) - не настроен:**

```json
{
  "webhook_url": "",
  "is_configured": false,
  "message": "PUBLIC_API_URL not configured. Set PUBLIC_API_URL environment variable to your domain (e.g., https://yourdomain.com)"
}
```

---

### Установить webhook

```http
POST /api/v1/telegram/integration/webhook
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**

```json
{
  "webhook_url": "https://api.example.com/api/v1/telegram/webhook/abc123def456..."
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Webhook registered successfully"
}
```

---

### Удалить webhook

```http
DELETE /api/v1/telegram/integration/webhook
Authorization: Bearer {token}
```

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Webhook removed"
}
```

---

## Формат уведомлений

При создании новой заявки владелец получает сообщение в Telegram. Формат зависит от типа заявки (`form_slug`).

### 1. Быстрая заявка (`form_slug: "quick"`)

Компактный формат с основными контактными данными:

```
📩 Быстрая заявка

👤 Имя: Иван Петров
📧 Email: ivan@example.com
📞 Телефон: +7 999 123-45-67
🏢 Компания: ООО "Рога и копыта"

💬 Сообщение:
Здравствуйте! Интересует ваша услуга по разработке сайта.

🔗 Источник: google · /services/web · desktop
```

### 2. Расширенная заявка / MVP Brief (`form_slug: "mvp-brief"`)

Развёрнутый формат со всеми заполненными полями брифа:

```
📋 Заявка MVP Brief

👤 Имя: Иван Петров
📧 Email: ivan@example.com
📞 Телефон: +7 999 123-45-67
💬 Telegram: @ivan_petrov
📍 Откуда узнали: Google

💡 Идея:
Платформа для автоматизации HR-процессов с AI-ассистентом для первичного скрининга кандидатов.

🎯 Рынок: B2B SaaS
👥 Аудитория: HR-менеджеры и рекрутеры
📊 Размер аудитории: 1 000 – 10 000
🤖 AI/ML: LLM (языковые модели)

📱 Типы приложений: Веб-приложение, API
🔌 Интеграции: HH.ru API, Slack, Google Calendar

💰 Бюджет: $15,000 – $40,000
⏱ Сроки: В течение 30 дней

🔗 Источник: google · /brief · desktop
```

**Правила форматирования:**
- Выводятся только заполненные поля (пустые пропускаются)
- Для полей-селектов выводится человекочитаемая метка, а не машинный ключ (например, "B2B SaaS" вместо "b2b_saas")
- Для multiselect (appTypes) значения перечисляются через запятую
- Строка "Источник" в конце: `utm_source · page_path · device_type` (только заполненные, через " · ")
- Не используются длинные разделители из символов `━` / `—`

---

## Frontend Implementation Guide

### Рекомендуемый UI

#### Экран настройки Telegram (Settings → Notifications → Telegram)

```
┌─────────────────────────────────────────────────────────┐
│  Telegram уведомления                              [ON] │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Bot Token                                              │
│  ┌─────────────────────────────────────────┐           │
│  │ ••••••••:ABC-DEF1234...                 │ [Изменить]│
│  └─────────────────────────────────────────┘           │
│  ✓ Бот @my_company_bot подключен                       │
│                                                         │
│  ─────────────────────────────────────────────────────  │
│                                                         │
│  Ваш Chat ID                                            │
│  ┌─────────────────────────────────────────┐           │
│  │ 123456789                               │           │
│  └─────────────────────────────────────────┘           │
│  [Как узнать Chat ID?]                                  │
│                                                         │
│  [Отправить тестовое сообщение]                        │
│                                                         │
│  ─────────────────────────────────────────────────────  │
│                                                         │
│  Webhook                                                │
│  Статус: ✓ Активен                                     │
│  URL: https://api.example.com/api/v1/telegram/webhook..│
│                                                         │
│  [Переустановить webhook]  [Удалить webhook]           │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### React Implementation Example

```tsx
// hooks/useTelegramIntegration.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

interface TelegramIntegration {
  id: string;
  bot_username: string | null;
  owner_chat_id: number | null;
  is_active: boolean;
  is_webhook_active: boolean;
  webhook_url: string | null;
  bot_token_masked: string | null;
}

export function useTelegramIntegration() {
  return useQuery<TelegramIntegration | null>({
    queryKey: ['telegram-integration'],
    queryFn: async () => {
      const { data } = await api.get('/api/v1/telegram/integration');
      return data;
    },
  });
}

export function useCreateTelegramIntegration() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: {
      bot_token: string;
      owner_chat_id?: number;
    }) => {
      const { data: response } = await api.post('/api/v1/telegram/integration', data);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['telegram-integration'] });
    },
  });
}

export function useSendTestMessage() {
  return useMutation({
    mutationFn: async (chat_id?: number) => {
      const { data } = await api.post('/api/v1/telegram/integration/test', {
        chat_id,
      });
      return data;
    },
  });
}
```

```tsx
// components/TelegramSettings.tsx
import { useState } from 'react';
import { 
  useTelegramIntegration, 
  useCreateTelegramIntegration,
  useSendTestMessage 
} from '@/hooks/useTelegramIntegration';

export function TelegramSettings() {
  const { data: integration, isLoading } = useTelegramIntegration();
  const createMutation = useCreateTelegramIntegration();
  const testMutation = useSendTestMessage();
  
  const [botToken, setBotToken] = useState('');
  const [chatId, setChatId] = useState('');
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createMutation.mutateAsync({
      bot_token: botToken,
      owner_chat_id: chatId ? parseInt(chatId) : undefined,
    });
  };
  
  const handleTestMessage = async () => {
    const result = await testMutation.mutateAsync(
      chatId ? parseInt(chatId) : undefined
    );
    if (result.success) {
      alert('Тестовое сообщение отправлено!');
    } else {
      alert(`Ошибка: ${result.message}`);
    }
  };
  
  if (isLoading) return <div>Loading...</div>;
  
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Telegram уведомления</h2>
      
      {integration ? (
        // Show current integration
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Бот</label>
            <p className="text-gray-600">@{integration.bot_username}</p>
            <p className="text-xs text-gray-400">
              Token: {integration.bot_token_masked}
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium">Chat ID</label>
            <input
              type="number"
              value={chatId || integration.owner_chat_id || ''}
              onChange={(e) => setChatId(e.target.value)}
              className="mt-1 block w-full rounded border-gray-300"
            />
          </div>
          
          <button
            onClick={handleTestMessage}
            disabled={testMutation.isPending}
            className="px-4 py-2 bg-blue-500 text-white rounded"
          >
            {testMutation.isPending ? 'Отправка...' : 'Отправить тест'}
          </button>
        </div>
      ) : (
        // Setup form
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Bot Token</label>
            <input
              type="text"
              value={botToken}
              onChange={(e) => setBotToken(e.target.value)}
              placeholder="123456789:ABC-DEF..."
              className="mt-1 block w-full rounded border-gray-300"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Получите токен у @BotFather в Telegram
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium">Ваш Chat ID</label>
            <input
              type="number"
              value={chatId}
              onChange={(e) => setChatId(e.target.value)}
              placeholder="123456789"
              className="mt-1 block w-full rounded border-gray-300"
            />
          </div>
          
          <button
            type="submit"
            disabled={createMutation.isPending}
            className="px-4 py-2 bg-blue-500 text-white rounded"
          >
            {createMutation.isPending ? 'Сохранение...' : 'Подключить бота'}
          </button>
        </form>
      )}
    </div>
  );
}
```

---

## Инструкции для пользователя

### Как создать Telegram бота

1. Откройте Telegram и найдите `@BotFather`
2. Отправьте команду `/newbot`
3. Введите имя бота (например, "Мой Сайт Уведомления")
4. Введите username бота (например, `my_site_notifications_bot`)
5. Скопируйте токен (выглядит как `123456789:ABC-DEF1234ghIkl-zyx57W2v1u123ew11`)

### Как узнать свой Chat ID

**Способ 1: Через @userinfobot**
1. Найдите `@userinfobot` в Telegram
2. Отправьте `/start`
3. Бот покажет ваш Chat ID

**Способ 2: Через API**
1. Напишите любое сообщение вашему боту
2. Откройте в браузере: `https://api.telegram.org/bot{TOKEN}/getUpdates`
3. Найдите `"chat":{"id":123456789}` в ответе

**Способ 3: Через админку (если настроен webhook)**
1. Напишите `/start` вашему боту
2. Chat ID будет записан в логи webhook'а

---

## Безопасность

### Хранение токена

- Bot token хранится в зашифрованном виде (Fernet AES-128)
- В API responses токен показывается замаскированным
- Ключ шифрования задается через `ENCRYPTION_KEY`

### Webhook защита

- Каждая интеграция имеет уникальный `webhook_secret`
- Telegram отправляет `X-Telegram-Bot-Api-Secret-Token` header
- Используется constant-time сравнение для защиты от timing атак

### Доступ

- Только авторизованные пользователи с ролью site_owner/admin
- Каждый tenant имеет свою изолированную интеграцию

---

## Environment Variables

```bash
# Обязательно для webhook
PUBLIC_API_URL=https://your-domain.com

# Для шифрования (генерация: python -c 'from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())')
ENCRYPTION_KEY=your-32-byte-base64-key
```

---

## Troubleshooting

### Бот не отвечает на сообщения

Это нормально - бот используется только для отправки уведомлений, не для чата.

### Уведомления не приходят

1. Проверьте, что `owner_chat_id` указан
2. Проверьте, что интеграция активна (`is_active: true`)
3. Отправьте тестовое сообщение через API
4. Проверьте логи на ошибки Telegram API

### Ошибка "Invalid token"

- Убедитесь, что токен скопирован полностью
- Проверьте, что бот не заблокирован
- Создайте новый токен через @BotFather если старый скомпрометирован

### Webhook не устанавливается

- URL должен быть HTTPS
- Сервер должен быть доступен из интернета
- Для локальной разработки используйте ngrok

