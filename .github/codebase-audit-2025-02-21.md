# Codebase Audit Report & Implementation Plan

**Date**: February 21, 2026
**Scope**: Full codebase audit covering mock data integrity, page functionality, branding consistency, and critical bugs

---

## 1. Mock Data Inventory

| Entity | Count | Details |
|---|---|---|
| Users | **34** | 1 SUPERADMIN, 2 GROUP_PASTOR, 1 GROUP_ADMIN, 5 CAMPUS_PASTOR, 7 CAMPUS_ADMIN, 2 ZONAL_LEADER, 6 HOD, 4 SGL, 4 CELL_LEADER, 2 DATA_ENTRY, 10 MEMBER (1 unassigned) |
| OrgGroups | 2 | "Harvesters Nigeria", "Harvesters United Kingdom" |
| Campuses | 6 | 4 Nigeria (Lekki, Gbagada, Anthony, Abuja), 2 UK (London, Birmingham) |
| Departments | 6 | Youth, Women, Men, Worship, Children, Outreach |
| SmallGroups | 4 | Youth Fire, Grace Circle, Iron Men, Praise & Worship |
| Cells | 4 | Spark, Virtue, Valor, Harmony |
| Meetings | 12 | Various levels (ALL, ZONE, CAMPUS, DEPT, SG, CELL) |
| Reports | 6 | Various statuses |
| Report Templates | 12 | 1 comprehensive + 11 focused |
| Interactions | 6 | Various types |
| Campaigns | 3 | Active campaigns |
| Invite Links | 4 | For various groups |
| Membership Requests | 1 | Pending |
| Notifications | 6 | For various users |
| Zones | 2 | Synthesized from OrgGroups (not real zone entities) |
| **Missing levels** | 0 | No Area, Community, or District entities exist despite org hierarchy config |

---

## 2. Critical Bugs Found

### 2.1 GroupCard.tsx 404 Bug (Leader pages broken)
- **File**: `components/features/groups/GroupCard.tsx` line 60
- **Problem**: `href={`/groups/${group.id}`}` links to `/groups/group-4` — no such route exists
- **Cause**: Missing role prefix. Valid routes are `/leader/groups/[id]` or `/superadmin/groups/[id]`
- **Impact**: Console 404 error: `:3000/groups/group-4?_rsc=eyhj3`
- **Fix**: Accept `routePrefix` prop or derive from auth context

### 2.2 Leader Dashboard Hardcoded Role
- **Files**: `app/leader/dashboard/page.tsx`, `app/leader/my-group/page.tsx`, `app/leader/analytics/page.tsx`
- **Problem**: All wrap with `UserRole.SMALL_GROUP_LEADER` regardless of actual role. Use `user?.groupId` which is `undefined` for GROUP_PASTOR, GROUP_ADMIN, CAMPUS_PASTOR, CAMPUS_ADMIN, ZONAL_LEADER, HOD
- **Impact**: "No Group Assigned" empty state / blank page for all non-SGL leader logins

### 2.3 Data Count Misalignment ("44 members" vs "20" vs "14")
- **Dashboard** (`api/analytics/overview`): Counts ALL 34 users as `totalUsers`, displays as "Total Members"
- **Users page**: Shows paginated subset (likely 20 per page)
- **Analytics** (`api/analytics/church`): Filters only `MEMBER` + `SMALL_GROUP_LEADER` roles (~14 users)
- **Root cause**: Each API defines "members" differently

### 2.4 Dev Credentials Not Showing in Builds
- **File**: `app/(auth)/login/page.tsx`
- **Problem**: `process.env.NODE_ENV == "development"` evaluated server-side at build time. Next.js forces `NODE_ENV=production` during `next build`, so Vercel previews never show dev credentials
- **Fix**: Use `NEXT_PUBLIC_SHOW_DEV_CREDENTIALS` env var

---

## 3. Terminology / Branding Issues

| Location | Current Text | Issue |
|---|---|---|
| Landing page hero (`app/page.tsx` L60) | "Harvesters **Small Groups CRM**" | Should reflect full org management |
| Landing page benefits (`app/page.tsx` L104) | "Our Small Groups Platform" | Same |
| Landing page body (`app/page.tsx` L68) | "thriving small groups" | Same |
| About page CTA (`app/(public)/about/page.tsx`) | "Join a Small Group Today" | Same |
| Superadmin dashboard (`app/superadmin/dashboard/page.tsx`) | "Welcome to Harvesters Small Groups CRM" | Same |
| Register form step 4 (`components/features/auth/RegisterForm.tsx`) | Group suggestions are small-group only | Should include cell selection via cell leader name search |

---

## 4. Missing / Incomplete Features

1. **Landing page**: No footer, minimal navbar, generic copy
2. **Superadmin Groups page**: Only shows SmallGroup entities — should show all org levels overview
3. **Registration**: No cell selection via cell leader name search dropdown
4. **Mock data gaps**: No Zone, Area, Community, or District mock entities
5. **No root middleware.ts**: No route protection — unauthenticated users can access any page URL directly

---

## 5. Implementation Plan

### Phase 1: Critical Bug Fixes ✅

| # | Task | Effort | Files |
|---|---|---|---|
| 1.1 | Fix GroupCard.tsx href — Accept `routePrefix` prop; update all usages | Small | GroupCard.tsx + all pages using it |
| 1.2 | Fix leader dashboard role hardcoding — Use actual `user.role` for DashboardLayout, create role-appropriate views | Medium | leader/dashboard, my-group, analytics pages |
| 1.3 | Fix dev credentials — Switch to `NEXT_PUBLIC_SHOW_DEV_CREDENTIALS=true` env var | Small | login/page.tsx, .env files |
| 1.4 | Fix data count alignment — Standardize definitions across APIs | Medium | overview API, church API, dashboard page |

### Phase 2: Leader Experience Overhaul ✅

| # | Task | Effort | Files |
|---|---|---|---|
| 2.1 | Add `groupId`/`campusId`/`zoneId` to leader mock users | Medium | mockData.ts |
| 2.2 | Create role-aware leader dashboard | Large | leader/dashboard, new API endpoints |
| 2.3 | Fix leader groups/my-group pages | Medium | leader/groups, leader/my-group |

### Phase 3: Branding & Terminology Update ✅

| # | Task | Effort | Files |
|---|---|---|---|
| 3.1 | Update all "Small Groups CRM" → proper name | Small | Landing page, dashboard, about page, register |
| 3.2 | Redesign landing page — New hero, benefits, footer, navbar | Medium | app/page.tsx, new Footer component |
| 3.3 | Update public pages | Small | (public)/ pages |

### Phase 4: Superadmin & Registration Enhancements ✅

| # | Task | Effort | Files |
|---|---|---|---|
| 4.1 | Redesign superadmin groups page — Show all org levels in hierarchical view | Large | superadmin/groups/page.tsx |
| 4.2 | Add cell leader name search in registration | Medium | RegisterForm.tsx, new API endpoint |

### Phase 5: Infrastructure & Polish ✅

| # | Task | Effort | Files |
|---|---|---|---|
| 5.1 | Add root middleware.ts — Protect routes, redirect unauthenticated users | Medium | middleware.ts (root) |
| 5.2 | Landing page footer + public navbar enhancement | Small | New components |

---

## 6. Implementation Status

- [x] Phase 1: Critical Bug Fixes
- [x] Phase 2: Leader Experience Overhaul
- [x] Phase 3: Branding & Terminology Update
- [x] Phase 4: Superadmin & Registration Enhancements
- [x] Phase 5: Infrastructure & Polish

---

## 7. Implementation Log

### Phase 1: Critical Bug Fixes (COMPLETE)
- **1.1 GroupCard 404**: Added `routePrefix` prop to `GroupCard.tsx` (default `/superadmin/groups`), updated href to `${routePrefix}/${group.id}`
- **1.2 Leader Dashboard**: Complete rewrite of `app/leader/dashboard/page.tsx` with `SCOPED_LEADER_ROLES` array; scoped leaders see multi-stat overview, SGL/CELL_LEADER see single-group view
- **1.3 Dev Credentials**: Switched from `NODE_ENV` to `NEXT_PUBLIC_SHOW_DEV_CREDENTIALS` env var in login page and `.env` files
- **1.4 Data Count Fix**: `api/analytics/overview` returns both `totalUsers` and `totalMembers`; `api/analytics/church` includes CELL_LEADER; dashboard label → "Total Users"

### Phase 2: Leader Pages Overhaul (COMPLETE)
- Fixed `leader/my-group/page.tsx` and `leader/analytics/page.tsx` with scoped leader detection
- Fixed all 15+ hardcoded `DashboardLayout role={UserRole.SMALL_GROUP_LEADER}` across:
  - `leader/schedule/page.tsx` (3 instances)
  - `leader/profile/page.tsx` (3 instances)
  - `leader/requests/page.tsx` (2 instances)
  - `leader/members/page.tsx` (2 instances + added useAuth)
  - `leader/members/[id]/page.tsx` (3 instances + added useAuth)
  - `leader/interactions/page.tsx` (2 instances)
- Verified: zero remaining hardcoded `DashboardLayout role={UserRole.SMALL_GROUP_LEADER}` in codebase

### Phase 3: Branding & Terminology (COMPLETE)
- All "Small Groups CRM" → "Church CRM" across 12+ files
- Full landing page redesign with sticky navbar (dual logos, mobile hamburger), stats strip, feature highlights, comprehensive footer
- Updated: layout.tsx metadata, superadmin dashboard, analytics CSV header, about page, terms, privacy, contact, register pages, not-found page

### Phase 4: Superadmin & Registration (COMPLETE)
- **4.1**: Superadmin groups page rewritten from single SmallGroup list to multi-tab hierarchical view (Overview, Campuses, Departments, Groups, Cells) with parallel API fetches, search filtering, and entity counts
- **4.2**: Cell leader search added to registration:
  - New public API: `api/cells/search-by-leader/route.ts` — searches users by name who are CELL_LEADERs or SGL, returns their cells/groups
  - RegisterForm step 4 now has debounced leader name search input above group suggestions, with "OR choose from suggested groups" divider
  - Membership request body includes `cellId` when cell is selected via leader search

### Phase 5: Infrastructure (COMPLETE)
- **5.1**: Root `middleware.ts` created with:
  - Route protection for `/superadmin/*`, `/leader/*`, `/member/*`, `/profile/*`
  - Unauthenticated users redirected to `/login?callbackUrl=...`
  - Authenticated users redirected away from auth routes to their dashboard
  - Role-based access control (SUPERADMIN → superadmin routes, LEADER roles → leader routes, MEMBER → member routes)
  - Lightweight JWT payload decode (Edge-compatible, no crypto verification — API routes handle full verification)
  - Matcher excludes API routes, static assets, and public files

### Files Created
| File | Purpose |
|---|---|
| `.github/codebase-audit-2025-02-21.md` | This audit document |
| `app/api/cells/search-by-leader/route.ts` | Public API for cell leader name search during registration |
| `middleware.ts` | Root Next.js middleware for route protection |

### Files Modified (Major Changes)
| File | Change |
|---|---|
| `app/page.tsx` | Complete landing page redesign |
| `app/leader/dashboard/page.tsx` | Complete rewrite for role-aware dashboard |
| `app/superadmin/groups/page.tsx` | Complete rewrite with hierarchical tab view |
| `components/features/auth/RegisterForm.tsx` | Added cell leader search + updated terminology |
| `components/features/groups/GroupCard.tsx` | Added `routePrefix` prop |
| `app/(auth)/login/page.tsx` | Dev credentials env var + metadata |
| `app/api/analytics/overview/route.ts` | Added `totalMembers` alongside `totalUsers` |
| `app/api/analytics/church/route.ts` | Added CELL_LEADER to engagement filter |
| `app/superadmin/dashboard/page.tsx` | Label and branding fixes |
| `app/layout.tsx` | Metadata updates |
| All `app/leader/*/page.tsx` files | DashboardLayout role prop fixed to `user?.role` |
| All `app/(public)/*/page.tsx` files | Terminology updates |
