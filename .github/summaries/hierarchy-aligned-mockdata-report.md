# Hierarchy-Aligned Mock Data Rewrite — Summary Report

## Overview

Comprehensive rewrite of `lib/data/mockData.ts` (and minor addition to `lib/types.ts`) to align mock data with the `ORG_HIERARCHY_CONFIG` defined in `lib/constants/roles.ts`.

**Source of truth**: `roles.ts` defines the organisational hierarchy as:

```
Cell → Zone → Area → Community → District → Campus → Group (top)
```

This **inverts** the old data model where Zone wrapped Campus. Now **Group** is the top-level entity, **Campus** sits below Group, and **Zone** is a sub-campus unit.

---

## Changes Made

### 1. `lib/types.ts` — Campus Interface Enhancement

Added optional geolocation & contact fields to the `Campus` interface:

```typescript
address?: string;
latitude?: number;
longitude?: number;
phone?: string;
```

These are non-breaking additions (all optional) enabling future map/location features.

### 2. `lib/data/mockData.ts` — Full Mock Data Rewrite

#### Zones (Group-Level Entities)

- **Renamed** existing zone entities to represent the **Group** level (top of hierarchy):
  - `zone-lagos` → name: "Harvesters Nigeria" (was "Lagos Zone")
  - `zone-uk` → name: "Harvesters United Kingdom" (was "United Kingdom Zone")
- **Updated** leaders from `user-zonal-leader-*` to `user-group-pastor-*`
- **Updated** descriptions with real Harvesters founding information
- **Note**: Zone IDs kept unchanged (`zone-lagos`, `zone-uk`) to avoid 45+ cascading reference changes. A future migration should rename these to `group-nigeria`, `group-uk` and introduce proper Zone entities.

#### Campuses (3 → 7, with Real Data)

Expanded from 3 to 7 campuses with **real addresses, phone numbers, and geolocation** from [harvestersng.org](https://harvestersng.org/campus-locations/):

| ID | Name | Location | Lat/Lng |
|---|---|---|---|
| `campus-lagos-lekki` | Lekki Phase 1 Campus | Lekki, Lagos | 6.4467, 3.4700 |
| `campus-lagos-gbagada` | Gbagada Campus | Gbagada, Lagos | 6.5543, 3.3828 |
| `campus-lagos-anthony` | Anthony Campus | Anthony, Lagos | 6.5642, 3.3619 |
| `campus-abuja` | Abuja Campus | Wuse, Abuja | 9.0579, 7.4951 |
| `campus-ibadan` | Ibadan Campus | Ibadan, Oyo | 7.3904, 3.8949 |
| `campus-london` | London Campus | Bermondsey, London | 51.4930, -0.0654 |
| `campus-birmingham` | Birmingham Campus | Birmingham, UK | 52.4813, -1.8908 |

#### Departments (4 → 6)

Added:
- `dept-children` — "Kidz Zone" (Lekki campus)
- `dept-outreach` — "Missions & Outreach" (Anthony campus)

#### Users (22 → 35+)

All 11 role tiers now have proper representation:

| Role (Tier) | Existing | Added | Total |
|---|---|---|---|
| SUPERADMIN (0) | 1 | 0 | 1 |
| GROUP_PASTOR (1) | 1 | 1 (`user-group-pastor-2` UK) | 2 |
| GROUP_ADMIN (2) | 1 | 0 | 1 |
| CAMPUS_PASTOR (3) | 2 | 3 (Anthony, Abuja, London) | 5 |
| CAMPUS_ADMIN (4) | 3 | 4 (Anthony, Abuja, Ibadan, Birmingham) | 7 |
| ZONAL_LEADER (5) | 2 | 0 (updated `campusId`) | 2 |
| HOD (6) | 4 | 2 (`user-hod-5` Kidz Zone, `user-hod-6` Outreach) | 6 |
| SMALL_GROUP_LEADER (7) | 3 | 1 (`user-leader-4` London) | 4 |
| CELL_LEADER (8) | 3 | 1 (`user-cell-leader-4` London) | 4 |
| DATA_ENTRY (9) | 2 | 0 | 2 |
| MEMBER (10) | 8 | 2 (`user-member-8`, `user-member-9` London) | 10 |

**Key user updates:**
- Zonal leaders now have `campusId` set (zones are sub-campus in new hierarchy)
- Zonal leaders' `invitedById` changed from superadmin to campus pastor (proper chain)
- `user-member-7` (Emma Osei) now assigned to `group-4`/`cell-4`

#### Groups (3 → 4)

Added: `group-4` — "Praise & Worship Fellowship" (London campus, dept-worship)

#### Cells (3 → 4)

Added: `cell-4` — "Harmony Cell" (London campus, within group-4)

#### Meetings (10 → 12)

Added:
- `meeting-campus-london-1` — London campus fellowship night (with campusNotes)
- `meeting-london-group-1` — Praise Fellowship group meeting

#### Reports, Campaigns, Interactions, etc.

No changes needed — existing entity references remain valid.

---

## Codebase Changes Required (Not Yet Implemented)

The following changes are **documented but not implemented** per the task scope. They should be addressed in a subsequent task:

### Priority 1: Type System Alignment

1. **Create `OrgGroup` interface** in `types.ts`:
   Currently the Zone entities are repurposed to represent Group-level entities. A proper `OrgGroup` type should be created with fields like `id`, `name`, `description`, `country`, `leaderId`, `isActive`, etc.

2. **Rename `Campus.zoneId` → `Campus.groupId`**:
   The `Campus` interface has `zoneId: string` (required) which now semantically points to a Group-level entity. This should become `groupId: string` referencing `OrgGroup`.

3. **Add `campusId` and/or `areaId` to `Zone` interface**:
   In the new hierarchy, Zone is below Area which is below Campus. The Zone interface needs parent references.

4. **Clarify `SmallGroup.zoneId` and `Cell.zoneId`**:
   These currently reference the Group-level zone entities. In the new hierarchy, they should reference actual sub-campus Zone entities (which don't exist yet in mock data).

### Priority 2: Database Layer

5. **Add database stores** in `database.ts` for:
   - `areas: Area[]`
   - `communities: Community[]`
   - `districts: District[]`
   - `orgGroups: OrgGroup[]` (if new type created)

6. **Add CRUD API routes** for Area, Community, District, and OrgGroup entities.

### Priority 3: Mock Data Expansion

7. **Create actual Zone entities** that sit under campuses (e.g., "Lekki Mainland Zone", "Lekki Island Zone") with the `ZONAL_LEADER` role.

8. **Rename zone IDs** from `zone-lagos`/`zone-uk` to `group-nigeria`/`group-uk` once the type system supports `OrgGroup`.

9. **Add mock Area, Community, District data** to populate the full hierarchy chain.

### Priority 4: UI Layer

10. **Update navigation and breadcrumbs** to reflect the full 7-tier hierarchy.

11. **Update analytics/reporting** to support filtering by the full hierarchy chain.

---

## Verification

- **`npx tsc --noEmit`**: 0 errors ✅
- **File size**: 3,105 lines (up from ~2,639)
- **All referenced entity IDs verified**: Every `campusId`, `zoneId`, `departmentId`, `hodId`, `adminId`, `leaderId`, and `invitedById` points to an existing entity.
