# Leads & Inquiries API

> Customer inquiries, contact forms, and lead management

---

## Overview

The Leads module manages customer inquiries submitted through website forms. Features include:
- Inquiry form configuration
- Inquiry status tracking
- User assignment
- UTM parameter tracking
- Analytics and reporting
- Notes/comments per inquiry

---

## Inquiry Status Flow

```
┌─────────┐    ┌─────────────┐    ┌───────────┐    ┌───────────┐
│   NEW   │───▶│ IN_PROGRESS │───▶│ CONTACTED │───▶│ COMPLETED │
└─────────┘    └─────────────┘    └───────────┘    └───────────┘
     │                                                    │
     │                                                    │
     ▼                                                    ▼
┌─────────┐                                         ┌─────────┐
│  SPAM   │                                         │CANCELLED│
└─────────┘                                         └─────────┘
```

| Status | Description |
|--------|-------------|
| `new` | New inquiry, not yet processed |
| `in_progress` | Being handled by staff |
| `contacted` | Customer has been contacted |
| `completed` | Inquiry resolved |
| `spam` | Marked as spam |
| `cancelled` | Cancelled by user or system |

---

## Inquiry Forms

### GET /api/v1/admin/inquiry-forms

List all inquiry forms.

**Required Permission:** `inquiries:read`

**Success Response (200):**
```json
[
  {
    "id": "form-uuid",
    "tenant_id": "tenant-uuid",
    "name": "Contact Form",
    "slug": "contact",
    "description": "Main contact form",
    "fields": [
      {
        "name": "name",
        "type": "text",
        "label": "Your Name",
        "required": true
      },
      {
        "name": "email",
        "type": "email",
        "label": "Email Address",
        "required": true
      },
      {
        "name": "phone",
        "type": "tel",
        "label": "Phone",
        "required": false
      },
      {
        "name": "message",
        "type": "textarea",
        "label": "Message",
        "required": true
      }
    ],
    "settings": {
      "notification_email": "sales@company.com",
      "auto_reply": true,
      "redirect_url": "/thank-you"
    },
    "is_active": true,
    "created_at": "2026-01-01T00:00:00Z",
    "updated_at": "2026-01-01T00:00:00Z"
  }
]
```

---

### POST /api/v1/admin/inquiry-forms

Create a new inquiry form.

**Required Permission:** `settings:update`

**Request Body:**
```json
{
  "name": "Consultation Request",
  "slug": "consultation",
  "description": "Form for requesting a consultation",
  "fields": [
    {
      "name": "name",
      "type": "text",
      "label": "Full Name",
      "required": true,
      "placeholder": "John Doe"
    },
    {
      "name": "email",
      "type": "email",
      "label": "Email",
      "required": true
    },
    {
      "name": "service",
      "type": "select",
      "label": "Service Interest",
      "required": true,
      "options": ["Corporate Law", "Tax", "Litigation"]
    }
  ],
  "settings": {
    "notification_email": "consultations@company.com",
    "auto_reply": true
  },
  "is_active": true
}
```

**Field Types:**
| Type | Description |
|------|-------------|
| `text` | Single-line text input |
| `email` | Email input with validation |
| `tel` | Phone number input |
| `textarea` | Multi-line text |
| `select` | Dropdown selection |
| `checkbox` | Boolean checkbox |
| `radio` | Radio button group |

---

### PATCH /api/v1/admin/inquiry-forms/{form_id}

Update inquiry form.

**Required Permission:** `settings:update`

---

### DELETE /api/v1/admin/inquiry-forms/{form_id}

Soft delete inquiry form.

**Required Permission:** `settings:update`

---

## Inquiries

### GET /api/v1/admin/inquiries

List all inquiries with pagination and filters.

**Required Permission:** `inquiries:read`

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | integer | 1 | Page number |
| `pageSize` | integer | 20 | Items per page |
| `status` | string | - | Filter by status |
| `formId` | UUID | - | Filter by form |
| `assignedTo` | UUID | - | Filter by assigned user |
| `utmSource` | string | - | Filter by UTM source |

**Example Request:**
```bash
GET /api/v1/admin/inquiries?status=new&page=1
Authorization: Bearer {token}
```

**Success Response (200):**
```json
{
  "items": [
    {
      "id": "inquiry-uuid",
      "tenant_id": "tenant-uuid",
      "form_id": "form-uuid",
      "status": "new",
      "data": {
        "name": "Иван Петров",
        "email": "ivan@example.com",
        "phone": "+7 999 123-45-67",
        "message": "Хочу узнать о ваших услугах..."
      },
      "assigned_to": null,
      "notes": null,
      "utm_source": "google",
      "utm_medium": "cpc",
      "utm_campaign": "brand",
      "utm_term": null,
      "utm_content": null,
      "referrer": "https://google.com",
      "ip_address": "192.168.1.1",
      "user_agent": "Mozilla/5.0...",
      "created_at": "2026-01-14T10:00:00Z",
      "updated_at": "2026-01-14T10:00:00Z"
    }
  ],
  "total": 156,
  "page": 1,
  "page_size": 20
}
```

---

### GET /api/v1/admin/inquiries/{inquiry_id}

Get inquiry by ID.

**Required Permission:** `inquiries:read`

**Success Response (200):** Full inquiry object.

---

### PATCH /api/v1/admin/inquiries/{inquiry_id}

Update inquiry (status, assignment, notes).

**Required Permission:** `inquiries:update`

**Request Body:**
```json
{
  "status": "in_progress",
  "assigned_to": "user-uuid",
  "notes": "Called customer on 14.01.2026. Scheduled follow-up for 16.01."
}
```

**Field Validation:**
| Field | Type | Description |
|-------|------|-------------|
| `status` | string | New status value |
| `assigned_to` | UUID | User to assign (or null to unassign) |
| `notes` | string | Internal notes |

**Success Response (200):** Updated inquiry object.

---

### DELETE /api/v1/admin/inquiries/{inquiry_id}

Soft delete inquiry.

**Required Permission:** `inquiries:delete`

**Response:** `204 No Content`

---

### GET /api/v1/admin/inquiries/analytics

Get inquiry analytics summary.

**Required Permission:** `inquiries:read`

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `days` | integer | 30 | Number of days to analyze |

**Example Request:**
```bash
GET /api/v1/admin/inquiries/analytics?days=30
Authorization: Bearer {token}
```

**Success Response (200):**
```json
{
  "period": {
    "start": "2025-12-15T00:00:00Z",
    "end": "2026-01-14T23:59:59Z",
    "days": 30
  },
  "summary": {
    "total": 156,
    "new": 23,
    "in_progress": 12,
    "completed": 98,
    "spam": 15
  },
  "by_form": [
    {
      "form_id": "form-uuid-1",
      "form_name": "Contact Form",
      "count": 89
    },
    {
      "form_id": "form-uuid-2",
      "form_name": "Consultation Request",
      "count": 67
    }
  ],
  "by_source": [
    { "source": "google", "count": 78 },
    { "source": "direct", "count": 45 },
    { "source": "facebook", "count": 33 }
  ],
  "by_day": [
    { "date": "2026-01-14", "count": 8 },
    { "date": "2026-01-13", "count": 5 },
    { "date": "2026-01-12", "count": 12 }
  ]
}
```

---

## Public Endpoint

### POST /api/v1/public/inquiries

Submit an inquiry (public form submission).

**Rate Limit:** 3 requests per 60 seconds per IP

**Request Body:**
```json
{
  "tenant_id": "tenant-uuid",
  "form_slug": "contact",
  "data": {
    "name": "Иван Петров",
    "email": "ivan@example.com",
    "phone": "+7 999 123-45-67",
    "message": "Хочу узнать о ваших услугах..."
  },
  "utm_source": "google",
  "utm_medium": "cpc",
  "utm_campaign": "brand"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Thank you! We will contact you soon."
}
```

**Error Response (422):**
```json
{
  "type": "https://api.cms.local/errors/validation_error",
  "title": "Validation Error",
  "status": 422,
  "detail": "Form validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

**Error Response (429):**
```json
{
  "type": "https://api.cms.local/errors/rate_limit_exceeded",
  "title": "Rate Limit Exceeded",
  "status": 429,
  "detail": "Too many submissions. Please try again later.",
  "retry_after": 60
}
```

---

## Frontend Integration

### Inquiries List with Filters

```jsx
const InquiriesList = () => {
  const [inquiries, setInquiries] = useState([])
  const [filters, setFilters] = useState({
    status: '',
    formId: '',
    page: 1
  })
  
  useEffect(() => {
    const params = new URLSearchParams()
    if (filters.status) params.set('status', filters.status)
    if (filters.formId) params.set('formId', filters.formId)
    params.set('page', filters.page)
    
    api.get(`/admin/inquiries?${params}`)
      .then(({ data }) => setInquiries(data))
  }, [filters])
  
  return (
    <div>
      <Filters>
        <Select 
          value={filters.status} 
          onChange={(v) => setFilters({ ...filters, status: v })}
          options={[
            { value: '', label: 'All Statuses' },
            { value: 'new', label: 'New' },
            { value: 'in_progress', label: 'In Progress' },
            { value: 'completed', label: 'Completed' }
          ]}
        />
      </Filters>
      
      <Table>
        {inquiries.items?.map(inq => (
          <InquiryRow key={inq.id} inquiry={inq} />
        ))}
      </Table>
      
      <Pagination 
        total={inquiries.total}
        page={filters.page}
        pageSize={20}
        onChange={(p) => setFilters({ ...filters, page: p })}
      />
    </div>
  )
}
```

### Kanban Board View

```jsx
const InquiriesKanban = () => {
  const [inquiries, setInquiries] = useState([])
  
  useEffect(() => {
    api.get('/admin/inquiries?pageSize=100')
      .then(({ data }) => setInquiries(data.items))
  }, [])
  
  const columns = ['new', 'in_progress', 'contacted', 'completed']
  
  const groupedByStatus = columns.reduce((acc, status) => {
    acc[status] = inquiries.filter(i => i.status === status)
    return acc
  }, {})
  
  const handleDrop = async (inquiryId, newStatus) => {
    await api.patch(`/admin/inquiries/${inquiryId}`, { status: newStatus })
    // Refresh list
  }
  
  return (
    <Board>
      {columns.map(status => (
        <Column key={status} status={status} onDrop={handleDrop}>
          {groupedByStatus[status].map(inq => (
            <InquiryCard key={inq.id} inquiry={inq} />
          ))}
        </Column>
      ))}
    </Board>
  )
}
```

### Analytics Dashboard

```jsx
const InquiriesAnalytics = () => {
  const [analytics, setAnalytics] = useState(null)
  const [days, setDays] = useState(30)
  
  useEffect(() => {
    api.get(`/admin/inquiries/analytics?days=${days}`)
      .then(({ data }) => setAnalytics(data))
  }, [days])
  
  if (!analytics) return <Loading />
  
  return (
    <Dashboard>
      <StatCards>
        <StatCard title="Total" value={analytics.summary.total} />
        <StatCard title="New" value={analytics.summary.new} color="blue" />
        <StatCard title="Completed" value={analytics.summary.completed} color="green" />
      </StatCards>
      
      <Chart 
        type="line" 
        data={analytics.by_day} 
        xKey="date" 
        yKey="count" 
      />
      
      <PieChart 
        data={analytics.by_source}
        dataKey="count"
        nameKey="source"
      />
    </Dashboard>
  )
}
```

### Public Form Submission

```jsx
const ContactForm = ({ formSlug }) => {
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  
  const handleSubmit = async (formData) => {
    setSubmitting(true)
    try {
      // Get UTM params from URL
      const params = new URLSearchParams(window.location.search)
      
      await api.post('/public/inquiries', {
        tenant_id: TENANT_ID,
        form_slug: formSlug,
        data: formData,
        utm_source: params.get('utm_source'),
        utm_medium: params.get('utm_medium'),
        utm_campaign: params.get('utm_campaign')
      })
      
      setSuccess(true)
    } catch (error) {
      if (error.response?.status === 429) {
        showError('Please wait before submitting again')
      } else {
        showError('Something went wrong. Please try again.')
      }
    } finally {
      setSubmitting(false)
    }
  }
  
  if (success) {
    return <SuccessMessage>Thank you! We'll be in touch soon.</SuccessMessage>
  }
  
  return (
    <Form onSubmit={handleSubmit}>
      <Input name="name" label="Name" required />
      <Input name="email" type="email" label="Email" required />
      <Input name="phone" type="tel" label="Phone" />
      <Textarea name="message" label="Message" required />
      <Button type="submit" loading={submitting}>Send</Button>
    </Form>
  )
}
```

