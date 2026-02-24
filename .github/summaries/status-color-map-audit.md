# Status → Color Map Audit

> Comprehensive inventory of every status-value-to-color mapping found in the codebase.
> Generated for building a centralized `StatusBadge` component.

---

## Summary

- **Total unique categories:** 15
- **Total unique status→color mappings:** ~95+
- **Files with color mapping logic:** ~25 source files (excluding `.github/` summaries)
- **Existing centralized components:** `ReportStatusBadge.tsx`, `REPORT_STATUS_COLORS`, `REPORT_STATUS_LABELS`

---

## 1. Membership Request Status

| Status | Color | Source File(s) |
|--------|-------|---------------|
| `PENDING` | `warning` | `components/features/membership/MembershipRequestCard.tsx` |
| `APPROVED` | `success` | `components/features/membership/MembershipRequestCard.tsx` |
| `REJECTED` | `error` | `components/features/membership/MembershipRequestCard.tsx` |
| _(default)_ | `default` | `components/features/membership/MembershipRequestCard.tsx` |

## 2. Membership Request Type

| Status | Color | Source File(s) |
|--------|-------|---------------|
| `JOIN` | `blue` | `components/features/membership/MembershipRequestCard.tsx` |
| _(non-JOIN)_ | `purple` | `components/features/membership/MembershipRequestCard.tsx` |

## 3. Campaign Status

| Status | Color | Source File(s) |
|--------|-------|---------------|
| `ACTIVE` | `success` | `components/features/campaigns/CampaignBanner.tsx`, `CampaignCard.tsx` |
| `DRAFT` | `processing` | `components/features/campaigns/CampaignBanner.tsx`, `CampaignCard.tsx` |
| `EXPIRED` | `default` | `components/features/campaigns/CampaignBanner.tsx`, `CampaignCard.tsx` |
| `ARCHIVED` | `warning` | `components/features/campaigns/CampaignBanner.tsx`, `CampaignCard.tsx` |
| _(default)_ | `default` | `components/features/campaigns/CampaignBanner.tsx`, `CampaignCard.tsx` |

## 4. Interaction Type

| Status | Color | Source File(s) |
|--------|-------|---------------|
| `CALL` | `blue` | `components/features/interactions/InteractionLog.tsx`, `app/leader/interactions/page.tsx` |
| `FOLLOW_UP` | `green` | `components/features/interactions/InteractionLog.tsx`, `app/leader/interactions/page.tsx` |
| `CHECK_IN` | `purple` | `components/features/interactions/InteractionLog.tsx`, `app/leader/interactions/page.tsx` |
| _(default)_ | `default` | `components/features/interactions/InteractionLog.tsx`, `app/leader/interactions/page.tsx` |

## 5. Attendance (Numeric Rate)

| Condition | Color | Source File(s) |
|-----------|-------|---------------|
| `rate >= 80` | `success` | `components/features/meetings/MeetingCard.tsx` |
| `rate >= 60` | `warning` | `components/features/meetings/MeetingCard.tsx` |
| `rate < 60` | `error` | `components/features/meetings/MeetingCard.tsx` |

**Variant in `app/leader/members/page.tsx`:**

| Condition | Color |
|-----------|-------|
| `rate >= 80` | `green` |
| `rate >= 50` | `orange` |
| `rate < 50` | `red` |

## 6. Attendance (Boolean Present/Absent)

| Status | Color | Source File(s) |
|--------|-------|---------------|
| Present (`true`) | `success` | `components/features/meetings/AttendanceList.tsx`, `app/leader/members/[id]/page.tsx`, `app/member/history/page.tsx` |
| Absent (`false`) | `error` | `components/features/meetings/AttendanceList.tsx`, `app/leader/members/[id]/page.tsx`, `app/member/history/page.tsx` |

**Static labels in `AttendanceList.tsx`:**

| Label | Color |
|-------|-------|
| Present count | `success` |
| Absent count | `error` |
| Rate % | `blue` |

## 7. Priority (Follow-Up)

| Priority | Color | Source File(s) |
|----------|-------|---------------|
| `HIGH` | `red` | `components/features/communications/FollowUpReminderWidget.tsx` |
| `MEDIUM` | `orange` | `components/features/communications/FollowUpReminderWidget.tsx` |
| `LOW` | `blue` | `components/features/communications/FollowUpReminderWidget.tsx` |
| _(default)_ | `default` | `components/features/communications/FollowUpReminderWidget.tsx` |

## 8. Risk Level

| Level | Color | Source File(s) |
|-------|-------|---------------|
| `high` | `red` | `app/leader/follow-ups/page.tsx` |
| `medium` | `orange` | `app/leader/follow-ups/page.tsx` |
| `low` | `yellow` | `app/leader/follow-ups/page.tsx` |
| _(default)_ | `gray` | `app/leader/follow-ups/page.tsx` |

## 9. Follow-Up Status

| Status | Color | Source File(s) |
|--------|-------|---------------|
| `COMPLETED` | `green` | `app/leader/follow-ups/page.tsx` |
| `PENDING` | `blue` | `app/leader/follow-ups/page.tsx` |
| `OVERDUE` | `red` | `app/leader/follow-ups/page.tsx` |
| _(default)_ | `gray` | `app/leader/follow-ups/page.tsx` |

## 10. Follow-Up Type

| Type | Color | Source File(s) |
|------|-------|---------------|
| `CALL` | `blue` | `app/leader/follow-ups/page.tsx` (inline record) |
| `VISIT` | `green` | `app/leader/follow-ups/page.tsx` |
| `MESSAGE` | `purple` | `app/leader/follow-ups/page.tsx` |

## 11. User Role (Ant Design Tag colors)

### `app/superadmin/members/page.tsx` — Full role→color map:

| Role | Color |
|------|-------|
| `SUPERADMIN` | `red` |
| `GROUP_PASTOR` | `volcano` |
| `GROUP_ADMIN` | `orange` |
| `CAMPUS_PASTOR` | `gold` |
| `ZONAL_LEADER` | `purple` |
| `CAMPUS_ADMIN` | `geekblue` |
| `HOD` | `blue` |
| `SMALL_GROUP_LEADER` | `cyan` |
| `CELL_LEADER` | `lime` |
| `DATA_ENTRY` | `magenta` |
| `MEMBER` | `green` |

### `app/superadmin/users/activity-logs/page.tsx` — Simplified (3 roles):

| Role | Color |
|------|-------|
| `SUPERADMIN` | `red` |
| `SMALL_GROUP_LEADER` | `blue` |
| `MEMBER` | `green` |
| _(default)_ | `default` |

### `app/profile/page.tsx` — Simplified (3 roles):

| Role | Color |
|------|-------|
| `SUPERADMIN` | `red` |
| `SMALL_GROUP_LEADER` | `blue` |
| `MEMBER` | `green` |

### `app/superadmin/groups/[id]/member/[memberId]/stats/page.tsx` — Inline ternary (3 roles):

| Role | Color |
|------|-------|
| `SUPERADMIN` | `red` |
| `SMALL_GROUP_LEADER` | `blue` |
| _(other)_ | `green` |

### `app/superadmin/users/[id]/page.tsx` — Same inline ternary (3 roles)

### `components/features/users/UserCard.tsx` — Tailwind CSS classes (not Tag colors):

| Role | CSS Classes |
|------|------------|
| `SUPERADMIN` | `bg-ds-status-error/10 text-ds-status-error` |
| `ZONAL_LEADER` | `bg-ds-chart-3/10 text-purple-800` |
| `CAMPUS_ADMIN` | `bg-ds-brand-accent-subtle text-ds-brand-accent` |
| `HOD` | `bg-ds-chart-1/10 text-ds-chart-1` |
| `SMALL_GROUP_LEADER` | `bg-cyan-100 text-cyan-800` |
| `CELL_LEADER` | `bg-teal-100 text-teal-800` |
| `MEMBER` | `bg-ds-status-success/10 text-ds-status-success` |
| _(default)_ | `bg-ds-surface-sunken text-ds-text-primary` |

### `components/features/auth/LoginForm.tsx` — DEV_CREDENTIALS role colors:

| Role Label | Color |
|------------|-------|
| Superadmin | `red` |
| Group Pastor | `volcano` |
| Group Admin | `orange` |
| Campus Pastor | `gold` |
| Campus Admin | `lime` |
| Zonal Leader | `green` |
| HOD | `cyan` |
| SG Leader | `blue` |
| Cell Leader | `geekblue` |
| Data Entry | `purple` |
| Member | `magenta` |

## 12. Activity Log Action Type

| Action | Color | Source File(s) |
|--------|-------|---------------|
| `CREATE` | `green` | `app/superadmin/users/activity-logs/page.tsx` |
| `UPDATE` | `blue` | `app/superadmin/users/activity-logs/page.tsx` |
| `DELETE` | `red` | `app/superadmin/users/activity-logs/page.tsx` |
| `LOGIN` | `cyan` | `app/superadmin/users/activity-logs/page.tsx` |
| `LOGOUT` | `default` | `app/superadmin/users/activity-logs/page.tsx` |
| `APPROVE` | `green` | `app/superadmin/users/activity-logs/page.tsx` |
| `REJECT` | `red` | `app/superadmin/users/activity-logs/page.tsx` |
| _(default)_ | `default` | `app/superadmin/users/activity-logs/page.tsx` |

## 13. Member Status (Group Membership)

### `app/leader/my-group/page.tsx`:

| Status | Color | Icon |
|--------|-------|------|
| `active` | `green` | `CheckCircleOutlined` |
| `at-risk` | `orange` | `ClockCircleOutlined` |
| `inactive` | `red` | `CloseCircleOutlined` |

### Active/Inactive Boolean:

| Status | Color | Source File(s) |
|--------|-------|---------------|
| Active (`isActive: true`) | `success` | `app/superadmin/members/page.tsx`, `app/leader/members/page.tsx`, `app/superadmin/groups/[id]/member/[memberId]/stats/page.tsx` |
| Inactive (`isActive: false`) | `error` | `app/superadmin/members/page.tsx` |
| Inactive (`isActive: false`) | `default` | `app/leader/members/page.tsx`, `app/superadmin/groups/[id]/member/[memberId]/stats/page.tsx` |
| Active (`isActive: true`) | `success` | `app/superadmin/users/[id]/page.tsx` |
| Inactive (`isActive: false`) | `error` | `app/superadmin/users/[id]/page.tsx` |

## 14. Report Status (Centralized)

Defined in `lib/constants/reports.ts` (`REPORT_STATUS_COLORS`), used by `components/features/reports/ReportStatusBadge.tsx`:

| Status | Color |
|--------|-------|
| `DRAFT` | `default` |
| `SUBMITTED` | `processing` |
| `REQUIRES_EDITS` | `warning` |
| `APPROVED` | `success` |
| `REVIEWED` | `cyan` |
| `LOCKED` | `error` |

### Report Edit Status

Defined inline in both `app/superadmin/reports/[id]/edits/page.tsx` and `app/leader/reports/[id]/edits/page.tsx` (`EDIT_STATUS_MAP`):

| Status | Color | Label |
|--------|-------|-------|
| `DRAFT` | `orange` | Draft |
| `SUBMITTED` | `blue` | Submitted |
| `APPROVED` | `green` | Approved |
| `REJECTED` | `red` | Rejected |

### Report Update Request Status

Defined in `app/superadmin/reports/update-requests/page.tsx` (`STATUS_COLORS`):

| Status | Color |
|--------|-------|
| `PENDING` | `orange` |
| `APPROVED` | `green` |
| `REJECTED` | `red` |

### Report Template Status (inline)

| Status | Color | Source File(s) |
|--------|-------|---------------|
| Active (`isActive: true`) | `green` | `app/superadmin/reports/templates/page.tsx`, `templates/[id]/page.tsx` |
| Inactive (`isActive: false`) | `red` | `app/superadmin/reports/templates/page.tsx`, `templates/[id]/page.tsx` |
| Default | `blue` | `app/superadmin/reports/templates/page.tsx`, `templates/[id]/page.tsx` |
| Data Entry | `orange` | `app/superadmin/reports/page.tsx` |

## 15. Report Timeline Event Type

Defined in `components/features/reports/ReportTimeline.tsx` (`EVENT_CONFIG`):

| Event Type | Color |
|------------|-------|
| `CREATED` | `blue` |
| `SUBMITTED` | `green` |
| `EDIT_REQUESTED` | `orange` |
| `EDIT_SUBMITTED` | `cyan` |
| `EDIT_APPROVED` | `green` |
| `EDIT_REJECTED` | `red` |
| `EDIT_APPLIED` | `green` |
| `APPROVED` | `green` |
| `REVIEWED` | `purple` |
| `LOCKED` | `red` |
| `DEADLINE_PASSED` | `red` |
| `UPDATE_REQUESTED` | `orange` |
| `UPDATE_APPROVED` | `green` |
| `UPDATE_REJECTED` | `red` |
| `DATA_ENTRY_CREATED` | `blue` |
| `TEMPLATE_VERSION_NOTE` | `default` |
| `FIELD_UNLOCKED` | `gold` |
| `AUTO_APPROVED` | `green` |
| _(fallback)_ | `gray` |

## 16. Report Deadline Countdown (Time-Based)

Defined in `components/features/reports/ReportDeadlineCountdown.tsx`:

| Condition | Color |
|-----------|-------|
| Past deadline (`diffMs <= 0`) | `error` |
| Less than 6 hours | `error` |
| Less than 24 hours | `warning` |
| More than 24 hours | `success` |

## 17. Engagement Level

Defined in `app/member/dashboard/page.tsx` (Tailwind CSS classes, not Tag colors):

| Level | CSS Class |
|-------|-----------|
| `HIGH` | `text-ds-status-success` |
| `MEDIUM` | `text-ds-chart-1` |
| `LOW` | `text-ds-chart-4` |
| `AT_RISK` | `text-ds-status-error` |
| _(default)_ | `text-ds-text-secondary` |

## 18. Analytics — At-Risk Members Count

Defined in `app/superadmin/analytics/page.tsx` (inline):

| Condition | Color |
|-----------|-------|
| `value > 0` | `error` |
| `value === 0` | `success` |

## 19. Miscellaneous Static Tags

| Label | Color | Source File(s) |
|-------|-------|---------------|
| "Group Leader" | `blue` | `app/leader/profile/page.tsx`, `app/member/my-group/page.tsx` |
| "Super Administrator" | `red` | `app/superadmin/profile/page.tsx` |
| Meeting frequency | `blue` | `app/leader/my-group/page.tsx`, `app/member/my-group/page.tsx`, `app/member/membership-requests/new/page.tsx` |
| Attendee count | `blue` | `app/leader/meetings/[id]/page.tsx`, `app/member/meetings/[id]/page.tsx` |
| "Required" (template field) | `blue` | `app/superadmin/reports/templates/[id]/page.tsx`, `components/features/reports/TemplateSectionBuilder.tsx` |
| Boolean Yes | `blue` | `app/superadmin/reports/templates/[id]/page.tsx`, `components/features/reports/TemplateSectionBuilder.tsx` |
| "No changes detected" | `default` | `components/features/reports/ReportEditDiff.tsx` |
| Pending interest | `orange` | `app/superadmin/interests/page.tsx` |
| Calendar event tag | `blue` | `app/leader/schedule/page.tsx` |
| Broadcast meeting tag | `blue` | `app/superadmin/meetings/broadcast/page.tsx` |
| Group count tag | `success` | `app/superadmin/meetings/broadcast/page.tsx` |
| Notification type | `blue` | `app/member/notifications/page.tsx` |
| Inactive member warning | `red` | `app/leader/my-group/page.tsx` |

---

## Inconsistencies Found

| Category | Issue |
|----------|-------|
| **Active/Inactive** | Inconsistent "inactive" color: `error` in `/superadmin/members`, `default` in `/leader/members` and `/stats` |
| **Attendance Rate** | Two different threshold scales: 80/60 vs 80/50, and `success`/`warning`/`error` vs `green`/`orange`/`red` |
| **Role colors** | Three different mapping schemes exist — full 11-role, simplified 3-role, and Tailwind-class-based |
| **Follow-Up Priority** | `LOW` is `blue` in `FollowUpReminderWidget`, but `yellow` as risk level in follow-ups page |
| **Status "PENDING"** | `warning` in membership requests, `orange` in update requests, `blue` in follow-ups |
| **Login credentials** | Role colors differ from all other role color maps (e.g., Zonal Leader = `green` vs `purple`) |
| **Report edit DRAFT** | `orange` in EDIT_STATUS_MAP vs `default` in REPORT_STATUS_COLORS |
| **Report SUBMITTED** | `processing` in REPORT_STATUS_COLORS vs `blue` in EDIT_STATUS_MAP |

---

## Recommended Canonical Color Map for StatusBadge

Based on usage frequency and semantic consistency:

```typescript
// === GENERAL STATUS ===
"active"       → "success"
"inactive"     → "default"
"pending"      → "warning"
"approved"     → "success"
"rejected"     → "error"
"completed"    → "success"
"overdue"      → "error"
"at-risk"      → "warning"    // or "orange"
"draft"        → "default"
"archived"     → "default"
"expired"      → "default"

// === REPORT STATUS ===
"DRAFT"          → "default"
"SUBMITTED"      → "processing"
"REQUIRES_EDITS" → "warning"
"APPROVED"       → "success"
"REVIEWED"       → "cyan"
"LOCKED"         → "error"

// === REPORT EDIT STATUS ===
"EDIT_DRAFT"     → "orange"
"EDIT_SUBMITTED" → "blue"
"EDIT_APPROVED"  → "green"
"EDIT_REJECTED"  → "red"

// === CAMPAIGN STATUS ===
"CAMPAIGN_ACTIVE"   → "success"
"CAMPAIGN_DRAFT"    → "processing"
"CAMPAIGN_EXPIRED"  → "default"
"CAMPAIGN_ARCHIVED" → "warning"

// === INTERACTION TYPE ===
"CALL"      → "blue"
"FOLLOW_UP" → "green"
"CHECK_IN"  → "purple"
"VISIT"     → "green"
"MESSAGE"   → "purple"

// === PRIORITY ===
"HIGH"   → "red"
"MEDIUM" → "orange"
"LOW"    → "blue"

// === RISK LEVEL ===
"high"   → "red"
"medium" → "orange"
"low"    → "yellow"

// === FOLLOW-UP STATUS ===
"COMPLETED" → "green"
"PENDING"   → "blue"
"OVERDUE"   → "red"

// === ACTION TYPE ===
"CREATE"  → "green"
"UPDATE"  → "blue"
"DELETE"  → "red"
"LOGIN"   → "cyan"
"LOGOUT"  → "default"
"APPROVE" → "green"
"REJECT"  → "red"

// === ATTENDANCE ===
"present" → "success"
"absent"  → "error"

// === BOOLEAN ===
true  → "success"  // active, present, yes
false → "error"    // inactive, absent (or "default")

// === USER ROLE (canonical full map) ===
"SUPERADMIN"          → "red"
"GROUP_PASTOR"        → "volcano"
"GROUP_ADMIN"         → "orange"
"CAMPUS_PASTOR"       → "gold"
"CAMPUS_ADMIN"        → "geekblue"
"ZONAL_LEADER"        → "purple"
"HOD"                 → "blue"
"SMALL_GROUP_LEADER"  → "cyan"
"CELL_LEADER"         → "lime"
"DATA_ENTRY"          → "magenta"
"MEMBER"              → "green"
```

---

## Files That Will Need Migration

1. `components/features/membership/MembershipRequestCard.tsx` — `getStatusColor`, `getTypeColor`
2. `components/features/interactions/InteractionLog.tsx` — `getInteractionColor`
3. `components/features/meetings/MeetingCard.tsx` — `getAttendanceColor`
4. `components/features/meetings/AttendanceList.tsx` — inline `<Tag color=>`
5. `components/features/campaigns/CampaignBanner.tsx` — `getStatusColor`
6. `components/features/campaigns/CampaignCard.tsx` — `getStatusColor`
7. `components/features/communications/FollowUpReminderWidget.tsx` — `getPriorityColor`
8. `components/features/users/UserCard.tsx` — `getRoleBadgeColor` (Tailwind variant)
9. `components/features/reports/ReportTimeline.tsx` — `EVENT_CONFIG`
10. `components/features/reports/ReportDeadlineCountdown.tsx` — time-based color
11. `components/features/reports/ReportEditDiff.tsx` — static "default"
12. `components/features/reports/TemplateSectionBuilder.tsx` — static "blue"
13. `app/superadmin/users/activity-logs/page.tsx` — `getActionColor`, `getRoleColor`
14. `app/superadmin/members/page.tsx` — inline role colors, isActive
15. `app/superadmin/users/[id]/page.tsx` — inline ternary role + isActive
16. `app/superadmin/groups/[id]/member/[memberId]/stats/page.tsx` — inline ternary role + isActive
17. `app/superadmin/reports/update-requests/page.tsx` — `STATUS_COLORS`
18. `app/superadmin/reports/[id]/edits/page.tsx` — `EDIT_STATUS_MAP`
19. `app/superadmin/reports/templates/page.tsx` — inline Active/Inactive/Default
20. `app/superadmin/reports/templates/[id]/page.tsx` — inline Active/Inactive/Default/Required
21. `app/superadmin/reports/page.tsx` — Data Entry tag
22. `app/superadmin/analytics/page.tsx` — at-risk conditional
23. `app/superadmin/profile/page.tsx` — static "red" Super Administrator
24. `app/leader/follow-ups/page.tsx` — `getRiskColor`, `getStatusColor`, follow-up type colors
25. `app/leader/interactions/page.tsx` — `getInteractionColor` (duplicate)
26. `app/leader/my-group/page.tsx` — member status config, static tags
27. `app/leader/members/page.tsx` — attendance rate color, isActive
28. `app/leader/members/[id]/page.tsx` — attendance boolean
29. `app/leader/meetings/[id]/page.tsx` — static "blue" attendee count
30. `app/leader/profile/page.tsx` — static "blue" Group Leader
31. `app/leader/reports/[id]/edits/page.tsx` — `EDIT_STATUS_MAP` (duplicate)
32. `app/leader/groups/[id]/reports/page.tsx` — static "blue"
33. `app/leader/schedule/page.tsx` — static "blue"
34. `app/profile/page.tsx` — `getRoleBadge`
35. `app/member/history/page.tsx` — attendance boolean
36. `app/member/meetings/[id]/page.tsx` — static "blue"
37. `app/member/my-group/page.tsx` — static "blue" frequency + Leader
38. `app/member/notifications/page.tsx` — static "blue"
39. `app/member/dashboard/page.tsx` — `getEngagementColor` (Tailwind, not Tag)
40. `app/member/membership-requests/new/page.tsx` — static "blue"
41. `app/superadmin/meetings/broadcast/page.tsx` — static "blue" + "success"
42. `app/superadmin/interests/page.tsx` — static "orange"
