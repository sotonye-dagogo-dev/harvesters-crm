# Route & Link Audit — Fix Plan
**Session:** February 19, 2026  
**Status:** In Progress

---

## Scope

Full codebase audit of all navigation links (`href`, `router.push`, `router.replace`, `redirect`) and API `fetch` call URLs across all roles (superadmin, leader, member). Goal: ensure every link resolves to an existing page or API route.

---

## Existing Pages Inventory (76 routes)

### Shared / Root
- `/` — landing page  
- `/offline`  
- `/profile`, `/profile/edit`, `/profile/change-password`

### Auth
- `/login`, `/register`, `/forgot-password`, `/reset-password`

### Public
- `/about`, `/contact`, `/privacy`, `/terms`

### Superadmin
- `/superadmin/dashboard`  
- `/superadmin/analytics`  
- `/superadmin/profile`  
- `/superadmin/users`, `/superadmin/users/[id]`, `/superadmin/users/activity-logs`  
- `/superadmin/members`  
- `/superadmin/interests`  
- `/superadmin/groups`, `/superadmin/groups/new`, `/superadmin/groups/[id]`, `/superadmin/groups/[id]/edit`, `/superadmin/groups/[id]/assign-leader`, `/superadmin/groups/[id]/add-member`  
- `/superadmin/groups/[id]/member/[memberId]/stats`, `/superadmin/groups/[id]/member/[memberId]/attendance-history`  
- `/superadmin/meetings/broadcast`  
- `/superadmin/reports`, `/superadmin/reports/[id]`, `/superadmin/reports/[id]/history`, `/superadmin/reports/[id]/edits`  
- `/superadmin/reports/templates`, `/superadmin/reports/templates/[id]`  
- `/superadmin/reports/update-requests`, `/superadmin/reports/analytics`  
- `/superadmin/settings/system-notifications`  
- ❌ `/superadmin/users/new` — **DOES NOT EXIST**  
- ❌ `/superadmin/users/[id]/edit` — **DOES NOT EXIST**  
- ❌ `/superadmin/profile/change-password` — **DOES NOT EXIST** (shared `/profile/change-password` exists)  
- ❌ `/superadmin/profile/edit` — **DOES NOT EXIST** (shared `/profile/edit` exists)  
- ❌ `/superadmin/groups/[id]/reports` — **DOES NOT EXIST**  
- ❌ `/superadmin/meetings` (non-broadcast parent) — **DOES NOT EXIST**  
- ❌ `/superadmin/settings/notifications` — **DOES NOT EXIST** (actual page: `/superadmin/settings/system-notifications`)

### Leader
- `/leader/dashboard`, `/leader/analytics`, `/leader/profile`  
- `/leader/my-group`  
- `/leader/members`, `/leader/members/[id]`  
- `/leader/meetings`, `/leader/meetings/new`, `/leader/meetings/[id]`, `/leader/meetings/[id]/edit`, `/leader/meetings/[id]/attendance`  
- `/leader/interactions`, `/leader/interactions/new`, `/leader/interactions/[id]/edit`  
- `/leader/follow-ups`  
- `/leader/schedule`  
- `/leader/requests`  
- `/leader/groups/[id]/reports`  
- `/leader/reports`, `/leader/reports/new`, `/leader/reports/data-entry`, `/leader/reports/[id]`, `/leader/reports/[id]/edit`, `/leader/reports/[id]/history`, `/leader/reports/[id]/edits`  
- `/leader/settings/meeting-reminders`  
- ❌ `/leader/profile/change-password` — **DOES NOT EXIST** (shared `/profile/change-password` exists)  
- ❌ `/leader/profile/edit` — **DOES NOT EXIST** (shared `/profile/edit` exists)  
- ❌ `/leader/notifications` — **DOES NOT EXIST**  
- ❌ `/leader/membership-requests` — **DOES NOT EXIST** (correct route: `/leader/requests`)  
- ❌ `/leader/settings/notifications` — **DOES NOT EXIST** (actual page: `/leader/settings/meeting-reminders`)

### Member
- `/member/dashboard`, `/member/analytics`, `/member/profile`, `/member/profile/edit`, `/member/profile/change-password`  
- `/member/my-group`  
- `/member/history`  
- `/member/notifications`  
- `/member/membership-requests`, `/member/membership-requests/new`  
- `/member/settings/preferences`  
- ❌ `/member/meetings/[id]` — **DOES NOT EXIST** (no member meeting detail page)  
- ❌ `/member/settings/notifications` — **DOES NOT EXIST** (actual page: `/member/settings/preferences`)

---

## Existing API Routes (88 routes — all verified correct in code)

All API calls in the codebase target valid existing routes with the following **one exception**:  
- ❌ `/api/analytics/members/me` (called by `app/member/history/page.tsx`) — the dynamic route is `/api/analytics/members/[id]`, no special "me" handler exists. **Needs user ID.**

---

## Issues Found — With Fix Plan

### CATEGORY A — Missing Role Prefix in Navigation Links
> `router.push()` calls that omit the role prefix segment entirely.

| # | File | Line | Wrong URL | Correct URL |
|---|------|------|-----------|-------------|
| A1 | `app/superadmin/users/page.tsx` | 225 | `` `/users/${id}/edit` `` | `` `/superadmin/users/${id}` `` (edit page doesn't exist; go to view) |
| A2 | `app/superadmin/users/[id]/page.tsx` | 140 | `` `/users/${userId}/edit` `` | `/superadmin/users` (edit page doesn't exist) |
| A3 | `app/superadmin/groups/[id]/edit/page.tsx` | 120 | `` `/groups/${params.id}` `` | `` `/superadmin/groups/${params.id}` `` |
| A4 | `app/superadmin/groups/[id]/add-member/page.tsx` | 47 | `` `/groups/${params.id}` `` | `` `/superadmin/groups/${params.id}` `` |
| A5 | `app/superadmin/groups/[id]/add-member/page.tsx` | 87 | `` `/groups/${params.id}` `` | `` `/superadmin/groups/${params.id}` `` |
| A6 | `app/superadmin/groups/[id]/add-member/page.tsx` | 126 | `` `/groups/${params.id}` `` | `` `/superadmin/groups/${params.id}` `` |
| A7 | `app/superadmin/groups/[id]/add-member/page.tsx` | 152 | `` `/groups/${params.id}` `` | `` `/superadmin/groups/${params.id}` `` |
| A8 | `app/superadmin/groups/[id]/assign-leader/page.tsx` | 156 | `` `/groups/${params.id}` `` | `` `/superadmin/groups/${params.id}` `` |
| A9 | `app/leader/interactions/page.tsx` | 307 | `` `/interactions/${id}/edit` `` | `` `/leader/interactions/${id}/edit` `` |
| A10 | `app/leader/groups/[id]/reports/page.tsx` | 433 | `` `/groups/${groupId}` `` | `/leader/my-group` (no parent `/leader/groups/[id]` page) |
| A11 | `app/member/membership-requests/page.tsx` | 116 | `/membership-requests/new` | `/member/membership-requests/new` |

### CATEGORY B — Destination Page Does Not Exist
> `router.push()` targeting pages with no `page.tsx`.

| # | File | Line | Wrong URL | Correct URL |
|---|------|------|-----------|-------------|
| B1 | `app/superadmin/users/page.tsx` | 175 | `/superadmin/users/new` | `/superadmin/users` (no create-user page) |
| B2 | `app/superadmin/profile/page.tsx` | 77 | `/superadmin/profile/change-password` | `/profile/change-password` (shared) |
| B3 | `app/superadmin/profile/page.tsx` | 84 | `/superadmin/profile/edit` | `/profile/edit` (shared) |
| B4 | `app/leader/profile/page.tsx` | 77 | `/leader/profile/change-password` | `/profile/change-password` (shared) |
| B5 | `app/leader/profile/page.tsx` | 84 | `/leader/profile/edit` | `/profile/edit` (shared) |
| B6 | `app/superadmin/groups/[id]/page.tsx` | 233 | `` `/superadmin/groups/${id}/reports` `` | `/superadmin/reports` (no group-scoped reports for superadmin) |
| B7 | `app/member/notifications/page.tsx` | 148 | `` `/member/meetings/${id}` `` | `/member/my-group` (no member meeting detail page) |

### CATEGORY C — Superadmin Meetings Nav Points to Non-Existent Page
> `lib/constants/roles.ts` nav item for superadmin meetings.

| # | File | Line | Wrong URL | Correct URL |
|---|------|------|-----------|-------------|
| C1 | `lib/constants/roles.ts` | 34 | `/superadmin/meetings` | `/superadmin/meetings/broadcast` (only sub-page exists) |

### CATEGORY D — DashboardLayout Settings Notification Href Generates Wrong Path
> `components/features/navigation/DashboardLayout.tsx` builds `{settingsPath}/notifications` which is wrong for all roles.

| # | Role | Generated (Wrong) | Should Be |
|---|------|-------------------|----------|
| D1 | Superadmin | `/superadmin/settings/notifications` | `/superadmin/settings/system-notifications` |
| D2 | Leader (all) | `/leader/settings/notifications` | `/leader/settings/meeting-reminders` |
| D3 | Member | `/member/settings/notifications` | `/member/settings/preferences` |

**Fix:** Add a role-prefix → settings-page mapping in DashboardLayout and use it instead of the `${settingsPath}/notifications` template.

### CATEGORY E — NotificationBell `rolePath` Derived Incorrectly
> `components/features/notifications/NotificationBell.tsx` uses `user?.role?.toLowerCase()` which gives wrong paths for all leader sub-roles (e.g. `small_group_leader`, `cell_leader`) and then constructs URLs to pages that may not exist.

Sub-issues:
- **E1** — `rolePath` is wrong for any leader sub-role → must derive from `getRoleConfig(role).routePrefix`
- **E2** — `/${rolePath}/meetings/${id}` for member → `/member/meetings/[id]` doesn't exist → go to `/member/my-group`; for superadmin → `/superadmin/dashboard`
- **E3** — `/${rolePath}/membership-requests` → leader uses `/leader/requests`, superadmin has no membership-requests page → `/superadmin/members`
- **E4** — `/${rolePath}/notifications` (View All) → only `/member/notifications` exists; leader and superadmin → their respective dashboards

### CATEGORY F — API URL Uses Literal "me" Instead of User ID
> One special case that requires a minimal code addition to fix the URL correctly.

| # | File | Line | Wrong URL | Correct URL |
|---|------|------|-----------|-------------|
| F1 | `app/member/history/page.tsx` | 52 | `/api/analytics/members/me` | `` `/api/analytics/members/${user?.id}` `` (add `useAuth` hook) |

---

## Implementation Checklist

- [x] **Plan document created**
- [x] **C1** — `lib/constants/roles.ts` — fix superadmin meetings nav path (`/superadmin/meetings` → `/superadmin/meetings/broadcast`)
- [x] **D1-D3** — `components/features/navigation/DashboardLayout.tsx` — fix settings notification href (role-specific paths per role)
- [x] **E1-E4** — `components/features/notifications/NotificationBell.tsx` — fix rolePath derivation using `getRoleConfig` + fixed all routing destinations
- [x] **A1, B1** — `app/superadmin/users/page.tsx` — "Add User" → `/superadmin/users` fallback; "Edit" → `/superadmin/users/${id}` view page
- [x] **A2** — `app/superadmin/users/[id]/page.tsx` — removed broken edit path, navigates to `/superadmin/users`
- [x] **B2, B3** — `app/superadmin/profile/page.tsx` — change-password → `/profile/change-password`, edit → `/profile/edit`
- [x] **B6** — `app/superadmin/groups/[id]/page.tsx` — reports button → `/superadmin/reports`
- [x] **A3** — `app/superadmin/groups/[id]/edit/page.tsx` — back button → `/superadmin/groups/${params.id}`
- [x] **A4-A7** — `app/superadmin/groups/[id]/add-member/page.tsx` — 4× back links → `/superadmin/groups/${params.id}`
- [x] **A8** — `app/superadmin/groups/[id]/assign-leader/page.tsx` — back link → `/superadmin/groups/${params.id}`
- [x] **B4, B5** — `app/leader/profile/page.tsx` — change-password → `/profile/change-password`, edit → `/profile/edit`
- [x] **A9** — `app/leader/interactions/page.tsx` — edit link → `/leader/interactions/${id}/edit`
- [x] **A10** — `app/leader/groups/[id]/reports/page.tsx` — back link → `/leader/my-group`
- [x] **B7** — `app/member/notifications/page.tsx` — meeting link → `/member/my-group`
- [x] **A11** — `app/member/membership-requests/page.tsx` — "New Request" → `/member/membership-requests/new`
- [x] **F1** — `app/member/history/page.tsx` — API URL fixed to `/api/analytics/members/${user?.id}` (added `useAuth`)
- [x] **Bonus** — `app/page.tsx` — landing page redirect now uses `getDashboardRoute(user.role)` instead of broken `role.toLowerCase()`
- [x] **Bonus** — `app/not-found.tsx` — 404 page "Go to Dashboard" now uses `getDashboardRoute(user.role)` instead of broken `role.toLowerCase()`

---

## Notes

All three gaps identified in the initial audit have now been resolved:

- ~~**`/superadmin/users/new`** and **`/superadmin/users/[id]/edit`** — No dedicated create/edit user pages exist.~~ **RESOLVED:** "Add User" now opens a Create User modal with a full registration form (name, email, password, role, phone, DOB, gender, address, marital/employment status). A POST handler was added to `/api/users`. The user detail page's "Edit" button now opens an inline Edit User modal that calls PUT `/api/users/[id]`.
- ~~**`/superadmin/groups/[id]/reports`** — No group-scoped reports sub-page for superadmin exists.~~ **RESOLVED:** "View Reports" on the group detail page now navigates to `/superadmin/reports?groupId={id}`. The superadmin reports page reads `groupId` from URL search params, passes it through to the API, and shows a contextual title with the group name. The reports API and `reportDb.findAll` now support `groupId` filtering. A "Clear group filter" link is provided to return to unfiltered view.
- ~~**Member meeting detail** — Members have no `/member/meetings/[id]` page.~~ **RESOLVED:** A read-only meeting detail page was created at `app/member/meetings/[id]/page.tsx` (modeled after the leader version, without edit/delete/attendance actions). The `NotificationBell` component and `member/notifications/page.tsx` now route meeting reminder clicks to `/member/meetings/{id}` instead of `/member/my-group`.

