# Команды для обновления на удаленном сервере

## 🚀 Вариант 1: Если проект уже на сервере (через Git)

Подключитесь к серверу и выполните:

```bash
# 1. Перейти в папку проекта
cd /opt/mediannfrontadmin
# или если проект в другом месте:
# cd /path/to/mediannfrontadmin

# 2. Получить последние изменения из Git
git pull

# 3. Проверить что .env.production существует и правильный
cat .env.production | grep API_URL
# Должно быть: NEXT_PUBLIC_API_URL=https://api.mediann.dev/api/v1

# 4. Остановить текущий контейнер
docker compose -f docker-compose.prod.yml --env-file .env.production down

# 5. Пересобрать образ с новыми изменениями и запустить
docker compose -f docker-compose.prod.yml --env-file .env.production up -d --build --force-recreate

# 6. Проверить что контейнер запустился
docker ps | grep admin

# 7. Посмотреть логи (если нужно)
docker logs mediann_admin_prod --tail 50 -f
```

## 🚀 Вариант 2: Если admin интегрирован в docker-compose бекенда

Если admin панель запускается вместе с бекендом в одном docker-compose:

```bash
# 1. Перейти в папку бекенда
cd /opt/backend_sceleton/backend

# 2. Получить изменения (если используете Git)
cd ../mediannfrontadmin
git pull
cd ../backend

# 3. Пересобрать только admin сервис
docker compose -f docker-compose.prod.yml --env-file .env.prod build admin

# 4. Перезапустить admin контейнер
docker compose -f docker-compose.prod.yml --env-file .env.prod up -d admin

# 5. Проверить статус
docker ps | grep admin
docker logs mediann_admin_prod --tail 50
```

## 🚀 Вариант 3: Быстрое обновление (без остановки)

Если нужно обновить без простоя:

```bash
cd /opt/mediannfrontadmin

# Получить изменения
git pull

# Пересобрать и запустить (docker-compose сам остановит старый и запустит новый)
docker compose -f docker-compose.prod.yml --env-file .env.production up -d --build --force-recreate

# Проверить здоровье контейнера
docker ps | grep admin
curl http://localhost:3000
```

## ⚠️ Важные моменты

### 1. Переменные окружения NEXT_PUBLIC_*

**ВАЖНО:** Переменные с префиксом `NEXT_PUBLIC_*` встраиваются в код на этапе сборки!

Если вы изменили `.env.production`, обязательно пересоберите образ с флагом `--build`:

```bash
docker compose -f docker-compose.prod.yml --env-file .env.production down
docker compose -f docker-compose.prod.yml --env-file .env.production up -d --build --force-recreate
```

### 2. Проверка API URL

Убедитесь что в `.env.production` правильный API URL с префиксом `/api/v1`:

```bash
# Проверить
grep API_URL .env.production

# Должно быть:
# NEXT_PUBLIC_API_URL=https://api.mediann.dev/api/v1
# НЕ просто: https://api.mediann.dev
```

### 3. Проверка сети Docker

Если admin не видит бекенд, проверьте сеть:

```bash
# Посмотреть все сети
docker network ls

# Проверить к какой сети подключен admin
docker inspect mediann_admin_prod | grep -A 10 Networks

# Если нужно подключить к сети бекенда вручную
docker network connect cms_network_prod mediann_admin_prod
```

### 4. Перезагрузка Nginx (если нужно)

Если изменили конфигурацию Nginx:

```bash
cd /opt/backend_sceleton/backend

# Проверить конфигурацию
docker compose -f docker-compose.prod.yml --env-file .env.prod exec nginx nginx -t

# Перезагрузить
docker compose -f docker-compose.prod.yml --env-file .env.prod exec nginx nginx -s reload
```

## 🔍 Диагностика проблем

### Контейнер не запускается

```bash
# Посмотреть логи
docker logs mediann_admin_prod --tail 100

# Проверить статус
docker ps -a | grep admin

# Попробовать запустить вручную для отладки
docker compose -f docker-compose.prod.yml --env-file .env.production up admin
```

### Изменения не применяются

1. Убедитесь что пересобрали образ с `--build`
2. Проверьте что изменения действительно в Git и вы сделали `git pull`
3. Очистите старые образы и пересоберите:

```bash
docker compose -f docker-compose.prod.yml --env-file .env.production down
docker rmi mediann-admin:latest  # или ваш IMAGE_TAG
docker compose -f docker-compose.prod.yml --env-file .env.production up -d --build --force-recreate
```

### Health check не проходит

```bash
# Проверить изнутри контейнера
docker exec mediann_admin_prod wget --spider http://localhost:3000

# Проверить снаружи
curl http://localhost:3000
```

## 📝 Полная последовательность команд (копировать целиком)

```bash
# Подключитесь к серверу и выполните:

cd /opt/mediannfrontadmin
git pull
docker compose -f docker-compose.prod.yml --env-file .env.production down
docker compose -f docker-compose.prod.yml --env-file .env.production up -d --build --force-recreate
docker ps | grep admin
docker logs mediann_admin_prod --tail 20
```
