---
name: Admin Panel Phase 2
overview: "План разработки второй фазы админ-панели: реализация CRUD для всех контентных сущностей (FAQ, Services, Team, Reviews), модуля Leads, SEO, Users и улучшенной страницы Settings с feature flags."
todos:
  - id: faq-crud
    content: "FAQ: types, API, hooks, List page, Create/Edit pages with locales"
    status: completed
  - id: services-crud
    content: "Services: types, API, hooks, List page, Create/Edit pages"
    status: completed
  - id: team-crud
    content: "Team (Employees): types, API, hooks, List page, Create/Edit pages"
    status: completed
  - id: reviews-crud
    content: "Reviews: types, API, hooks, List page with moderation, Create/Edit"
    status: completed
  - id: topics-sidebar
    content: "Topics: CRUD sidebar/modal in Articles section"
    status: completed
  - id: rich-text-editor
    content: TipTap Rich Text Editor integration for content fields
    status: completed
  - id: leads-module
    content: "Leads: List, Kanban view, Detail page, status management, analytics"
    status: completed
  - id: inquiry-forms
    content: "Inquiry Forms: CRUD for form configurations"
    status: completed
  - id: seo-module
    content: "SEO: Routes List/Edit, Redirects CRUD"
    status: completed
  - id: users-module
    content: "Users: List, Create/Edit with role assignment, Roles read-only"
    status: completed
  - id: settings-enhanced
    content: "Settings: General, Localization, Notifications, Analytics, Feature Flags"
    status: completed
  - id: ui-components
    content: "UI Kit additions: Switch, Rating, DatePicker, Combobox"
    status: completed
---

# План работ: Admin Panel Phase 2

## Анализ текущего состояния

### Реализовано (MVP Complete)

| Модуль | Статус | Файлы ||--------|--------|-------|| Project Foundation | ✅ 100% | FSD структура, tokens, providers || UI Kit Core | ✅ 100% | Button, Input, Select, Modal, Table, Pagination и др. || Auth | ✅ 100% | Login, token storage, guards, X-Tenant-ID || Articles CRUD | ✅ 100% | List, Create, Edit с locales || Media Library | ✅ 100% | Grid, presigned URL upload || Shell Layout | ✅ 100% | Sidebar, Header, theme toggle |

### НЕ реализовано (пустые папки в `src/features/`)

| Модуль | Backend API | Frontend Status ||--------|-------------|-----------------|| FAQ | ✅ Ready | ❌ Empty folders || Services | ✅ Ready | ❌ Empty folders || Employees (Team) | ✅ Ready | ❌ Empty folders || Reviews | ✅ Ready | ❌ Empty folders || Inquiries (Leads) | ✅ Ready | ❌ Empty folders || SEO | ✅ Ready | ❌ Empty folders || Users | ✅ Ready | ❌ Empty folders || Settings (enhanced) | ✅ Ready | ⚠️ Placeholder |

### Новое из обновлённой документации

| Документ | Содержание | Действие ||----------|------------|----------|| `12-cases.md` | Cases API | **SKIP** - backend не реализован || `13-tenants-settings.md` | Feature flags, tenant settings | Реализовать в Settings || `gap-analysis.md` | Dashboard, Audit, Bulk ops | **SKIP** - backend не готов |---

## ITERATION 2: Content Modules (8-10 дней)

### Цель

Полный CRUD для FAQ, Services, Team, Reviews. Все сущности работают end-to-end.

### Backlog

| ID | Задача | P | Effort | DoD ||----|--------|---|--------|-----|| IT2-001 | FAQ types + API + hooks | P0 | 3h | `faqApi.ts`, `useFAQ.ts` готовы || IT2-002 | FAQ List page | P0 | 3h | Таблица с фильтрами (category, isPublished) || IT2-003 | FAQ Create/Edit page | P0 | 4h | Форма с locales, category, sort_order || IT2-004 | Services types + API + hooks | P0 | 3h | `servicesApi.ts`, `useServices.ts` || IT2-005 | Services List page | P0 | 3h | Таблица с фильтрами || IT2-006 | Services Create/Edit page | P0 | 4h | Форма с locales, icon, features || IT2-007 | Employees types + API + hooks | P0 | 3h | `employeesApi.ts`, `useEmployees.ts` || IT2-008 | Team List page | P0 | 3h | Таблица с sort_order || IT2-009 | Team Create/Edit page | P0 | 4h | Форма с photo, locales, position || IT2-010 | Reviews types + API + hooks | P0 | 3h | `reviewsApi.ts`, `useReviews.ts` || IT2-011 | Reviews List page + moderation | P0 | 4h | Таблица + Approve/Reject actions || IT2-012 | Reviews Create/Edit page | P0 | 3h | Форма с rating, author, locales || IT2-013 | Topics sidebar (Articles) | P1 | 4h | CRUD topics в sidebar/modal || IT2-014 | Rich Text Editor (TipTap) | P1 | 6h | Интеграция в ArticleForm, FAQ, Services || IT2-015 | Switch/Toggle component | P2 | 2h | Для is_published, is_featured |

### Ключевые файлы для создания

```javascript
src/features/faq/
├── api/faqApi.ts          # CRUD методы
├── model/useFAQ.ts        # React Query hooks
├── ui/FAQForm.tsx         # Форма с locales
└── index.ts

src/features/services/
├── api/servicesApi.ts
├── model/useServices.ts
├── ui/ServiceForm.tsx
└── index.ts

src/features/employees/
├── api/employeesApi.ts
├── model/useEmployees.ts
├── ui/EmployeeForm.tsx
└── index.ts

src/features/reviews/
├── api/reviewsApi.ts
├── model/useReviews.ts
├── ui/ReviewForm.tsx
├── ui/ReviewCard.tsx      # Для модерации
└── index.ts

src/app/(dashboard)/faq/
├── page.tsx               # List
├── new/page.tsx           # Create
└── [id]/page.tsx          # Edit

# Аналогично для services/, team/, reviews/
```



### Паттерн для каждой сущности (копировать из Articles)

1. **Types**: `src/entities/{entity}/types.ts`
2. **API**: `src/features/{entity}/api/{entity}Api.ts`
3. **Hooks**: `src/features/{entity}/model/use{Entity}.ts`
4. **Form**: `src/features/{entity}/ui/{Entity}Form.tsx`
5. **Pages**: `src/app/(dashboard)/{entity}/page.tsx`, `new/`, `[id]/`

---

## ITERATION 3: Leads + SEO + Users (6-8 дней)

### Цель

Управление лидами с Kanban view, SEO настройки, управление пользователями.

### Backlog

| ID | Задача | P | Effort | DoD ||----|--------|---|--------|-----|| IT3-001 | Inquiry types + API + hooks | P0 | 3h | Все CRUD + analytics || IT3-002 | Leads List page | P0 | 4h | Таблица с фильтрами (status, formId, UTM) || IT3-003 | Leads Kanban view | P1 | 6h | Drag-n-drop между статусами || IT3-004 | Lead Detail page | P0 | 4h | Полная информация + notes + assign || IT3-005 | Inquiry Forms List | P1 | 3h | CRUD форм || IT3-006 | Leads Analytics tab | P2 | 4h | Графики по дням, sources, devices || IT3-007 | SEO Routes types + API | P0 | 2h | `seoApi.ts` || IT3-008 | SEO Routes List page | P0 | 3h | Таблица meta tags по URL || IT3-009 | SEO Route Edit page | P0 | 3h | Форма meta_title, meta_description || IT3-010 | Redirects List page | P1 | 3h | CRUD redirects || IT3-011 | Users types + API + hooks | P0 | 3h | `usersApi.ts` || IT3-012 | Users List page | P0 | 3h | Таблица users || IT3-013 | User Create/Edit page | P0 | 4h | Форма с roles select || IT3-014 | Roles List (read-only) | P1 | 2h | Просмотр ролей и permissions |

### Kanban для Leads

```jsx
// Статусы колонок
const columns = ['new', 'in_progress', 'contacted', 'completed']

// Drag-n-drop библиотека: @dnd-kit/core
```

---

## ITERATION 4: Settings Enhancement (3-4 дня)

### Цель

Полноценная страница настроек с feature flags, локализацией, уведомлениями.

### Backlog

| ID | Задача | P | Effort | DoD ||----|--------|---|--------|-----|| IT4-001 | Tenant Settings API | P0 | 2h | `tenantsApi.ts`, `useSettings.ts` || IT4-002 | Settings - General tab | P0 | 3h | Logo, colors, contact info || IT4-003 | Settings - Localization tab | P0 | 3h | Default locale, timezone, formats || IT4-004 | Settings - Notifications tab | P1 | 3h | Email, Telegram для leads || IT4-005 | Settings - Analytics tab | P1 | 2h | GA, Yandex Metrika IDs || IT4-006 | Feature Flags management | P0 | 4h | Toggle modules on/off || IT4-007 | Profile - Change password | P1 | 2h | Форма смены пароля |

### Структура Settings page

```javascript
/settings
├── General (name, logo, colors)
├── Localization (locale, timezone, date/time format)
├── Notifications (inquiry_email, telegram_chat_id)
├── Analytics (ga_tracking_id, ym_counter_id)
├── Feature Flags (toggle modules)
└── Profile (change password)
```

---

## UI Kit Additions

| Компонент | Нужен для | Effort ||-----------|-----------|--------|| Switch/Toggle | is_published, is_featured, feature flags | 2h || Rating | Reviews (1-5 stars) | 2h || DatePicker | review_date, filters | 4h || RichTextEditor | FAQ answers, Service descriptions | 6h || Combobox | Topic select, User assign | 3h |---

## Что НЕ реализуем (Backend NOT Ready)

| Фича | Причина | Workaround ||------|---------|------------|| Cases (Portfolio) | API не реализован | Скрыть пункт меню || Dashboard stats | Нет endpoint | Placeholder "Coming soon" || Audit Log | Router не создан | Скрыть пункт меню || Bulk operations | Нет endpoint | Операции по одному || Search | Частично на backend | Client-side фильтрация || Export CSV | Нет endpoint | Убрать кнопку || Role CRUD | Только read | Показать read-only |---

## Общий Timeline

```javascript
Week 1-2:   Iteration 2 (FAQ, Services, Team, Reviews)
Week 3:     Iteration 3.1 (Leads, Inquiry Forms)
Week 4:     Iteration 3.2 (SEO, Users)
Week 5:     Iteration 4 (Settings, Feature Flags, Polish)
```

---

## Risks and Dependencies

| Risk | Mitigation ||------|------------|| Backend может отличаться от docs | Проверять реальные responses, mock fallback || Optimistic locking конфликты | Toast с "Refresh and try again" || Large file uploads | Progress indicator, retry logic |---

## Definition of Done (Phase 2)

- [ ] Все CRUD сущности работают end-to-end
- [ ] Leads Kanban view функционален
- [ ] SEO routes редактируются
- [ ] Users CRUD работает
- [ ] Settings page полностью функциональна
- [ ] Feature flags управляют видимостью модулей