# Быстрая справка по командам деплоя

## 🚨 Если сборка зависла

```bash
# 1. Проверьте процессы
docker ps -a

# 2. Остановите зависший контейнер
docker stop mediann_admin_prod
docker rm mediann_admin_prod

# 3. Очистите и пересоберите
cd /opt/mediannfrontadmin
make docker-clean
make restart
```

## ⚡ Быстрые команды

### Обычный деплой (самое частое)
```bash
cd /opt/mediannfrontadmin
git pull
make restart-fast  # Быстро, использует кэш
```

### Если нужна чистая пересборка
```bash
cd /opt/mediannfrontadmin
git pull
make restart  # Полная пересборка
```

### Если проблемы с кэшем
```bash
cd /opt/mediannfrontadmin
make docker-clean-all  # Полная очистка
make restart
```

## 📊 Команды мониторинга

```bash
# Логи в реальном времени
make compose-prod-logs

# Статус контейнера
docker ps | grep mediann

# Использование ресурсов
docker stats mediann_admin_prod

# Проверить память сервера
free -h
```

## 🔍 Отладка

### Сборка долго идет
Нормальное время: 2-5 минут без кэша, 10-30 сек с кэшем.
Если более 5 минут - убейте процесс и пересоберите.

### Ошибка "parent snapshot"
```bash
make docker-prune
make restart
```

### Нехватка памяти
```bash
# Проверить
free -h

# Если Memory > 90%, очистить
docker system prune -af
```

## 📝 Все команды Makefile

```bash
make help  # Показать все доступные команды
```

Основные:
- `make restart` - обычный перезапуск
- `make restart-fast` - быстрый перезапуск (с кэшем)
- `make docker-clean` - очистить образы и кэш
- `make docker-clean-all` - полная очистка
- `make clean-cache` - очистить только Next.js кэш
- `make compose-prod-logs` - показать логи

## 💡 Полная документация

См. [docs/PERFORMANCE_OPTIMIZATION.md](./docs/PERFORMANCE_OPTIMIZATION.md)
