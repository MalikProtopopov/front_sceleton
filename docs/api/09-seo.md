# SEO API

> SEO metadata, redirects, sitemap, and robots.txt management

---

## Overview

The SEO module manages search engine optimization settings including:
- Per-page meta tags (title, description, canonical, robots)
- 301/302 redirects
- Dynamic sitemap generation
- robots.txt configuration

---

## SEO Routes

SEO routes define metadata for specific URL paths.

### GET /api/v1/admin/seo/routes

List all SEO routes with pagination.

**Required Permission:** `seo:read`

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | integer | 1 | Page number |
| `pageSize` | integer | 20 | Items per page |
| `locale` | string | - | Filter by locale |

**Example Request:**
```bash
GET /api/v1/admin/seo/routes?locale=ru&page=1
Authorization: Bearer {token}
```

**Success Response (200):**
```json
{
  "items": [
    {
      "id": "route-uuid",
      "tenant_id": "tenant-uuid",
      "path": "/about",
      "locale": "ru",
      "meta_title": "О компании | Компания",
      "meta_description": "Узнайте больше о нашей компании...",
      "canonical_url": "https://company.com/about",
      "robots": "index, follow",
      "og_title": "О компании",
      "og_description": "Узнайте больше о нашей компании...",
      "og_image": "https://cdn.example.com/og/about.jpg",
      "structured_data": {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": "Компания"
      },
      "created_at": "2026-01-14T10:00:00Z",
      "updated_at": "2026-01-14T10:00:00Z"
    }
  ],
  "total": 25,
  "page": 1,
  "page_size": 20
}
```

---

### PUT /api/v1/admin/seo/routes

Create or update SEO route (upsert by path + locale).

**Required Permission:** `seo:update`

**Request Body:**
```json
{
  "path": "/about",
  "locale": "ru",
  "meta_title": "О компании | Компания",
  "meta_description": "Узнайте больше о нашей компании и наших услугах",
  "canonical_url": "https://company.com/about",
  "robots": "index, follow",
  "og_title": "О компании",
  "og_description": "Узнайте больше о нашей компании",
  "og_image": "https://cdn.example.com/og/about.jpg",
  "structured_data": {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    "name": "О компании"
  }
}
```

**Field Validation:**
| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `path` | string | Yes | URL path (e.g., `/about`) |
| `locale` | string | Yes | 2-5 chars |
| `meta_title` | string | No | Max 70 chars |
| `meta_description` | string | No | Max 160 chars |
| `canonical_url` | string | No | Full URL |
| `robots` | string | No | Robots directive |
| `og_title` | string | No | Max 95 chars |
| `og_description` | string | No | Max 200 chars |
| `og_image` | string | No | Image URL |
| `structured_data` | object | No | JSON-LD schema |

**Success Response (200/201):** Created/updated SEO route object.

**Behavior:**
- If route with same `path` + `locale` exists → update
- Otherwise → create new

---

### PATCH /api/v1/admin/seo/routes/{route_id}

Update existing SEO route by ID.

**Required Permission:** `seo:update`

**Request Body:**
```json
{
  "meta_title": "Updated Title | Company",
  "meta_description": "Updated description"
}
```

**Success Response (200):** Updated route object.

---

### DELETE /api/v1/admin/seo/routes/{route_id}

Delete SEO route.

**Required Permission:** `seo:update`

**Response:** `204 No Content`

---

## Redirects

### GET /api/v1/admin/seo/redirects

List all redirects.

**Required Permission:** `seo:read`

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | integer | 1 | Page number |
| `pageSize` | integer | 20 | Items per page |
| `isActive` | boolean | - | Filter by active status |

**Success Response (200):**
```json
{
  "items": [
    {
      "id": "redirect-uuid",
      "tenant_id": "tenant-uuid",
      "source_path": "/old-page",
      "target_path": "/new-page",
      "status_code": 301,
      "is_active": true,
      "is_regex": false,
      "hit_count": 156,
      "created_at": "2026-01-14T10:00:00Z",
      "updated_at": "2026-01-14T10:00:00Z"
    }
  ],
  "total": 12,
  "page": 1,
  "page_size": 20
}
```

---

### POST /api/v1/admin/seo/redirects

Create a new redirect.

**Required Permission:** `seo:update`

**Request Body:**
```json
{
  "source_path": "/old-article",
  "target_path": "/blog/new-article",
  "status_code": 301,
  "is_active": true,
  "is_regex": false
}
```

**Field Validation:**
| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `source_path` | string | Yes | Source URL path |
| `target_path` | string | Yes | Target URL or path |
| `status_code` | integer | No | 301 or 302 (default: 301) |
| `is_active` | boolean | No | Default: true |
| `is_regex` | boolean | No | Regex pattern matching |

**Success Response (201):** Created redirect object.

---

### GET /api/v1/admin/seo/redirects/{redirect_id}

Get redirect by ID.

**Required Permission:** `seo:read`

---

### PATCH /api/v1/admin/seo/redirects/{redirect_id}

Update redirect.

**Required Permission:** `seo:update`

**Request Body:**
```json
{
  "target_path": "/updated-target",
  "is_active": false
}
```

---

### DELETE /api/v1/admin/seo/redirects/{redirect_id}

Soft delete redirect.

**Required Permission:** `seo:update`

**Response:** `204 No Content`

---

## Public Endpoints

### GET /api/v1/public/seo/meta

Get SEO metadata for a specific path.

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `tenant_id` | UUID | Yes | Tenant ID |
| `path` | string | Yes | URL path |
| `locale` | string | No | Locale code (default: `ru`) |

**Example Request:**
```bash
GET /api/v1/public/seo/meta?tenant_id={uuid}&path=/about&locale=ru
```

**Success Response (200):**
```json
{
  "meta_title": "О компании | Компания",
  "meta_description": "Узнайте больше о нашей компании...",
  "canonical_url": "https://company.com/about",
  "robots": "index, follow",
  "og_title": "О компании",
  "og_description": "Узнайте больше о нашей компании",
  "og_image": "https://cdn.example.com/og/about.jpg",
  "structured_data": {...}
}
```

**404 Response:** If no SEO route exists for path/locale, returns 404.

---

### GET /api/v1/public/sitemap.xml

Get dynamic sitemap.

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `tenant_id` | UUID | Yes | Tenant ID |
| `locale` | string | No | Filter by locale |

**Response:** XML sitemap format

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://company.com/</loc>
    <lastmod>2026-01-14T10:00:00Z</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://company.com/about</loc>
    <lastmod>2026-01-10T08:00:00Z</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://company.com/blog/article-slug</loc>
    <lastmod>2026-01-14T12:30:00Z</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>
</urlset>
```

---

### GET /api/v1/public/robots.txt

Get dynamic robots.txt.

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `tenant_id` | UUID | Yes | Tenant ID |

**Response:** Plain text robots.txt

```
User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/

Sitemap: https://company.com/sitemap.xml
```

---

## Frontend Integration

### SEO Route Editor

```jsx
const SEORouteEditor = ({ route, onSave }) => {
  const [formData, setFormData] = useState(route || {
    path: '',
    locale: 'ru',
    meta_title: '',
    meta_description: '',
    canonical_url: '',
    robots: 'index, follow',
    og_title: '',
    og_description: '',
    og_image: '',
    structured_data: null
  })
  
  const handleSubmit = async () => {
    await api.put('/admin/seo/routes', formData)
    onSave()
  }
  
  const titleLength = formData.meta_title?.length || 0
  const descLength = formData.meta_description?.length || 0
  
  return (
    <Form onSubmit={handleSubmit}>
      <Input name="path" label="URL Path" required placeholder="/about" />
      <Select 
        name="locale" 
        label="Locale" 
        options={[
          { value: 'ru', label: 'Russian' },
          { value: 'en', label: 'English' }
        ]}
      />
      
      <Section title="Meta Tags">
        <Input 
          name="meta_title" 
          label="Meta Title"
          maxLength={70}
          hint={`${titleLength}/70 characters`}
          warning={titleLength > 60}
        />
        <Textarea 
          name="meta_description" 
          label="Meta Description"
          maxLength={160}
          hint={`${descLength}/160 characters`}
          warning={descLength > 155}
        />
        <Input name="canonical_url" label="Canonical URL" />
        <Select 
          name="robots" 
          label="Robots"
          options={[
            { value: 'index, follow', label: 'Index, Follow' },
            { value: 'noindex, follow', label: 'Noindex, Follow' },
            { value: 'index, nofollow', label: 'Index, Nofollow' },
            { value: 'noindex, nofollow', label: 'Noindex, Nofollow' }
          ]}
        />
      </Section>
      
      <Section title="Open Graph">
        <Input name="og_title" label="OG Title" />
        <Textarea name="og_description" label="OG Description" />
        <ImagePicker name="og_image" label="OG Image" />
      </Section>
      
      <Section title="Structured Data">
        <JsonEditor 
          name="structured_data" 
          label="JSON-LD Schema"
          hint="Optional structured data for search engines"
        />
      </Section>
      
      <Button type="submit">Save SEO Settings</Button>
    </Form>
  )
}
```

### Redirect Manager

```jsx
const RedirectManager = () => {
  const [redirects, setRedirects] = useState([])
  const [showForm, setShowForm] = useState(false)
  
  useEffect(() => {
    loadRedirects()
  }, [])
  
  const loadRedirects = async () => {
    const { data } = await api.get('/admin/seo/redirects')
    setRedirects(data.items)
  }
  
  const handleCreate = async (formData) => {
    await api.post('/admin/seo/redirects', formData)
    setShowForm(false)
    loadRedirects()
  }
  
  const handleDelete = async (id) => {
    if (confirm('Delete this redirect?')) {
      await api.delete(`/admin/seo/redirects/${id}`)
      loadRedirects()
    }
  }
  
  const handleToggle = async (redirect) => {
    await api.patch(`/admin/seo/redirects/${redirect.id}`, {
      is_active: !redirect.is_active
    })
    loadRedirects()
  }
  
  return (
    <div>
      <Header>
        <h1>Redirects</h1>
        <Button onClick={() => setShowForm(true)}>Add Redirect</Button>
      </Header>
      
      <Table>
        <thead>
          <tr>
            <th>Source</th>
            <th>Target</th>
            <th>Code</th>
            <th>Hits</th>
            <th>Active</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {redirects.map(r => (
            <tr key={r.id}>
              <td>{r.source_path}</td>
              <td>{r.target_path}</td>
              <td>{r.status_code}</td>
              <td>{r.hit_count}</td>
              <td>
                <Toggle 
                  checked={r.is_active} 
                  onChange={() => handleToggle(r)}
                />
              </td>
              <td>
                <Button onClick={() => handleDelete(r.id)}>Delete</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
      
      {showForm && (
        <Modal onClose={() => setShowForm(false)}>
          <RedirectForm onSubmit={handleCreate} />
        </Modal>
      )}
    </div>
  )
}
```

### SEO Preview Component

```jsx
const SEOPreview = ({ meta }) => {
  return (
    <Card>
      <Title>Google Search Preview</Title>
      
      <GooglePreview>
        <PreviewTitle>
          {meta.meta_title || 'Page Title'}
        </PreviewTitle>
        <PreviewUrl>
          {meta.canonical_url || 'https://company.com/page'}
        </PreviewUrl>
        <PreviewDescription>
          {meta.meta_description || 'Page description will appear here...'}
        </PreviewDescription>
      </GooglePreview>
      
      <Title>Social Media Preview</Title>
      
      <SocialPreview>
        {meta.og_image && <PreviewImage src={meta.og_image} />}
        <PreviewContent>
          <PreviewOgTitle>{meta.og_title || meta.meta_title}</PreviewOgTitle>
          <PreviewOgDesc>{meta.og_description || meta.meta_description}</PreviewOgDesc>
        </PreviewContent>
      </SocialPreview>
    </Card>
  )
}
```

---

## Best Practices

### Meta Title
- Keep under 60 characters
- Include primary keyword
- Brand name at end: "Page Title | Company"

### Meta Description
- Keep under 155 characters
- Include call-to-action
- Unique per page

### Canonical URLs
- Always use absolute URLs
- Prevent duplicate content
- Point to preferred version

### Robots Directives
| Directive | Use Case |
|-----------|----------|
| `index, follow` | Normal pages (default) |
| `noindex, follow` | Search pages, filters |
| `index, nofollow` | User-generated content |
| `noindex, nofollow` | Admin, private pages |

### Redirects
- Use 301 for permanent moves
- Use 302 for temporary changes
- Avoid redirect chains
- Monitor hit counts

