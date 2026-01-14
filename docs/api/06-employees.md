# Employees API

> Team members and staff management

---

## Overview

Employees represent team members displayed on the company's "About" or "Team" pages. Features include:
- Multi-language support via `locales`
- Publish/unpublish control
- Association with practice areas
- Photo and contact information
- Sort order for display sequence
- SEO metadata per locale

---

## Data Model

```json
{
  "id": "employee-uuid",
  "tenant_id": "tenant-uuid",
  "photo_url": "https://cdn.example.com/team/john.jpg",
  "email": "john@company.com",
  "phone": "+7 999 123-45-67",
  "is_published": true,
  "sort_order": 0,
  "version": 1,
  "created_at": "2026-01-14T10:00:00Z",
  "updated_at": "2026-01-14T10:00:00Z",
  "locales": [
    {
      "id": "locale-uuid",
      "employee_id": "employee-uuid",
      "locale": "ru",
      "first_name": "Иван",
      "last_name": "Петров",
      "position": "Старший юрист",
      "slug": "ivan-petrov",
      "bio": "<p>Иван специализируется на...</p>",
      "meta_title": "Иван Петров - Старший юрист",
      "meta_description": "Профиль Ивана Петрова..."
    }
  ],
  "practice_areas": [
    { "practice_area_id": "pa-uuid-1" }
  ]
}
```

---

## Admin Endpoints

### GET /api/v1/admin/employees

List all employees with pagination and filters.

**Required Permission:** `employees:read`

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | integer | 1 | Page number |
| `pageSize` | integer | 20 | Items per page |
| `isPublished` | boolean | - | Filter by published status |

**Example Request:**
```bash
GET /api/v1/admin/employees?page=1&isPublished=true
Authorization: Bearer {token}
```

**Success Response (200):**
```json
{
  "items": [
    {
      "id": "employee-uuid",
      "tenant_id": "tenant-uuid",
      "photo_url": "https://cdn.example.com/team/john.jpg",
      "email": "john@company.com",
      "phone": "+7 999 123-45-67",
      "is_published": true,
      "sort_order": 0,
      "version": 1,
      "created_at": "2026-01-14T10:00:00Z",
      "updated_at": "2026-01-14T10:00:00Z",
      "locales": [...],
      "practice_areas": [...]
    }
  ],
  "total": 15,
  "page": 1,
  "page_size": 20
}
```

---

### POST /api/v1/admin/employees

Create a new employee.

**Required Permission:** `employees:create`

**Request Body:**
```json
{
  "photo_url": "https://cdn.example.com/team/john.jpg",
  "email": "john@company.com",
  "phone": "+7 999 123-45-67",
  "is_published": false,
  "sort_order": 0,
  "practice_area_ids": ["pa-uuid-1", "pa-uuid-2"],
  "locales": [
    {
      "locale": "ru",
      "first_name": "Иван",
      "last_name": "Петров",
      "position": "Старший юрист",
      "slug": "ivan-petrov",
      "bio": "<p>Иван специализируется на корпоративном праве...</p>",
      "meta_title": "Иван Петров - Старший юрист | Компания",
      "meta_description": "Профиль Ивана Петрова - старшего юриста компании"
    },
    {
      "locale": "en",
      "first_name": "Ivan",
      "last_name": "Petrov",
      "position": "Senior Lawyer",
      "slug": "ivan-petrov",
      "bio": "<p>Ivan specializes in corporate law...</p>",
      "meta_title": "Ivan Petrov - Senior Lawyer | Company",
      "meta_description": "Profile of Ivan Petrov - senior lawyer"
    }
  ]
}
```

**Field Validation:**
| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `photo_url` | string | No | Max 500 chars |
| `email` | string | No | Valid email, max 255 chars |
| `phone` | string | No | Max 50 chars |
| `is_published` | boolean | No | Default: false |
| `sort_order` | integer | No | Default: 0 |
| `practice_area_ids` | UUID[] | No | Must exist |
| `locales` | array | Yes | At least 1 locale |

**Locale Field Validation:**
| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `locale` | string | Yes | 2-5 chars |
| `first_name` | string | Yes | 1-100 chars |
| `last_name` | string | Yes | 1-100 chars |
| `position` | string | No | Max 200 chars |
| `slug` | string | Yes | 2-255 chars, URL-safe |
| `bio` | string | No | HTML content |
| `meta_title` | string | No | Max 70 chars |
| `meta_description` | string | No | Max 160 chars |

**Success Response (201):** Created employee object.

---

### GET /api/v1/admin/employees/{employee_id}

Get employee by ID.

**Required Permission:** `employees:read`

**Success Response (200):** Full employee object.

---

### PATCH /api/v1/admin/employees/{employee_id}

Update employee.

**Required Permission:** `employees:update`

**Request Body:**
```json
{
  "photo_url": "https://cdn.example.com/team/john-new.jpg",
  "is_published": true,
  "sort_order": 1,
  "practice_area_ids": ["pa-uuid-1"],
  "version": 1
}
```

**Success Response (200):** Updated employee object.

---

### DELETE /api/v1/admin/employees/{employee_id}

Soft delete employee.

**Required Permission:** `employees:delete`

**Response:** `204 No Content`

---

## Public Endpoints

### GET /api/v1/public/employees

List published employees.

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `tenant_id` | UUID | Yes | Tenant ID |
| `locale` | string | No | Locale code (default: `ru`) |
| `practice_area` | string | No | Filter by practice area slug |

**Example Request:**
```bash
GET /api/v1/public/employees?tenant_id={uuid}&locale=ru
```

**Success Response (200):**
```json
[
  {
    "id": "employee-uuid",
    "photo_url": "https://cdn.example.com/team/john.jpg",
    "email": "john@company.com",
    "first_name": "Иван",
    "last_name": "Петров",
    "position": "Старший юрист",
    "slug": "ivan-petrov",
    "bio": null,
    "sort_order": 0,
    "practice_areas": [
      {
        "id": "pa-uuid",
        "title": "Корпоративное право",
        "slug": "corporate-law"
      }
    ]
  }
]
```

**Note:** `bio` is `null` in list view for performance.

---

### GET /api/v1/public/employees/{slug}

Get published employee by slug.

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `tenant_id` | UUID | Yes | Tenant ID |
| `locale` | string | No | Locale code (default: `ru`) |

**Success Response (200):**
```json
{
  "id": "employee-uuid",
  "photo_url": "https://cdn.example.com/team/john.jpg",
  "email": "john@company.com",
  "phone": "+7 999 123-45-67",
  "first_name": "Иван",
  "last_name": "Петров",
  "position": "Старший юрист",
  "slug": "ivan-petrov",
  "bio": "<p>Иван специализируется на корпоративном праве...</p>",
  "meta_title": "Иван Петров - Старший юрист",
  "meta_description": "Профиль Ивана Петрова...",
  "practice_areas": [...]
}
```

---

## Practice Areas

Practice areas are specializations or departments that employees can be associated with.

### POST /api/v1/admin/practice-areas

Create a practice area.

**Required Permission:** `services:create`

**Request Body:**
```json
{
  "icon": "⚖️",
  "is_published": true,
  "sort_order": 0,
  "locales": [
    {
      "locale": "ru",
      "title": "Корпоративное право",
      "slug": "korporativnoe-pravo",
      "description": "Специализация на корпоративных вопросах"
    }
  ]
}
```

**Note:** Currently only CREATE is implemented. See [gap-analysis.md](./gap-analysis.md) for full CRUD requirements.

---

## Frontend Integration

### Team Page

```jsx
const TeamPage = () => {
  const [employees, setEmployees] = useState([])
  const [filter, setFilter] = useState(null)
  
  useEffect(() => {
    const params = filter ? `?practice_area=${filter}` : ''
    api.get(`/public/employees${params}&tenant_id=${tenantId}`)
      .then(({ data }) => setEmployees(data))
  }, [filter])
  
  return (
    <div>
      <PracticeAreaFilter value={filter} onChange={setFilter} />
      <TeamGrid employees={employees} />
    </div>
  )
}

const TeamGrid = ({ employees }) => (
  <Grid columns={{ sm: 2, md: 3, lg: 4 }}>
    {employees.map(emp => (
      <EmployeeCard key={emp.id} employee={emp} />
    ))}
  </Grid>
)

const EmployeeCard = ({ employee }) => (
  <Card>
    <Avatar 
      src={employee.photo_url} 
      alt={`${employee.first_name} ${employee.last_name}`}
    />
    <Name>{employee.first_name} {employee.last_name}</Name>
    <Position>{employee.position}</Position>
    <PracticeAreas>
      {employee.practice_areas.map(pa => (
        <Tag key={pa.id}>{pa.title}</Tag>
      ))}
    </PracticeAreas>
    <Link href={`/team/${employee.slug}`}>View Profile</Link>
  </Card>
)
```

### Admin Employee Form

```jsx
const EmployeeForm = ({ employee, onSave }) => {
  const [practiceAreas, setPracticeAreas] = useState([])
  
  useEffect(() => {
    api.get('/public/practice-areas')
      .then(({ data }) => setPracticeAreas(data))
  }, [])
  
  const handleSubmit = async (formData) => {
    if (employee) {
      await api.patch(`/admin/employees/${employee.id}`, {
        ...formData,
        version: employee.version
      })
    } else {
      await api.post('/admin/employees', formData)
    }
    onSave()
  }
  
  return (
    <Form onSubmit={handleSubmit}>
      <ImageUpload name="photo_url" label="Photo" />
      <Input name="email" type="email" label="Email" />
      <Input name="phone" label="Phone" />
      
      <MultiSelect 
        name="practice_area_ids" 
        label="Practice Areas"
        options={practiceAreas.map(pa => ({
          value: pa.id,
          label: pa.locales[0]?.title
        }))}
      />
      
      <Switch name="is_published" label="Published" />
      <NumberInput name="sort_order" label="Sort Order" />
      
      <LocaleTabs>
        <Input name="first_name" label="First Name" required />
        <Input name="last_name" label="Last Name" required />
        <Input name="position" label="Position" />
        <Input name="slug" label="URL Slug" required />
        <RichEditor name="bio" label="Biography" />
        <Input name="meta_title" label="SEO Title" />
        <Textarea name="meta_description" label="SEO Description" />
      </LocaleTabs>
      
      <Button type="submit">Save</Button>
    </Form>
  )
}
```

