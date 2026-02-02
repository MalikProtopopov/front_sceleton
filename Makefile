# Mediann Admin — команды запуска и перезапуска проекта
# Использование: make <цель>

.PHONY: help dev build start install lint \
	compose-dev compose-dev-build compose-dev-down \
	compose-prod compose-prod-build compose-prod-down compose-prod-logs \
	deploy deploy-build restart

# По умолчанию — показать справку
help:
	@echo "Mediann Admin — доступные команды:"
	@echo ""
	@echo "  Локальная разработка:"
	@echo "    make install     — установить зависимости (npm ci)"
	@echo "    make dev         — запустить dev-сервер (next dev)"
	@echo "    make build       — собрать проект (next build)"
	@echo "    make start       — запустить production (next start)"
	@echo ""
	@echo "  Docker (разработка):"
	@echo "    make compose-dev       — поднять dev через docker-compose"
	@echo "    make compose-dev-build — поднять dev с пересборкой"
	@echo "    make compose-dev-down  — остановить dev"
	@echo ""
	@echo "  Docker (production):"
	@echo "    make compose-prod       — поднять prod в фоне"
	@echo "    make compose-prod-build — поднять prod с пересборкой"
	@echo "    make compose-prod-down  — остановить prod"
	@echo "    make compose-prod-logs  — логи prod контейнера"
	@echo ""
	@echo "  Деплой и перезапуск:"
	@echo "    make deploy       — запустить скрипт деплоя"
	@echo "    make deploy-build — деплой только сборки"
	@echo "    make restart      — перезапуск prod (down + up --build)"
	@echo ""
	@echo "  Прочее:"
	@echo "    make lint        — проверка линтером"

# Локальная разработка
install:
	npm ci

dev:
	npm run dev

build:
	npm run build

start:
	npm run start

lint:
	npm run lint

# Docker — разработка
compose-dev:
	npm run compose:dev

compose-dev-build:
	npm run compose:dev:build

compose-dev-down:
	npm run compose:dev:down

# Docker — production (без npm, для сервера)
COMPOSE_PROD = docker compose -f docker-compose.prod.yml
COMPOSE_PROD_ENV = $(COMPOSE_PROD) --env-file .env.production

compose-prod:
	$(COMPOSE_PROD_ENV) up -d

compose-prod-build:
	$(COMPOSE_PROD_ENV) up -d --build --force-recreate

compose-prod-down:
	$(COMPOSE_PROD_ENV) down

compose-prod-logs:
	$(COMPOSE_PROD_ENV) logs -f admin

# Деплой (требует npm)
deploy:
	npm run deploy

deploy-build:
	npm run deploy:build-only

# Перезапуск prod: остановить и поднять с пересборкой (без npm)
restart: compose-prod-down compose-prod-build
