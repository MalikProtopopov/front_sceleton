---
name: Admin V2 Integration
overview: "Implement missing functionality for the admin panel's V2 backend integration: tenant CRUD pages, cross-tenant user management, enhanced error handling (403/409 edge cases), force_password_change flow, and send_credentials support."
todos:
  - id: phase1-api-error
    content: "Phase 1.1-1.2: Extend ApiError type with error_code; add global 403 interceptor in apiClient for tenant_inactive / feature_disabled; create Zustand store + blocked UI components"
    status: completed
  - id: phase1-409
    content: "Phase 1.3: Differentiate 409 error codes in versionConflict.ts -- separate version_conflict from already_exists"
    status: completed
  - id: phase1-system-role
    content: "Phase 1.4: Handle system_role_protected in useRoles.ts onError handlers"
    status: completed
  - id: phase2-tenant-types-api
    content: "Phase 2.1-2.2: Update Tenant types (users_count, search, sort params) and tenantsApi to pass new params"
    status: completed
  - id: phase2-tenant-list
    content: "Phase 2.3: Enhance tenant list page with search input, sort controls, users_count display"
    status: completed
  - id: phase2-tenant-create
    content: "Phase 2.4: Create TenantForm component and /tenants/new page"
    status: completed
  - id: phase2-tenant-edit
    content: "Phase 2.5: Create /tenants/[id]/edit page using TenantForm with version locking"
    status: completed
  - id: phase2-tenant-users-tab
    content: "Phase 2.6: Add Tabs to tenant detail page; implement TenantUsersTab with cross-tenant user management"
    status: completed
  - id: phase3-cross-tenant-api
    content: "Phase 3.1-3.3: Add tenant_id to user types, usersApi, rolesApi, and all user hooks with cache key separation"
    status: completed
  - id: phase3-user-create
    content: "Phase 3.4: Add send_credentials checkbox to user create form + duplicate email error handling"
    status: completed
  - id: phase3-force-password
    content: "Phase 3.5: Implement force_password_change detection after login and redirect guard in dashboard layout"
    status: completed
  - id: phase4-verify-polish
    content: "Phase 4: Verify feature flags, audit logs, sidebar gating, welcome email UX -- fix any param naming mismatches"
    status: completed
isProject: false
---

# Admin Frontend Integration Guide (V2) -- Implementation Plan

## Current State

The codebase is a **Next.js 16 (App Router)** project using **React Query**, **react-hook-form + Zod**, **Axios**, **Sonner** toasts, and a Feature-Sliced Design (`entities/`, `features/`, `shared/`, `widgets/`). Much of the foundation already exists:

- **Tenant list** with pagination and `is_active` filter -- but no search, sort, or `users_count`
- **Tenant detail** page -- but no edit page, no create page, no Users tab
- **Tenant delete** and **feature flag modules page** -- working
- **User CRUD** (list, create, edit, delete) -- but no `tenant_id` cross-tenant support, no `send_credentials`, no `force_password_change`
- **Roles/Permissions CRUD** -- working, but no `system_role_protected` handling
- **Audit log viewer** -- working with filters, pagination, export
- **Version conflict handling** (409) -- working, but conflates `version_conflict` with `already_exists`
- **Auth flow** with token refresh -- working, but no `force_password_change` redirect

---

## Phase 1: Shared Infrastructure / Error Handling

Before building features, fix the shared error handling layer so all new and existing pages benefit.

### 1.1 Extend `ApiError` type

In `[src/shared/types/api.ts](src/shared/types/api.ts)`, add `error_code` and optional fields:

```typescript
export interface ApiError {
  type: string;
  title: string;
  status: number;
  detail: string;
  instance?: string;
  errors?: ValidationError[];
  error_code?: string;   // e.g. "tenant_inactive", "feature_disabled", "already_exists", "version_conflict", "system_role_protected"
  resource?: string;
  field?: string;
}
```

### 1.2 Global 403 interceptor for `tenant_inactive` and `feature_disabled`

In `[src/shared/api/apiClient.ts](src/shared/api/apiClient.ts)`, add a response interceptor for 403:

- If `error_code === "tenant_inactive"` -- set a global state (Zustand store or context) that triggers a full-screen "Organization Suspended" overlay
- If `error_code === "feature_disabled"` -- set state that shows "This section is no longer available" on the affected page
- If `error_code === "permission_denied"` -- show toast or redirect

Create two new UI components:

- `src/shared/ui/TenantInactivePage/TenantInactivePage.tsx` -- full-screen blocked page
- `src/shared/ui/FeatureDisabledNotice/FeatureDisabledNotice.tsx` -- inline notice

Create a Zustand store `src/shared/model/useGlobalErrors.ts` to hold `isTenantInactive` and `disabledFeature` state; consume in the dashboard layout (`[src/app/(dashboard)/layout.tsx](src/app/(dashboard)`/layout.tsx)).

### 1.3 Differentiate 409 error codes

In `[src/shared/lib/versionConflict.ts](src/shared/lib/versionConflict.ts)`:

- `isVersionConflict()` should check `error_code === "version_conflict"` (not just status 409)
- Add `isAlreadyExists(error)` helper that checks `error_code === "already_exists"` and returns `{ resource, field }`
- Update `getErrorMessage()` to produce field-specific messages (e.g. "Email already exists in this organization")

### 1.4 Handle `system_role_protected`

In `[src/features/users/model/useRoles.ts](src/features/users/model/useRoles.ts)` -- `useUpdateRole` and `useDeleteRole` `onError` handlers should detect `error_code === "system_role_protected"` and show a specific toast.

---

## Phase 2: Tenant/Organization Management

### 2.1 Update tenant types

In `[src/entities/tenant/types.ts](src/entities/tenant/types.ts)`:

- Add `users_count?: number` to `Tenant`
- Add `search?: string`, `sort_by?: string`, `sort_order?: string` to `TenantListParams`

### 2.2 Update tenant API

In `[src/features/tenants/api/tenantsApi.ts](src/features/tenants/api/tenantsApi.ts)`:

- Pass `search`, `sort_by`, `sort_order` params in the `list()` call

### 2.3 Enhance tenant list page

In `[src/app/(dashboard)/tenants/page.tsx](src/app/(dashboard)`/tenants/page.tsx):

- Add search input (debounced text field)
- Add sort controls (dropdown for `sort_by`: name/created_at, toggle for asc/desc)
- Display `users_count` on each `TenantCard`

### 2.4 Create tenant page

Create `src/app/(dashboard)/tenants/new/page.tsx`:

- Form fields: name, slug, domain, is_active, contact_email, contact_phone, primary_color
- Use `useCreateTenant()` hook; redirect to tenant detail on success
- Reuse form as a shared `TenantForm` component at `src/features/tenants/ui/TenantForm.tsx`

### 2.5 Edit tenant page

Create `src/app/(dashboard)/tenants/[id]/edit/page.tsx`:

- Load tenant via `useTenantDetail(id)`
- Same `TenantForm` with pre-filled values
- Send `version` in PATCH for optimistic locking
- Handle 409 `version_conflict` via `handleVersionConflict()`

### 2.6 Add Users tab on tenant detail

Modify `[src/app/(dashboard)/tenants/[id]/page.tsx](src/app/(dashboard)`/tenants/[id]/page.tsx):

- Add a `Tabs` component (using existing `src/shared/ui/Tabs/`) with tabs: "Details" | "Users" | "Modules"
- The "Users" tab renders a cross-tenant user list/management UI passing `tenant_id` to all API calls
- Create `src/features/tenants/ui/TenantUsersTab.tsx` -- reuses user list table, create/edit modals or links, passing `tenant_id`

---

## Phase 3: Cross-Tenant User Management

### 3.1 Update user types

In `[src/entities/user/types.ts](src/entities/user/types.ts)`:

- Add `tenant_id?: string` to `UserFilterParams`
- Add `send_credentials?: boolean` to `CreateUserDto`
- Add `force_password_change?: boolean` to `User` and `UserWithPermissions`

### 3.2 Update user API

In `[src/features/users/api/usersApi.ts](src/features/users/api/usersApi.ts)`:

- All methods (`getAll`, `getById`, `create`, `update`, `delete`) should accept optional `tenantId` and append `?tenant_id=<uuid>` when provided
- Similarly update `[src/features/users/api/rolesApi.ts](src/features/users/api/rolesApi.ts)` if roles are tenant-scoped

### 3.3 Update user hooks

In `[src/features/users/model/useUsers.ts](src/features/users/model/useUsers.ts)`:

- All hooks (`useUsersList`, `useUser`, `useCreateUser`, `useUpdateUser`, `useDeleteUser`, `useToggleUserActive`) should accept optional `tenantId` parameter and pass it through to the API
- Query keys should include `tenantId` for proper cache separation

### 3.4 Update user create form

In the create user page/form:

- Add `send_credentials` checkbox (default: true)
- Show info text: "Password will NOT be sent by email. Communicate it via another channel."
- Handle 409 `already_exists` for duplicate email with a field-specific error message

### 3.5 Implement `force_password_change` redirect

In `[src/features/auth/model/useAuth.ts](src/features/auth/model/useAuth.ts)` or `[src/providers/AuthProvider.tsx](src/providers/AuthProvider.tsx)`:

- After login, check if `user.force_password_change === true`
- If true, redirect to `/settings` (change password page) or a dedicated `/change-password` page instead of `/articles`
- Show a toast: "You must change your password before continuing"

In `[src/app/(dashboard)/layout.tsx](src/app/(dashboard)`/layout.tsx):

- If `user.force_password_change === true` and current route is not the change-password route, redirect there

---

## Phase 4: Feature Flags & Remaining Polish

### 4.1 Feature flags (mostly done)

The modules page at `[src/app/(dashboard)/tenants/[id]/modules/page.tsx](src/app/(dashboard)`/tenants/[id]/modules/page.tsx) already works. Verify:

- It uses `tenant_id` query param correctly
- All 8 feature names from the spec are supported
- Toggle success/error feedback is correct

### 4.2 Audit logs (mostly done)

The audit page at `[src/app/(dashboard)/audit/page.tsx](src/app/(dashboard)`/audit/page.tsx) already works. Verify:

- API param naming matches backend (`page_size` vs `pageSize` -- check and fix if needed)
- `changes` modal displays old/new values correctly
- All resource types and actions from the spec are in `AUDIT_RESOURCE_TYPES` and `AUDIT_ACTIONS`

### 4.3 Sidebar feature-gating

`[src/widgets/Sidebar/ui/Sidebar.tsx](src/widgets/Sidebar/ui/Sidebar.tsx)` already hides items by feature flag. Verify all 8 features map correctly. Ensure platform_owner sees all items.

### 4.4 Welcome email UX

On the user create form, when `send_credentials` is checked, show a callout/info box explaining:

- A welcome email will be sent (without the password)
- The admin must share the password via another channel
- The user will be forced to change their password on first login

---

## File Impact Summary


| File                                             | Change                                                              |
| ------------------------------------------------ | ------------------------------------------------------------------- |
| `src/shared/types/api.ts`                        | Add `error_code`, `resource`, `field` to `ApiError`                 |
| `src/shared/api/apiClient.ts`                    | Add 403 interceptor                                                 |
| `src/shared/lib/versionConflict.ts`              | Differentiate 409 codes, add `isAlreadyExists`                      |
| `src/shared/model/useGlobalErrors.ts`            | **New** -- Zustand store for global error state                     |
| `src/shared/ui/TenantInactivePage/`              | **New** -- full-screen blocked UI                                   |
| `src/shared/ui/FeatureDisabledNotice/`           | **New** -- inline notice component                                  |
| `src/entities/tenant/types.ts`                   | Add `users_count`, search/sort params                               |
| `src/entities/user/types.ts`                     | Add `tenant_id` filter, `send_credentials`, `force_password_change` |
| `src/features/tenants/api/tenantsApi.ts`         | Pass search/sort params                                             |
| `src/features/tenants/ui/TenantForm.tsx`         | **New** -- shared create/edit form                                  |
| `src/features/tenants/ui/TenantUsersTab.tsx`     | **New** -- cross-tenant user tab                                    |
| `src/app/(dashboard)/tenants/page.tsx`           | Add search, sort, users_count                                       |
| `src/app/(dashboard)/tenants/new/page.tsx`       | **New** -- create tenant page                                       |
| `src/app/(dashboard)/tenants/[id]/page.tsx`      | Add Tabs (Details/Users/Modules)                                    |
| `src/app/(dashboard)/tenants/[id]/edit/page.tsx` | **New** -- edit tenant page                                         |
| `src/features/users/api/usersApi.ts`             | Add `tenant_id` param to all methods                                |
| `src/features/users/api/rolesApi.ts`             | Add `tenant_id` if needed                                           |
| `src/features/users/model/useUsers.ts`           | Add `tenantId` to all hooks + query keys                            |
| `src/features/users/model/useRoles.ts`           | Add `system_role_protected` handling                                |
| `src/app/(dashboard)/users/new/page.tsx`         | Add `send_credentials` field                                        |
| `src/features/auth/model/useAuth.ts`             | Force password change redirect                                      |
| `src/providers/AuthProvider.tsx`                 | Force password change guard                                         |
| `src/app/(dashboard)/layout.tsx`                 | Consume global error state, force password change guard             |


