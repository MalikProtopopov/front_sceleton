# Роуты админки — для бэкенда (sidebar / доступы)

Список всех зарегистрированных путей во фронте, сгруппированных по разделам. Нужно для:
- ответа API `GET /auth/me/sidebar` (какие `path` / `name` отдавать и с какими `accessible` / `reason`);
- решения, по каким признакам давать доступ (тариф, роль, permission).

**Важно:** фронт ходит в API по своим эндпоинтам; здесь перечислены только **URL страниц в админке** (то, что видит пользователь в браузере и в сайдбаре).

---

## 1. Главное (core)

| Путь во фронте | Описание | Рекомендация для бэка |
|----------------|----------|------------------------|
| `/` | Дашборд (главная) | Только для **владельца платформы** (`platform_owner` / superuser). Остальным не показывать в сайдбаре и при необходимости отдавать 403 на API дашборда. |

---

## 2. Контент (content)

| Путь во фронте | Описание | Возможный feature / примечание |
|----------------|----------|--------------------------------|
| `/articles` | Список статей | `blog_module` |
| `/articles/new` | Создание статьи | `blog_module` |
| `/articles/:id` | Редактирование статьи | `blog_module` |
| `/cases` | Кейсы / портфолио | `cases_module` |
| `/cases/new`, `/cases/:id` | Создание / редактирование кейса | `cases_module` |
| `/faq` | Вопросы и ответы | `faq_module` |
| `/faq/new`, `/faq/:id` | Создание / редактирование FAQ | `faq_module` |
| `/services` | Услуги | `services_module` |
| `/services/new`, `/services/:id` | Создание / редактирование услуги | `services_module` |
| `/documents` | Документы | например `documents` или всегда доступно |

---

## 3. Каталог (commerce)

| Путь во фронте | Описание | Возможный feature / примечание |
|----------------|----------|--------------------------------|
| `/catalog/uom` | Единицы измерения | `catalog_module` |
| `/catalog/categories` | Категории | `catalog_module` |
| `/catalog/categories/new`, `/catalog/categories/:id` | Создание / редактирование категории | `catalog_module` |
| `/catalog/parameters` | Параметры | `catalog_module` |
| `/catalog/parameters/new`, `/catalog/parameters/:id` | Создание / редактирование параметра | `catalog_module` |
| `/catalog/products` | Товары | `catalog_module` |
| `/catalog/products/new`, `/catalog/products/:id` | Создание / редактирование товара | `catalog_module` |

---

## 4. Команда и компания (company)

| Путь во фронте | Описание | Возможный feature / примечание |
|----------------|----------|--------------------------------|
| `/team` | Команда / сотрудники | `team_module` (или `employees`) |
| `/team/new`, `/team/:id` | Создание / редактирование сотрудника | `team_module` |
| `/reviews` | Отзывы | `reviews_module` |
| `/reviews/new`, `/reviews/:id` | Создание / редактирование отзыва | `reviews_module` |
| `/company` | О компании (лендинг) | часто без фичи, всегда доступно |
| `/company/practice-areas`, `/company/practice-areas/new`, `/company/practice-areas/:id` | Практики | часть «О компании» |
| `/company/advantages`, `/company/addresses`, `/company/contacts` | Преимущества, адреса, контакты | часть «О компании» |

**Примечание:** алиас `/employees` редиректит на `/team` — в сайдбаре можно отдавать либо `path: "/admin/team"`, либо `path: "/admin/employees"`, фронт оба маппит в `/team`.

---

## 5. Медиа и заявки (crm)

| Путь во фронте | Описание | Возможный feature / примечание |
|----------------|----------|--------------------------------|
| `/media` | Медиатека | обычно core, без фичи |
| `/leads` | Заявки (канбан) | core / crm |
| `/leads/:id` | Карточка заявки | то же |
| `/leads/forms` | Формы заявок | то же |
| `/leads/forms/new`, `/leads/forms/:id` | Создание / редактирование формы | то же |

---

## 6. Администрирование (platform / admin)

| Путь во фронте | Описание | Рекомендация для бэка |
|----------------|----------|------------------------|
| `/seo/paths` | SEO Paths | `seo_advanced` (тариф) и/или permission типа `seo:read` |
| `/seo/redirects` | Редиректы | `seo_advanced` |
| `/users` | Пользователи | RBAC, например `users:read` / `users:write` |
| `/users/new`, `/users/:id` | Создание / редактирование пользователя | то же |
| `/users/roles` | Роли | RBAC, например `roles:read` / `roles:write` |
| `/users/roles/new`, `/users/roles/:id` | Создание / редактирование роли | то же |
| `/audit` | Журнал аудита | например `audit:read` или только для админов тенанта |
| `/settings` | Настройки сайта / локали | часто доступно владельцу/админу; мультиязычность может быть `multilang` |

---

## 7. Биллинг (billing) — пользовательский

| Путь во фронте | Описание | Рекомендация для бэка |
|----------------|----------|------------------------|
| `/billing` | Мой тариф | всегда доступно авторизованному в тенанте |
| `/billing/plans` | Каталог тарифов | то же |
| `/billing/requests` | Заявки на апгрейд | то же |
| `/billing/modules` | Модули (если есть отдельная страница) | то же |
| `/billing/limits` | Лимиты (если есть) | то же |

---

## 8. Платформа (platform) — только владелец платформы

Эти пути **только для superuser / platform_owner**. Обычно не отдаются в `GET /auth/me/sidebar` для обычных тенантов, либо отдаются с `accessible: false` и `reason: "role"`.

| Путь во фронте | Описание |
|----------------|----------|
| `/platform` | Дашборд платформы |
| `/platform/tenants/:id` | Карточка тенанта |
| `/tenants` | Список проектов (тенантов) |
| `/tenants/new`, `/tenants/:id`, `/tenants/:id/edit` | CRUD тенантов |
| `/tenants/:id/modules` | Модули тенанта (биллинг) |
| `/platform/plans` | Тарифы (управление) |
| `/platform/plans/new`, `/platform/plans/:id` | CRUD тарифов |
| `/platform/modules` | Модули (управление) |
| `/platform/modules/new`, `/platform/modules/:id` | CRUD модулей |
| `/platform/bundles` | Бандлы |
| `/platform/bundles/new`, `/platform/bundles/:id` | CRUD бандлов |
| `/platform/requests` | Заявки на апгрейд (модерация) |

---

## Маппинг API path → фронт (для ответа sidebar)

Если бэкенд отдаёт пути в формате `/admin/...`, фронт маппит их так (актуально на момент документа):

| path от бэка | path во фронте |
|--------------|----------------|
| `/admin/dashboard` | `/` |
| `/admin/media` | `/media` |
| `/admin/articles` | `/articles` |
| `/admin/cases` | `/cases` |
| `/admin/services` | `/services` |
| `/admin/inquiries` | `/leads` |
| `/admin/products` | `/catalog/products` |
| `/admin/seo` | `/seo/paths` |
| `/admin/locales` | `/settings` |
| `/admin/billing` | `/billing` |
| `/admin/faq` | `/faq` |
| `/admin/documents` | `/documents` |
| `/admin/team` или `/admin/employees` | `/team` |
| `/admin/reviews` | `/reviews` |
| `/admin/company` | `/company` |
| `/admin/users` | `/users` |
| `/admin/roles` | `/users/roles` |
| `/admin/audit` | `/audit` |
| `/admin/settings` | `/settings` |
| `/admin/catalog`, `/admin/catalog/uom`, `/admin/catalog/categories`, `/admin/catalog/parameters`, `/admin/catalog/products` | `/catalog/...` |

---

## Что уточнить с бэкендом

1. **Дашборд (`/`)** — выдавать в sidebar только для `platform_owner`/superuser или есть отдельный «тенантский» дашборд для остальных?
2. **Фичи по разделам** — соответствие разделов и feature flags (например `blog_module`, `catalog_module`, `seo_advanced`, `team_module`, `reviews_module`, `faq_module`, `services_module`, `documents`, `multilang`).
3. **Админ-разделы** (SEO, пользователи, роли, аудит, настройки) — только по RBAC (`permission`) или ещё и по тарифу (например `seo_advanced`)?
4. **Алиасы** — использовать в sidebar `path: "/admin/team"` или `"/admin/employees"` (фронт оба ведёт на `/team`).
5. **Вложенные страницы** (например `/articles/new`, `/company/practice-areas`) — достаточно ли в sidebar одной точки входа (`/articles`, `/company`) или нужны отдельные пункты для подразделов.

После уточнения можно зафиксировать формат ответа `GET /auth/me/sidebar` (поля `name`, `path`, `category`, `visible`, `accessible`, `reason`, `required_permission`) под этот список роутов.
