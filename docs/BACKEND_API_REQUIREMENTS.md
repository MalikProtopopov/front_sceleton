# Backend API Requirements

> **Этот документ содержит список API endpoints, которые необходимо реализовать на бекенде для корректной работы админ-панели.**

---

## Текущие 404 ошибки

Следующие endpoints вызываются с фронтенда, но возвращают 404 Not Found:

| Endpoint | Методы | Страница фронтенда |
|----------|--------|-------------------|
| `/api/v1/admin/documents` | GET, POST | /documents |
| `/api/v1/admin/employees` | GET, POST | /team |
| `/api/v1/admin/reviews` | GET, POST | /reviews |
| `/api/v1/admin/articles` | GET, POST | /articles |
| `/api/v1/admin/topics` | GET, POST | /articles (sidebar) |
| `/api/v1/admin/services` | GET, POST | /services |
| `/api/v1/admin/files` | GET, POST | /media |
| `/api/v1/admin/inquiry-forms` | GET | /forms |
| `/api/v1/admin/seo/routes` | GET | /seo |
| `/api/v1/admin/practice-areas` | GET, POST | /company |
| `/api/v1/admin/advantages` | GET, POST | /company |
| `/api/v1/admin/addresses` | GET, POST | /company |
| `/api/v1/admin/contacts` | GET, POST | /company |
| `/api/v1/feature-flags` | GET | настройки |

---

## Подробное описание каждого модуля

### 1. Documents Module - `/api/v1/admin/documents`

```
GET    /api/v1/admin/documents                    - Список документов (пагинация)
POST   /api/v1/admin/documents                    - Создание документа
GET    /api/v1/admin/documents/{id}               - Получение документа по ID
PUT    /api/v1/admin/documents/{id}               - Полное обновление
PATCH  /api/v1/admin/documents/{id}               - Частичное обновление
DELETE /api/v1/admin/documents/{id}               - Удаление
POST   /api/v1/admin/documents/{id}/publish       - Публикация
POST   /api/v1/admin/documents/{id}/unpublish     - Снятие с публикации
POST   /api/v1/admin/documents/{id}/file          - Загрузка файла документа
```

**Query параметры для GET списка:**
- `page` (int, default: 1)
- `pageSize` (int, default: 20)
- `search` (string, optional)
- `status` (string, optional): draft, published, archived

---

### 2. Employees Module - `/api/v1/admin/employees`

```
GET    /api/v1/admin/employees                    - Список сотрудников
POST   /api/v1/admin/employees                    - Создание сотрудника
GET    /api/v1/admin/employees/{id}               - Получение по ID
PUT    /api/v1/admin/employees/{id}               - Обновление
PATCH  /api/v1/admin/employees/{id}               - Частичное обновление
DELETE /api/v1/admin/employees/{id}               - Удаление
POST   /api/v1/admin/employees/{id}/photo         - Загрузка фото
DELETE /api/v1/admin/employees/{id}/photo         - Удаление фото

# Локализации
GET    /api/v1/admin/employees/{id}/locales       - Список локализаций
POST   /api/v1/admin/employees/{id}/locales       - Создание локализации
PUT    /api/v1/admin/employees/{id}/locales/{localeId} - Обновление
DELETE /api/v1/admin/employees/{id}/locales/{localeId} - Удаление
```

---

### 3. Reviews Module - `/api/v1/admin/reviews`

```
GET    /api/v1/admin/reviews                      - Список отзывов
POST   /api/v1/admin/reviews                      - Создание отзыва
GET    /api/v1/admin/reviews/{id}                 - Получение по ID
PUT    /api/v1/admin/reviews/{id}                 - Обновление
PATCH  /api/v1/admin/reviews/{id}                 - Частичное обновление
DELETE /api/v1/admin/reviews/{id}                 - Удаление
POST   /api/v1/admin/reviews/{id}/approve         - Одобрение отзыва
POST   /api/v1/admin/reviews/{id}/reject          - Отклонение отзыва
POST   /api/v1/admin/reviews/{id}/author-photo    - Загрузка фото автора
DELETE /api/v1/admin/reviews/{id}/author-photo    - Удаление фото автора
```

---

### 4. Articles Module - `/api/v1/admin/articles`

```
GET    /api/v1/admin/articles                     - Список статей
POST   /api/v1/admin/articles                     - Создание статьи
GET    /api/v1/admin/articles/{id}                - Получение по ID
PUT    /api/v1/admin/articles/{id}                - Обновление
PATCH  /api/v1/admin/articles/{id}                - Частичное обновление
DELETE /api/v1/admin/articles/{id}                - Удаление
POST   /api/v1/admin/articles/{id}/publish        - Публикация
POST   /api/v1/admin/articles/{id}/unpublish      - Снятие с публикации
POST   /api/v1/admin/articles/{id}/cover-image    - Загрузка обложки
DELETE /api/v1/admin/articles/{id}/cover-image    - Удаление обложки

# Локализации
GET    /api/v1/admin/articles/{id}/locales        - Список локализаций
POST   /api/v1/admin/articles/{id}/locales        - Создание локализации
PUT    /api/v1/admin/articles/{id}/locales/{localeId} - Обновление
DELETE /api/v1/admin/articles/{id}/locales/{localeId} - Удаление
```

---

### 5. Topics Module - `/api/v1/admin/topics`

```
GET    /api/v1/admin/topics                       - Список тем
POST   /api/v1/admin/topics                       - Создание темы
GET    /api/v1/admin/topics/{id}                  - Получение по ID
PUT    /api/v1/admin/topics/{id}                  - Обновление
PATCH  /api/v1/admin/topics/{id}                  - Частичное обновление
DELETE /api/v1/admin/topics/{id}                  - Удаление

# Локализации
GET    /api/v1/admin/topics/{id}/locales          - Список локализаций
POST   /api/v1/admin/topics/{id}/locales          - Создание локализации
PUT    /api/v1/admin/topics/{id}/locales/{localeId} - Обновление
DELETE /api/v1/admin/topics/{id}/locales/{localeId} - Удаление
```

**Query параметры:**
- `pageSize` (int, default: 100) - для sidebar загружаем все

---

### 6. Services Module - `/api/v1/admin/services`

```
GET    /api/v1/admin/services                     - Список услуг
POST   /api/v1/admin/services                     - Создание услуги
GET    /api/v1/admin/services/{id}                - Получение по ID
PUT    /api/v1/admin/services/{id}                - Обновление
PATCH  /api/v1/admin/services/{id}                - Частичное обновление
DELETE /api/v1/admin/services/{id}                - Удаление
POST   /api/v1/admin/services/{id}/image          - Загрузка изображения
DELETE /api/v1/admin/services/{id}/image          - Удаление изображения

# Цены
GET    /api/v1/admin/services/{id}/prices         - Список цен
POST   /api/v1/admin/services/{id}/prices         - Добавление цены
PUT    /api/v1/admin/services/{id}/prices/{priceId} - Обновление цены
DELETE /api/v1/admin/services/{id}/prices/{priceId} - Удаление цены

# Теги
GET    /api/v1/admin/services/{id}/tags           - Список тегов
POST   /api/v1/admin/services/{id}/tags           - Добавление тега
DELETE /api/v1/admin/services/{id}/tags/{tagId}   - Удаление тега

# Локализации
GET    /api/v1/admin/services/{id}/locales        - Список локализаций
POST   /api/v1/admin/services/{id}/locales        - Создание локализации
PUT    /api/v1/admin/services/{id}/locales/{localeId} - Обновление
DELETE /api/v1/admin/services/{id}/locales/{localeId} - Удаление
```

---

### 7. Files/Media Module - `/api/v1/admin/files`

```
GET    /api/v1/admin/files                        - Список файлов
POST   /api/v1/admin/files                        - Загрузка файла
GET    /api/v1/admin/files/{id}                   - Получение по ID
DELETE /api/v1/admin/files/{id}                   - Удаление файла
POST   /api/v1/admin/files/upload-url             - Получение presigned URL для загрузки
```

**Query параметры для GET списка:**
- `page` (int, default: 1)
- `pageSize` (int, default: 24)
- `type` (string, optional): image, document, video, audio

---

### 8. Inquiry Forms Module - `/api/v1/admin/inquiry-forms`

```
GET    /api/v1/admin/inquiry-forms                - Список форм заявок
GET    /api/v1/admin/inquiry-forms/{id}           - Получение по ID
PUT    /api/v1/admin/inquiry-forms/{id}           - Обновление
PATCH  /api/v1/admin/inquiry-forms/{id}           - Частичное обновление
DELETE /api/v1/admin/inquiry-forms/{id}           - Удаление
```

---

### 9. SEO Module - `/api/v1/admin/seo`

```
# Routes
GET    /api/v1/admin/seo/routes                   - Список SEO роутов
POST   /api/v1/admin/seo/routes                   - Создание роута
GET    /api/v1/admin/seo/routes/{id}              - Получение по ID
PUT    /api/v1/admin/seo/routes/{id}              - Обновление
DELETE /api/v1/admin/seo/routes/{id}              - Удаление

# Redirects
GET    /api/v1/admin/seo/redirects                - Список редиректов
POST   /api/v1/admin/seo/redirects                - Создание редиректа
GET    /api/v1/admin/seo/redirects/{id}           - Получение по ID
PUT    /api/v1/admin/seo/redirects/{id}           - Обновление
DELETE /api/v1/admin/seo/redirects/{id}           - Удаление
```

---

### 10. Company Info Module

```
# Practice Areas
GET    /api/v1/admin/practice-areas               - Список областей практики
POST   /api/v1/admin/practice-areas               - Создание
GET    /api/v1/admin/practice-areas/{id}          - Получение
PUT    /api/v1/admin/practice-areas/{id}          - Обновление
DELETE /api/v1/admin/practice-areas/{id}          - Удаление
# + локализации аналогично другим модулям

# Advantages
GET    /api/v1/admin/advantages                   - Список преимуществ
POST   /api/v1/admin/advantages                   - Создание
GET    /api/v1/admin/advantages/{id}              - Получение
PUT    /api/v1/admin/advantages/{id}              - Обновление
DELETE /api/v1/admin/advantages/{id}              - Удаление
# + локализации

# Addresses
GET    /api/v1/admin/addresses                    - Список адресов
POST   /api/v1/admin/addresses                    - Создание
GET    /api/v1/admin/addresses/{id}               - Получение
PUT    /api/v1/admin/addresses/{id}               - Обновление
DELETE /api/v1/admin/addresses/{id}               - Удаление
# + локализации

# Contacts
GET    /api/v1/admin/contacts                     - Список контактов
POST   /api/v1/admin/contacts                     - Создание
GET    /api/v1/admin/contacts/{id}                - Получение
PUT    /api/v1/admin/contacts/{id}                - Обновление
DELETE /api/v1/admin/contacts/{id}                - Удаление
```

---

### 11. Feature Flags - `/api/v1/feature-flags`

```
GET    /api/v1/feature-flags                      - Список флагов
GET    /api/v1/feature-flags/{name}               - Флаг по имени
PUT    /api/v1/feature-flags/{name}               - Обновление флага
```

**Query параметры:**
- `tenant_id` (uuid, required)

---

## Общие требования

### Формат ответа для списков (пагинация)

```json
{
  "items": [...],
  "total": 100
}
```

### Авторизация

- Все endpoints требуют `Authorization: Bearer <token>` header
- Для `/auth/login` требуется `X-Tenant-ID` header

### CORS

Разрешить запросы с:
- `http://localhost:3000`
- `http://localhost:3001`
- `https://admin.mediann.dev`

### Обработка ошибок

```json
{
  "detail": "Error message"
}
```

Коды ответов:
- `200` - Успешный GET
- `201` - Успешное создание
- `204` - Успешное удаление (без тела)
- `400` - Ошибка валидации
- `401` - Не авторизован
- `403` - Нет доступа
- `404` - Не найдено
- `409` - Конфликт (например, дубликат)
- `422` - Unprocessable Entity
- `500` - Внутренняя ошибка сервера
