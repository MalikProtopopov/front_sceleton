---
name: Admin Panel MVP Development
overview: Поэтапный план разработки админ-панели mediann.dev на Next.js 15 с Feature-Sliced Design архитектурой, светлой темой по умолчанию и интеграцией с готовым бэкендом API.
todos:
  - id: project-init
    content: Initialize Next.js 15 + TypeScript + Tailwind v4 project with FSD structure
    status: completed
  - id: design-tokens
    content: Implement design tokens (CSS variables) + ThemeProvider with light/dark toggle
    status: completed
  - id: ui-kit-core
    content: "Build core UI Kit: Button, Input, Select, Spinner, Badge, Modal, Toast"
    status: completed
  - id: api-client
    content: Setup API client with Axios interceptors, auth refresh logic, error handling
    status: completed
  - id: auth-flow
    content: "Implement auth: Login page, token storage, AuthProvider, protected routes"
    status: completed
  - id: shell-layout
    content: "Build shell layout: Sidebar navigation, Header with user menu + theme toggle"
    status: completed
  - id: table-components
    content: Create Table + Pagination components with loading/empty states
    status: completed
  - id: articles-crud
    content: "Implement Articles: List page with filters, Create/Edit forms with locales"
    status: completed
  - id: media-library
    content: "Build Media Library: File grid, presigned URL upload flow, file picker"
    status: completed
  - id: rbac-guards
    content: "Add RBAC: usePermissions hook, permission-based UI guards"
    status: completed
---

# План разработки Admin Panel MVP

## A) ИТЕРАЦИИ РАЗРАБОТКИ

---

### ITERATION 1: MVP (2 недели)

**Цель (Outcome):** Рабочая админ-панель с авторизацией, навигацией, CRUD для Articles + Media, переключение темы light/dark.**Backlog:**| ID | Задача | Приоритет | Effort ||----|--------|-----------|--------|| MVP-001 | Инициализация проекта (Next.js 15, TS, Tailwind v4) | P0 | 4h || MVP-002 | Design Tokens + Theme Provider (light/dark) | P0 | 6h || MVP-003 | UI Kit: Button, Input, Select, Spinner | P0 | 8h || MVP-004 | API Client + Auth interceptors | P0 | 6h || MVP-005 | Auth: Login page + Token storage + Guards | P0 | 8h || MVP-006 | Shell Layout: Sidebar + Header + Main area | P0 | 8h || MVP-007 | Routing structure + Protected routes | P0 | 4h || MVP-008 | UI Kit: Table, Pagination, Modal, Toast | P1 | 10h || MVP-009 | Articles: List page with filters/sorting | P1 | 8h || MVP-010 | Articles: Create/Edit form with locales | P1 | 10h || MVP-011 | Media Library: Grid + Upload flow | P1 | 8h || MVP-012 | RBAC: Permission checks + UI guards | P1 | 6h || MVP-013 | Empty/Loading/Error states | P2 | 4h |**Definition of Done:**

- Пользователь может войти с email/password
- Видит sidebar с навигацией (Articles, Media, Settings)
- Может создать/редактировать/публиковать статью
- Может загрузить файл в Media Library
- Тема переключается через toggle в header
- Нет console errors, TypeScript strict mode

**Риски:**

- Backend endpoints могут отличаться от документации (митигация: mock fallback)
- Optimistic locking требует UX для конфликтов

**Что отложить:**

- Dashboard statistics
- Bulk operations
- Version history
- CSV export

---

### ITERATION 2: Content Modules (1.5 недели)

**Цель:** Полный CRUD для всех контентных сущностей.**Backlog:**| ID | Задача | Приоритет | Effort ||----|--------|-----------|--------|| IT2-001 | FAQ: List + Create/Edit | P0 | 6h || IT2-002 | Services: List + Create/Edit | P0 | 6h || IT2-003 | Employees (Team): List + Create/Edit | P0 | 6h || IT2-004 | Reviews: List + Create/Edit + Approve/Reject | P0 | 8h || IT2-005 | Topics management (sidebar panel) | P1 | 4h || IT2-006 | Rich Text Editor (TipTap/Lexical) | P1 | 8h || IT2-007 | Image picker integration в editor | P1 | 4h || IT2-008 | Search parameter для всех списков | P2 | 4h |**Definition of Done:**

- Все CRUD сущности работают end-to-end
- Rich text editor поддерживает images, links, formatting
- Search работает на всех list pages

---

### ITERATION 3: Leads + SEO + Users (1.5 недели)

**Цель:** Управление лидами, SEO настройками и пользователями.**Backlog:**| ID | Задача | Приоритет | Effort ||----|--------|-----------|--------|| IT3-001 | Inquiries: List + Kanban view | P0 | 8h || IT3-002 | Inquiries: Detail + Status update + Assign | P0 | 6h || IT3-003 | Inquiry Forms management | P1 | 4h || IT3-004 | SEO Routes: List + Edit | P0 | 6h || IT3-005 | Redirects: CRUD | P1 | 4h || IT3-006 | Users: List + Create/Edit | P0 | 6h || IT3-007 | Roles: List (read-only, т.к. CRUD не реализован) | P1 | 2h || IT3-008 | Profile: Change password | P1 | 3h || IT3-009 | Inquiries Analytics chart | P2 | 4h |---

### ITERATION 4: Polish + Advanced (1 неделя)

**Цель:** Dashboard, улучшения UX, оптимизация.**Backlog:**| ID | Задача | Приоритет | Effort ||----|--------|-----------|--------|| IT4-001 | Dashboard: Stats cards (если endpoint готов) | P1 | 4h || IT4-002 | Keyboard shortcuts (Cmd+K search, etc.) | P2 | 4h || IT4-003 | Optimistic updates для быстрого UX | P2 | 4h || IT4-004 | Skeleton loaders вместо spinners | P2 | 3h || IT4-005 | Form autosave (draft) | P2 | 4h || IT4-006 | Mobile responsive layout | P1 | 6h || IT4-007 | E2E tests (critical paths) | P1 | 8h || IT4-008 | Performance audit + fixes | P1 | 4h |---

## B) MVP SCOPE (минимум для первой пользы)

### Обязательные экраны MVP:

1. **Login** (`/login`) - авторизация
2. **Articles List** (`/articles`) - таблица с фильтрами
3. **Article Edit** (`/articles/[id]`) - форма с locales tabs
4. **Article Create** (`/articles/new`)
5. **Media Library** (`/media`) - grid с upload
6. **Settings** (`/settings`) - профиль + theme toggle

### Обязательные модули:

| Модуль | Зависимости | Приоритет ||--------|-------------|-----------|| Auth (login, token, guards) | - | P0 || Layout (sidebar, header, shell) | Auth | P0 || Theme (tokens, provider, toggle) | - | P0 || API Client (axios, interceptors) | Auth | P0 || Table Component (sorting, pagination) | UI Kit | P0 || Form Components (inputs, validation) | UI Kit | P0 |

### Первые сущности для end-to-end:

**Articles + Media** - это лучший выбор потому что:

- Articles покрывает все паттерны: CRUD, locales, publishing workflow, topics relations
- Media нужен для Articles (cover image) - проверяет upload flow
- Вместе они дают полный вертикальный срез

---

## C) АРХИТЕКТУРА ФРОНТА

### Структура папок (Feature-Sliced Design):

```javascript
src/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Auth group
│   │   └── login/
│   │       └── page.tsx
│   ├── (dashboard)/              # Protected group
│   │   ├── layout.tsx            # Shell layout
│   │   ├── page.tsx              # Dashboard
│   │   ├── articles/
│   │   │   ├── page.tsx          # List
│   │   │   ├── new/page.tsx      # Create
│   │   │   └── [id]/page.tsx     # Edit
│   │   ├── media/
│   │   ├── faq/
│   │   ├── services/
│   │   ├── team/
│   │   ├── reviews/
│   │   ├── leads/
│   │   ├── seo/
│   │   ├── users/
│   │   └── settings/
│   ├── layout.tsx                # Root layout
│   ├── providers.tsx             # All providers
│   └── globals.css               # Global styles + tokens
│
├── widgets/                      # Самостоятельные UI блоки
│   ├── Sidebar/
│   │   ├── ui/
│   │   │   ├── Sidebar.tsx
│   │   │   ├── NavItem.tsx
│   │   │   └── index.ts
│   │   └── index.ts
│   ├── Header/
│   ├── DataTable/
│   └── MediaPicker/
│
├── features/                     # Бизнес-фичи
│   ├── auth/
│   │   ├── api/authApi.ts
│   │   ├── model/useAuth.ts
│   │   ├── ui/LoginForm.tsx
│   │   ├── lib/tokenStorage.ts
│   │   └── index.ts
│   ├── articles/
│   │   ├── api/articlesApi.ts
│   │   ├── model/useArticles.ts
│   │   ├── ui/
│   │   │   ├── ArticleForm.tsx
│   │   │   ├── ArticleFilters.tsx
│   │   │   └── LocalesTabs.tsx
│   │   └── index.ts
│   ├── media/
│   ├── faq/
│   ├── services/
│   ├── employees/
│   ├── reviews/
│   ├── inquiries/
│   ├── seo/
│   └── users/
│
├── entities/                     # Бизнес-сущности (типы, базовые компоненты)
│   ├── article/
│   │   ├── types.ts
│   │   └── ui/ArticleCard.tsx
│   ├── user/
│   ├── file/
│   └── inquiry/
│
├── shared/                       # Общий код
│   ├── api/
│   │   ├── apiClient.ts          # Axios instance
│   │   ├── interceptors.ts       # Auth interceptor
│   │   └── index.ts
│   ├── ui/                       # UI Kit
│   │   ├── Button/
│   │   ├── Input/
│   │   ├── Select/
│   │   ├── Modal/
│   │   ├── Table/
│   │   ├── Pagination/
│   │   ├── Toast/
│   │   ├── Tabs/
│   │   ├── Card/
│   │   ├── Badge/
│   │   ├── Spinner/
│   │   ├── Skeleton/
│   │   └── index.ts
│   ├── lib/
│   │   ├── cn.ts                 # classnames utility
│   │   ├── formatDate.ts
│   │   ├── formatFileSize.ts
│   │   └── index.ts
│   ├── config/
│   │   ├── routes.ts             # Route constants
│   │   ├── apiEndpoints.ts       # API endpoints
│   │   └── index.ts
│   ├── hooks/
│   │   ├── usePermissions.ts
│   │   ├── useDebounce.ts
│   │   └── index.ts
│   └── types/
│       ├── api.ts                # Generic API types
│       └── index.ts
│
├── providers/                    # Context providers
│   ├── ThemeProvider.tsx
│   ├── QueryProvider.tsx
│   ├── AuthProvider.tsx
│   └── index.ts
│
└── styles/
    └── tokens.css                # CSS Variables (design tokens)
```



### Где что находится:

| Компонент | Расположение | Пояснение ||-----------|--------------|-----------|| Design tokens + тема | `src/app/globals.css`, `src/styles/tokens.css`, `src/providers/ThemeProvider.tsx` | CSS variables + React context || UI Components | `src/shared/ui/` | Чистые presentational компоненты || API слой | `src/shared/api/` + `src/features/*/api/` | Общий клиент + entity-specific методы || State management | React Query в `features/*/model/`, Zustand для auth в `src/providers/AuthProvider.tsx` | Server state + minimal client state || Auth guards / RBAC | `src/shared/hooks/usePermissions.ts`, middleware в `src/app/(dashboard)/layout.tsx` | HOC или hook-based guards || Routing + Layout | `src/app/` (App Router), `src/widgets/Sidebar/`, `src/widgets/Header/` | File-based routing + widget composition |

### Расширяемость для новых CRUD сущностей:

```typescript
// Паттерн для добавления новой сущности (например, "cases"):

// 1. Типы: src/entities/case/types.ts
export interface Case {
  id: string;
  tenant_id: string;
  status: 'draft' | 'published';
  locales: CaseLocale[];
  version: number;
  // ...
}

// 2. API: src/features/cases/api/casesApi.ts
export const casesApi = {
  getAll: (params: ListParams) => apiClient.get<PaginatedResponse<Case>>('/admin/cases', { params }),
  getById: (id: string) => apiClient.get<Case>(`/admin/cases/${id}`),
  create: (data: CreateCaseDto) => apiClient.post<Case>('/admin/cases', data),
  update: (id: string, data: UpdateCaseDto) => apiClient.patch<Case>(`/admin/cases/${id}`, data),
  delete: (id: string) => apiClient.delete(`/admin/cases/${id}`),
};

// 3. Hooks: src/features/cases/model/useCases.ts
export const caseKeys = {
  all: ['cases'] as const,
  list: (params: ListParams) => [...caseKeys.all, 'list', params] as const,
  detail: (id: string) => [...caseKeys.all, 'detail', id] as const,
};

export const useCases = (params: ListParams) => {
  return useQuery({
    queryKey: caseKeys.list(params),
    queryFn: () => casesApi.getAll(params),
  });
};

// 4. Pages: src/app/(dashboard)/cases/page.tsx - copy pattern from articles
```

---

## D) DESIGN SYSTEM ВНЕДРЕНИЕ

### Design Tokens (CSS Variables):

```css
/* src/styles/tokens.css */

:root {
  /* === LIGHT THEME (default) === */
  
  /* Background */
  --color-bg-primary: #ffffff;
  --color-bg-secondary: #fafafa;
  --color-bg-elevated: #f5f5f5;
  --color-bg-hover: #f0f0f0;
  
  /* Text */
  --color-text-primary: #0a0a0a;
  --color-text-secondary: #525252;
  --color-text-muted: #a3a3a3;
  --color-text-inverse: #ffffff;
  
  /* Brand / Accent */
  --color-accent-primary: #FF006E;
  --color-accent-primary-hover: #e6005f;
  --color-accent-secondary: #0080FF;
  
  /* Border */
  --color-border: #e5e5e5;
  --color-border-hover: #d4d4d4;
  --color-border-focus: #FF006E;
  
  /* Semantic */
  --color-success: #22c55e;
  --color-success-bg: #f0fdf4;
  --color-warning: #f59e0b;
  --color-warning-bg: #fffbeb;
  --color-error: #ef4444;
  --color-error-bg: #fef2f2;
  --color-info: #3b82f6;
  --color-info-bg: #eff6ff;
  
  /* Shadows */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.07);
  --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);
  
  /* Radius */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-full: 9999px;
  
  /* Transitions */
  --transition-fast: 150ms ease-out;
  --transition-normal: 250ms ease-out;
  
  /* Typography */
  --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', monospace;
}

/* === DARK THEME === */
[data-theme="dark"] {
  --color-bg-primary: #0a0a0a;
  --color-bg-secondary: #171717;
  --color-bg-elevated: #262626;
  --color-bg-hover: #333333;
  
  --color-text-primary: #ffffff;
  --color-text-secondary: #a3a3a3;
  --color-text-muted: #737373;
  --color-text-inverse: #0a0a0a;
  
  --color-border: #333333;
  --color-border-hover: #404040;
  
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.3);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.4);
  --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.5);
}
```



### Theme Provider:

```typescript
// src/providers/ThemeProvider.tsx
'use client';

import { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextValue {
  theme: Theme;
  resolvedTheme: 'light' | 'dark';
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setThemeState] = useState<Theme>('light');
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const stored = localStorage.getItem('theme') as Theme | null;
    if (stored) setThemeState(stored);
  }, []);

  useEffect(() => {
    const resolved = theme === 'system'
      ? window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
      : theme;
    
    setResolvedTheme(resolved);
    document.documentElement.setAttribute('data-theme', resolved);
    localStorage.setItem('theme', theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme: setThemeState }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
};
```



### Базовые компоненты (MVP):

| Компонент | Состояния | Варианты ||-----------|-----------|----------|| **Button** | default, hover, active, disabled, loading | primary, secondary, ghost, danger || **Input** | default, hover, focus, error, disabled | text, password, email, search || **Select** | default, hover, focus, disabled | single, searchable || **Modal** | open, closed | default, danger (for confirms) || **Table** | loading, empty, data | sortable columns, selectable rows || **Pagination** | - | simple, with page size selector || **Toast** | - | success, error, warning, info || **Tabs** | - | default, pills || **Badge** | - | по статусам: draft/published/archived, success/warning/error || **Spinner** | - | sizes: sm, md, lg || **Skeleton** | - | text, card, table-row |

### UI Kit Backlog (Iteration 2+):

- Dropdown Menu
- Combobox (autocomplete)
- DatePicker
- FileUpload (drag & drop)
- Avatar
- Tooltip
- Accordion
- Switch
- Checkbox/Radio
- Progress Bar
- Command Palette (Cmd+K)

---

## E) ИНТЕГРАЦИЯ С API

### API Client Setup:

```typescript
// src/shared/api/apiClient.ts
import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { getAccessToken, getRefreshToken, setTokens, clearTokens } from '@/features/auth/lib/tokenStorage';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';
const TENANT_ID = process.env.NEXT_PUBLIC_TENANT_ID;

class ApiClient {
  private instance: AxiosInstance;
  private isRefreshing = false;
  private failedQueue: Array<{
    resolve: (token: string) => void;
    reject: (error: Error) => void;
  }> = [];

  constructor() {
    this.instance = axios.create({
      baseURL: API_BASE_URL,
      headers: { 'Content-Type': 'application/json' },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor - add auth token
    this.instance.interceptors.request.use((config: InternalAxiosRequestConfig) => {
      const token = getAccessToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      // Add tenant ID for login
      if (config.url?.includes('/auth/login')) {
        config.headers['X-Tenant-ID'] = TENANT_ID;
      }
      return config;
    });

    // Response interceptor - handle 401
    this.instance.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

        if (error.response?.status === 401 && !originalRequest._retry) {
          if (this.isRefreshing) {
            return new Promise((resolve, reject) => {
              this.failedQueue.push({ resolve, reject });
            }).then((token) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              return this.instance(originalRequest);
            });
          }

          originalRequest._retry = true;
          this.isRefreshing = true;

          try {
            const refreshToken = getRefreshToken();
            const { data } = await axios.post(`${API_BASE_URL}/auth/refresh`, {
              refresh_token: refreshToken,
            });

            setTokens(data);
            this.failedQueue.forEach(({ resolve }) => resolve(data.access_token));
            this.failedQueue = [];
            
            originalRequest.headers.Authorization = `Bearer ${data.access_token}`;
            return this.instance(originalRequest);
          } catch (refreshError) {
            this.failedQueue.forEach(({ reject }) => reject(refreshError as Error));
            this.failedQueue = [];
            clearTokens();
            window.location.href = '/login';
            return Promise.reject(refreshError);
          } finally {
            this.isRefreshing = false;
          }
        }

        return Promise.reject(error);
      }
    );
  }

  get axios() {
    return this.instance;
  }
}

export const apiClient = new ApiClient().axios;
```



### Auth Implementation:

```typescript
// src/features/auth/api/authApi.ts
import { apiClient } from '@/shared/api';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface TokensResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

export interface LoginResponse {
  tokens: TokensResponse;
  user: User;
}

export const authApi = {
  login: (data: LoginRequest) => 
    apiClient.post<LoginResponse>('/auth/login', data),
  
  logout: () => 
    apiClient.post('/auth/logout'),
  
  me: () => 
    apiClient.get<UserWithPermissions>('/auth/me'),
  
  changePassword: (data: { current_password: string; new_password: string }) =>
    apiClient.post('/auth/me/password', data),
};
```



### Token Storage:

```typescript
// src/features/auth/lib/tokenStorage.ts
const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

export const getAccessToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(ACCESS_TOKEN_KEY);
};

export const getRefreshToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(REFRESH_TOKEN_KEY);
};

export const setTokens = (tokens: { access_token: string; refresh_token: string }) => {
  localStorage.setItem(ACCESS_TOKEN_KEY, tokens.access_token);
  localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refresh_token);
};

export const clearTokens = () => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
};
```



### React Query Setup:

```typescript
// src/providers/QueryProvider.tsx
'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState } from 'react';

export const QueryProvider = ({ children }: { children: React.ReactNode }) => {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            gcTime: 5 * 60 * 1000, // 5 minutes (formerly cacheTime)
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
};
```



### Типизация DTO:

Рекомендация: **Ручные типы** (не генерация из OpenAPI) по причинам:

1. Backend документация в markdown, не OpenAPI spec
2. Ручные типы дают больше контроля над именованием
3. Можно добавлять frontend-specific типы
```typescript
// src/entities/article/types.ts
export interface ArticleLocale {
  id: string;
  article_id: string;
  locale: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  meta_title: string | null;
  meta_description: string | null;
  created_at: string;
  updated_at: string;
}

export interface ArticleTopic {
  topic_id: string;
}

export type ArticleStatus = 'draft' | 'published' | 'archived';

export interface Article {
  id: string;
  tenant_id: string;
  status: ArticleStatus;
  cover_image_url: string | null;
  reading_time_minutes: number | null;
  sort_order: number;
  version: number;
  published_at: string | null;
  view_count: number;
  author_id: string;
  created_at: string;
  updated_at: string;
  locales: ArticleLocale[];
  topics: ArticleTopic[];
}

// Request DTOs
export interface CreateArticleDto {
  status?: ArticleStatus;
  cover_image_url?: string;
  reading_time_minutes?: number;
  sort_order?: number;
  topic_ids?: string[];
  locales: Omit<ArticleLocale, 'id' | 'article_id' | 'created_at' | 'updated_at'>[];
}

export interface UpdateArticleDto extends Partial<CreateArticleDto> {
  version: number; // Required for optimistic locking
}
```




### Пример вертикального среза (End-to-End):

```javascript
Экран: Article Edit Page
─────────────────────────────────────────────────────────

1. ROUTE: /articles/[id]/page.tsx
   │
   ├─► useArticle(id) hook загружает данные
   │   └─► articlesApi.getById(id)
   │       └─► GET /api/v1/admin/articles/{id}
   │
   ├─► ArticleForm компонент с React Hook Form
   │   └─► useForm({ defaultValues: article })
   │
   └─► Submit Handler
       │
       ├─► articlesApi.update(id, data)
       │   └─► PATCH /api/v1/admin/articles/{id}
       │       Body: { ...changes, version: currentVersion }
       │
       ├─► onSuccess:
       │   ├─► queryClient.invalidateQueries(['articles'])
       │   ├─► toast.success('Article updated')
       │   └─► router.push('/articles')
       │
       └─► onError:
           ├─► if 409 Conflict: showConflictDialog()
           ├─► if 422 Validation: setError(field, message)
           └─► else: toast.error(error.detail)
```

---

## F) ЭКРАННАЯ КАРТА

### Screen-to-API Mapping:

| Screen | URL | API Endpoints | Status ||--------|-----|---------------|--------|| Login | `/login` | `POST /auth/login` | API Ready || Dashboard | `/` | `GET /admin/dashboard` | **GAP** - нет endpoint || Articles List | `/articles` | `GET /admin/articles` | API Ready || Article Edit | `/articles/[id] `| `GET/PATCH /admin/articles/{id}`, `POST /publish`, `POST /unpublish` | API Ready || Article Create | `/articles/new` | `POST /admin/articles` | API Ready || Topics | `/articles` (sidebar) | `GET/POST/PATCH/DELETE /admin/topics` | API Ready || FAQ List | `/faq` | `GET /admin/faq` | API Ready || FAQ Edit | `/faq/[id] `| `GET/PATCH/DELETE /admin/faq/{id}` | API Ready || Services List | `/services` | `GET /admin/services` | API Ready || Services Edit | `/services/[id] `| `GET/PATCH/DELETE /admin/services/{id}` | API Ready || Team List | `/team` | `GET /admin/employees` | API Ready || Team Edit | `/team/[id] `| `GET/PATCH/DELETE /admin/employees/{id}` | API Ready || Reviews List | `/reviews` | `GET /admin/reviews` | API Ready || Reviews Edit | `/reviews/[id] `| `GET/PATCH/DELETE`, `POST /approve`, `POST /reject` | API Ready || Leads List | `/leads` | `GET /admin/inquiries` | API Ready || Lead Detail | `/leads/[id] `| `GET/PATCH /admin/inquiries/{id}` | API Ready || Lead Analytics | `/leads` (tab) | `GET /admin/inquiries/analytics` | API Ready || Inquiry Forms | `/leads/forms` | `GET/POST/PATCH/DELETE /admin/inquiry-forms` | API Ready || Media Library | `/media` | `GET /admin/files`, `POST /upload-url`, `POST /files` | API Ready || SEO Routes | `/seo` | `GET/PUT/PATCH/DELETE /admin/seo/routes` | API Ready || Redirects | `/seo/redirects` | `GET/POST/PATCH/DELETE /admin/seo/redirects` | API Ready || Users List | `/users` | `GET /auth/users` | API Ready || User Edit | `/users/[id] `| `GET/PATCH/DELETE /auth/users/{id}` | API Ready || Roles | `/roles` | `GET /auth/roles`, `GET /auth/permissions` | Read Only (CRUD **GAP**) || Settings | `/settings` | `GET/PUT /admin/tenants/{id}/settings` | API Ready || Audit Log | `/audit` | - | **GAP** - нет endpoint |

### Фичи требующие уточнений (из gap-analysis):

| Фича | Проблема | Workaround ||------|----------|------------|| Dashboard stats | Нет endpoint | Показать placeholder "Coming soon" || Bulk operations | Нет endpoint | Операции по одному (позже bulk) || Search | Не везде реализован | Client-side фильтрация или disabled || Export CSV | Нет endpoint | Убрать кнопку Export || Audit Log | Нет router | Скрыть пункт меню || Role CRUD | Только read | Показать roles read-only || Version History | Нет endpoint | Не показывать history tab |

### Массовые операции / Фильтры / Сортировка:

| Screen | Bulk Ops | Filters | Sort | Search ||--------|----------|---------|------|--------|| Articles | **GAP** | status, topicId | created_at, published_at | **GAP** || FAQ | **GAP** | category, isPublished | created_at | **GAP** || Employees | **GAP** | isPublished | sort_order | **GAP** || Inquiries | **GAP** | status, formId, assignedTo, utmSource | created_at | **GAP** || Files | N/A | folder, imagesOnly | created_at, file_size | N/A || Users | N/A | is_active | N/A | **GAP** |---

## G) ТРЕБОВАНИЯ ПО КАЧЕСТВУ

### Чек-лист соответствия CLAUDE_FRONTEND.md:

- [ ] Feature-Sliced Design структура папок
- [ ] TypeScript strict mode включен
- [ ] Нет `any`, использовать `unknown` где нужно
- [ ] Named exports для компонентов
- [ ] Реэкспорт через `index.ts`
- [ ] CSS Variables для всех цветов
- [ ] Tailwind utility classes
- [ ] `cn()` helper для условных классов
- [ ] React Query для server state
- [ ] Zustand только для auth/theme (минимум client state)
- [ ] React Hook Form для форм
- [ ] Zod для валидации схем
- [ ] API Client как класс с методами
- [ ] Query keys как factory pattern
- [ ] Импорты отсортированы (prettier)
- [ ] ESLint no-console (кроме warn, error)
- [ ] `use client` только где нужны клиентские hooks

### Линтеры / Форматтеры:

```json
// package.json scripts
{
  "scripts": {
    "dev": "next dev --turbopack",
    "build": "next build",
    "start": "next start",
    "lint": "next lint && tsc --noEmit",
    "format": "prettier --write .",
    "format:check": "prettier --check ."
  }
}
```



### Commit Conventions:

```javascript
feat: add articles list page
fix: resolve auth token refresh race condition  
refactor: extract DataTable into widget
chore: update dependencies
docs: add API integration guide
```



### Тестовый минимум:

**MVP:**

- Smoke тест: Login -> Articles List -> Create Article -> Logout

**Iteration 2+:**

- E2E (Playwright): Critical user journeys
- Unit: Utility functions (formatDate, cn, etc.)
- Component: Key UI components (Button, Modal, Table)

---

## H) ПЕРВЫЙ СПРИНТ (5-10 дней)

### День 1-2: Project Setup

| Задача | Effort | DoD ||--------|--------|-----|| `npx create-next-app@latest` с TypeScript, Tailwind, App Router | 1h | Проект запускается || Настроить tsconfig.json (strict: true, paths) | 30m | Компиляция без ошибок || Настроить ESLint + Prettier конфиги | 1h | `yarn lint` + `yarn format` работают || Создать структуру папок FSD | 1h | Все папки созданы || Design tokens в `globals.css` | 2h | CSS variables работают || ThemeProvider + toggle | 2h | Тема переключается || Tailwind v4 конфиг с токенами | 1h | `bg-bg-primary` работает |**Результат дня 2:** Пустой проект с темизацией, открывается на localhost:3000

### День 3-4: UI Kit + API Client

| Задача | Effort | DoD ||--------|--------|-----|| Button component (все варианты) | 2h | Storybook/preview страница || Input component (все состояния) | 2h | С label, error, hint || Spinner, Badge components | 1h | Работают || `cn()` helper, shared/lib | 30m | Экспортируется || apiClient.ts с interceptors | 3h | Запросы уходят || authApi.ts (login, me, logout) | 1h | Методы типизированы || tokenStorage.ts | 1h | get/set/clear работают |**Результат дня 4:** UI Kit базовый готов, API client настроен

### День 5-6: Auth + Layout

| Задача | Effort | DoD ||--------|--------|-----|| Login page UI | 2h | Форма отображается || Login form logic (React Hook Form + Zod) | 2h | Валидация работает || Login API integration | 2h | Успешный логин сохраняет токены || AuthProvider context | 2h | user доступен глобально || Protected route middleware | 1h | Редирект на /login если нет токена || Sidebar widget | 3h | Навигация, collapse || Header widget | 2h | User menu, theme toggle, logout || Shell layout | 1h | Sidebar + Header + Main area |**Результат дня 6:** Можно залогиниться и увидеть пустую админку с sidebar

### День 7-8: Articles List + Table

| Задача | Effort | DoD ||--------|--------|-----|| Table component (базовый) | 3h | Columns, rows, loading || Pagination component | 2h | Работает с Table || articlesApi.ts | 1h | getAll, getById методы || useArticles hook (React Query) | 1h | Query keys pattern || Articles list page | 3h | Таблица с данными || Filters UI (status dropdown) | 2h | Фильтрация работает || Empty/Loading states | 1h | Показываются корректно |**Результат дня 8:** Таблица статей отображается с real data

### День 9-10: Article Form + Media

| Задача | Effort | DoD ||--------|--------|-----|| Modal component | 2h | Open/close, variants || Toast component (sonner) | 1h | success/error/warning || Tabs component | 1h | Для локалей || Select component | 2h | Single select || ArticleForm component | 4h | Все поля, locales tabs || Article create page | 2h | Form + submit || Article edit page | 2h | Load data + submit + publish || mediaApi.ts (upload flow) | 2h | getUploadUrl, register || Media Library page (grid) | 3h | Отображение файлов || Upload flow (presigned URL) | 2h | Файл загружается в S3 |**Результат дня 10:** Полный CRUD для Articles + Upload файлов

### Демо-сценарий (конец спринта):

```javascript
1. Открыть /login
2. Войти с email/password
3. Увидеть Dashboard (placeholder) с sidebar
4. Перейти в Articles
5. Увидеть таблицу статей (с бэкенда)
6. Создать новую статью:
    - Заполнить title, slug, content (RU locale)
    - Добавить EN locale
    - Выбрать topic
    - Сохранить как Draft
7. Опубликовать статью
8. Перейти в Media Library
9. Загрузить изображение
10. Увидеть его в grid
11. Переключить тему на Dark
12. Logout
```

---

## ASSUMPTIONS (предположения)

1. Backend URL будет предоставлен (переменная `NEXT_PUBLIC_API_URL`)
2. Tenant ID фиксированный (переменная `NEXT_PUBLIC_TENANT_ID`)
3. Backend соответствует документации в `docs/api/`
4. Тестовый пользователь уже создан в backend
5. S3 bucket настроен для upload
6. CORS на backend разрешает requests с localhost

## OPEN QUESTIONS

1. **Backend URL:** Какой URL для API? (localhost:8000 или production)
2. **Tenant ID:** Какой UUID использовать?
3. **Test User:** Есть ли готовые credentials для тестирования?