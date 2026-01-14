# Gap Analysis: Backend vs UX Specification

> Comparison of current backend implementation against admin_panel_spec.md requirements

This document identifies missing features, endpoints, and functionality that need to be implemented to fully support the admin panel UX specification.

---

## Executive Summary

| Category | Implemented | Missing | Coverage |
|----------|-------------|---------|----------|
| Core CRUD | 45 endpoints | 8 endpoints | 85% |
| Publishing Workflow | Basic | Advanced features | 60% |
| Bulk Operations | 0 | 6 endpoints | 0% |
| Search | Partial | Full-text search | 30% |
| Export/Import | 0 | 4 endpoints | 0% |
| Dashboard | 0 | 2 endpoints | 0% |
| Audit & Security | Model only | 5 endpoints | 20% |
| Localization | Model only | 4 endpoints | 25% |

**Overall Readiness: ~65%**

---

## Critical Gaps (Priority 1 - Blocking)

These features are essential for MVP and block major admin functionality.

### 1. Dashboard Endpoints

**UX Requirement:** "Overview stats, recent activity, publishing status"

**Current Status:** ❌ No endpoints

**Needed:**
```
GET /api/v1/admin/dashboard
Response:
{
  "stats": {
    "articles": { "total": 42, "published": 30, "draft": 12 },
    "inquiries": { "total": 156, "new": 8, "this_week": 23 },
    "team_members": { "total": 15 },
    "reviews": { "pending": 3 }
  },
  "recent_activity": [
    { "action": "publish", "resource": "article", "user": "...", "timestamp": "..." }
  ]
}
```

**Implementation:**
- Create `app/modules/dashboard/` module
- Aggregate queries from existing tables
- Use Redis cache for performance

---

### 2. Audit Log Router

**UX Requirement:** "Audit Log (change history) - who did what, when"

**Current Status:** ⚠️ Model exists (`AuditLog`), no router

**Needed:**
```
GET /api/v1/admin/audit-logs
Query: page, pageSize, userId, resourceType, resourceId, action, dateFrom, dateTo

Response:
{
  "items": [
    {
      "id": "log-uuid",
      "user_id": "user-uuid",
      "resource_type": "article",
      "resource_id": "article-uuid",
      "action": "update",
      "changes": { "title": { "old": "...", "new": "..." } },
      "ip_address": "192.168.1.1",
      "user_agent": "...",
      "created_at": "2026-01-14T10:00:00Z"
    }
  ],
  "total": 1000
}
```

**Implementation:**
- Create `app/modules/audit/router.py`
- Add permission: `audit:read`
- Only admins should access

---

### 3. Bulk Operations

**UX Requirement:** "Bulk publish/unpublish/archive/delete multiple items"

**Current Status:** ❌ Not implemented

**Needed for Articles:**
```
POST /api/v1/admin/articles/bulk
{
  "action": "publish" | "unpublish" | "archive" | "delete",
  "ids": ["uuid1", "uuid2", "uuid3"]
}

Response:
{
  "success": ["uuid1", "uuid2"],
  "failed": [
    { "id": "uuid3", "error": "Article has no content" }
  ]
}
```

**Apply to:** Articles, FAQ, Reviews, Services, Employees

---

### 4. Search Functionality

**UX Requirement:** "Search by title, author, email..."

**Current Status:** ⚠️ `search` param not implemented in most endpoints

**Needed:** Add `search` query parameter to:
- `GET /api/v1/admin/articles` - search title, content
- `GET /api/v1/admin/employees` - search name, position
- `GET /api/v1/admin/inquiries` - search name, email, message
- `GET /api/v1/auth/users` - search email, name

**Implementation:**
- Use PostgreSQL full-text search or ILIKE
- Add `search` to `FilterParams` dependency

---

### 5. Role Management CRUD

**UX Requirement:** "Configure role permissions (RBAC editor)"

**Current Status:** ⚠️ Roles read-only, no create/update/delete

**Needed:**
```
POST /api/v1/auth/roles
{
  "name": "custom_role",
  "description": "Custom role description",
  "permission_ids": ["perm-uuid-1", "perm-uuid-2"]
}

PATCH /api/v1/auth/roles/{role_id}
{
  "name": "updated_name",
  "permission_ids": ["perm-uuid-1", "perm-uuid-3"]
}

DELETE /api/v1/auth/roles/{role_id}
(Only non-system roles)
```

**Constraints:**
- Cannot delete system roles (`is_system: true`)
- Cannot create duplicate role names per tenant
- Deleting role should handle users with that role

---

### 6. Export Endpoints

**UX Requirement:** "Export to CSV" for leads, SEO, audit logs

**Current Status:** ❌ Not implemented

**Needed:**
```
GET /api/v1/admin/inquiries/export
Query: status, dateFrom, dateTo, format=csv

Response: CSV file download
Content-Type: text/csv
Content-Disposition: attachment; filename="inquiries_2026-01-14.csv"
```

**Apply to:**
- Inquiries
- SEO routes  
- Audit logs

---

## Medium Priority Gaps (Priority 2)

### 7. Publishing Calendar

**UX Requirement:** "Publishing Calendar - schedule content, view publishing timeline"

**Current Status:** ❌ Not implemented

**Needed:**
- Add `scheduled_at` field to Article model
- Add `scheduled` to ArticleStatus enum
- Create calendar view endpoint

```
GET /api/v1/admin/articles/calendar
Query: month=2026-01, status=scheduled

Response:
{
  "2026-01-15": [
    { "id": "...", "title": "...", "scheduled_at": "2026-01-15T14:00:00Z" }
  ],
  "2026-01-20": [...]
}
```

**Model Changes:**
```python
class ArticleStatus(str, Enum):
    DRAFT = "draft"
    SCHEDULED = "scheduled"  # NEW
    PUBLISHED = "published"
    ARCHIVED = "archived"

# Add to Article model:
scheduled_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
```

---

### 8. Version History

**UX Requirement:** "Version History - see change history, restore versions"

**Current Status:** ❌ Not implemented

**Needed:**
```
GET /api/v1/admin/articles/{id}/history
Response:
{
  "versions": [
    {
      "version": 3,
      "author_id": "user-uuid",
      "changes": { "title": { "old": "...", "new": "..." } },
      "created_at": "2026-01-14T15:00:00Z"
    }
  ]
}

POST /api/v1/admin/articles/{id}/restore
{ "version": 2 }
```

**Implementation Options:**
1. Store snapshots in separate table (disk-intensive)
2. Store diffs using audit log (more complex)
3. Use PostgreSQL temporal tables (advanced)

---

### 9. Translation Status Report

**UX Requirement:** "Translation Status Report - show completion % per language"

**Current Status:** ❌ Not implemented

**Needed:**
```
GET /api/v1/admin/localization/status
Query: contentType=article|faq|service

Response:
{
  "overall": {
    "ru": { "total": 42, "complete": 42, "percent": 100 },
    "en": { "total": 42, "complete": 30, "percent": 71 },
    "de": { "total": 42, "complete": 10, "percent": 24 }
  },
  "by_type": {
    "articles": { "ru": 100, "en": 75, "de": 20 },
    "faq": { "ru": 100, "en": 80, "de": 30 }
  }
}
```

---

### 10. Locale Management CRUD

**UX Requirement:** "Languages - add/manage locales"

**Current Status:** ⚠️ Model exists (`LocaleConfig`), no router

**Needed:**
```
GET /api/v1/admin/locales
POST /api/v1/admin/locales
PATCH /api/v1/admin/locales/{id}
DELETE /api/v1/admin/locales/{id}
```

**Constraints:**
- Cannot delete default locale
- Cannot delete locale with published content
- RTL support flag

---

### 11. Media Collections

**UX Requirement:** "Collections (folders/tags) for media organization"

**Current Status:** ⚠️ `folder` field exists, no collection entity

**Needed:**
- Create `MediaCollection` model
- Add collection CRUD endpoints
- Many-to-many with files

---

### 12. Session Management

**UX Requirement:** "Active Sessions - view and terminate user sessions"

**Current Status:** ❌ Not implemented

**Needed:**
```
GET /api/v1/auth/sessions
Response: List of active sessions with device info

DELETE /api/v1/auth/sessions/{session_id}
DELETE /api/v1/auth/sessions/all
```

**Implementation:**
- Store sessions in Redis
- Track device, IP, last activity
- Allow termination

---

### 13. Practice Areas Full CRUD

**Current Status:** ⚠️ Only CREATE implemented

**Needed:**
```
GET /api/v1/admin/practice-areas
GET /api/v1/admin/practice-areas/{id}
PATCH /api/v1/admin/practice-areas/{id}
DELETE /api/v1/admin/practice-areas/{id}
```

---

### 14. Advantages Full CRUD

**Current Status:** ⚠️ Only CREATE implemented

**Needed:**
```
GET /api/v1/admin/advantages
GET /api/v1/admin/advantages/{id}
PATCH /api/v1/admin/advantages/{id}
DELETE /api/v1/admin/advantages/{id}
```

---

### 15. Contacts Full CRUD

**Current Status:** ⚠️ Only CREATE implemented

**Needed:**
```
GET /api/v1/admin/addresses
PATCH /api/v1/admin/addresses/{id}
DELETE /api/v1/admin/addresses/{id}

GET /api/v1/admin/contacts
PATCH /api/v1/admin/contacts/{id}
DELETE /api/v1/admin/contacts/{id}
```

---

## Low Priority Gaps (Priority 3 - v2)

### 16. AI Translation

**UX Requirement:** "Auto-Translate using AI"

**Status:** External integration, not in v1 scope

### 17. Analytics Dashboard

**UX Requirement:** "Traffic, engagement by article"

**Status:** Requires analytics service integration

### 18. Webhooks

**UX Requirement:** "Webhooks for external systems"

**Status:** Not in current scope

### 19. Custom Fields

**UX Requirement:** "Custom fields per entity"

**Status:** Complex feature, v2

### 20. MFA Management

**UX Requirement:** "TOTP setup, backup codes"

**Status:** Security enhancement, v1.5

---

## Schema Changes Required

### Article Model

```python
# Add to ArticleStatus enum
SCHEDULED = "scheduled"

# Add to Article model
scheduled_at: Mapped[datetime | None] = mapped_column(
    DateTime(timezone=True), nullable=True
)
```

### Review Model (Optional)

```python
# Add IN_REVIEW status if approval workflow needed
class ReviewStatus(str, Enum):
    PENDING = "pending"
    IN_REVIEW = "in_review"  # Optional
    APPROVED = "approved"
    REJECTED = "rejected"
```

---

## Implementation Roadmap

### Week 1-2: Critical (P1)
1. ✅ Existing API documentation
2. Dashboard endpoints
3. Audit log router
4. Search parameter for lists
5. Bulk operations (articles first)

### Week 3-4: Important (P2)
1. Role management CRUD
2. Export endpoints
3. Full CRUD for practice areas, advantages, contacts
4. Locale management router

### Week 5-6: Enhancement (P2-P3)
1. Publishing calendar
2. Version history
3. Translation status
4. Session management
5. Media collections

### Post-MVP (v1.5+)
1. MFA management
2. AI translation integration
3. Webhooks
4. Custom fields
5. Advanced analytics

---

## API Endpoint Summary

### Currently Implemented: ~70 endpoints
### Missing for MVP: ~25 endpoints
### Missing for Full Spec: ~40 endpoints

| Category | Count | Status |
|----------|-------|--------|
| Auth | 10 | ✅ Complete |
| Articles | 10 | ⚠️ 90% (needs bulk, search) |
| Topics | 4 | ✅ Complete |
| FAQ | 5 | ✅ Complete |
| Reviews | 7 | ✅ Complete |
| Services | 5 | ✅ Complete |
| Employees | 5 | ✅ Complete |
| Practice Areas | 1 | ⚠️ 25% (needs full CRUD) |
| Advantages | 1 | ⚠️ 25% (needs full CRUD) |
| Contacts | 2 | ⚠️ 40% (needs full CRUD) |
| Inquiries | 6 | ⚠️ 90% (needs export) |
| Inquiry Forms | 5 | ✅ Complete |
| Files | 5 | ⚠️ 80% (needs collections) |
| SEO Routes | 4 | ⚠️ 80% (needs bulk) |
| Redirects | 5 | ✅ Complete |
| Dashboard | 0 | ❌ Missing |
| Audit | 0 | ❌ Missing |
| Locales | 0 | ❌ Missing |
| Sessions | 0 | ❌ Missing |

---

## Recommendations

### For PM/Tech Lead

1. **Prioritize Dashboard & Audit** - These are highly visible features that stakeholders expect
2. **Bulk operations are UX critical** - Power users rely heavily on these
3. **Search is table stakes** - Every list should be searchable
4. **Consider partial rollout** - Ship with 80% coverage, iterate

### For Backend Dev

1. Start with `search` parameter - Low effort, high impact
2. Audit log router reuses existing model - Quick win
3. Bulk endpoints follow same pattern - Template once, repeat
4. Dashboard can aggregate existing queries - No new models

### For Frontend Dev

1. Design for missing endpoints - Show "Coming Soon" or disable features
2. Implement client-side search as fallback
3. Build UI assuming bulk will exist - Enable buttons when ready
4. Cache dashboard data client-side

