# Развёртывание ветки multi-domain tenant switcher на сервере

## 1. Подтянуть новый код

```bash
# Перейти в каталог проекта
cd /path/to/mediannfrontadmin

# Обновить список веток с remote
git fetch origin

# Переключиться на ветку с мульти-доменным режимом
git checkout feature/multi-domain-tenant-switcher

# Подтянуть последние изменения (если кто-то пушил)
git pull origin feature/multi-domain-tenant-switcher
```

## 2. Установить зависимости (если нужно)

```bash
npm ci
# или, если не используете lockfile:
# npm install
```

## 3. Переменные окружения

Убедись, что в `.env.local` (или в переменных окружения деплоя) заданы:

- `NEXT_PUBLIC_API_URL` — URL бэкенда (например `https://api.mediann.dev` или `http://localhost:8000` для разработки).
- Для **локальной разработки на localhost** добавь `NEXT_PUBLIC_TENANT_ID=<uuid_тенанта>`.

На продакшене тенант определяется по домену, `NEXT_PUBLIC_TENANT_ID` не нужен.

## 4. Сборка и запуск

**Development:**

```bash
npm run dev
```

**Production (standalone build):**

```bash
# Сборка
npm run build

# Запуск (Next.js standalone)
node .next/standalone/server.js
# либо через pm2/systemd, указывая node .next/standalone/server.js
```

**Через Docker (если используется):**

```bash
docker compose build
docker compose up -d
```

## 5. Краткая шпаргалка (скопировать на сервер)

```bash
cd /path/to/mediannfrontadmin
git fetch origin
git checkout feature/multi-domain-tenant-switcher
git pull origin feature/multi-domain-tenant-switcher
npm ci
npm run build
# Дальше — твой способ запуска (node .next/standalone/server.js, pm2, docker и т.д.)
```
