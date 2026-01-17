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

```bash
NEXT_PUBLIC_API_URL=https://api.domain.com
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

**docker-compose.prod.yml:**
```yaml
services:
  admin:
    build:
      context: .
      dockerfile: Dockerfile
      args:
        NEXT_PUBLIC_API_URL: ${NEXT_PUBLIC_API_URL:-https://api.mediann.de}
        NEXT_PUBLIC_ADMIN_URL: ${NEXT_PUBLIC_ADMIN_URL:-https://admin.mediann.de}
    image: mediann-admin:${IMAGE_TAG:-latest}
    container_name: ${COMPOSE_PROJECT_NAME:-mediann}_admin_prod
    restart: unless-stopped
    expose:
      - "3000"
    environment:
      - NODE_ENV=production
      - NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL:-https://api.mediann.de}
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:3000/"]
      interval: 30s
      timeout: 10s
      retries: 3
    networks:
      - app_network
    deploy:
      resources:
        limits:
          memory: 512M

networks:
  app_network:
    name: ${NETWORK_NAME:-mediann_network}
    external: ${EXTERNAL_NETWORK:-false}
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

```nginx
# Upstream для admin
upstream admin {
    server admin:3000;
    keepalive 16;
}

# Admin Panel Server
server {
    listen 443 ssl http2;
    server_name admin.${DOMAIN};

    ssl_certificate /etc/letsencrypt/live/${DOMAIN}/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/${DOMAIN}/privkey.pem;

    location / {
        proxy_pass http://admin;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }

    # Static assets caching
    location /_next/static/ {
        proxy_pass http://admin;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
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

**Вариант C: Standalone docker-compose**
```bash
# На сервере, если admin отдельно от бекенда
cd /opt/mediannfrontadmin
docker compose -f docker-compose.prod.yml up -d --build
```

---

## ⚠️ Важные моменты

### CORS на бекенде

В `.env.prod` бекенда добавить admin домен:
```
CORS_ORIGINS=https://admin.mediann.de,https://www.mediann.de
```

### Переменные окружения

```bash
# .env.production (admin)
NEXT_PUBLIC_API_URL=https://api.mediann.de
NEXT_PUBLIC_ADMIN_URL=https://admin.mediann.de

# ВАЖНО: Переменные с NEXT_PUBLIC_ доступны в браузере!
# Не храни секреты в NEXT_PUBLIC_ переменных!
```

### Cookie и авторизация

Если используете httpOnly cookies для JWT:
```javascript
// В API запросах
fetch('https://api.mediann.de/auth/login', {
  credentials: 'include',  // Для отправки cookies
  // ...
})
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

### Static Export:
```bash
# Локально
cd mediannfrontadmin
npm run build
rsync -avz --delete out/ root@server:/var/www/admin/
```

### Docker:
```bash
# Автоматический деплой
REMOTE_HOST=your-server npm run deploy

# Или вручную на сервере
cd /opt/backend_sceleton
git pull origin main

cd backend
docker compose -f docker-compose.prod.yml --env-file .env.prod build admin
docker compose -f docker-compose.prod.yml --env-file .env.prod up -d admin
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

## 📦 Чеклист

- [ ] `NEXT_PUBLIC_API_URL` указывает на правильный API
- [ ] CORS на бекенде включает `https://admin.mediann.de`
- [ ] SSL сертификат покрывает `admin.mediann.de`
- [ ] Nginx настроен для обслуживания admin (proxy или static)
- [ ] Docker образ собирается без ошибок (`npm run docker:build`)
- [ ] Health check проходит (`curl http://localhost:3000`)
- [ ] Сеть Docker настроена для связи с бекендом

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
