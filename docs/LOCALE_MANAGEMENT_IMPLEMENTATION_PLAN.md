# План реализации обновленной логики управления локалями

## Обзор

Необходимо перейти от управления локалями внутри форм создания/редактирования сущностей к отдельным API endpoints для каждой локали. Это позволит независимо добавлять, редактировать и удалять локали без необходимости обновлять всю сущность.

## Текущее состояние

- Локали управляются внутри форм (добавление/удаление через UI формы)
- Все локали отправляются вместе с основными данными сущности в одном запросе
- Формы: `ServiceForm`, `ArticleForm`, `CaseForm`, `FAQForm`, `EmployeeForm`, `TopicModal`, и др.

## Целевое состояние

- Локали управляются через отдельные endpoints:
  - `POST /admin/{resource}/{id}/locales` - создать локаль
  - `PATCH /admin/{resource}/{id}/locales/{locale_id}` - обновить локаль
  - `DELETE /admin/{resource}/{id}/locales/{locale_id}` - удалить локаль
- Формы создания сущностей больше не требуют обязательных локалей
- Формы редактирования показывают существующие локали и позволяют управлять ими отдельно

## Поддерживаемые сущности

### Company Module
1. **Services** (`/admin/services/{id}/locales`)
2. **Employees** (`/admin/employees/{id}/locales`)
3. **Practice Areas** (`/admin/practice-areas/{id}/locales`)
4. **Advantages** (`/admin/advantages/{id}/locales`)
5. **Addresses** (`/admin/addresses/{id}/locales`)

### Content Module
6. **Topics** (`/admin/topics/{id}/locales`)
7. **Articles** (`/admin/articles/{id}/locales`)
8. **FAQ** (`/admin/faq/{id}/locales`)
9. **Cases** (`/admin/cases/{id}/locales`)

## Этапы реализации

### Этап 1: Базовая инфраструктура (Foundation)

#### 1.1. Общие типы для локалей
**Файл:** `src/shared/types/locale.ts`

Создать базовые типы и утилиты:
- Базовый интерфейс `Locale` с общими полями
- Типы ошибок API (`LocaleAlreadyExistsError`, `MinimumLocalesError`, `SlugExistsError`)
- Утилиты для работы с локалями

#### 1.2. Конфигурация API endpoints
**Файл:** `src/shared/config/apiEndpoints.ts`

Добавить endpoints для управления локалями для каждой сущности:
```typescript
LOCALES: {
  CREATE: (resource: string, id: string) => `/admin/${resource}/${id}/locales`,
  UPDATE: (resource: string, id: string, localeId: string) => `/admin/${resource}/${id}/locales/${localeId}`,
  DELETE: (resource: string, id: string, localeId: string) => `/admin/${resource}/${id}/locales/${localeId}`,
}
```

Или для каждой сущности отдельно:
```typescript
SERVICES: {
  // ... existing
  LOCALES: (id: string) => `/admin/services/${id}/locales`,
  LOCALE_BY_ID: (serviceId: string, localeId: string) => `/admin/services/${serviceId}/locales/${localeId}`,
}
```

#### 1.3. Переиспользуемый компонент LocaleManager
**Файл:** `src/shared/ui/LocaleManager/LocaleManager.tsx`

Создать универсальный компонент для управления локалями:
- Отображение списка существующих локалей
- Кнопка добавления новой локали (для доступных языков)
- Кнопки редактирования и удаления для каждой локали
- Блокировка удаления последней локали
- Модальное окно для создания/редактирования локали
- Обработка всех типов ошибок API

**Пропсы:**
```typescript
interface LocaleManagerProps<T extends Locale> {
  resourceType: 'service' | 'article' | 'case' | 'faq' | 'topic' | 'employee' | 'practice-area' | 'advantage' | 'address';
  resourceId: string;
  existingLocales: T[];
  availableLocales: string[]; // ['ru', 'en', 'de']
  localeSchema: z.ZodSchema; // Схема валидации для конкретного типа локали
  fields: LocaleField[]; // Конфигурация полей формы
  onLocaleCreated?: (locale: T) => void;
  onLocaleUpdated?: (locale: T) => void;
  onLocaleDeleted?: (localeId: string) => void;
}
```

#### 1.4. Хук для управления локалями
**Файл:** `src/shared/hooks/useLocaleManagement.ts`

Создать переиспользуемый хук:
- Функции для создания/обновления/удаления локалей
- Обработка ошибок
- Инвалидация кэша React Query
- Loading states

### Этап 2: API клиенты для каждой сущности

Для каждой сущности добавить методы в соответствующий API файл:

#### 2.1. Services
**Файл:** `src/features/services/api/servicesApi.ts`
```typescript
// Locales
createLocale: (serviceId: string, data: CreateServiceLocaleDto) =>
  apiClient.post<ServiceLocale>(API_ENDPOINTS.SERVICES.LOCALES(serviceId), data),

updateLocale: (serviceId: string, localeId: string, data: UpdateServiceLocaleDto) =>
  apiClient.patch<ServiceLocale>(API_ENDPOINTS.SERVICES.LOCALE_BY_ID(serviceId, localeId), data),

deleteLocale: (serviceId: string, localeId: string) =>
  apiClient.delete(API_ENDPOINTS.SERVICES.LOCALE_BY_ID(serviceId, localeId)),
```

#### 2.2. Articles
**Файл:** `src/features/articles/api/articlesApi.ts`
Аналогично для ArticleLocale

#### 2.3. Cases
**Файл:** `src/features/cases/api/casesApi.ts`
Аналогично для CaseLocale

#### 2.4. FAQ
**Файл:** `src/features/faq/api/faqApi.ts`
Аналогично для FAQLocale

#### 2.5. Topics
**Файл:** `src/features/topics/api/topicsApi.ts`
Аналогично для TopicLocale

#### 2.6. Employees
**Файл:** `src/features/employees/api/employeesApi.ts`
Аналогично для EmployeeLocale

#### 2.7. Practice Areas
**Файл:** `src/features/company/api/companyApi.ts`
Аналогично для PracticeAreaLocale

#### 2.8. Advantages
**Файл:** `src/features/company/api/companyApi.ts`
Аналогично для AdvantageLocale

#### 2.9. Addresses
**Файл:** `src/features/company/api/companyApi.ts`
Аналогично для AddressLocale

### Этап 3: Обновление типов DTO

Для каждой сущности обновить типы создания/обновления:

#### 3.1. Убрать обязательные locales из CreateDto
**Файлы:** Все `types.ts` файлы в `src/entities/`

Изменить:
```typescript
// Было:
export interface CreateServiceDto {
  locales: CreateServiceLocaleDto[]; // Обязательно
}

// Стало:
export interface CreateServiceDto {
  locales?: CreateServiceLocaleDto[]; // Опционально (для обратной совместимости)
}
```

#### 3.2. Добавить типы для обновления локалей
**Файлы:** Все `types.ts` файлы в `src/entities/`

Добавить:
```typescript
export interface UpdateServiceLocaleDto {
  locale: string; // Обязательно
  title?: string;
  slug?: string;
  short_description?: string;
  description?: string;
  meta_title?: string;
  meta_description?: string;
}
```

### Этап 4: Обновление форм создания/редактирования

#### 4.1. Формы создания
**Файлы:** Все `*Form.tsx` файлы

Изменения:
- Убрать обязательность хотя бы одной локали при создании
- Сделать секцию локалей опциональной или убрать её совсем
- После создания сущности показать LocaleManager для добавления локалей

#### 4.2. Формы редактирования
**Файлы:** Все `*Form.tsx` файлы

Изменения:
- Убрать управление локалями из формы
- Добавить отдельную секцию с компонентом `LocaleManager`
- Локали редактируются независимо от основной формы
- Основная форма больше не отправляет `locales` в `UpdateDto`

### Этап 5: React Query хуки

#### 5.1. Мутации для локалей
**Файлы:** Все `model/use*.ts` файлы

Добавить мутации:
```typescript
const createLocaleMutation = useMutation({
  mutationFn: (data: { resourceId: string; locale: CreateLocaleDto }) =>
    api.createLocale(data.resourceId, data.locale),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: [resourceKey, resourceId] });
  },
});
```

### Этап 6: Обработка ошибок

#### 6.1. Утилиты для обработки ошибок
**Файл:** `src/shared/lib/localeErrors.ts`

Создать функции:
- `isLocaleAlreadyExistsError(error)` - проверка ошибки дубликата локали
- `isMinimumLocalesError(error)` - проверка ошибки минимума локалей
- `isSlugExistsError(error)` - проверка ошибки дубликата slug
- `getLocaleErrorMessage(error)` - получение пользовательского сообщения

#### 6.2. Интеграция в компоненты
Обновить `LocaleManager` и формы для использования утилит обработки ошибок

### Этап 7: Получение доступных локалей

#### 7.1. Хук для получения настроек локалей
**Файл:** `src/shared/hooks/useAvailableLocales.ts`

Создать хук для получения списка доступных локалей из настроек tenant:
```typescript
const useAvailableLocales = () => {
  // Получить из tenant settings или использовать дефолтные
  return ['ru', 'en', 'de'];
};
```

### Этап 8: Тестирование и валидация

#### 8.1. Тестирование каждой сущности
Для каждой сущности проверить:
- ✅ Создание сущности без локалей
- ✅ Добавление локали после создания
- ✅ Редактирование локали
- ✅ Удаление локали (кроме последней)
- ✅ Блокировка удаления последней локали
- ✅ Обработка ошибки дубликата локали
- ✅ Обработка ошибки дубликата slug

#### 8.2. Интеграционное тестирование
- Проверить работу с несколькими локалями одновременно
- Проверить обновление кэша после операций с локалями
- Проверить работу в разных браузерах/сессиях

## Приоритет реализации

### Высокий приоритет (MVP)
1. ✅ Этап 1: Базовая инфраструктура
2. ✅ Этап 2: API клиенты для Services, Articles, Cases, FAQ
3. ✅ Этап 3: Обновление типов DTO
4. ✅ Этап 4: Обновление форм для Services, Articles, Cases, FAQ

### Средний приоритет
5. ✅ Этап 2: API клиенты для Topics, Employees
6. ✅ Этап 4: Обновление форм для Topics, Employees

### Низкий приоритет
7. ✅ Этап 2: API клиенты для Practice Areas, Advantages, Addresses
8. ✅ Этап 4: Обновление форм для Practice Areas, Advantages, Addresses

## Детальный план по файлам

### Новые файлы

1. `src/shared/types/locale.ts` - Общие типы для локалей
2. `src/shared/lib/localeErrors.ts` - Утилиты обработки ошибок
3. `src/shared/hooks/useLocaleManagement.ts` - Хук для управления локалями
4. `src/shared/hooks/useAvailableLocales.ts` - Хук для получения доступных локалей
5. `src/shared/ui/LocaleManager/LocaleManager.tsx` - Компонент управления локалями
6. `src/shared/ui/LocaleManager/LocaleForm.tsx` - Форма создания/редактирования локали
7. `src/shared/ui/LocaleManager/index.ts` - Экспорты

### Изменяемые файлы

#### Конфигурация
- `src/shared/config/apiEndpoints.ts` - Добавить endpoints для локалей

#### API клиенты (9 файлов)
- `src/features/services/api/servicesApi.ts`
- `src/features/articles/api/articlesApi.ts`
- `src/features/cases/api/casesApi.ts`
- `src/features/faq/api/faqApi.ts`
- `src/features/topics/api/topicsApi.ts`
- `src/features/employees/api/employeesApi.ts`
- `src/features/company/api/companyApi.ts` (для Practice Areas, Advantages, Addresses)

#### Типы (9 файлов)
- `src/entities/service/types.ts`
- `src/entities/article/types.ts`
- `src/entities/case/types.ts`
- `src/entities/faq/types.ts`
- `src/entities/topic/types.ts`
- `src/entities/employee/types.ts`
- `src/entities/company/types.ts` (для Practice Areas, Advantages, Addresses)

#### Формы (9 файлов)
- `src/features/services/ui/ServiceForm.tsx`
- `src/features/articles/ui/ArticleForm.tsx`
- `src/features/cases/ui/CaseForm.tsx`
- `src/features/faq/ui/FAQForm.tsx`
- `src/features/topics/ui/TopicModal.tsx`
- `src/features/employees/ui/EmployeeForm.tsx`
- Формы для Practice Areas, Advantages, Addresses (если есть)

#### React Query хуки (9 файлов)
- `src/features/services/model/useServices.ts`
- `src/features/articles/model/useArticles.ts`
- `src/features/cases/model/useCases.ts`
- `src/features/faq/model/useFAQ.ts`
- `src/features/topics/model/useTopics.ts`
- `src/features/employees/model/useEmployees.ts`
- `src/features/company/model/use*.ts` (для Practice Areas, Advantages, Addresses)

#### Страницы редактирования (9 файлов)
- `src/app/(dashboard)/services/[id]/page.tsx`
- `src/app/(dashboard)/articles/[id]/page.tsx`
- `src/app/(dashboard)/cases/[id]/page.tsx`
- `src/app/(dashboard)/faq/[id]/page.tsx`
- `src/app/(dashboard)/team/[id]/page.tsx`
- И другие страницы редактирования

## Особенности реализации

### 1. Обратная совместимость
- При создании сущности можно передать `locales` для обратной совместимости
- Но рекомендуется создавать сущность без локалей, а затем добавлять их через отдельные endpoints

### 2. Валидация
- Slug должен быть уникальным в пределах locale и tenant
- Нельзя удалить последнюю локаль
- Нельзя создать две локали с одним языком

### 3. UX улучшения
- Показывать индикатор загрузки при операциях с локалями
- Показывать toast уведомления об успехе/ошибке
- Блокировать кнопку удаления для последней локали визуально
- Предлагать редактировать существующую локаль при попытке создать дубликат

### 4. Кэширование
- После создания/обновления/удаления локали инвалидировать кэш основной сущности
- Это обновит список локалей в UI

## Оценка времени

- Этап 1 (Базовая инфраструктура): 4-6 часов
- Этап 2 (API клиенты): 2-3 часа (9 сущностей)
- Этап 3 (Типы DTO): 1-2 часа
- Этап 4 (Обновление форм): 8-12 часов (9 форм)
- Этап 5 (React Query хуки): 2-3 часа
- Этап 6 (Обработка ошибок): 2-3 часа
- Этап 7 (Доступные локали): 1 час
- Этап 8 (Тестирование): 4-6 часов

**Итого:** 24-36 часов работы

## Риски и митигация

### Риск 1: Нарушение обратной совместимости
**Митигация:** Сохранить возможность передачи `locales` при создании, но сделать опциональным

### Риск 2: Сложность миграции существующих данных
**Митигация:** Бэкенд уже поддерживает новую логику, фронтенд нужно только обновить

### Риск 3: Пользователи могут создать сущность без локалей
**Митигация:** Добавить валидацию на бэкенде или предупреждение на фронтенде

### Риск 4: Потеря данных при переходе
**Митигация:** Тщательное тестирование, постепенный rollout

## Чеклист готовности

- [ ] Базовая инфраструктура создана
- [ ] API клиенты для всех сущностей реализованы
- [ ] Типы обновлены
- [ ] Формы обновлены для всех сущностей
- [ ] React Query хуки добавлены
- [ ] Обработка ошибок реализована
- [ ] Компонент LocaleManager протестирован
- [ ] Все формы протестированы
- [ ] Документация обновлена

