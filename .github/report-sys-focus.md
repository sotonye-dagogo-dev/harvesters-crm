# Report System Focus — Understanding, Context & Plan

---

## Summary

Build a **centralized, role-based reporting system** for Harvesters International Christian Center that enables campus-level departmental leaders to submit structured weekly reports (based on **superadmin-configurable report templates** with strategic indicators and key metrics), have those reports flow through a hierarchical review/approval pipeline (Campus Admin → Campus Pastor → Group Admin → Group Pastor → Church Ministry → SPO → CEO), and provide dashboards, history tracking, deadline enforcement, edit-request workflows, and a dedicated Data Entry role for back-filling historical reports.

The existing app role structure will be updated to reflect the full church hierarchy (Cell → Zone → Area → Community → District → Campus → Group) and all non-superadmin/non-member roles will be consolidated under the `/leader` route with dynamic, role-aware rendering. **Report templates are not hardcoded** — Superadmins can create, modify, reorder, add/remove sections and metrics at any time, and reports reference the template version they were created against.

**Significant refactoring** of existing mock data (`mockData.ts`), the in-memory database service (`database.ts`), types (`types.ts`), constants (`constants/index.ts`), and related interfaces is required to accommodate the new hierarchy, data-driven templates, and reporting entities.

---

## Context

### A. What Exists Today (and What Must Change)

The current application is a Church Fellowship CRM built with Next.js 15 (App Router), TypeScript, Tailwind CSS + Ant Design. It has:

- **7-tier user role hierarchy**: `SUPERADMIN → ZONAL_LEADER → CAMPUS_ADMIN → HOD → SMALL_GROUP_LEADER → CELL_LEADER → MEMBER`
- **Organizational units**: Zone, Campus, Department, SmallGroup, Cell (each with types, CRUD, and relationship models)
- **Separate page routes** for `/superadmin`, `/leader`, `/member` — with constants already defining separate routes per role (zonal-leader, campus-admin, hod, cell-leader, etc.) though they all ultimately map to `/leader` pages today
- **Existing features**: meetings, attendance, interactions, follow-ups, membership requests, campaigns, invite links, analytics
- **Mock backend** with in-memory database (`lib/data/database.ts`) and Next.js API routes under `/api/`
- **No reporting system** exists yet — this is net-new functionality

#### What Needs Significant Modification

| Area | Current State | Required Change |
|------|---------------|-----------------|
| `lib/types.ts` | 1487 lines of globally-declared types; no report types; hierarchy missing Area/Community/District; roles missing DATA_ENTRY, CAMPUS_PASTOR, GROUP_ADMIN, GROUP_PASTOR | Add all report-related interfaces + enums; add new org unit types; add new roles; refactor existing types to support data-driven role/hierarchy config |
| `lib/constants/index.ts` | 627 lines; hardcoded `USER_ROLES`, `HIERARCHY_ORDER`, `APP_ROUTES`, `API_ROUTES`; no report constants | Add DATA_ENTRY + new roles to all role maps; add report API/app routes; add report template default structure; make hierarchy ordering data-driven |
| `lib/data/mockData.ts` | Sample users, groups, meetings, etc.; no reports; user roles only cover existing 7 | Add report templates, sample reports at various statuses, report edits, update requests, history events; add users for new roles (Campus Pastor, Group Admin, Data Entry, etc.) |
| `lib/data/database.ts` | CRUD for users, groups, meetings, interactions, etc.; no report operations | Add full report CRUD + workflow operations; add report template CRUD; add report edit/update-request operations; add audit trail functions |
| `providers/AuthProvider.tsx` | Routes users to role-specific dashboards | Update to route all leader-tier roles to `/leader/*` |
| `lib/utils/middleware.ts` | Role-based route protection | Add DATA_ENTRY role handling; unify all leader roles to `/leader` path |
| Existing mock data entities | Users reference old roles exclusively | Add mock users for each new role type; ensure sample data covers the full hierarchy |

### B. The PRD Requirements (Reporting System)

From the provided PRD and report-types documents:

1. **Report Categories** — 11 default sections (stored as a configurable template, not hardcoded):
   - Report Summary – Special Programs (Church Planting, Program Metrics)
   - Attendance & Quality of Program
   - NLP
   - Salvation
   - Small Group / Cell
   - Discipleship / Assimilation
   - Next Gen (Kid-Zone + Stir House)
   - Partnership
   - HAEF
   - Spiritual
   - Relationship Breakthrough

2. **Key Metric Fields** — Each metric captures: Monthly Goal, Monthly Achieved, Year-on-Year Goal. Numeric-only validation, required fields, range validation, auto-save, auto-calculate summaries.

3. **Reporting Workflow/Pipeline**:
   - Campus Departmental Leaders fill in their sections → Campus Admin compiles/submits → Campus Pastor reviews (Approve / Request Edits) → Group Admin / Group Pastor mark as Reviewed → Church Ministry / SPO / CEO have visibility dashboards
   - Statuses: `DRAFT → SUBMITTED → REQUIRES_EDITS → APPROVED → REVIEWED`

4. **Field Locking & Time Controls**: Monthly Goal and YoY Goal locked after submission, Monthly Achieved editable until month end then locked, authorized override possible.

5. **Weekly Submission Cycle**: Reports submitted weekly, tracked by week/month/year.

6. **Notifications**: Email on submit, edit request, approval, available for review.

### C. Additional Client Requirements (Beyond PRD)

1. **48-hour deadline with escalating email reminders** — After 24 hours of the 48-hour deadline window, email notifications every 6 hours until deadline.

2. **Report History & Version Tracking** — Full audit trail of every event on a report (who did what, when). Version snapshots on every significant state change.

3. **Separate Report Edit Entity** — When edits are requested, the submitter creates a new "Report Edit" entity (a revision). It does NOT overwrite the main report until the edit is approved by the reviewer. This keeps the original intact through the review cycle.

4. **Post-Deadline Update Request Channel** — If a deadline has passed and a Campus Admin needs changes, they submit a formal update request (a report edit entity) to the Superadmin, who can then approve and apply the update to the locked report in the DB.

5. **Data Entry Role & Historical Report Interface** — A standalone `DATA_ENTRY` role that can access all report forms purely for entering past/historical reports. These reports:
   - Have their report date set to whatever the Data Entry personnel specifies (since they're back-filling)
   - Go straight into the pipeline like normal reports
   - Record the Data Entry person as the actor/creator with full status tracking
   - Are available alongside all other reports in dashboards/views
   - Superadmins also have this data-entry capability

6. **Superadmin-Managed Report Templates** — Report templates (form types, sections, metrics) are NOT hardcoded. Superadmins can:
   - Create new report templates from scratch
   - Edit existing templates (add/remove/reorder sections, add/remove/rename metrics)
   - Set which sections are required, which fields are mandatory
   - Configure which roles are responsible for filling which sections
   - Activate/deactivate templates
   - Version templates — when a template is modified, existing reports keep the template version they were created with; new reports use the latest version
   - Set default templates per campus/group or use a single global template

7. **Role Consolidation** — All roles between MEMBER and SUPERADMIN should use the `/leader` route. The pages and APIs under `/leader` should be **dynamic and modular**, rendering content/navigation/permissions based on the user's actual role and defined privileges. No more separate `/campus-admin`, `/hod`, `/zonal-leader`, `/cell-leader` routes — all consolidated into `/leader/*`.

8. **Updated Organizational Hierarchy** — The actual church structure is:
   ```
   Cell → Zone → Area → Community → District → Campus → Group
   ```
   - 10 members make a Cell
   - 4 Cells make a Zone
   - 4 of each level make the immediate higher level
   - Campus has a Campus Pastor and Campus Admin
   - Group has a Group Admin
   - All other intermediate levels have Leaders
   - SPO, Church Ministry, and CEO are akin to Group Admin level

### D. Future-Proofing Principles

The system must be designed so that **roles, hierarchy levels, and report templates can be modified without code changes** in the future:

1. **Data-driven role definitions** — Roles and their hierarchy ordering should be defined in a configuration object (and eventually a DB table) rather than spread across dozens of switch statements. A single `ROLE_CONFIG` map drives all permissions, labels, hierarchy order, route access, and report capabilities.

2. **Data-driven org hierarchy** — The parent-child relationships between org levels (Cell → Zone → Area → etc.) should be defined in a config array, not hardcoded conditionals. Adding a new level (e.g., "Region" between District and Campus) should mean adding one entry, not modifying 50 files.

3. **Template-driven reports** — All report structure comes from the `ReportTemplate` entity stored in the database (mock or real). The UI renders forms dynamically from template definitions. No report section or metric name is hardcoded in components.

4. **Workflow-driven status transitions** — The valid status transitions for reports (who can do what, from which state) are defined in a config map, not in if/else chains. Adding a new status or changing the flow means updating the config.

---

## Plan

### Phase R1: Data Modeling & Types (Report System Foundation)

**Goal**: Define all types, enums, and interfaces needed for the reporting system. Refactor existing types where they conflict with the new hierarchy and role structure.

- [x] **R1.1** Add new report-related enums to `lib/types.ts`:
  - `ReportStatus`: `DRAFT | SUBMITTED | REQUIRES_EDITS | APPROVED | REVIEWED | LOCKED`
  - `ReportEventType`: `CREATED | SUBMITTED | EDIT_REQUESTED | EDIT_SUBMITTED | EDIT_APPROVED | EDIT_REJECTED | APPROVED | REVIEWED | LOCKED | DEADLINE_PASSED | UPDATE_REQUESTED | UPDATE_APPROVED | UPDATE_REJECTED | DATA_ENTRY_CREATED | TEMPLATE_VERSION_NOTE`
  - `ReportPeriodType`: `WEEKLY | MONTHLY | YEARLY`
  - `MetricFieldType`: `NUMBER | PERCENTAGE | TEXT | CURRENCY` (for template flexibility)

- [x] **R1.2** Define **ReportTemplate** interfaces (data-driven, not hardcoded):
  - `ReportTemplate` — id, name, description, version, sections[], isActive, isDefault, createdById, campusId/groupId (optional scope), createdAt, updatedAt
  - `ReportTemplateSection` — id, templateId, name, description, order, isRequired, subSections[], metrics[]
  - `ReportTemplateMetric` — id, sectionId, name, description, fieldType (MetricFieldType), isRequired, minValue, maxValue, order, capturesGoal, capturesAchieved, capturesYoY
  - `ReportTemplateVersion` — id, templateId, versionNumber, snapshot (full template JSON), createdAt, createdById
  - `ReportFieldPermission` — templateId, sectionId, roleId, canEdit, canView
  - Input types: `CreateReportTemplateInput`, `UpdateReportTemplateInput`, `CreateTemplateSectionInput`, `CreateTemplateMetricInput`

- [x] **R1.3** Define core **Report** interfaces:
  - `Report` — id, templateId, templateVersionId, campusId, groupId, periodType, periodYear, periodMonth, periodWeek, status, submittedById, reviewedById, approvedById, deadline, lockedAt, isDataEntry, dataEntryById, dataEntryDate, notes, createdAt, updatedAt
  - `ReportSection` — id, reportId, templateSectionId, sectionName (snapshot from template), metrics[]
  - `ReportMetric` — id, reportSectionId, templateMetricId, metricName (snapshot), monthlyGoal, monthlyAchieved, yoyGoal, computedPercentage, isLocked, lockedAt, lockedById
  - `ReportWithDetails` — extends Report with resolved template, sections, metrics, campus, group, submittedBy, etc.

- [x] **R1.4** Define **ReportEdit** interfaces:
  - `ReportEdit` — id, reportId, submittedById, status (DRAFT | SUBMITTED | APPROVED | REJECTED), reason, sections[] (proposed changes), reviewedById, reviewNotes, createdAt, updatedAt
  - `ReportEditSection` — mirrors ReportSection but for the edit entity
  - `ReportEditMetric` — mirrors ReportMetric but for the edit entity

- [x] **R1.5** Define **ReportUpdateRequest** interfaces:
  - `ReportUpdateRequest` — id, reportId, requestedById, reason, sections[] (proposed changes), status (PENDING | APPROVED | REJECTED), reviewedById, reviewNotes, createdAt, updatedAt

- [x] **R1.6** Define **ReportEvent** / audit trail interfaces:
  - `ReportEvent` — id, reportId, eventType (ReportEventType), actorId, timestamp, details (JSON), previousStatus, newStatus, snapshotId
  - `ReportVersion` — id, reportId, versionNumber, snapshot (full report JSON), createdAt, createdById, reason

- [x] **R1.7** Define report analytics interfaces:
  - `ReportAnalytics` — campusId, groupId, period, totalReports, submittedOnTime, submittedLate, pendingReview, approved, complianceRate
  - `ReportComplianceSummary` — per campus/group compliance over time

- [x] **R1.8** Update `UserRole` enum — add `DATA_ENTRY`, `CAMPUS_PASTOR`, `GROUP_ADMIN`, `GROUP_PASTOR`. Update `HIERARCHY_ORDER`. Update all role labels.

- [x] **R1.9** Add new org hierarchy types — `Area`, `Community`, `District` interfaces (if not present). Ensure the chain Cell → Zone → Area → Community → District → Campus → Group is modeled. Each interface follows the same pattern: id, name, description, parentId, leaderId, isActive, timestamps.

- [x] **R1.10** Define **RoleConfig** type for data-driven role system:
  - `RoleConfig` — role, label, hierarchyOrder, dashboardRoute, canCreateReports, canReviewReports, canApproveReports, canManageTemplates, canDataEntry, reportVisibilityScope, navItems[]
  - `OrgLevelConfig` — level, label, parentLevel, childLevel, membersPerUnit, leaderRole

- [x] **R1.11** Define filter/form types for reports:
  - `ReportFilters` — campusId, groupId, periodType, periodYear, periodMonth, periodWeek, status, templateId, search, isDataEntry
  - `ReportFormValues` — for Ant Design form binding
  - `ReportTemplateFormValues` — for template creation/editing

### Phase R2: Report Constants, Template Defaults & Role Config

**Goal**: Define the default report template structure, role config, status workflow, and all reporting constants. These serve as defaults seeded into mock data — the actual source of truth is the template entities in the DB.

- [x] **R2.1** Create `lib/constants/reports.ts`:
  - `DEFAULT_REPORT_TEMPLATE` — The 11-section template from the report-types doc, fully structured as a `ReportTemplate` object with all sections, sub-sections, and metrics. This is used to **seed** the first template in mock data, not hardcoded into the UI.
  - `REPORT_STATUS_TRANSITIONS` — Map of `status → { allowedNextStatuses[], requiredRole[] }` for workflow enforcement
  - `REPORT_DEADLINE_CONFIG` — `{ submissionWindowHours: 48, reminderStartHours: 24, reminderIntervalHours: 6 }`
  - `REPORT_PERIOD_CONFIG` — Weekly cycle day boundaries

- [x] **R2.2** Define `ROLE_CONFIG` in `lib/constants/roles.ts` (or extend `index.ts`):
  - A `Record<UserRole, RoleConfig>` mapping every role to its full permission set, navigation items, dashboard route, and report capabilities
  - Helper functions: `getRoleConfig(role)`, `canRolePerformAction(role, action)`, `getRoleNavItems(role)`, `getRoleReportPermissions(role)`
  - This single config replaces scattered `if (role === ...)` checks throughout the codebase

- [x] **R2.3** Define `ORG_HIERARCHY_CONFIG` — ordered array of `OrgLevelConfig`:
  ```
  [Cell(10 members) → Zone(4 cells) → Area(4 zones) → Community(4 areas) → District(4 communities) → Campus(has pastor+admin) → Group(has admin)]
  ```
  - Helper functions: `getParentLevel(level)`, `getChildLevel(level)`, `getLeaderRoleForLevel(level)`, `getLevelsBetween(low, high)`

- [x] **R2.4** Add report-related API routes to `API_ROUTES` constant.

- [x] **R2.5** Add report-related app routes to `APP_ROUTES` constant.

- [x] **R2.6** Add report-related `NotificationType` enum values and labels.

### Phase R3: Mock Data & Database Service Overhaul

**Goal**: Create report mock data and extend the in-memory database. Also update existing mock data to include new roles and org units.

- [x] **R3.1** Update `mockData.ts` — Add mock users for new roles:
  - DATA_ENTRY users (at least 2)
  - CAMPUS_PASTOR users (one per campus)
  - GROUP_ADMIN users (one per group)
  - GROUP_PASTOR users (one per group)
  - Ensure existing users are updated if their role names changed

- [ ] **R3.2** Add mock org units for new hierarchy levels (deferred — Area/Community/District mock entities):
  - Sample Area, Community, District entities
  - Wire them into the Cell → Zone → ... → Group chain

- [x] **R3.3** Seed default report template:
  - Create the 11-section template as a `ReportTemplate` entity in mock data (from `DEFAULT_REPORT_TEMPLATE` constant)
  - Include a version record for it

- [x] **R3.4** Add sample reports:
  - Reports at various statuses (DRAFT, SUBMITTED, APPROVED, REVIEWED, LOCKED, REQUIRES_EDITS)
  - Reports from different campuses and periods
  - At least one data-entry report with `isDataEntry: true`
  - At least one report with associated ReportEdit entities
  - At least one ReportUpdateRequest

- [x] **R3.5** Add sample report events/history entries for the sample reports.

- [x] **R3.6** Extend `database.ts` — Report Template CRUD:
  - `createReportTemplate()`, `getReportTemplate()`, `getReportTemplates()`, `updateReportTemplate()`, `deleteReportTemplate()`
  - `publishTemplateVersion()` — snapshot current template state into a version
  - `getTemplateVersions()`, `getTemplateVersion()`

- [x] **R3.7** Extend `database.ts` — Report CRUD:
  - `createReport()`, `getReport()`, `getReports()`, `updateReport()`, `deleteReport()`
  - `getReportWithDetails()` — resolves template, sections, metrics, actor names

- [x] **R3.8** Extend `database.ts` — Report workflow operations:
  - `submitReport()`, `approveReport()`, `requestEdits()`, `reviewReport()`, `lockReport()`
  - Each operation validates status transitions, records events, creates version snapshots

- [x] **R3.9** Extend `database.ts` — Report Edit operations:
  - `createReportEdit()`, `getReportEdits()`, `updateReportEdit()`, `submitReportEdit()`
  - `approveReportEdit()` — merges edit values into parent report, records event
  - `rejectReportEdit()` — records rejection event

- [x] **R3.10** Extend `database.ts` — Report Update Request operations:
  - `createUpdateRequest()`, `getUpdateRequests()`, `getUpdateRequest()`
  - `approveUpdateRequest()` — applies changes to locked report, records event
  - `rejectUpdateRequest()`

- [x] **R3.11** Extend `database.ts` — Audit trail:
  - `addReportEvent()`, `getReportHistory()`, `getReportVersions()`
  - `createReportVersion()` — snapshot report state

- [x] **R3.12** Extend `database.ts` — Report analytics queries:
  - `getReportComplianceStats()`, `getCampusReportAnalytics()`, `getGroupReportAnalytics()`

### Phase R4: API Routes — Report & Template Endpoints

**Goal**: Create Next.js API routes for the reporting system and template management.

- [x] **R4.1** Report Template endpoints:
  - `GET /api/report-templates` — List templates (optionally filter by scope, active status)
  - `GET /api/report-templates/:id` — Get template with all sections/metrics
  - `POST /api/report-templates` — Create template (Superadmin only)
  - `PUT /api/report-templates/:id` — Update template (Superadmin only)
  - `DELETE /api/report-templates/:id` — Deactivate template (Superadmin only)
  - [ ] `POST /api/report-templates/:id/publish` — Publish new version snapshot (deferred — update auto-publishes)
  - `GET /api/report-templates/:id/versions` — List template versions

- [x] **R4.2** Core report CRUD:
  - `GET /api/reports` — List reports (filterable by campus, group, period, status, role-scoped)
  - `GET /api/reports/:id` — Get report with sections/metrics
  - `POST /api/reports` — Create new report (references a templateId; or data entry report with custom date)
  - `PUT /api/reports/:id` — Update report metric values (draft edits, auto-save)
  - `DELETE /api/reports/:id` — Delete draft report

- [x] **R4.3** Report workflow action endpoints:
  - `POST /api/reports/:id/submit` — Submit report (validates completeness, sets status, triggers notifications)
  - `POST /api/reports/:id/approve` — Approve report (Campus Pastor)
  - `POST /api/reports/:id/request-edits` — Request edits (with feedback message)
  - `POST /api/reports/:id/review` — Mark as reviewed (Group Admin/Pastor)
  - `POST /api/reports/:id/lock` — Manual lock / auto-lock

- [x] **R4.4** Report Edit endpoints:
  - `GET /api/reports/:id/edits` — List edit submissions for a report
  - `POST /api/reports/:id/edits` — Create an edit (separate entity with proposed changes)
  - [ ] `PUT /api/reports/:id/edits/:editId` — Update a draft edit (deferred)
  - `POST /api/reports/:id/edits/:editId/submit` — Submit edit for review
  - `POST /api/reports/:id/edits/:editId/approve` — Approve edit (merges into main report)
  - `POST /api/reports/:id/edits/:editId/reject` — Reject edit

- [x] **R4.5** Report Update Request endpoints (post-deadline):
  - `GET /api/report-update-requests` — List update requests (Superadmin scoped)
  - `POST /api/report-update-requests` — Create update request (Campus Admin)
  - `GET /api/report-update-requests/:id` — Get request details
  - `POST /api/report-update-requests/:id/approve` — Superadmin approves and applies changes
  - `POST /api/report-update-requests/:id/reject` — Superadmin rejects

- [x] **R4.6** Report history & version endpoints:
  - `GET /api/reports/:id/history` — Full audit trail
  - `GET /api/reports/:id/versions` — Version snapshots

- [x] **R4.7** Report analytics endpoints:
  - `GET /api/analytics/reports` — Overall report submission stats, compliance rates
  - [ ] `GET /api/analytics/reports/campus/:id` — Campus reporting performance (deferred — use ?campusId= filter)
  - [ ] `GET /api/analytics/reports/group/:id` — Group reporting performance (deferred — use ?groupId= filter)

### Phase R5: Role Updates & Route Consolidation

**Goal**: Update user roles, add DATA_ENTRY, and consolidate all leader routes under `/leader` with dynamic, role-aware rendering.

- [x] **R5.1** Update `UserRole` enum and all role infrastructure across the codebase:
  - Add `DATA_ENTRY`, `CAMPUS_PASTOR`, `GROUP_ADMIN`, `GROUP_PASTOR` to enum, constants, labels
  - Update `HIERARCHY_ORDER` to include new roles
  - Update `MEETING_LEVEL_PERMISSIONS` for new roles
  - Update `isLeadershipRole()`, `getRolesBelow()`, etc.

- [x] **R5.2** Implement `ROLE_CONFIG` from Phase R2 and integrate across the app:
  - Replace scattered role checks with `getRoleConfig(role).canX` calls
  - Wire role config into navigation component

- [x] **R5.3** Update leader layout (`app/leader/layout.tsx`):
  - Read user role from auth context
  - Render role-appropriate sidebar navigation from `ROLE_CONFIG`
  - Show/hide menu items based on role permissions

- [x] **R5.4** Make leader pages role-aware:
  - Leader dashboard shows role-specific widgets and stats
  - `/leader/reports` pages dynamically render based on role:
    - Departmental leaders → Fill report sections
    - Campus Admin → Compile, view, submit reports
    - Campus Pastor → Review, approve/request edits
    - Group Admin / Group Pastor → View, mark reviewed
    - Data Entry → Historical report entry interface

- [x] **R5.5** Update middleware/auth routing:
  - All non-SUPERADMIN, non-MEMBER roles route to `/leader/*`
  - DATA_ENTRY routes to `/leader/*` with reports access only
  - Existing SUPERADMIN routes remain at `/superadmin/*`
  - Member routes remain at `/member/*`

- [x] **R5.6** Update `AuthProvider` redirect logic for new roles.

- [ ] **R5.7** Update `APP_ROUTES` to remove per-role route sets (deferred — old routes kept for backward compatibility).

### Phase R6: Report UI — Pages & Components

**Goal**: Build the user-facing report pages and reusable components. All report UI renders dynamically from template definitions.

- [x] **R6.1** Create report component library (`components/features/reports/`):
  - `ReportForm.tsx` — Dynamically renders form sections/metrics from a `ReportTemplate`; supports auto-save; respects field locking and role permissions
  - `ReportMetricField.tsx` — Input for a single metric (monthlyGoal, monthlyAchieved, yoyGoal) with numeric validation, lock indicator
  - `ReportSectionCard.tsx` — Collapsible Ant Design Card for one report section; renders its child metrics
  - `ReportStatusBadge.tsx` — Ant Design Tag showing report status with color coding
  - `ReportTimeline.tsx` — Ant Design Timeline showing report event history
  - `ReportEditDiff.tsx` — Side-by-side or inline diff between main report values and proposed edit
  - `ReportDeadlineCountdown.tsx` — Countdown to submission deadline
  - [ ] `ReportComplianceChart.tsx` — Chart (bar/line) showing submission compliance rates (deferred to R9)
  - [ ] `ReportSummaryTable.tsx` — Auto-calculated performance table (deferred to R9)
  - `ReportFilterBar.tsx` — Filter controls for campus, group, period, status, template
  - `ReportActionBar.tsx` — Submit/approve/request-edits/review action buttons based on role + status

- [ ] **R6.2** Create template management components (deferred — `components/features/reports/templates/`):
  - `TemplateBuilder.tsx` — Drag-and-drop or ordered list of sections; add/remove/reorder sections and metrics
  - `TemplateSectionEditor.tsx` — Edit section name, description, required flag, add metrics
  - `TemplateMetricEditor.tsx` — Edit metric name, field type, required, min/max, which value types to capture
  - `TemplatePreview.tsx` — Preview how the report form will look from the template
  - `TemplateVersionHistory.tsx` — List past template versions with diff

- [x] **R6.3** Create leader report pages (`app/leader/reports/`):
  - `page.tsx` — Report list (role-scoped view with filters)
  - `new/page.tsx` — Create new report (selects template, campus/period)
  - `[id]/page.tsx` — View report detail with sections, metrics, history, action buttons
  - `[id]/edit/page.tsx` — Edit report (creates ReportEdit entity if already submitted)
  - `[id]/history/page.tsx` — Full audit trail view
  - `[id]/edits/page.tsx` — List of edit submissions for this report
  - `data-entry/page.tsx` — Historical report entry form (DATA_ENTRY + Superadmin)

- [x] **R6.4** Create superadmin report pages (`app/superadmin/reports/`):
  - `page.tsx` — All reports across campuses/groups with filtering
  - `update-requests/page.tsx` — Post-deadline update request queue
  - `analytics/page.tsx` — Reporting compliance analytics dashboard
  - `templates/page.tsx` — Template management list
  - [ ] `templates/new/page.tsx` — Create new template (deferred — needs TemplateBuilder component)
  - `templates/[id]/page.tsx` — View/edit template
  - [ ] `templates/[id]/versions/page.tsx` — Template version history (deferred)

- [ ] **R6.5** Create dashboard widgets (deferred to R9):
  - Report submission status widget (leader dashboard)
  - Pending reviews widget (campus pastor dashboard)
  - Compliance overview widget (superadmin dashboard)
  - Deadline reminder widget (sidebar or dashboard)
  - Update requests pending widget (superadmin)

### Phase R7: Notification System for Reports

**Goal**: Implement report-specific notifications and deadline reminder logic.

- [x] **R7.1** Add `NotificationType` values:
  - `REPORT_SUBMITTED`, `REPORT_EDITS_REQUESTED`, `REPORT_APPROVED`, `REPORT_REVIEWED`
  - `REPORT_EDIT_APPROVED`, `REPORT_EDIT_REJECTED`
  - `REPORT_UPDATE_REQUEST_APPROVED`, `REPORT_UPDATE_REQUEST_REJECTED`
  - `REPORT_DEADLINE_REMINDER`, `REPORT_DEADLINE_FINAL`

- [x] **R7.2** Implement notification triggers in report workflow operations (6/9 routes wired; remaining: approve, request-edits, edit-reject):
  - Report submitted → Notify Campus Pastor
  - Edits requested → Notify Campus Admin (submitter)
  - Report approved → Notify Campus Admin + Group Admin
  - Report available for review → Notify Group Admin/Pastor
  - Edit approved/rejected → Notify edit submitter
  - Update request approved/rejected → Notify requester

- [ ] **R7.3** Implement deadline reminder logic:
  - Track report deadlines
  - At 24 hours remaining → First reminder notification
  - Every 6 hours after → Escalating reminders
  - At deadline → Final notice + auto-approve if no reviewer action (FR29)
  - Mock implementation: generate notifications at appropriate times when reports are queried

### Phase R8: Field Locking & Auto-Calculations

**Goal**: Implement field locking rules and auto-calculation per PRD requirements.

- [x] **R8.1** Implement field locking logic (utility layer in `reportFieldUtils.ts`; API-level enforcement deferred):
  - Monthly Goal → Locked after first submission of report (FR18)
  - Year-on-Year Goal → Locked after first submission (FR19)
  - Monthly Achieved → Editable until month end, then locked (FR20-21)
  - Track locked state per metric: `isLocked`, `lockedAt`, `lockedById`
  - Prevent modification of locked fields at API level (FR22)

- [ ] **R8.2** Implement Superadmin override:
  - Superadmin can unlock any field (FR23)
  - Logs override event in audit trail

- [x] **R8.3** Implement auto-calculations (in `reportFieldUtils.ts` — computeAchievementPercentage, computeYoYGrowth; section/report-level summaries deferred):
  - `computedPercentage = (monthlyAchieved / monthlyGoal) * 100` where applicable
  - Section-level summaries: totals, averages across metrics
  - Report-level summary: overall completion, performance score
  - Trend calculation: compare current period to previous period

- [ ] **R8.4** Implement submission validation:
  - Prevent submission if required fields are incomplete (FR17)
  - Range validation on numeric fields (FR14)
  - Return detailed validation errors listing which fields are incomplete

- [ ] **R8.5** Implement auto-approve on deadline:
  - If deadline passes and Campus Pastor hasn't acted, auto-approve (FR29)
  - Record auto-approve event in audit trail

### Phase R9: Integration Testing & Polish

**Goal**: Verify the entire reporting flow end-to-end and polish UX.

- [ ] **R9.1** Test complete pipeline: Draft → Submit → Review → Approve → Lock
- [ ] **R9.2** Test edit workflow: Request Edits → Edit Submitted → Edit Approved (merges into main)
- [ ] **R9.3** Test post-deadline update request flow
- [ ] **R9.4** Test data entry flow with custom dates
- [ ] **R9.5** Test template management: create, edit, publish version, use in report
- [ ] **R9.6** Test role-based visibility — each role sees only what they should
- [ ] **R9.7** Test deadline enforcement and notification generation
- [ ] **R9.8** Test auto-save and validation feedback
- [ ] **R9.9** Test field locking and Superadmin override
- [ ] **R9.10** Responsive design verification (desktop, tablet, mobile)
- [ ] **R9.11** Error handling and edge cases (expired deadlines, deleted templates, orphaned reports)
- [ ] **R9.12** Accessibility check on report forms (keyboard nav, screen readers, ARIA)

---

## Implementation Priority

| Priority | Phase | Description |
|----------|-------|-------------|
| **P0** | R1 | Data modeling — Types, enums, interfaces (including template types) |
| **P0** | R2 | Constants — Default template, role config, workflow config |
| **P0** | R3 | Mock backend — DB service, sample data (including existing data updates) |
| **P0** | R4 | API routes — All report + template endpoints |
| **P1** | R5 | Role updates — New roles, DATA_ENTRY, `/leader` consolidation |
| **P1** | R6 | UI — Report pages, forms, template management, components |
| **P2** | R7 | Notifications — Triggers, deadline reminders |
| **P2** | R8 | Field locking, auto-calculations, auto-approve |
| **P3** | R9 | Testing, polish, edge cases |

**P0** = Must have for the system to function at all
**P1** = Must have for usability
**P2** = Required for full feature parity with PRD
**P3** = Quality assurance

---

## Key Design Decisions

1. **Report templates are data-driven, not hardcoded** — The 11 default sections from the PRD are seeded as the initial `ReportTemplate` entity. Superadmins can create, edit, and version templates at any time. The UI renders report forms dynamically from the template definition. This means no report section name or metric field is ever hardcoded in a React component — it all comes from the template data.

2. **Template versioning** — When a Superadmin modifies a template, a new version is published. Existing reports retain a reference to the template version they were created with (`templateVersionId`), so their structure doesn't change retroactively. New reports use the latest version.

3. **Report Edit as a separate entity** — A `ReportEdit` is a full or partial copy of report metric values that exists independently. When approved, its values are merged into the parent `Report`. This preserves the original report state until explicit approval.

4. **Report vs ReportUpdateRequest** — A `ReportEdit` is used during the normal review cycle (before lock). A `ReportUpdateRequest` is specifically for post-deadline/post-lock changes and requires Superadmin approval. Both carry metric changes but follow different approval paths.

5. **Version tracking** — Each significant state change (submit, approve, edit applied, update applied) creates a version snapshot. The history log records every micro-event with actor, timestamp, and before/after status.

6. **Data Entry reports** — These are regular `Report` entities with `isDataEntry: true` and `dataEntryById` populated. Their period date is set by the Data Entry user rather than auto-calculated. They enter the pipeline normally and are visible alongside other reports.

7. **Data-driven role system** — A single `ROLE_CONFIG` map defines everything a role can do: navigation items, report permissions, hierarchy position, route access. Adding a role or changing permissions means editing one config object, not searching through dozens of files. The same principle applies to org hierarchy (`ORG_HIERARCHY_CONFIG`).

8. **Dynamic `/leader` route** — One layout, one sidebar, one set of pages — all parameterized by user role via `ROLE_CONFIG`. UI components check `getRoleConfig(role).canX` before rendering sections. This is the consolidation of all intermediate role routes.

9. **Weekly reporting cycle** — Each report covers a specific week. The system tracks submission windows (48-hour deadlines from period end). The deadline configuration is externalized in `REPORT_DEADLINE_CONFIG` so it can be adjusted without code changes.

10. **Significant existing data refactoring** — This is not a bolt-on feature. Mock users, org units, and the database service all need updates to support the new roles, hierarchy, and template-driven reporting. The plan accounts for this as part of Phase R3, not as an afterthought.
