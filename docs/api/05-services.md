# Services API

> Company services and offerings management

---

## Overview

Services represent the main offerings of the company displayed on the website. Features include:
- Multi-language support via `locales`
- Publish/unpublish control
- Icon and cover image
- Sort order for display sequence
- SEO metadata per locale

---

## Data Model

```json
{
  "id": "service-uuid",
  "tenant_id": "tenant-uuid",
  "icon": "⚖️",
  "cover_image_url": "https://cdn.example.com/services/legal.jpg",
  "is_published": true,
  "sort_order": 0,
  "version": 1,
  "created_at": "2026-01-14T10:00:00Z",
  "updated_at": "2026-01-14T10:00:00Z",
  "locales": [
    {
      "id": "locale-uuid",
      "service_id": "service-uuid",
      "locale": "ru",
      "title": "Юридические услуги",
      "slug": "yuridicheskie-uslugi",
      "short_description": "Полный спектр юридической поддержки",
      "description": "<p>Мы предоставляем...</p>",
      "meta_title": "Юридические услуги | Компания",
      "meta_description": "Профессиональные юридические услуги...",
      "meta_keywords": null
    }
  ]
}
```

---

## Admin Endpoints

### GET /api/v1/admin/services

List all services with pagination and filters.

**Required Permission:** `services:read`

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | integer | 1 | Page number |
| `pageSize` | integer | 20 | Items per page |
| `isPublished` | boolean | - | Filter by published status |

**Example Request:**
```bash
GET /api/v1/admin/services?isPublished=true
Authorization: Bearer {token}
```

**Success Response (200):**
```json
{
  "items": [
    {
      "id": "service-uuid",
      "tenant_id": "tenant-uuid",
      "icon": "⚖️",
      "cover_image_url": "https://cdn.example.com/services/legal.jpg",
      "is_published": true,
      "sort_order": 0,
      "version": 1,
      "created_at": "2026-01-14T10:00:00Z",
      "updated_at": "2026-01-14T10:00:00Z",
      "locales": [...]
    }
  ],
  "total": 8,
  "page": 1,
  "page_size": 20
}
```

---

### POST /api/v1/admin/services

Create a new service.

**Required Permission:** `services:create`

**Request Body:**
```json
{
  "icon": "⚖️",
  "cover_image_url": "https://cdn.example.com/services/legal.jpg",
  "is_published": false,
  "sort_order": 0,
  "locales": [
    {
      "locale": "ru",
      "title": "Юридические услуги",
      "slug": "yuridicheskie-uslugi",
      "short_description": "Полный спектр юридической поддержки",
      "description": "<p>Мы предоставляем полный спектр...</p>",
      "meta_title": "Юридические услуги | Компания",
      "meta_description": "Профессиональные юридические услуги для бизнеса"
    }
  ]
}
```

**Field Validation:**
| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `icon` | string | No | Max 10 chars (emoji) |
| `cover_image_url` | string | No | Max 500 chars |
| `is_published` | boolean | No | Default: false |
| `sort_order` | integer | No | Default: 0 |
| `locales` | array | Yes | At least 1 locale |

**Locale Field Validation:**
| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `locale` | string | Yes | 2-5 chars |
| `title` | string | Yes | 1-255 chars |
| `slug` | string | Yes | 2-255 chars, URL-safe |
| `short_description` | string | No | Max 500 chars |
| `description` | string | No | HTML content |
| `meta_title` | string | No | Max 70 chars |
| `meta_description` | string | No | Max 160 chars |
| `meta_keywords` | string | No | Max 255 chars |

**Success Response (201):** Created service object.

---

### GET /api/v1/admin/services/{service_id}

Get service by ID.

**Required Permission:** `services:read`

**Success Response (200):** Full service object.

---

### PATCH /api/v1/admin/services/{service_id}

Update service.

**Required Permission:** `services:update`

**Request Body:**
```json
{
  "icon": "🏛️",
  "is_published": true,
  "sort_order": 1,
  "version": 1
}
```

**Success Response (200):** Updated service object.

---

### DELETE /api/v1/admin/services/{service_id}

Soft delete service.

**Required Permission:** `services:delete`

**Response:** `204 No Content`

---

## Public Endpoints

### GET /api/v1/public/services

List published services.

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `tenant_id` | UUID | Yes | Tenant ID |
| `locale` | string | No | Locale code (default: `ru`) |

**Success Response (200):**
```json
[
  {
    "id": "service-uuid",
    "icon": "⚖️",
    "cover_image_url": "https://cdn.example.com/services/legal.jpg",
    "title": "Юридические услуги",
    "slug": "yuridicheskie-uslugi",
    "short_description": "Полный спектр юридической поддержки",
    "description": null,
    "sort_order": 0
  }
]
```

**Note:** `description` is `null` in list view. Fetch single service for full content.

---

### GET /api/v1/public/services/{slug}

Get published service by slug.

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `tenant_id` | UUID | Yes | Tenant ID |
| `locale` | string | No | Locale code (default: `ru`) |

**Success Response (200):**
```json
{
  "id": "service-uuid",
  "icon": "⚖️",
  "cover_image_url": "https://cdn.example.com/services/legal.jpg",
  "title": "Юридические услуги",
  "slug": "yuridicheskie-uslugi",
  "short_description": "Полный спектр юридической поддержки",
  "description": "<p>Мы предоставляем полный спектр...</p>",
  "meta_title": "Юридические услуги | Компания",
  "meta_description": "Профессиональные юридические услуги..."
}
```

---

## Frontend Integration

### Services Grid

```jsx
const ServicesGrid = () => {
  const [services, setServices] = useState([])
  
  useEffect(() => {
    api.get('/admin/services?isPublished=true')
      .then(({ data }) => setServices(data.items))
  }, [])
  
  return (
    <Grid columns={3}>
      {services.map(service => (
        <ServiceCard key={service.id} service={service} />
      ))}
    </Grid>
  )
}

const ServiceCard = ({ service }) => {
  const locale = service.locales[0]
  
  return (
    <Card>
      {service.cover_image_url && (
        <Image src={service.cover_image_url} />
      )}
      <Icon>{service.icon}</Icon>
      <Title>{locale?.title}</Title>
      <Description>{locale?.short_description}</Description>
      <Link href={`/services/${locale?.slug}`}>Learn More</Link>
    </Card>
  )
}
```

### Drag-and-Drop Reorder

```javascript
// Update sort order after drag-and-drop
const handleReorder = async (reorderedServices) => {
  const updates = reorderedServices.map((service, index) => ({
    id: service.id,
    sort_order: index,
    version: service.version
  }))
  
  // Batch update (would need bulk endpoint)
  // For now, update one by one
  for (const update of updates) {
    await api.patch(`/admin/services/${update.id}`, {
      sort_order: update.sort_order,
      version: update.version
    })
  }
}
```

