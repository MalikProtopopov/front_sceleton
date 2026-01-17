# Cases (Case Studies) API

> Portfolio items, success stories, and project showcases

---

## Implementation Status

> **WARNING:** Cases API is **NOT YET IMPLEMENTED** in the backend.  
> The database model exists (`backend/app/modules/content/models.py`) but there are no API endpoints.
> This document describes the **planned** API structure based on the data model.

---

## Overview

Cases (Case Studies) represent successful projects, portfolio items, or client success stories. Features include:
- Multi-language support via `locales`
- Service linking (many-to-many with Services)
- Review association (one-to-many with Reviews)
- Publishing workflow (draft → published → archived)
- Featured case highlighting
- Client information (name, project year, duration)
- SEO metadata per locale

---

## Data Model

### Case Entity

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Unique identifier |
| `tenant_id` | UUID | Tenant ownership |
| `status` | string | `draft`, `published`, `archived` |
| `published_at` | datetime | Publication timestamp |
| `cover_image_url` | string | Featured image URL (max 500 chars) |
| `client_name` | string | Client/company name (optional, max 255 chars) |
| `project_year` | integer | Year the project was completed |
| `project_duration` | string | Duration description (max 100 chars) |
| `is_featured` | boolean | Highlighted on homepage/portfolio |
| `sort_order` | integer | Display ordering |
| `version` | integer | Optimistic locking version |
| `created_at` | datetime | Creation timestamp |
| `updated_at` | datetime | Last update timestamp |
| `deleted_at` | datetime | Soft delete timestamp |

### CaseLocale Entity

| Field | Type | Description |
|-------|------|-------------|
| `id` | UUID | Unique identifier |
| `case_id` | UUID | Parent case reference |
| `locale` | string | Locale code (2-5 chars) |
| `title` | string | Case title (max 255 chars) |
| `slug` | string | URL-friendly identifier |
| `excerpt` | string | Short description (max 500 chars) |
| `description` | text | Full case description |
| `results` | text | Project outcomes/results |
| `meta_title` | string | SEO title (max 70 chars) |
| `meta_description` | string | SEO description (max 160 chars) |

---

## State Machine

```
                    ┌──────────────┐
                    │    DRAFT     │
                    └──────┬───────┘
                           │
              ┌────────────┼────────────┐
              │            │            │
              ▼            │            ▼
    ┌──────────────┐       │   ┌──────────────┐
    │  PUBLISHED   │◀──────┘   │   ARCHIVED   │
    └──────┬───────┘           └──────────────┘
           │                          ▲
           │                          │
           └──────────────────────────┘
```

| From | To | Action | Endpoint |
|------|-----|--------|----------|
| Draft | Published | Publish | `POST /cases/{id}/publish` |
| Published | Draft | Unpublish | `POST /cases/{id}/unpublish` |
| Any | Archived | Archive | `PATCH` with `status: archived` |
| Archived | Draft | Restore | `PATCH` with `status: draft` |

---

## Planned Admin Endpoints

### GET /api/v1/admin/cases

List all cases with pagination and filters.

**Required Permission:** `cases:read` (to be created)

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | integer | 1 | Page number |
| `pageSize` | integer | 20 | Items per page (max 100) |
| `status` | string | - | Filter: `draft`, `published`, `archived` |
| `serviceId` | UUID | - | Filter by linked service |
| `featured` | boolean | - | Filter by featured status |

**Expected Response (200):**
```json
{
  "items": [
    {
      "id": "case-uuid-1",
      "tenant_id": "tenant-uuid",
      "status": "published",
      "cover_image_url": "https://cdn.example.com/cases/cover.jpg",
      "client_name": "TechCorp Inc.",
      "project_year": 2025,
      "project_duration": "6 months",
      "is_featured": true,
      "sort_order": 0,
      "version": 2,
      "published_at": "2025-06-15T10:00:00Z",
      "created_at": "2025-01-14T10:00:00Z",
      "updated_at": "2025-06-15T10:00:00Z",
      "locales": [
        {
          "id": "locale-uuid-1",
          "case_id": "case-uuid-1",
          "locale": "ru",
          "title": "Редизайн корпоративного портала",
          "slug": "redizajn-korporativnogo-portala",
          "excerpt": "Полная переработка UX/UI для крупного клиента",
          "description": "<p>Подробное описание проекта...</p>",
          "results": "<p>Увеличение конверсии на 45%...</p>",
          "meta_title": "Кейс: Редизайн портала",
          "meta_description": "Как мы увеличили конверсию на 45%",
          "created_at": "2025-01-14T10:00:00Z",
          "updated_at": "2025-06-15T10:00:00Z"
        }
      ],
      "services": [
        { "service_id": "service-uuid-1" },
        { "service_id": "service-uuid-2" }
      ]
    }
  ],
  "total": 15,
  "page": 1,
  "page_size": 20
}
```

---

### POST /api/v1/admin/cases

Create a new case study.

**Required Permission:** `cases:create`

**Request Body:**
```json
{
  "status": "draft",
  "cover_image_url": "https://cdn.example.com/cases/cover.jpg",
  "client_name": "TechCorp Inc.",
  "project_year": 2025,
  "project_duration": "6 months",
  "is_featured": false,
  "sort_order": 0,
  "service_ids": ["service-uuid-1", "service-uuid-2"],
  "locales": [
    {
      "locale": "ru",
      "title": "Редизайн корпоративного портала",
      "slug": "redizajn-korporativnogo-portala",
      "excerpt": "Полная переработка UX/UI для крупного клиента",
      "description": "<p>Подробное описание проекта...</p>",
      "results": "<p>Результаты работы...</p>",
      "meta_title": "Кейс: Редизайн портала",
      "meta_description": "Как мы увеличили конверсию на 45%"
    },
    {
      "locale": "en",
      "title": "Corporate Portal Redesign",
      "slug": "corporate-portal-redesign",
      "excerpt": "Complete UX/UI overhaul for enterprise client",
      "description": "<p>Detailed project description...</p>",
      "results": "<p>Work results...</p>",
      "meta_title": "Case: Portal Redesign",
      "meta_description": "How we increased conversion by 45%"
    }
  ]
}
```

**Field Validation:**
| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `status` | string | No | Default: `draft`. Values: `draft`, `published`, `archived` |
| `cover_image_url` | string | No | Max 500 chars |
| `client_name` | string | No | Max 255 chars |
| `project_year` | integer | No | Valid year |
| `project_duration` | string | No | Max 100 chars |
| `is_featured` | boolean | No | Default: false |
| `sort_order` | integer | No | Default: 0 |
| `service_ids` | UUID[] | No | Array of service UUIDs |
| `locales` | array | Yes | At least 1 locale required |

**Locale Field Validation:**
| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `locale` | string | Yes | 2-5 chars (e.g., `ru`, `en`) |
| `title` | string | Yes | 1-255 chars |
| `slug` | string | Yes | 2-255 chars, URL-safe |
| `excerpt` | string | No | Max 500 chars |
| `description` | string | No | HTML content |
| `results` | string | No | HTML content |
| `meta_title` | string | No | Max 70 chars |
| `meta_description` | string | No | Max 160 chars |

---

### GET /api/v1/admin/cases/{case_id}

Get case by ID.

**Required Permission:** `cases:read`

**Path Parameters:**
| Parameter | Type | Description |
|-----------|------|-------------|
| `case_id` | UUID | Case ID |

---

### PATCH /api/v1/admin/cases/{case_id}

Update case.

**Required Permission:** `cases:update`

**Request Body:**
```json
{
  "client_name": "TechCorp International",
  "is_featured": true,
  "service_ids": ["service-uuid-1"],
  "version": 2
}
```

**Note:** `version` field is required for optimistic locking.

---

### POST /api/v1/admin/cases/{case_id}/publish

Publish a case study.

**Required Permission:** `cases:publish`

---

### POST /api/v1/admin/cases/{case_id}/unpublish

Unpublish a case study (move to draft).

**Required Permission:** `cases:publish`

---

### DELETE /api/v1/admin/cases/{case_id}

Soft delete a case.

**Required Permission:** `cases:delete`

**Response:** `204 No Content`

---

## Planned Public Endpoints

### GET /api/v1/public/cases

List published cases for public display.

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `tenant_id` | UUID | Yes | Tenant ID |
| `locale` | string | No | Locale code (default: `ru`) |
| `page` | integer | No | Page number |
| `pageSize` | integer | No | Items per page |
| `serviceSlug` | string | No | Filter by service slug |
| `featured` | boolean | No | Filter featured only |

**Expected Response (200):**
```json
{
  "items": [
    {
      "id": "case-uuid",
      "slug": "corporate-portal-redesign",
      "title": "Corporate Portal Redesign",
      "excerpt": "Complete UX/UI overhaul for enterprise client",
      "description": null,
      "results": null,
      "cover_image_url": "https://cdn.example.com/cases/cover.jpg",
      "client_name": "TechCorp Inc.",
      "project_year": 2025,
      "project_duration": "6 months",
      "is_featured": true,
      "published_at": "2025-06-15T10:00:00Z",
      "meta_title": "Case: Portal Redesign",
      "meta_description": "How we increased conversion by 45%",
      "services": [
        {
          "id": "service-uuid",
          "slug": "web-development",
          "title": "Web Development"
        }
      ]
    }
  ],
  "total": 15,
  "page": 1,
  "page_size": 20
}
```

**Note:** `description` and `results` are `null` in list view for performance.

---

### GET /api/v1/public/cases/{slug}

Get published case by slug.

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `tenant_id` | UUID | Yes | Tenant ID |
| `locale` | string | No | Locale code (default: `ru`) |

**Expected Response (200):**
```json
{
  "id": "case-uuid",
  "slug": "corporate-portal-redesign",
  "title": "Corporate Portal Redesign",
  "excerpt": "Complete UX/UI overhaul for enterprise client",
  "description": "<p>Full project description...</p>",
  "results": "<p>Detailed results and metrics...</p>",
  "cover_image_url": "https://cdn.example.com/cases/cover.jpg",
  "client_name": "TechCorp Inc.",
  "project_year": 2025,
  "project_duration": "6 months",
  "is_featured": true,
  "published_at": "2025-06-15T10:00:00Z",
  "meta_title": "Case: Portal Redesign",
  "meta_description": "How we increased conversion by 45%",
  "services": [...],
  "reviews": [
    {
      "id": "review-uuid",
      "rating": 5,
      "author_name": "John Doe",
      "author_company": "TechCorp Inc.",
      "content": "Excellent work on our portal..."
    }
  ]
}
```

---

## Relations

### Cases ↔ Services

Many-to-many relationship via `case_service_links` table.

```
┌─────────┐       ┌──────────────────┐       ┌──────────┐
│  Cases  │──────▶│ CaseServiceLinks │◀──────│ Services │
└─────────┘       └──────────────────┘       └──────────┘
```

**Usage:** Show which services were used in the case study.

### Cases ↔ Reviews

One-to-many relationship. Reviews can optionally be linked to a specific case.

```
┌─────────┐       ┌─────────┐
│  Cases  │◀──────│ Reviews │
└─────────┘       └─────────┘
          (optional FK)
```

**Usage:** Display client testimonials specific to a case study.

---

## Frontend Integration

### Cases List Page

```javascript
// Fetch cases with filters
const fetchCases = async (filters = {}) => {
  const params = new URLSearchParams({
    page: filters.page || 1,
    pageSize: filters.pageSize || 20,
    ...(filters.status && { status: filters.status }),
    ...(filters.serviceId && { serviceId: filters.serviceId }),
    ...(filters.featured !== undefined && { featured: filters.featured })
  })
  
  const { data } = await api.get(`/admin/cases?${params}`)
  return data
}

// Status badge colors
const statusColors = {
  draft: 'gray',
  published: 'green',
  archived: 'orange'
}
```

### Case Editor

```javascript
// Create case with services
const createCase = async (caseData) => {
  const { data } = await api.post('/admin/cases', caseData)
  return data
}

// Update case with optimistic locking
const updateCase = async (id, updates, currentVersion) => {
  try {
    const { data } = await api.patch(`/admin/cases/${id}`, {
      ...updates,
      version: currentVersion
    })
    return data
  } catch (error) {
    if (error.response?.status === 409) {
      throw new ConflictError('Case was modified by another user')
    }
    throw error
  }
}

// Toggle featured status
const toggleFeatured = async (id, isFeatured, version) => {
  return updateCase(id, { is_featured: !isFeatured }, version)
}
```

### Public Portfolio Page

```javascript
// Fetch published cases for portfolio
const fetchPortfolio = async (locale = 'ru', page = 1) => {
  const params = new URLSearchParams({
    tenant_id: TENANT_ID,
    locale,
    page,
    pageSize: 12
  })
  
  const { data } = await fetch(`/api/v1/public/cases?${params}`)
  return data
}

// Fetch single case with related reviews
const fetchCaseBySlug = async (slug, locale = 'ru') => {
  const params = new URLSearchParams({
    tenant_id: TENANT_ID,
    locale
  })
  
  const { data } = await fetch(`/api/v1/public/cases/${slug}?${params}`)
  return data
}
```

---

## Implementation Notes

To implement Cases API, the following steps are required:

1. **Create Pydantic Schemas** (`backend/app/modules/content/schemas.py`):
   - `CaseLocaleCreate`, `CaseLocaleResponse`
   - `CaseCreate`, `CaseUpdate`, `CaseResponse`
   - `CasePublicResponse`, `CaseListResponse`

2. **Create CaseService** (`backend/app/modules/content/service.py`):
   - `list_cases()`, `get_by_id()`, `get_by_slug()`
   - `create()`, `update()`, `publish()`, `unpublish()`
   - `soft_delete()`

3. **Add Router Endpoints** (`backend/app/modules/content/router.py`):
   - Admin CRUD endpoints
   - Public list and detail endpoints
   - Publish/unpublish actions

4. **Add Permissions** to seed data:
   - `cases:read`, `cases:create`, `cases:update`, `cases:delete`, `cases:publish`

5. **Add Feature Flag** (optional):
   - `cases_module` flag already exists in `AVAILABLE_FEATURES`

