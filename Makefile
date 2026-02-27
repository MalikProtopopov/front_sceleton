# Mediann Admin — команды запуска и перезапуска проекта
# Использование: make <цель>

.PHONY: help dev build start install lint \
	compose-dev compose-dev-build compose-dev-down \
	compose-prod compose-prod-build compose-prod-down compose-prod-logs \
	docker-prune docker-clean docker-clean-all clean-cache deploy deploy-build restart restart-fast

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
	@echo "    make docker-prune       — очистить весь кэш сборки BuildKit (если ошибка parent snapshot)"
	@echo "    make docker-clean       — остановить админку, удалить образ и кэш сборки фронта (быстрый чистый пересбор)"
	@echo "    make docker-clean-all   — полная очистка (остановка + удаление образов + кэш + volumes)"
	@echo "    make clean-cache        — очистить только кэш Next.js и npm (без остановки контейнеров)"
	@echo ""
	@echo "  Деплой и перезапуск:"
	@echo "    make deploy       — запустить скрипт деплоя"
	@echo "    make deploy-build — деплой только сборки"
	@echo "    make restart      — перезапуск prod (down + up --build)"
	@echo "    make restart-fast — быстрый перезапуск с кэшем (используется если код не сильно изменился)"
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
	docker compose -f docker-compose.dev.yml up

compose-dev-build:
	docker compose -f docker-compose.dev.yml up --build

compose-dev-down:
	docker compose -f docker-compose.dev.yml down

# Docker — production (прямые вызовы docker compose, чтобы работало на сервере без npm в PATH)
compose-prod:
	docker compose -f docker-compose.prod.yml up -d

compose-prod-build:
	docker compose -f docker-compose.prod.yml up -d --build

compose-prod-down:
	docker compose -f docker-compose.prod.yml down

compose-prod-logs:
	docker compose -f docker-compose.prod.yml logs -f admin

# Очистить кэш Docker BuildKit (при ошибке "parent snapshot does not exist")
docker-prune:
	docker builder prune -af

# Остановить админку, удалить образ и кэш сборки фронта — следующий make restart соберёт с нуля
docker-clean:
	docker compose -f docker-compose.prod.yml down
	-docker rmi mediann-admin:latest 2>/dev/null || true
	docker builder prune -f
	@echo "Готово. Запустите: make restart"

# Полная очистка: остановка + удаление образов + кэш + volumes
docker-clean-all:
	@echo "⚠️  ПОЛНАЯ ОЧИСТКА: остановка контейнеров, удаление образов, кэша и volumes..."
	docker compose -f docker-compose.prod.yml down -v
	-docker rmi mediann-admin:latest 2>/dev/null || true
	docker builder prune -af
	docker system prune -f
	@echo "✅ Полная очистка завершена. Следующая сборка будет с нуля."

# Очистить кэш Next.js и npm без остановки контейнеров
clean-cache:
	@echo "🧹 Очистка кэша Next.js и npm..."
	rm -rf .next
	rm -rf node_modules/.cache
	rm -rf .turbo
	@echo "✅ Кэш очищен"

# Деплой
deploy:
	npm run deploy

deploy-build:
	npm run deploy:build-only

# Перезапуск prod: остановить, собрать, поднять, почистить мусор
restart:
	docker compose -f docker-compose.prod.yml down
	docker compose -f docker-compose.prod.yml up -d --build
	@echo "Очистка dangling-образов и build-кэша..."
	-docker image prune -f 2>/dev/null || true
	-docker builder prune -f --filter "until=24h" 2>/dev/null || true
	@echo "Готово."

# Быстрый перезапуск без пересборки (контейнер уже собран)
restart-fast:
	docker compose -f docker-compose.prod.yml down
	docker compose -f docker-compose.prod.yml up -d
