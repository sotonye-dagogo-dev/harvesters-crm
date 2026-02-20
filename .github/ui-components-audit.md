# UI Component Reusability & Consistency Audit

> **Phase 2 of Design System Operations**
> Status: **APPROVED — Implementation In Progress**

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Decisions Made](#2-decisions-made)
3. [Current UI Component Inventory](#3-current-ui-component-inventory)
4. [Direct Antd Import Violations](#4-direct-antd-import-violations)
5. [Wrapper Adoption Report](#5-wrapper-adoption-report)
6. [Table Action Column Audit](#6-table-action-column-audit)
7. [Repeated Patterns — New Component Candidates](#7-repeated-patterns--new-component-candidates)
8. [Proposed Enhancements to Existing Components](#8-proposed-enhancements-to-existing-components)
9. [Proposed New Reusable Components](#9-proposed-new-reusable-components)
10. [Implementation Plan & Progress](#10-implementation-plan--progress)

---

## 2. Decisions Made

| Decision | Resolution |
|----------|-----------|
| **Button strategy** | Replace ALL usage. Wrapper must be dynamic enough for every use case (danger, link, text, icon-only, loading, sizes, custom styling). |
| **Input strategy** | Wrapper works in both standalone and Form.Item contexts. Label/error are optional — omit in Form.Item. DS styling (radius, shadow) applied universally via single point of change. |
| **Table search** | Global search bar filtering across all string columns in dataSource. Most reusable, user-friendly, and low-config approach. |
| **Layout.tsx** | **Deprecate & remove.** Unused; DashboardLayout handles all layout. |
| **ErrorBoundary.tsx** | **Deprecate & remove.** Unused; Next.js error.tsx handles error boundaries. |
| **FilterToolbar** | **Implement now** as a new reusable component. |
| **Suspense** | Not applicable to LoadingSkeleton (it IS the fallback). Next.js loading.tsx and Suspense boundaries already handle this pattern at the page level. |

---

## 1. Executive Summary

The codebase has **14 reusable UI wrappers** in `components/ui/`, but adoption is extremely inconsistent. **4 wrappers have zero imports** (Table, Modal, Layout, ErrorBoundary), while direct Antd imports are widespread across feature components and pages. The Table component — the user's primary concern — is never used anywhere despite 21 files importing `Table` directly from `"antd"`.

### Key Findings

| Metric | Count |
|--------|-------|
| UI wrapper components | 14 |
| Wrappers with **zero adoption** | 4 (Table, Modal, Layout, ErrorBoundary) |
| Wrappers with **minimal adoption** (1 file) | 4 (Button, Pagination, SearchInput, PageLayout) |
| Files importing `Table` directly from antd | **21** |
| Files importing `Card` directly from antd | **27** |
| Files importing `Button` directly from antd | **34** |
| Files importing `Modal` directly from antd | **6** |
| Files importing `Input` directly from antd | **31** |
| Tables with inline action buttons (no dropdown) | **12** |
| Files with repeated status Tag color patterns | **40** |

---

## 2. Current UI Component Inventory

### 2.1 Table.tsx (0 imports — never used)

| Feature | Status |
|---------|--------|
| Extends `TableProps<T>` | ✅ |
| `searchable` prop | ❌ Broken — `searchText` state is set but never used for filtering |
| `responsiveScroll` prop | ✅ Defaults to `{ x: 800 }` |
| Built-in pagination formatting | ✅ `showSizeChanger`, `showTotal` |
| `TableHeader` sub-component | ✅ Title + subtitle + actions |
| Action column helper (ellipsis dropdown) | ❌ Missing |
| Column search/filter integration | ❌ Missing |
| Loading/empty states | ❌ Missing (relies on Antd defaults) |

### 2.2 Card.tsx (10 imports — moderate adoption)

| Feature | Status |
|---------|--------|
| Design system tokens | ✅ `shadow-ds-md`, `ds-hover-glow`, `border-ds-border-base` |
| `ScrollableCard` variant | ✅ Configurable `maxHeight` |
| `StatCard` variant | ✅ Title/value/icon/trend/color/description |
| **Issue:** 27 files use antd `Card` directly | ⚠️ |

### 2.3 Button.tsx (1 import — barely used)

| Feature | Status |
|---------|--------|
| `variant` prop mapping | ✅ primary/secondary/outline/ghost/link/text |
| Design system tokens | ✅ |
| Loading state | ✅ (inherited from Antd) |
| Icon support | ✅ (inherited from Antd) |
| **Issue:** 34 files use antd `Button` directly | ⚠️ |

### 2.4 Modal.tsx (0 imports — never used)

| Feature | Status |
|---------|--------|
| `Modal` with ds header border | ✅ |
| `ConfirmModal` variant | ✅ open/title/content/onConfirm/onCancel/danger |
| **Issue:** 6 files use antd `Modal` directly | ⚠️ |

### 2.5 Input.tsx (2 imports — low adoption)

| Feature | Status |
|---------|--------|
| `Input` with label + error | ✅ |
| `TextArea` variant | ✅ |
| `PasswordInput` variant | ✅ |
| Design system tokens | ✅ |
| **Issue:** 31 files use antd `Input` directly | ⚠️ |

### 2.6 PageLayout.tsx (1 import — barely used)

| Feature | Status |
|---------|--------|
| `PageHeader` — title/subtitle/icon/actions | ✅ |
| `PageLoading` — Spin with message | ✅ |
| `PageEmpty` — Card + empty state | ✅ |
| `PageError` — error display with retry | ✅ |
| `ResponsiveContainer` — overflow wrapper | ✅ |
| `PageContainer` — spacer wrapper | ✅ |
| **Note:** `PageError` imports antd `Card` directly instead of using the wrapper | ⚠️ |

### 2.7 Pagination.tsx (1 import)

| Feature | Status |
|---------|--------|
| Wraps antd `Pagination` | ✅ |
| `showTotal` formatted | ✅ |
| Responsive | ✅ |
| Page size options | ✅ `[10, 20, 50, 100]` |

### 2.8 EmptyState.tsx (7 imports — decent adoption)

Works well, good adoption. Could be expanded with variant presets.

### 2.9 LoadingSkeleton.tsx (7 imports — decent adoption)

| Feature | Status |
|---------|--------|
| `LoadingSkeleton` — rows/avatar/active | ✅ |
| `CardSkeleton` — grid of skeleton cards | ✅ |
| `TableSkeleton` — single skeleton block | ✅ |
| **Issue:** 18+ files use antd `Spin` directly instead | ⚠️ |

### 2.10 SearchInput.tsx (1 import — barely used)

Wraps `Input.Search` with ds tokens. Only used in 1 file.

### 2.11 MockFileUpload.tsx (3 imports)

Handles image upload/preview/removal. Reasonable usage.

### 2.12 Layout.tsx (0 imports — never used)

Contains `AppHeader`, `AppFooter`, `AppContent`. Completely unused — the `DashboardLayout` feature component handles all layout.

### 2.13 ErrorBoundary.tsx (0 imports — never used)

Contains `ErrorBoundary` and `RouteErrorBoundary` class components. Never imported anywhere.

### 2.14 ThemeToggle.tsx (4 imports)

Works well. Good adoption in auth pages and DashboardLayout.

---

## 3. Direct Antd Import Violations

Files that import core Antd components directly instead of using the UI wrappers.

### 3.1 Table — 21 violations (0% wrapper adoption)

| # | File |
|---|------|
| 1 | `app/superadmin/reports/page.tsx` |
| 2 | `app/superadmin/reports/templates/page.tsx` |
| 3 | `app/superadmin/reports/templates/[id]/page.tsx` |
| 4 | `app/superadmin/reports/[id]/edits/page.tsx` |
| 5 | `app/superadmin/reports/update-requests/page.tsx` |
| 6 | `app/superadmin/reports/analytics/page.tsx` |
| 7 | `app/superadmin/members/page.tsx` |
| 8 | `app/superadmin/users/activity-logs/page.tsx` |
| 9 | `app/superadmin/interests/page.tsx` |
| 10 | `app/superadmin/groups/[id]/page.tsx` |
| 11 | `app/superadmin/analytics/page.tsx` |
| 12 | `app/superadmin/groups/[id]/member/[memberId]/stats/page.tsx` |
| 13 | `app/superadmin/groups/[id]/member/[memberId]/attendance-history/page.tsx` |
| 14 | `app/leader/reports/page.tsx` |
| 15 | `app/leader/reports/[id]/edits/page.tsx` |
| 16 | `app/leader/members/page.tsx` |
| 17 | `app/leader/my-group/page.tsx` |
| 18 | `app/leader/follow-ups/page.tsx` |
| 19 | `app/leader/analytics/page.tsx` |
| 20 | `app/leader/groups/[id]/reports/page.tsx` |
| 21 | `components/features/reports/TemplateSectionBuilder.tsx` |

### 3.2 Card — 27 violations (27% wrapper adoption — 10 files use wrapper)

<details>
<summary>Click to expand full list</summary>

| # | File |
|---|------|
| 1 | `app/(auth)/forgot-password/page.tsx` |
| 2 | `app/(auth)/reset-password/page.tsx` |
| 3 | `components/features/auth/LoginForm.tsx` |
| 4 | `components/features/analytics/AttendanceChart.tsx` |
| 5 | `components/features/analytics/DistributionChart.tsx` |
| 6 | `components/features/analytics/EngagementHeatmap.tsx` |
| 7 | `components/features/analytics/GrowthChart.tsx` |
| 8 | `components/features/analytics/StatCard.tsx` |
| 9 | `components/features/campaigns/CampaignCard.tsx` |
| 10 | `components/features/communications/FollowUpReminderWidget.tsx` |
| 11 | `components/features/groups/GroupCard.tsx` |
| 12 | `components/features/meetings/MeetingCard.tsx` |
| 13 | `components/features/membership/MembershipRequestCard.tsx` |
| 14 | `components/features/reports/ReportOverviewWidget.tsx` |
| 15 | `components/features/reports/ReportSectionCard.tsx` |
| 16 | `components/features/users/UserCard.tsx` |
| 17 | `app/superadmin/members/page.tsx` |
| 18 | `app/superadmin/reports/[id]/history/page.tsx` |
| 19 | `app/superadmin/groups/[id]/edit/page.tsx` |
| 20 | `app/superadmin/groups/[id]/assign-leader/page.tsx` |
| 21 | `app/superadmin/groups/[id]/add-member/page.tsx` |
| 22 | `app/leader/reports/[id]/history/page.tsx` |
| 23 | `app/member/profile/page.tsx` |
| 24 | `app/member/profile/change-password/page.tsx` |
| 25 | `app/member/membership-requests/page.tsx` |
| 26 | `app/member/meetings/[id]/page.tsx` |
| 27 | `app/profile/change-password/page.tsx` |

</details>

### 3.3 Button — 34 violations (3% wrapper adoption — 1 file uses wrapper)

<details>
<summary>Click to expand full list</summary>

| # | File |
|---|------|
| 1 | `app/(auth)/forgot-password/page.tsx` |
| 2 | `app/(auth)/reset-password/page.tsx` |
| 3 | `app/error.tsx` |
| 4 | `app/not-found.tsx` |
| 5 | `app/offline/page.tsx` |
| 6 | `app/leader/dashboard/page.tsx` |
| 7 | `app/leader/meetings/page.tsx` |
| 8 | `app/leader/reports/page.tsx` |
| 9 | `app/leader/reports/[id]/edit/page.tsx` |
| 10 | `app/leader/reports/[id]/history/page.tsx` |
| 11 | `app/member/dashboard/page.tsx` |
| 12 | `app/member/meetings/[id]/page.tsx` |
| 13 | `app/member/membership-requests/page.tsx` |
| 14 | `app/member/profile/page.tsx` |
| 15 | `app/member/profile/change-password/page.tsx` |
| 16 | `app/profile/change-password/page.tsx` |
| 17 | `app/superadmin/dashboard/page.tsx` |
| 18 | `app/superadmin/groups/page.tsx` |
| 19 | `app/superadmin/groups/[id]/add-member/page.tsx` |
| 20 | `app/superadmin/groups/[id]/assign-leader/page.tsx` |
| 21 | `app/superadmin/groups/[id]/edit/page.tsx` |
| 22 | `app/superadmin/members/page.tsx` |
| 23 | `app/superadmin/reports/page.tsx` |
| 24 | `app/superadmin/reports/[id]/history/page.tsx` |
| 25 | `app/superadmin/users/page.tsx` |
| 26 | `components/features/auth/LoginForm.tsx` |
| 27 | `components/features/campaigns/CampaignBanner.tsx` |
| 28 | `components/features/communications/FollowUpReminderWidget.tsx` |
| 29 | `components/features/notifications/NotificationBell.tsx` |
| 30 | `components/features/pwa/InstallPrompt.tsx` |
| 31 | `components/features/pwa/PushNotificationManager.tsx` |
| 32 | `components/features/reports/ReportActionBar.tsx` |
| 33 | `components/features/reports/ReportFilterBar.tsx` |
| 34 | `components/features/reports/ReportForm.tsx` |

</details>

### 3.4 Modal — 6 violations (0% wrapper adoption)

| # | File |
|---|------|
| 1 | `lib/utils/confirmDialog.tsx` |
| 2 | `components/features/pwa/PushNotificationManager.tsx` |
| 3 | `components/features/navigation/KeyboardShortcutsHelp.tsx` |
| 4 | `components/features/campaigns/CampaignModal.tsx` |
| 5 | `app/superadmin/users/page.tsx` |
| 6 | `app/member/membership-requests/page.tsx` |

### 3.5 Input — 31 violations (6% wrapper adoption — 2 files use `PasswordInput`)

Files import `Input`, `Input.TextArea`, or `Input.Password` directly. Too numerous to list individually — see Section 3.1 for the pattern. Nearly every form page is affected.

---

## 4. Wrapper Adoption Report

| Wrapper | Files Using Wrapper | Files Using Direct Antd | Adoption Rate |
|---------|:-------------------:|:-----------------------:|:-------------:|
| **Table** | 0 | 21 | **0%** |
| **Modal** | 0 | 6 | **0%** |
| **Layout** | 0 | 0 | N/A (unused) |
| **ErrorBoundary** | 0 | 0 | N/A (unused) |
| **Button** | 1 | 34 | **3%** |
| **Input** | 2 | 31 | **6%** |
| **Pagination** | 1 | 0 | 100% |
| **SearchInput** | 1 | 0 | 100% |
| **PageLayout** | 1 | 0 | 100% |
| **Card** | 10 | 27 | **27%** |
| **EmptyState** | 7 | 11 (via antd `Empty`) | 39% |
| **LoadingSkeleton** | 7 | 18+ (via antd `Spin`) | ~28% |
| **MockFileUpload** | 3 | 0 | 100% |
| **ThemeToggle** | 4 | 0 | 100% |

---

## 5. Table Action Column Audit

All **12 tables with action columns** use **inline buttons** — no ellipsis dropdowns exist anywhere.

### Current Patterns (Inconsistent)

| Pattern | Files Using | Description |
|---------|-------------|-------------|
| `<Space>` + `Button type="link"` | 7 files | Most common — text+icon link buttons |
| Bare `<Button>` (no wrapper) | 2 files | Missing consistent wrapper |
| `<div>` flex + `AntButton` | 2 files | Ad-hoc flex layout |
| Icon-only `Button type="text"` + `Tooltip` | 1 file | TemplateSectionBuilder |

### Action Count Distribution

| Actions per row | Files |
|-----------------|-------|
| 1 action | 8 files |
| 2 actions | 1 file |
| 3 actions | 2 files |
| 4 actions | 1 file |

### Issues

1. **No dropdown/ellipsis pattern** — All actions are inline, which doesn't scale well on mobile or with 3+ actions
2. **Inconsistent wrapping** — Some use `<Space>`, some use `<div>`, some use nothing
3. **No standardized action types** — Each file defines its own action button styles
4. **No confirmation pattern** — Destructive actions sometimes have Popconfirm, sometimes don't

---

## 6. Repeated Patterns — New Component Candidates

### 6.1 StatusBadge — HIGH PRIORITY (40 files affected)

**Problem:** 40 files independently define status-to-color mapping functions (`getStatusColor()`, `getRoleColor()`, etc.) and render `<Tag color={...}>` with duplicated logic.

**Common status categories:**
- User/member status: `active`, `inactive`, `pending`, `suspended`
- Meeting attendance: `present`, `absent`, `late`, `excused`
- Request status: `pending`, `approved`, `rejected`, `cancelled`
- Report status: `draft`, `submitted`, `approved`, `revision_requested`
- Role colors: `superadmin`, `leader`, `member`
- Risk levels: `low`, `medium`, `high`, `critical`
- Interaction types: `visit`, `call`, `message`, `prayer`, `counseling`

### 6.2 FilterToolbar — MEDIUM PRIORITY (7 files with ad-hoc filter bars)

**Problem:** Multiple pages build inline filter bars with `Select` + `Input.Search` + reset buttons using varied layouts and patterns.

**Affected files:** superadmin/members, superadmin/users, superadmin/activity-logs, superadmin/reports/analytics, superadmin/groups, leader/interactions, leader/reports/data-entry

### 6.3 Avatar Standardization — LOW PRIORITY (4 files bypass ProfileAvatar)

**Problem:** `ProfileAvatar` component exists but 4 files use raw `Avatar` with inline `.charAt(0)` fallback.

**Affected files:** superadmin/groups/[id]/assign-leader, superadmin/groups/[id]/add-member, CampaignBanner.tsx, CampaignStory.tsx

---

## 7. Proposed Enhancements to Existing Components

### 7.1 Table.tsx — Major Enhancement

**Current state:** Basic wrapper with broken search and no action support.

**Proposed enhancements:**

1. **Action column with ellipsis dropdown:**
   ```typescript
   interface TableAction<T> {
     key: string;
     label: string;
     icon?: ReactNode;
     onClick: (record: T) => void;
     danger?: boolean;
     confirm?: {
       title: string;
       description?: string;
     };
     hidden?: (record: T) => boolean;
     disabled?: (record: T) => boolean;
   }
   ```
   - Renders a `MoreOutlined` (⋯) icon button that opens an Antd `Dropdown` menu
   - Supports optional confirmation dialog for destructive actions
   - Conditional visibility/disabled per row via callback functions

2. **Fix searchable prop:** Wire `searchText` to actual column filtering via `onFilter` or controlled `dataSource` filtering

3. **Loading/empty state props:** Accept `loading` and `emptyText` with design-system-styled defaults

4. **Export a column helper:** Utility function `createActionColumn<T>(actions: TableAction<T>[])` for cases where the consumer needs more control

### 7.2 Card.tsx — Minor Enhancement

- Currently works well but needs wider adoption
- Consider adding a `variant` prop: `default | bordered | flat | glass` for different visual contexts (e.g., form cards vs. data cards)

### 7.3 Modal.tsx — Minor Enhancement

- Add `size` prop: `sm | md | lg | xl` mapping to width values
- Expose `Modal.confirm`/`Modal.warning` static methods that use ds tokens

### 7.4 Button.tsx — Evaluation Needed

The wrapper adds a `variant` prop that maps to Antd `type`. However, many pages also need:
- `Button as AntButton` aliasing (7 files do this to avoid naming conflicts)
- `type="link"` and `type="text"` for table actions
- `danger` prop support

**Decision point:** The wrapper needs to either (a) fully replace all Antd Button usage patterns including form buttons, icon-only buttons, and danger variants, or (b) be scoped to specific CTA/nav use cases and allow direct Antd Button for specialized patterns.

### 7.5 Input.tsx — Evaluation Needed

**Challenge:** Most direct `Input` imports occur inside Antd `Form.Item`, which provides its own label/error handling. The wrapper's `label` and `error` props conflict with Form.Item's built-in functionality.

**Decision point:** Either (a) create a separate `FormInput` variant that strips label/error and only adds ds styling, or (b) accept that within `Form.Item` contexts, direct Antd `Input` is appropriate and only enforce the wrapper for standalone inputs.

### 7.6 PageLayout.tsx — Fix Internal Import

`PageError` imports `Card` from antd directly. Should use the ui wrapper.

### 7.7 SearchInput.tsx — Merge Decision

Currently minimal — basically just ds styling on `Input.Search`. Could be merged into Table's built-in search or kept standalone.

### 7.8 Layout.tsx — Deprecation Candidate

Never used. `DashboardLayout` handles all layout. Recommend either repurposing or removing to reduce confusion.

---

## 8. Proposed New Reusable Components

### 8.1 StatusBadge (HIGH PRIORITY)

```typescript
// components/ui/StatusBadge.tsx
interface StatusBadgeProps {
  status: string;
  category?: 'user' | 'attendance' | 'request' | 'report' | 'role' | 'risk' | 'interaction' | 'custom';
  color?: string;           // Override auto-detected color
  icon?: ReactNode;         // Optional leading icon
  size?: 'sm' | 'md';      // Small or default
  dot?: boolean;            // Show a colored dot instead of full background
}
```

**Centralizes:** All `getStatusColor()`, `getRoleColor()`, etc. functions into one source of truth with design-system-compliant colors.

### 8.2 FilterToolbar (MEDIUM PRIORITY)

```typescript
// components/ui/FilterToolbar.tsx
interface FilterConfig {
  key: string;
  type: 'select' | 'search' | 'date' | 'dateRange';
  label: string;
  placeholder?: string;
  options?: { label: string; value: string }[];  // For select type
  allowClear?: boolean;
}

interface FilterToolbarProps {
  filters: FilterConfig[];
  values: Record<string, unknown>;
  onChange: (key: string, value: unknown) => void;
  onReset?: () => void;
  actions?: ReactNode;   // Additional action buttons (e.g., "Add New")
}
```

**Centralizes:** The 7+ ad-hoc filter bar implementations.

---

## 10. Implementation Plan & Progress

### Phase 2A — Table Enhancement & Migration (Highest Impact)

**Priority: CRITICAL** — 21 files affected, 0% adoption, user's specific request

- [ ] **2A-1** Enhance `Table.tsx` — add `actions` prop with ellipsis dropdown, fix global search, add loading/empty states
- [ ] **2A-2** Migrate all 21 files from direct `Table` to wrapper with ellipsis actions
- [ ] **2A-3** Verify all tables render correctly with new action dropdowns

### Phase 2B — StatusBadge Creation & Migration (Highest Reach)

**Priority: HIGH** — 40 files affected, eliminates most duplicated logic

- [ ] **2B-1** Create `StatusBadge.tsx` with centralized color maps for all status categories
- [ ] **2B-2** Migrate all 40 files to use `StatusBadge` instead of inline `<Tag color={...}>`

### Phase 2C — Card Migration (High Reach)

**Priority: HIGH** — 27 files affected, 27% current adoption

- [ ] **2C-1** Migrate all 27 files from direct `Card` to wrapper
- [ ] **2C-2** Fix `PageLayout.tsx` internal antd Card import

### Phase 2D — Button Migration (Full Replacement)

**Priority: HIGH** — 34 files affected, replace ALL direct usage

- [ ] **2D-1** Enhance `Button.tsx` — cover all patterns (danger, link, text, icon-only, loading, sizes, form submit)
- [ ] **2D-2** Migrate all 34 files from direct `Button` to wrapper

### Phase 2E — Modal & Input Migration

**Priority: MEDIUM**

- [ ] **2E-1** Enhance `Modal.tsx` — add size variants
- [ ] **2E-2** Migrate 6 Modal violations
- [ ] **2E-3** Ensure Input wrapper works seamlessly in Form.Item contexts (label/error optional)
- [ ] **2E-4** Migrate Input violations across all files

### Phase 2F — New Components & Cleanup

**Priority: MEDIUM**

- [x] **2F-1** Create `FilterToolbar.tsx` — config-driven reusable filter bar
- [x] **2F-2** Migrate 9 ad-hoc filter bars to FilterToolbar:
  - [x] `superadmin/users/activity-logs/page.tsx` (P1 — Search + 2 Selects + DateRange)
  - [x] `components/features/reports/ReportFilterBar.tsx` (P1 — Search + 4 Selects + DateRange)
  - [x] `superadmin/groups/[id]/member/[memberId]/attendance-history/page.tsx` (P2 — Select + DateRange + Export action)
  - [x] `superadmin/members/page.tsx` (P2 — Search + Select)
  - [x] `superadmin/users/page.tsx` (P2 — Search + Select)
  - [x] `leader/interactions/page.tsx` (P2 — Search + Select)
  - [x] `superadmin/reports/analytics/page.tsx` (P3 — 2 Selects + Refresh action)
  - [x] `superadmin/groups/page.tsx` (P3 — Search)
  - [x] `leader/members/page.tsx` (P3 — Search)
- [ ] **2F-3** Migrate 4 files to use `ProfileAvatar` instead of raw Avatar
- [x] **2F-4** Deprecate & remove unused `Layout.tsx`
- [x] **2F-5** Deprecate & remove unused `ErrorBoundary.tsx`
- [ ] **2F-6** Final verification — grep for remaining direct antd imports of wrapped components

---

## Estimated Scope

| Phase | New/Modified Components | Files to Migrate | Complexity |
|-------|:-----------------------:|:----------------:|:----------:|
| 2A (Table) | 1 enhanced | 21 | High |
| 2B (StatusBadge) | 1 new | 40 | Medium |
| 2C (Card) | migration only | 28 | Low-Medium |
| 2D (Button) | 1 enhanced | 34 | Medium |
| 2E (Modal + Input) | 2 enhanced | 12-37 | Medium |
| 2F (Filter + Cleanup) | 1 new + deprecation | 13 | Low |
| **Total** | **6 components** | **~148-173 file edits** | — |

---

*Phase 2 — APPROVED. Implementation in progress.*
