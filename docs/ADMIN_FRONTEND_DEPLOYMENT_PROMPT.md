# Admin Frontend Deployment Prompt (Same Server as Backend)

> **Используй эту документацию как промпт для настройки деплоя Next.js админ-панели на том же сервере, что и бекенд.**

---

## 🎯 Цель

Развернуть Next.js админ-панель на том же сервере, что и бекенд:
- Использовать тот же Nginx для проксирования
- SSL уже настроен для `admin.domain.com`
- Два варианта деплоя: статический экспорт или Docker контейнер

---

## 📁 Архитектура

```
Сервер (один для backend + admin):
├── api.domain.com    → backend:8000 (FastAPI)
└── admin.domain.com  → admin:3000 (Next.js) или статика в /var/www/admin
```

---

## ✅ Реализованная структура проекта

В проекте уже созданы все необходимые файлы для Docker-деплоя:

```
mediannfrontadmin/
├── Dockerfile                    # Production multi-stage build
├── Dockerfile.dev                # Development с hot-reload
├── docker-compose.dev.yml        # Docker Compose для разработки
├── docker-compose.prod.yml       # Docker Compose для production
├── .dockerignore                 # Оптимизация Docker-контекста
├── .env.example                  # Шаблон переменных окружения
├── .env.local                    # Локальная разработка (gitignored)
├── .env.production.example       # Шаблон для production
├── next.config.ts                # Настроен для standalone output
├── package.json                  # С docker и compose командами
└── scripts/
    └── deploy.sh                 # Скрипт деплоя на сервер
```

### Доступные npm команды

```bash
# Локальная разработка
npm run dev                       # Next.js dev server

# Docker Compose - Development
npm run compose:dev               # Запуск dev-контейнера
npm run compose:dev:build         # Пересборка и запуск
npm run compose:dev:down          # Остановка

# Docker Compose - Production
npm run compose:prod              # Запуск production
npm run compose:prod:build        # Пересборка и запуск
npm run compose:prod:down         # Остановка
npm run compose:prod:logs         # Просмотр логов

# Прямая сборка Docker
npm run docker:build              # Сборка production образа
npm run docker:run                # Запуск контейнера

# Деплой на сервер
npm run deploy                    # Полный деплой
npm run deploy:build-only         # Только сборка
```

---

## 🔧 Вариант 1: Static Export (Рекомендуется для простоты)

### Преимущества:
- Меньше ресурсов сервера
- Проще деплой
- Быстрее загрузка

### Шаг 1: Настройка Next.js для static export

**next.config.js:**
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',  // Static HTML export
  trailingSlash: true,
  images: {
    unoptimized: true  // Для static export
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'https://api.domain.com',
  }
}

module.exports = nextConfig
```

### Шаг 2: Структура проекта admin

```
admin/
├── package.json
├── next.config.js
├── .env.production         # Переменные для production
├── .env.local              # Локальная разработка
├── Dockerfile              # Для Docker варианта (опционально)
├── src/
│   ├── app/
│   └── ...
└── scripts/
    └── deploy.sh           # Скрипт деплоя
```

### Шаг 3: .env.production

**⚠️ ВАЖНО: API URL должен включать `/api/v1` префикс!**

```bash
NEXT_PUBLIC_API_URL=https://api.domain.com/api/v1
NEXT_PUBLIC_ADMIN_URL=https://admin.domain.com
```

### Шаг 4: Скрипт деплоя (admin/scripts/deploy.sh)

```bash
#!/bin/bash
# =============================================================================
# Admin Panel Deployment Script (Static Export)
# =============================================================================

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Настройки
REMOTE_USER="root"
REMOTE_HOST="your-server-ip"
REMOTE_PATH="/var/www/admin"
BACKEND_PATH="/opt/backend_sceleton/backend"

log_info "Building admin panel..."
npm run build

log_info "Uploading to server..."
rsync -avz --delete out/ ${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_PATH}/

log_info "Setting permissions..."
ssh ${REMOTE_USER}@${REMOTE_HOST} "chmod -R 755 ${REMOTE_PATH}"

log_success "Admin panel deployed!"
log_info "URL: https://admin.domain.com"
```

### Шаг 5: Nginx конфигурация (уже в nginx.conf.template)

```nginx
# Admin Panel Server (admin.domain.com)
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name admin.${DOMAIN};

    ssl_certificate /etc/letsencrypt/live/${DOMAIN}/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/${DOMAIN}/privkey.pem;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # Root for static files
    root /var/www/admin;
    index index.html;

    # Static assets with caching
    location /_next/static/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    location /static/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # SPA fallback
    location / {
        try_files $uri $uri.html $uri/ /index.html;
    }
}
```

### Шаг 6: Деплой на сервер

```bash
# На локальной машине (в папке admin)
npm install
npm run build  # Создаст папку out/

# Загрузить на сервер
rsync -avz --delete out/ root@server:/var/www/admin/

# На сервере - проверить права
ssh root@server "chmod -R 755 /var/www/admin"

# Перезагрузить nginx (если нужно)
ssh root@server "cd /opt/backend_sceleton/backend && docker compose -f docker-compose.prod.yml --env-file .env.prod exec nginx nginx -s reload"
```

---

## 🐳 Вариант 2: Docker Container (Реализован)

### Преимущества:
- SSR (Server Side Rendering)
- API Routes в Next.js
- Более сложная логика
- Изоляция окружения

### Быстрый старт (локально)

```bash
# Разработка с hot-reload
npm run compose:dev

# Или production-сборка локально
npm run compose:prod:build
```

### Шаг 1: Dockerfile для admin (уже создан)

```dockerfile
# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci

# Copy source and build
COPY . .

ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

RUN npm run build

# Production stage
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy built files
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

### Шаг 2: next.config.ts (уже настроен)

```typescript
import type { NextConfig } from "next";

const isProduction = process.env.NODE_ENV === "production";

const nextConfig: NextConfig = {
  // Standalone output для Docker
  output: isProduction ? "standalone" : undefined,
  
  // Rewrites только для development
  async rewrites() {
    if (isProduction) return [];
    return [{ source: "/api/:path*", destination: `${BACKEND_URL}/api/:path*` }];
  },
  
  images: {
    remotePatterns: [
      // Development
      { protocol: "http", hostname: "localhost", port: "8000" },
      // Production
      { protocol: "https", hostname: "api.mediann.de" },
      { protocol: "https", hostname: "*.mediann.de" },
    ],
  },
};

export default nextConfig;
```

### Шаг 3: Docker Compose для production (уже создан)

**⚠️ ВАЖНО: В docker-compose.prod.yml НЕТ хардкодов - все значения берутся из .env.production!**

**docker-compose.prod.yml:**
```yaml
services:
  admin:
    build:
      context: .
      dockerfile: Dockerfile
      args:
        NEXT_PUBLIC_API_URL: ${NEXT_PUBLIC_API_URL}
        NEXT_PUBLIC_ADMIN_URL: ${NEXT_PUBLIC_ADMIN_URL}
    image: mediann-admin:${IMAGE_TAG:-latest}
    container_name: ${COMPOSE_PROJECT_NAME:-mediann}_admin_prod
    restart: unless-stopped
    expose:
      - "3000"
    environment:
      - NODE_ENV=production
      - NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
      - NEXT_PUBLIC_ADMIN_URL=${NEXT_PUBLIC_ADMIN_URL}
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:3000/"]
      interval: 30s
      timeout: 10s
      start_period: 10s
      retries: 3
    networks:
      - app_network
    deploy:
      resources:
        limits:
          memory: 512M
        reservations:
          memory: 256M

networks:
  app_network:
    name: ${NETWORK_NAME:-mediann_network}
    external: ${EXTERNAL_NETWORK:-false}
```

**Пример .env.production на сервере:**
```bash
# ⚠️ КРИТИЧНО: API URL должен включать /api/v1!
NEXT_PUBLIC_API_URL=https://api.mediann.dev/api/v1
NEXT_PUBLIC_ADMIN_URL=https://admin.mediann.dev
IMAGE_TAG=latest
COMPOSE_PROJECT_NAME=mediann
EXTERNAL_NETWORK=true
NETWORK_NAME=cms_network_prod
```

### Шаг 4: Добавить в docker-compose.prod.yml бекенда

Если admin запускается вместе с бекендом, добавьте в `backend/docker-compose.prod.yml`:

```yaml
services:
  # ... другие сервисы ...

  admin:
    build:
      context: ../mediannfrontadmin  # Путь к папке admin
      dockerfile: Dockerfile
      args:
        NEXT_PUBLIC_API_URL: https://api.${DOMAIN}
    container_name: ${PROJECT_NAME}_admin_prod
    restart: unless-stopped
    environment:
      NEXT_PUBLIC_API_URL: https://api.${DOMAIN}
      NODE_ENV: production
    expose:
      - "3000"
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:3000/"]
      interval: 30s
      timeout: 10s
      retries: 3
    networks:
      - app_network
```

### Шаг 5: Обновить nginx.conf.template для proxy

**⚠️ ВАЖНО: Nginx должен проксировать к Docker контейнеру, а НЕ к статическим файлам!**

В файле `/opt/backend_sceleton/backend/nginx/nginx.conf` (или `nginx.conf.template`) найдите блок `server_name admin.mediann.dev` и замените на:

```nginx
# Upstream для admin panel (должен быть раскомментирован)
upstream admin {
    server admin:3000;
    keepalive 16;
}

# Admin Panel Server (admin.domain.com)
server {
    listen 443 ssl;
    listen [::]:443 ssl;
    http2 on;
    server_name admin.mediann.dev;

    # SSL certificates
    ssl_certificate /etc/letsencrypt/live/api.mediann.dev/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.mediann.dev/privkey.pem;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # Health check
    location /nginx-health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }

    # Static assets with caching
    location /_next/static/ {
        proxy_pass http://admin:3000;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Proxy all requests to Next.js container
    location / {
        proxy_pass http://admin:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";

        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}
```

**После изменения конфига:**
```bash
# Проверить синтаксис
docker compose -f docker-compose.prod.yml --env-file .env.prod exec nginx nginx -t

# Перезагрузить nginx
docker compose -f docker-compose.prod.yml --env-file .env.prod exec nginx nginx -s reload
```

---

## 📋 Makefile команды для admin

Добавить в backend/Makefile:

```makefile
# =============================================================================
# Admin Panel Commands
# =============================================================================

admin-build:
	cd ../mediannfrontadmin && npm run build

admin-deploy: admin-build
	rsync -avz --delete ../mediannfrontadmin/out/ root@server:/var/www/admin/
	@echo "Admin panel deployed!"

# Для Docker варианта
admin-docker-build:
	docker compose -f docker-compose.prod.yml --env-file .env.prod build admin

admin-docker-up:
	docker compose -f docker-compose.prod.yml --env-file .env.prod up -d admin

admin-docker-logs:
	docker compose -f docker-compose.prod.yml --env-file .env.prod logs -f admin
```

---

## 🚀 Пошаговый деплой

### Для Static Export:

```bash
# 1. На локальной машине
cd mediannfrontadmin
npm install
npm run build

# 2. Загрузить на сервер
rsync -avz --delete out/ root@server:/var/www/admin/

# 3. На сервере - проверить
curl https://admin.domain.com
```

### Для Docker (рекомендуемый способ):

**Вариант A: Использование deploy.sh скрипта**
```bash
# На локальной машине
cd mediannfrontadmin

# Указать сервер и запустить деплой
REMOTE_HOST=your-server-ip npm run deploy

# Или только сборка образа
npm run deploy:build-only
```

**Вариант B: Ручной деплой**
```bash
# 1. Локально собрать образ
npm run docker:build

# 2. Сохранить и загрузить на сервер
docker save mediann-admin:latest | gzip > mediann-admin.tar.gz
scp mediann-admin.tar.gz root@server:/tmp/

# 3. На сервере загрузить образ
ssh root@server "gunzip -c /tmp/mediann-admin.tar.gz | docker load"

# 4. Запустить через docker-compose бекенда
ssh root@server "cd /opt/backend_sceleton/backend && docker compose -f docker-compose.prod.yml --env-file .env.prod up -d admin"
```

**Вариант C: Standalone docker-compose (рекомендуемый)**
```bash
# На сервере
cd /opt/mediannfrontadmin

# 1. Создать .env.production если его нет
cp .env.production.example .env.production
nano .env.production  # Отредактировать значения

# 2. Убедиться что API URL правильный
grep API_URL .env.production
# Должно быть: NEXT_PUBLIC_API_URL=https://api.mediann.dev/api/v1

# 3. Запустить
docker compose -f docker-compose.prod.yml --env-file .env.production up -d --build

# 4. Проверить
docker ps | grep admin
docker logs mediann_admin_prod --tail 20
```

**Вариант D: Первый деплой с Git**
```bash
# На сервере
cd /opt
git clone https://github.com/your-org/front_sceleton.git mediannfrontadmin
cd mediannfrontadmin

# Создать .env.production
cat > .env.production << 'EOF'
NEXT_PUBLIC_API_URL=https://api.mediann.dev/api/v1
NEXT_PUBLIC_ADMIN_URL=https://admin.mediann.dev
IMAGE_TAG=latest
COMPOSE_PROJECT_NAME=mediann
EXTERNAL_NETWORK=true
NETWORK_NAME=cms_network_prod
EOF

# Запустить
docker compose -f docker-compose.prod.yml --env-file .env.production up -d --build
```

---

## ⚠️ Важные моменты

### API Endpoints структура

**Важно понимать структуру API бекенда:**

- ✅ Admin endpoints: `/api/v1/admin/*` (articles, services, cases, etc.)
- ✅ Auth endpoints: `/api/v1/auth/*` (login, roles, permissions)
- ✅ Feature flags: `/api/v1/feature-flags` (БЕЗ `/admin`!)
- ✅ Public endpoints: `/api/v1/public/*`

**В коде фронтенда:**
- `API_BASE_URL` = `NEXT_PUBLIC_API_URL` (должен быть `https://api.domain.com/api/v1`)
- Endpoints в `apiEndpoints.ts` уже правильные (например, `/admin/articles`)
- Итоговый URL: `API_BASE_URL + endpoint` = `https://api.domain.com/api/v1/admin/articles` ✅

### CORS на бекенде

В `.env.prod` бекенда добавить admin домен:
```
CORS_ORIGINS=https://admin.mediann.dev,https://www.mediann.dev
```

### Переменные окружения

**⚠️ КРИТИЧНО: API URL должен включать `/api/v1` префикс!**

```bash
# .env.production (admin) - на сервере в /opt/mediannfrontadmin/
NEXT_PUBLIC_API_URL=https://api.mediann.dev/api/v1
NEXT_PUBLIC_ADMIN_URL=https://admin.mediann.dev
IMAGE_TAG=latest
COMPOSE_PROJECT_NAME=mediann
EXTERNAL_NETWORK=true
NETWORK_NAME=cms_network_prod
```

**Важные моменты:**
- ✅ Переменные с `NEXT_PUBLIC_` доступны в браузере - не храни секреты!
- ✅ `NEXT_PUBLIC_API_URL` должен заканчиваться на `/api/v1` (не просто `https://api.domain.com`)
- ✅ `EXTERNAL_NETWORK=true` для подключения к сети бекенда
- ✅ `NETWORK_NAME` должен совпадать с сетью бекенда (обычно `cms_network_prod`)

### Cookie и авторизация

Если используете httpOnly cookies для JWT:
```javascript
// В API запросах
fetch('https://api.mediann.de/api/v1/auth/login', {
  credentials: 'include',  // Для отправки cookies
  // ...
})
```

### Обработка пагинированных ответов

**Важно:** Некоторые API endpoints возвращают пагинированный ответ:
```json
{
  "items": [...],
  "total": 5
}
```

**В коде это уже обработано:**
- `rolesApi.getAll()` - извлекает `items` из ответа
- `articlesApi.getAll()` - ожидает `PaginatedResponse<Article>`
- Компоненты проверяют `data?.items` перед `.map()`

**Если добавляешь новый endpoint:**
```typescript
// Если API возвращает { items: [...], total: N }
const response = await apiClient.get<PaginatedResponse<Item>>(endpoint);
return response.items;

// Если API возвращает просто массив
const response = await apiClient.get<Item[]>(endpoint);
return response;
```

### Сетевое взаимодействие контейнеров

Если admin и backend в разных docker-compose файлах, используйте внешнюю сеть:

```yaml
# В docker-compose.prod.yml админки
networks:
  app_network:
    name: mediann_network
    external: true  # Подключение к существующей сети бекенда
```

```bash
# Переменные окружения
EXTERNAL_NETWORK=true
NETWORK_NAME=mediann_network
```

---

## 🔄 Обновление admin панели

### Docker (рекомендуемый способ):

**На сервере:**
```bash
cd /opt/mediannfrontadmin

# 1. Пулл обновлений из Git
git pull

# 2. Проверить что .env.production правильный
cat .env.production | grep API_URL
# Должно быть: NEXT_PUBLIC_API_URL=https://api.mediann.dev/api/v1

# 3. Пересобрать контейнер с новыми изменениями
docker compose -f docker-compose.prod.yml --env-file .env.production down
docker compose -f docker-compose.prod.yml --env-file .env.production up -d --build --force-recreate

# 4. Проверить что контейнер запустился
docker ps | grep admin

# 5. Посмотреть логи (если что-то пошло не так)
docker logs mediann_admin_prod --tail 50
```

**⚠️ ВАЖНО:** После изменения переменных окружения в `.env.production` обязательно пересобери контейнер с `--build`, так как `NEXT_PUBLIC_*` переменные встраиваются на этапе сборки!

### Static Export:
```bash
# Локально
cd mediannfrontadmin
npm run build
rsync -avz --delete out/ root@server:/var/www/admin/
```

---

## 🧪 Локальное тестирование Docker

```bash
# Development с hot-reload
npm run compose:dev

# Production-like локально
npm run compose:prod:build

# Проверить логи
npm run compose:prod:logs

# Остановить
npm run compose:dev:down
# или
npm run compose:prod:down
```

---

## 🐛 Известные проблемы и решения

### Проблема 1: 404 ошибки на API endpoints

**Симптомы:** Все запросы к `/admin/*` возвращают 404

**Причина:** API URL не включает префикс `/api/v1`

**Решение:**
```bash
# В .env.production должно быть:
NEXT_PUBLIC_API_URL=https://api.mediann.dev/api/v1  # ✅ Правильно
# НЕ: NEXT_PUBLIC_API_URL=https://api.mediann.dev    # ❌ Неправильно
```

### Проблема 2: Feature-flags возвращает 404

**Симптомы:** `GET /api/v1/admin/feature-flags` → 404

**Причина:** Неправильный путь - feature-flags не в admin роутере

**Решение:** Уже исправлено в коде - используется `/api/v1/feature-flags` (без `/admin`)

### Проблема 3: `e.map is not a function` ошибка

**Симптомы:** Ошибка в консоли при загрузке roles, topics, articles

**Причина:** API возвращает пагинированный ответ `{ items: [...], total: N }`, а код ожидает массив

**Решение:** Уже исправлено - добавлена обработка пагинированных ответов в `rolesApi.ts`

### Проблема 4: Nginx возвращает 403 Forbidden

**Симптомы:** `curl https://admin.mediann.dev` → 403

**Причина:** Nginx настроен на статические файлы вместо proxy к Docker контейнеру

**Решение:** См. "Шаг 5: Обновить nginx.conf.template для proxy" выше

### Проблема 5: Переменные окружения не применяются

**Симптомы:** После изменения `.env.production` изменения не вступили в силу

**Причина:** `NEXT_PUBLIC_*` переменные встраиваются на этапе сборки

**Решение:**
```bash
# Обязательно пересобрать с --build
docker compose -f docker-compose.prod.yml --env-file .env.production down
docker compose -f docker-compose.prod.yml --env-file .env.production up -d --build --force-recreate
```

### Проблема 6: Контейнер не видит admin контейнер

**Симптомы:** Nginx не может достучаться до `http://admin:3000`

**Причина:** Контейнеры в разных Docker сетях

**Решение:**
```bash
# Проверить сети
docker network ls

# Подключить admin контейнер к сети бекенда
docker network connect --alias admin cms_network_prod mediann_admin_prod

# Или использовать EXTERNAL_NETWORK=true в docker-compose.prod.yml
```

## 📦 Чеклист

- [ ] `NEXT_PUBLIC_API_URL` указывает на правильный API **с `/api/v1` префиксом**
- [ ] `.env.production` содержит все необходимые переменные
- [ ] `docker-compose.prod.yml` не содержит хардкодов (все из .env)
- [ ] CORS на бекенде включает `https://admin.mediann.dev`
- [ ] SSL сертификат покрывает `admin.mediann.dev`
- [ ] Nginx настроен для **proxy к Docker контейнеру** (не статические файлы!)
- [ ] Docker образ собирается без ошибок (`npm run docker:build`)
- [ ] Health check проходит (`curl http://localhost:3000`)
- [ ] Сеть Docker настроена для связи с бекендом (`EXTERNAL_NETWORK=true`)
- [ ] Контейнер admin подключен к сети бекенда с alias `admin`

### Чеклист файлов в репозитории

- [x] `Dockerfile` - production build
- [x] `Dockerfile.dev` - development build
- [x] `docker-compose.dev.yml` - локальная разработка
- [x] `docker-compose.prod.yml` - production
- [x] `.dockerignore` - оптимизация сборки
- [x] `.env.example` - шаблон переменных
- [x] `.env.production.example` - шаблон для prod
- [x] `scripts/deploy.sh` - скрипт деплоя
- [x] `next.config.ts` - настроен standalone output
