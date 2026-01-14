# Screen-to-API Mapping

> Mapping admin panel screens to backend API endpoints

This document maps each admin UI screen from the UX specification to the corresponding backend API endpoints.

---

## Dashboard

**Screen URL:** `/admin`

| User Action | HTTP Method | Endpoint | Query Params | Notes |
|-------------|-------------|----------|--------------|-------|
| Load overview stats | - | **GAP** | - | Endpoint needed: `GET /api/v1/admin/dashboard` |
| Load recent activity | - | **GAP** | - | Needs audit log router |

**Missing Endpoints:**
- Dashboard statistics summary
- Recent activity feed from audit logs

---

## Content: Articles

### Articles List

**Screen URL:** `/admin/articles`

| User Action | HTTP Method | Endpoint | Query Params | Notes |
|-------------|-------------|----------|--------------|-------|
| Load list | GET | `/api/v1/admin/articles` | `page`, `pageSize` | |
| Search articles | GET | `/api/v1/admin/articles` | `search` | **GAP**: search not implemented |
| Filter by status | GET | `/api/v1/admin/articles` | `status=draft\|published\|archived` | ✅ |
| Filter by topic | GET | `/api/v1/admin/articles` | `topicId={uuid}` | ✅ |
| Sort | GET | `/api/v1/admin/articles` | `sortBy`, `sortOrder` | Partially implemented |
| Open article | - | Navigate to edit screen | - | |
| Create new | POST | `/api/v1/admin/articles` | - | ✅ |
| Bulk publish | POST | - | - | **GAP**: Not implemented |
| Bulk archive | POST | - | - | **GAP**: Not implemented |
| Bulk delete | DELETE | - | - | **GAP**: Not implemented |

### Article Edit/Create

**Screen URL:** `/admin/articles/{id}` or `/admin/articles/new`

| User Action | HTTP Method | Endpoint | Body | Notes |
|-------------|-------------|----------|------|-------|
| Load article | GET | `/api/v1/admin/articles/{id}` | - | ✅ |
| Save changes | PATCH | `/api/v1/admin/articles/{id}` | `{...updates, version}` | ✅ Optimistic lock |
| Publish | POST | `/api/v1/admin/articles/{id}/publish` | - | ✅ |
| Unpublish | POST | `/api/v1/admin/articles/{id}/unpublish` | - | ✅ |
| Archive | PATCH | `/api/v1/admin/articles/{id}` | `{status: "archived", version}` | Via PATCH |
| Delete | DELETE | `/api/v1/admin/articles/{id}` | - | Soft delete ✅ |
| Version history | GET | - | - | **GAP**: Not implemented |
| Preview | - | Public URL | - | Client-side link |
| Upload image | POST | `/api/v1/admin/files/upload-url` | `{filename, content_type}` | ✅ |
| Load topics | GET | `/api/v1/admin/topics` | - | ✅ |

---

## Content: Topics

**Screen URL:** `/admin/articles` (sidebar or modal)

| User Action | HTTP Method | Endpoint | Notes |
|-------------|-------------|----------|-------|
| List topics | GET | `/api/v1/admin/topics` | ✅ |
| Create topic | POST | `/api/v1/admin/topics` | ✅ |
| Update topic | PATCH | `/api/v1/admin/topics/{id}` | ✅ |
| Delete topic | DELETE | `/api/v1/admin/topics/{id}` | ✅ |

---

## Content: FAQ

**Screen URL:** `/admin/faq`

| User Action | HTTP Method | Endpoint | Query Params | Notes |
|-------------|-------------|----------|--------------|-------|
| List FAQ | GET | `/api/v1/admin/faq` | `page`, `pageSize`, `category`, `isPublished` | ✅ |
| Create FAQ | POST | `/api/v1/admin/faq` | - | ✅ |
| Update FAQ | PATCH | `/api/v1/admin/faq/{id}` | - | ✅ |
| Delete FAQ | DELETE | `/api/v1/admin/faq/{id}` | - | ✅ |
| Get FAQ | GET | `/api/v1/admin/faq/{id}` | - | ✅ |

---

## Content: Reviews

**Screen URL:** `/admin/reviews`

| User Action | HTTP Method | Endpoint | Query Params | Notes |
|-------------|-------------|----------|--------------|-------|
| List reviews | GET | `/api/v1/admin/reviews` | `status`, `caseId`, `featured` | ✅ |
| Create review | POST | `/api/v1/admin/reviews` | - | ✅ |
| Update review | PATCH | `/api/v1/admin/reviews/{id}` | - | ✅ |
| Approve | POST | `/api/v1/admin/reviews/{id}/approve` | - | ✅ |
| Reject | POST | `/api/v1/admin/reviews/{id}/reject` | - | ✅ |
| Delete | DELETE | `/api/v1/admin/reviews/{id}` | - | ✅ |

---

## People & Company: Team Members

**Screen URL:** `/admin/team`

| User Action | HTTP Method | Endpoint | Query Params | Notes |
|-------------|-------------|----------|--------------|-------|
| List employees | GET | `/api/v1/admin/employees` | `page`, `pageSize`, `isPublished` | ✅ |
| Create employee | POST | `/api/v1/admin/employees` | - | ✅ |
| Update employee | PATCH | `/api/v1/admin/employees/{id}` | - | ✅ |
| Delete employee | DELETE | `/api/v1/admin/employees/{id}` | - | ✅ |
| Get employee | GET | `/api/v1/admin/employees/{id}` | - | ✅ |

---

## People & Company: Services

**Screen URL:** `/admin/services`

| User Action | HTTP Method | Endpoint | Query Params | Notes |
|-------------|-------------|----------|--------------|-------|
| List services | GET | `/api/v1/admin/services` | `page`, `pageSize`, `isPublished` | ✅ |
| Create service | POST | `/api/v1/admin/services` | - | ✅ |
| Update service | PATCH | `/api/v1/admin/services/{id}` | - | ✅ |
| Delete service | DELETE | `/api/v1/admin/services/{id}` | - | ✅ |
| Get service | GET | `/api/v1/admin/services/{id}` | - | ✅ |

---

## People & Company: Practice Areas

**Screen URL:** `/admin/practice-areas`

| User Action | HTTP Method | Endpoint | Notes |
|-------------|-------------|----------|-------|
| List | GET | `/api/v1/public/practice-areas` | Public endpoint used |
| Create | POST | `/api/v1/admin/practice-areas` | ✅ |
| Update | PATCH | - | **GAP**: Not implemented |
| Delete | DELETE | - | **GAP**: Not implemented |

---

## People & Company: Advantages

**Screen URL:** `/admin/advantages`

| User Action | HTTP Method | Endpoint | Notes |
|-------------|-------------|----------|-------|
| List | GET | `/api/v1/public/advantages` | Public endpoint used |
| Create | POST | `/api/v1/admin/advantages` | ✅ |
| Update | PATCH | - | **GAP**: Not implemented |
| Delete | DELETE | - | **GAP**: Not implemented |

---

## People & Company: Contacts

**Screen URL:** `/admin/contacts`

| User Action | HTTP Method | Endpoint | Notes |
|-------------|-------------|----------|-------|
| Get contacts | GET | `/api/v1/public/contacts` | Returns addresses + contacts |
| Create address | POST | `/api/v1/admin/addresses` | ✅ |
| Create contact | POST | `/api/v1/admin/contacts` | ✅ |
| Update | PATCH | - | **GAP**: Not implemented |
| Delete | DELETE | - | **GAP**: Not implemented |

---

## Leads & Inquiries

### Inquiries List

**Screen URL:** `/admin/leads`

| User Action | HTTP Method | Endpoint | Query Params | Notes |
|-------------|-------------|----------|--------------|-------|
| List inquiries | GET | `/api/v1/admin/inquiries` | `page`, `pageSize`, `status`, `formId`, `assignedTo`, `utmSource` | ✅ |
| Kanban view | GET | `/api/v1/admin/inquiries` | Same endpoint, group client-side | ✅ |
| View detail | GET | `/api/v1/admin/inquiries/{id}` | - | ✅ |
| Update status | PATCH | `/api/v1/admin/inquiries/{id}` | - | ✅ |
| Assign to user | PATCH | `/api/v1/admin/inquiries/{id}` | `{assigned_to: uuid}` | ✅ |
| Add note | PATCH | `/api/v1/admin/inquiries/{id}` | `{notes: "..."}` | ✅ |
| Delete | DELETE | `/api/v1/admin/inquiries/{id}` | - | ✅ |
| Export CSV | GET | - | - | **GAP**: Not implemented |
| Analytics | GET | `/api/v1/admin/inquiries/analytics` | `days` | ✅ |

### Inquiry Forms

**Screen URL:** `/admin/leads/forms`

| User Action | HTTP Method | Endpoint | Notes |
|-------------|-------------|----------|-------|
| List forms | GET | `/api/v1/admin/inquiry-forms` | ✅ |
| Create form | POST | `/api/v1/admin/inquiry-forms` | ✅ |
| Update form | PATCH | `/api/v1/admin/inquiry-forms/{id}` | ✅ |
| Delete form | DELETE | `/api/v1/admin/inquiry-forms/{id}` | ✅ |

---

## Media Library

**Screen URL:** `/admin/media`

| User Action | HTTP Method | Endpoint | Query Params | Notes |
|-------------|-------------|----------|--------------|-------|
| List files | GET | `/api/v1/admin/files` | `page`, `pageSize`, `folder`, `imagesOnly` | ✅ |
| Get upload URL | POST | `/api/v1/admin/files/upload-url` | - | Returns presigned S3 URL |
| Register file | POST | `/api/v1/admin/files` | - | After S3 upload |
| Update metadata | PATCH | `/api/v1/admin/files/{id}` | - | Alt text, folder |
| Delete file | DELETE | `/api/v1/admin/files/{id}` | `hardDelete` | Soft by default |
| Collections | - | - | - | **GAP**: Not implemented |
| File versions | - | - | - | **GAP**: Not implemented |

### Upload Flow

```
1. POST /api/v1/admin/files/upload-url
   → Returns { upload_url, file_url, s3_key }

2. PUT {upload_url}
   → Upload file directly to S3

3. POST /api/v1/admin/files
   → Register file in database
```

---

## SEO Center

### SEO Routes

**Screen URL:** `/admin/seo`

| User Action | HTTP Method | Endpoint | Query Params | Notes |
|-------------|-------------|----------|--------------|-------|
| List routes | GET | `/api/v1/admin/seo/routes` | `page`, `pageSize`, `locale` | ✅ |
| Create/Update route | PUT | `/api/v1/admin/seo/routes` | - | Upsert by path+locale |
| Update route | PATCH | `/api/v1/admin/seo/routes/{id}` | - | ✅ |
| Delete route | DELETE | `/api/v1/admin/seo/routes/{id}` | - | ✅ |
| Bulk update | - | - | - | **GAP**: Not implemented |
| Export | - | - | - | **GAP**: Not implemented |

### Redirects

**Screen URL:** `/admin/seo/redirects`

| User Action | HTTP Method | Endpoint | Query Params | Notes |
|-------------|-------------|----------|--------------|-------|
| List redirects | GET | `/api/v1/admin/seo/redirects` | `page`, `pageSize`, `isActive` | ✅ |
| Create redirect | POST | `/api/v1/admin/seo/redirects` | - | ✅ |
| Update redirect | PATCH | `/api/v1/admin/seo/redirects/{id}` | - | ✅ |
| Delete redirect | DELETE | `/api/v1/admin/seo/redirects/{id}` | - | ✅ |

---

## Users & Security

### Users List

**Screen URL:** `/admin/users`

| User Action | HTTP Method | Endpoint | Query Params | Notes |
|-------------|-------------|----------|--------------|-------|
| List users | GET | `/api/v1/auth/users` | `page`, `pageSize`, `is_active` | ✅ |
| Create user | POST | `/api/v1/auth/users` | - | ✅ |
| Update user | PATCH | `/api/v1/auth/users/{id}` | - | ✅ |
| Delete user | DELETE | `/api/v1/auth/users/{id}` | - | ✅ |
| Get user | GET | `/api/v1/auth/users/{id}` | - | ✅ |

### Roles & Permissions

**Screen URL:** `/admin/roles`

| User Action | HTTP Method | Endpoint | Notes |
|-------------|-------------|----------|-------|
| List roles | GET | `/api/v1/auth/roles` | ✅ |
| List permissions | GET | `/api/v1/auth/permissions` | ✅ |
| Create role | POST | - | **GAP**: Not implemented |
| Update role | PATCH | - | **GAP**: Not implemented |
| Delete role | DELETE | - | **GAP**: Not implemented |

### Audit Log

**Screen URL:** `/admin/audit`

| User Action | HTTP Method | Endpoint | Notes |
|-------------|-------------|----------|-------|
| List logs | GET | - | **GAP**: Model exists, router missing |
| Filter logs | GET | - | **GAP**: Not implemented |
| Export logs | GET | - | **GAP**: Not implemented |

### Sessions

**Screen URL:** `/admin/users/{id}/sessions`

| User Action | HTTP Method | Endpoint | Notes |
|-------------|-------------|----------|-------|
| List sessions | GET | - | **GAP**: Not implemented |
| Terminate session | DELETE | - | **GAP**: Not implemented |

---

## Localization

**Screen URL:** `/admin/localization`

| User Action | HTTP Method | Endpoint | Notes |
|-------------|-------------|----------|-------|
| List languages | GET | Via `/api/v1/admin/tenants/{id}` | In tenant settings |
| Add language | POST | - | **GAP**: Needs locale router |
| Update language | PATCH | - | **GAP**: Not implemented |
| Disable language | PATCH | - | **GAP**: Not implemented |
| Translation status | GET | - | **GAP**: Not implemented |

---

## Settings

**Screen URL:** `/admin/settings`

| User Action | HTTP Method | Endpoint | Notes |
|-------------|-------------|----------|-------|
| Get settings | GET | `/api/v1/admin/tenants/{id}` | ✅ |
| Update settings | PUT | `/api/v1/admin/tenants/{id}/settings` | ✅ |
| Feature flags | GET | `/api/v1/admin/feature-flags` | ✅ |
| Toggle feature | PATCH | `/api/v1/admin/feature-flags/{name}` | ✅ |

---

## Summary: Endpoint Coverage

| Module | Screens | Endpoints | Coverage |
|--------|---------|-----------|----------|
| Dashboard | 1 | 0 | ❌ 0% |
| Articles | 2 | 10 | ✅ 90% |
| FAQ | 1 | 5 | ✅ 100% |
| Reviews | 1 | 7 | ✅ 100% |
| Team | 2 | 5 | ✅ 100% |
| Services | 1 | 5 | ✅ 100% |
| Practice Areas | 1 | 1 | ⚠️ 25% |
| Leads | 2 | 11 | ✅ 90% |
| Media | 1 | 5 | ⚠️ 80% |
| SEO | 2 | 9 | ✅ 90% |
| Users | 2 | 7 | ⚠️ 70% |
| Audit | 1 | 0 | ❌ 0% |
| Localization | 1 | 0 | ❌ 0% |
| Settings | 1 | 4 | ✅ 100% |

**Overall Coverage: ~75%**

---

## Critical Missing Endpoints

Priority 1 (Blocking):
1. `GET /api/v1/admin/dashboard` - Dashboard stats
2. `GET /api/v1/admin/audit-logs` - Audit log list
3. `POST /api/v1/admin/articles/bulk` - Bulk operations
4. Search parameter for list endpoints

Priority 2 (Important):
1. `POST/PATCH /api/v1/auth/roles` - Role management
2. `GET /api/v1/admin/localization/status` - Translation status
3. `GET /api/v1/admin/inquiries/export` - CSV export
4. Practice areas, advantages, contacts full CRUD

Priority 3 (Enhancement):
1. `GET /api/v1/admin/articles/{id}/history` - Version history
2. `GET /api/v1/auth/sessions` - Session management
3. Media collections
4. Publishing calendar

