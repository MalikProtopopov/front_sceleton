# Оптимизация производительности сборки

Этот документ содержит команды и рекомендации для ускорения сборки проекта на сервере.

## 🚀 Быстрые команды

### Для регулярного использования

```bash
# Быстрый перезапуск (использует кэш Docker)
make restart-fast

# Обычный перезапуск с пересборкой (если изменения значительные)
make restart
```

### Если сборка зависла или работает медленно

```bash
# 1. Очистить только кэш Next.js (быстро, безопасно)
make clean-cache

# 2. Очистить Docker кэш сборки (если проблемы с кэшем)
make docker-clean

# 3. Полная очистка всего (крайний случай)
make docker-clean-all
```

## 🔧 Проблемы и решения

### Сборка зависает на `npm run build`

**Причина**: Next.js может зависать при сборке больших проектов из-за:
- Недостатка памяти
- Проблем с кэшем
- Циклических зависимостей в импортах

**Решение**:

1. **Проверьте память на сервере**:
```bash
free -h
# Если Memory usage > 90%, нужно освободить память
```

2. **Остановите зависший процесс**:
```bash
# Найдите процесс
docker ps -a
# Остановите контейнер
docker stop mediann_admin_prod
docker rm mediann_admin_prod
```

3. **Очистите кэш и пересоберите**:
```bash
make docker-clean
make restart
```

### Сборка долго идет (более 5 минут)

**Обычное время сборки**:
- С кэшем: 10-30 секунд
- Без кэша: 2-5 минут
- Более 5 минут = проблема

**Решение**:

```bash
# Используйте быстрый перезапуск для мелких изменений
make restart-fast

# Для больших изменений - полная очистка
make docker-clean-all
make restart
```

### Ошибки "parent snapshot does not exist"

**Решение**:
```bash
make docker-prune
make restart
```

## 📊 Мониторинг сборки

### Просмотр логов в реальном времени

```bash
# Смотреть логи сборки
docker compose -f docker-compose.prod.yml logs -f admin

# Или используйте make команду
make compose-prod-logs
```

### Проверка статуса контейнера

```bash
# Все контейнеры
docker ps -a

# Только админка
docker ps -a | grep mediann_admin
```

### Проверка использования ресурсов

```bash
# Память и CPU
docker stats mediann_admin_prod

# Размер образов
docker images | grep mediann-admin
```

## ⚡ Советы по ускорению

### 1. Используйте кэш правильно

- **Мелкие изменения** (стили, тексты): `make restart-fast`
- **Средние изменения** (новые компоненты): `make restart`
- **Большие изменения** (обновление зависимостей): `make docker-clean && make restart`

### 2. Оптимизируйте зависимости

```bash
# Проверьте размер node_modules
du -sh node_modules

# Удалите неиспользуемые зависимости
npm prune
```

### 3. Используйте .dockerignore

Убедитесь, что `.dockerignore` исключает:
```
node_modules
.next
.git
.env*
*.log
```

### 4. Оптимизация памяти

Если на сервере мало памяти, добавьте swap:

```bash
# Проверить swap
swapon --show

# Создать swap файл (если нужно)
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

## 🎯 Workflow для разных ситуаций

### Обычный деплой (git pull + обновление)

```bash
cd /opt/mediannfrontadmin
git pull
make restart-fast
```

### Если что-то сломалось

```bash
cd /opt/mediannfrontadmin
git pull
make docker-clean
make restart
```

### Если долго собирается

```bash
# Проверьте, не зависла ли сборка
docker ps -a
docker logs mediann_admin_prod

# Если зависла - убейте и пересоберите
docker stop mediann_admin_prod
docker rm mediann_admin_prod
make docker-clean-all
make restart
```

### Профилактическая очистка (раз в неделю)

```bash
# Полная очистка неиспользуемых образов и кэша
make docker-clean-all
docker system prune -af --volumes
make restart
```

## 📈 Мониторинг производительности

### Время сборки

Нормальные значения:
- `npm ci`: 20-60 секунд
- `npm run build`: 60-180 секунд (без кэша)
- `npm run build`: 10-30 секунд (с кэшем)

### Память

Рекомендуемые значения:
- Минимум: 2GB RAM
- Рекомендуется: 4GB RAM
- Swap: минимум 2GB

### Диск

```bash
# Проверить использование диска
df -h

# Очистить старые образы Docker
docker system prune -a --volumes -f
```

## 🆘 Экстренные команды

### Если сервер завис

```bash
# Проверить загрузку
htop

# Убить процессы Docker если нужно
sudo systemctl restart docker

# Перезапустить проект
cd /opt/mediannfrontadmin
make restart
```

### Если не хватает места на диске

```bash
# Очистить всё Docker
docker system prune -af --volumes

# Очистить логи
sudo journalctl --vacuum-time=3d

# Удалить старые образы
docker images | grep '<none>' | awk '{print $3}' | xargs docker rmi -f
```

## 📝 Полезные алиасы

Добавьте в `~/.bashrc` или `~/.zshrc`:

```bash
# Быстрый переход
alias admin='cd /opt/mediannfrontadmin'

# Быстрые команды
alias admin-restart='cd /opt/mediannfrontadmin && make restart-fast'
alias admin-clean='cd /opt/mediannfrontadmin && make docker-clean'
alias admin-logs='cd /opt/mediannfrontadmin && make compose-prod-logs'

# Мониторинг
alias admin-status='docker ps | grep mediann_admin'
alias admin-stats='docker stats mediann_admin_prod'
```

Применить:
```bash
source ~/.bashrc  # или ~/.zshrc
```
