# Cell Attendance System (CAS)
## Product Requirements Document & AI-Assisted Engineering Roadmap
### Version 2.0 | May 2026 | Harvesters International Christian Centre

---

> **Classification:** Internal Technical Document  
> **Audience:** Web Developer (Next.js), Organizational Leadership  
> **Companion Documents:** Harvesters Unified PRD v1.0, Backend Architecture Abstraction v1.0  
> **Supersedes:** CAS PRD v1.0 (intern draft, April 2026)

---

## EXECUTIVE SUMMARY

The Cell Attendance System (CAS) is a **Next.js 15 Progressive Web App (PWA) + API backend** that digitizes the cell group meeting lifecycle for Harvesters International Christian Centre. It is built on the same technology stack and architectural patterns as all other PWAs in the Harvesters digital estate (report-sys, Faith Hub, MyHarvestHub) — ensuring shared conventions, a single developer language context, and frictionless integration. It transitions cell leaders from WhatsApp-based manual reporting into a structured, offline-capable, fraud-resistant ecosystem while remaining frictionless enough to achieve 85%+ adoption.

A **native Flutter mobile companion app** is planned as a parallel future version, to be built once the PWA has reached production stability and the API contracts are proven. All backend API design decisions in this document account for that future mobile client from day one — the API is mobile-ready even before the mobile app exists.

CAS is not a standalone product. It is a **federated module** in the Harvesters Unified Digital Estate. Its backend is designed from day one to integrate with the Canonical Identity Service (CIS), emit structured domain events to the Reporting System, and surface member data from the Church CRM. Every architectural decision is evaluated against four non-negotiable principles: **Config-Driven. Single Source of Truth. ACID-Compliant. Migration-Safe.**

The system has a **hard deadline of May 20** for initial integration milestones (bearer token auth, CIS link, report bridge endpoint). The full feature set is delivered in three phases over 12 weeks.

---

## 1. SYSTEM CONTEXT & POSITIONING

### 1.1 Where CAS Sits in the Harvesters Ecosystem

```
┌────────────────────────────────────────────────────────────────────────┐
│                    HARVESTERS UNIFIED DIGITAL ESTATE                    │
│                                                                        │
│  ┌──────────────┐   ┌──────────────┐   ┌──────────────┐               │
│  │  Faith Hub   │   │  Report-Sys  │◄──│     CAS      │  ← NEW        │
│  │  (Web PWA)   │   │  (Web PWA)   │   │ (Next.js 15  │               │
│  │              │   │              │   │   PWA + API) │               │
│  └──────┬───────┘   └──────┬───────┘   └──────┬───────┘               │
│         │                  │                  │                        │
│         └──────────────────┼──────────────────┘                       │
│                            │                                           │
│               ┌────────────▼────────────┐                             │
│               │  CANONICAL IDENTITY     │                             │
│               │  SERVICE (CIS)          │                             │
│               │  Single user identity   │                             │
│               └────────────────────────┘                             │
│                                                                        │
│  ┌──────────────┐   ┌──────────────┐                                  │
│  │   DMHicc     │   │ MyHarvestHub │                                   │
│  │  (Campaigns) │   │ (Commerce)   │                                   │
│  └──────────────┘   └──────────────┘                                  │
└────────────────────────────────────────────────────────────────────────┘
```

CAS is the **data origination point** for all cell-level metrics that flow into the Reporting System. Where the Reporting System previously required manual entry of cell attendance counts, CAS provides a verified, structured, automated source of that data. The Reporting System becomes a **consumer** of CAS events rather than a manual data entry interface for cell metrics.

### 1.2 What CAS Replaces

Currently, the cell reporting workflow at Harvesters is:

1. Cell leader conducts a meeting (physical or online via WhatsApp call).
2. Leader manually counts attendees and first-timers.
3. Leader types a formatted message in WhatsApp and sends it to their Zonal Leader.
4. Zonal Leader manually aggregates messages from all their cell leaders.
5. Zonal data is manually entered into the Reporting System by a data entry person.

This process takes hours, produces inconsistent data formats, has no verification mechanism, makes follow-up on first-timers entirely ad hoc, and provides no historical member-level attendance records.

### 1.3 What CAS Provides

- Cell leaders submit attendance in under 10 minutes post-meeting from any device (phone, tablet, or desktop browser)
- Attendance is geo-verified (physical) or token-verified (online) — eliminating false reporting
- First-timer data is captured with phone numbers, immediately triggering follow-up tasks
- Reports auto-aggregate to Zonal and Central levels — zero manual collation
- Attendance data auto-populates the Reporting System — zero data re-entry
- Historical attendance records per member enable trend analysis in the CRM

---

## 2. USER PERSONAS & JOURNEYS

### 2.1 Persona: Cell Leader (Primary PWA User — Mobile Browser)

**Profile:** Mid-20s to 40s, moderate smartphone literacy, WhatsApp power-user, time-poor on Sunday afternoons and midweek evenings. Leads a cell of 5–25 people.

**Core Job-to-be-Done:** Record who attended my cell meeting, log any first-timers, and report up to my Zonal Leader — quickly, reliably, without needing strong internet.

**Pain Points:**
- Network fluctuations make real-time apps unreliable during meetings
- Latecomers arrive after the initial headcount — the system must stay open
- WhatsApp feels natural; a complex app will be abandoned
- GPS blocking in basement venues or thick-walled church buildings

**Success State:** "I tapped attendance for my members, added 2 first-timers, hit submit, and my WhatsApp summary was ready to share. Done in 8 minutes."

### 2.2 Persona: Zonal Leader (Mobile + Web)

**Profile:** Oversees 5–20 cells. Receives weekly reports from all cell leaders. Spends significant time chasing missing reports and manually adding up numbers.

**Core Job-to-be-Done:** See the health of all my cells at a glance, identify which leaders haven't submitted, and review aggregate numbers for my zone — without chasing anyone on WhatsApp.

**Pain Points:**
- No visibility until leaders WhatsApp them manually
- Manual aggregation is error-prone
- No historical view to spot declining cells

**Success State:** "I opened my dashboard Sunday evening. All 12 of my cells had submitted. Two were flagged for low attendance. I reviewed the numbers and approved the zone summary in 3 minutes."

### 2.3 Persona: Central Admin (Web Only)

**Profile:** Church leadership or data team. Needs a bird's-eye view of all cells across all zones and campuses. Currently receives manually compiled spreadsheets on Monday mornings.

**Core Job-to-be-Done:** See accurate, verified cell metrics for the current and historical periods — without waiting for manual compilation, and with confidence the numbers are right.

**Pain Points:**
- Data arrives late (Monday/Tuesday instead of Sunday night)
- No way to verify data integrity
- No member-level detail — only aggregate counts

**Success State:** "By 10 PM Sunday I have a full accurate cell report across all campuses. I can drill down by zone, by campus, by individual leader. I can see which cells are growing and which are struggling."

---

## 3. FUNCTIONAL REQUIREMENTS

### 3.1 Module A — Authentication & Onboarding

#### A.1 Authentication Flow

The CAS uses **phone number + OTP** as the primary authentication method (aligned with the intern PRD's correct identification of this UX fit for the target audience). However, the underlying identity system integrates with the CIS for cross-platform identity linking.

**Auth Flow:**

```
[Mobile] User enters phone number
        ↓
[API] POST /api/auth/request-otp
  → Validate phone format
  → Generate 6-digit OTP (TTL: 10 minutes)
  → Send via SMS (Termii / Africa's Talking)
  → Store OTP hash + phone in Redis with TTL
        ↓
[Mobile] User enters OTP
        ↓
[API] POST /api/auth/verify-otp
  → Validate OTP hash against Redis
  → Look up User by phone in CAS DB
  → If found: generate JWT pair, return user + role
  → If not found: check CIS by phone/email (if email was provided)
    → If CIS match found: auto-link, create CAS user record, return JWT
    → If no CIS match: create new canonical user in CIS, create CAS user, link, return JWT
  → Clear OTP from Redis
  → Return: { accessToken, refreshToken, user: { id, name, role, cellId, zoneId } }
```

**Token Strategy:**
- Tokens issued as httpOnly cookies — matching report-sys and MyHarvestHub exactly
- Access token TTL: 15 minutes; Refresh token TTL: 7 days
- The JWT payload carries `canonicalUserId`, `casUserId`, `role`, `cellId`, `zoneId`, `orgId`
- Cookie names follow estate convention: `cas_token` (access) + `cas_refresh` (refresh)
- The `/api/auth/verify-otp` response also returns `accessToken` in the JSON body — this is for the future Flutter mobile client, which will store it in flutter_secure_storage and send it as `Authorization: Bearer <token>`. The PWA ignores this field and relies on the cookie.

#### A.2 Role Assignment

Roles are assigned by an Admin in the CAS admin web interface and are config-driven (stored in the `AdminConfig` table). Default roles:

| Role | Key | Description |
|---|---|---|
| Cell Leader | `CELL_LEADER` | Submits attendance for their assigned cell(s) |
| Zonal Leader | `ZONAL_LEADER` | Views/approves reports for all cells in their zone |
| District Leader | `DISTRICT_LEADER` | Zone rollup visibility across a district |
| Central Admin | `CENTRAL_ADMIN` | Full visibility, user management, system config |
| Data Entry | `DATA_ENTRY` | Manual entry for non-mobile leaders (legacy support) |

Roles are stored in the CAS `User` record and are also synced to the CIS `user_platform_links.platform_roles` array.

#### A.3 Cell Assignment

Every Cell Leader is bound to one or more cells. This binding is stored in `CellAssignment` and is managed by admins. The assignment includes:
- The cell (`Cell` record)
- Their role within the cell (primary leader vs. assistant)
- The zone this cell belongs to
- Effective date (audit trail for leadership changes)

### 3.2 Module B — Cell & Member Management

#### B.1 Cell Registry

Cells are stored in the `Cell` model with the following metadata:

```typescript
interface Cell {
  id: string;
  orgId: string;
  zoneId: string;
  campusId: string;
  name: string;
  type: 'PHYSICAL' | 'ONLINE' | 'HYBRID';
  meetingFrequency: 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY';
  meetingDay: DayOfWeek;  // SUNDAY | MONDAY | ... | SATURDAY
  meetingTime: string;     // HH:mm (24-hour)
  coordinates?: { lat: number; lng: number };  // For geofencing
  geofenceRadius: number;  // Metres, default 100, admin-configurable
  interestTags: string[];  // Maps to the 25 cell group categories
  maxCapacity?: number;
  isActive: boolean;
}
```

All cell configuration fields that may change (geofence radius, meeting frequency, session window duration) are stored in the `AdminConfig` table and read from there — not hardcoded.

#### B.2 Member Roster Management

Each cell has a persistent roster (`CellMember` junction table). Leaders can:
- View their full roster with member profiles
- Mark members as active / inactive / transferred
- Add new members (by searching the canonical user directory or adding manually)
- Remove members (triggers a transfer-out record, not a delete)

Roster management is available both in the mobile app and the web admin interface.

#### B.3 First-Timer Capture

First-timers are people attending a cell for the first time who are not yet on the roster. The capture form is designed for speed during a live meeting:

**Required fields:**
- Full name
- Phone number (WhatsApp number preferred)
- `referredBy`: which cell member brought them (select from roster)

**Optional fields:**
- Email address
- Age range
- Whether they attended church service (links to service attendance data)

On submission, the first-timer record is created in the CAS DB. An async worker:
1. Checks CIS for an existing canonical user with that phone/email.
2. If found: creates a `FirstTimerRecord` linked to the canonical user.
3. If not found: creates a new canonical user in CIS, then creates the `FirstTimerRecord`.
4. Creates an `AssimilationTask` assigned to the cell leader with a follow-up reminder (configurable, default: follow-up call within 48 hours).

### 3.3 Module C — Attendance Session

This is the core module. It handles the full lifecycle of a single cell meeting.

#### C.1 Session States

```
SCHEDULED → OPEN → LOCKED → SUBMITTED → APPROVED (→ CONFLICTED if report-sys has manual data)
              ↑
           REOPENED (Admin only)
```

#### C.2 Session Lifecycle

**SCHEDULED:** The session exists because it is the next meeting date for a cell based on its `meetingFrequency` and `meetingDay`. Sessions are auto-created by a daily background job (or Vercel cron) for the upcoming week.

**OPEN:** The session opens 30 minutes before the meeting's scheduled time. The session window stays open for 90 minutes after the scheduled start time — this is the `elasticWindowMinutes` config value (default 90, range 30–180, admin-configurable per zone).

**LOCKED:** 90 minutes after the scheduled start, the session is locked. Attendance can only be modified by a Zonal Leader or Admin after this point (with an audit log entry).

**SUBMITTED:** Leader taps "Submit Report". The report is validated and saved. The event outbox fires `cas.attendance.session_completed`.

**APPROVED:** Zonal Leader reviews and approves the zone's submissions for that period.

#### C.3 Dual-Mode Attendance Verification

**Physical Meeting — GPS Geofencing:**

The leader's device must be within `geofenceRadius` metres of the cell's stored coordinates at the time of session submission. The coordinates and radius are stored in the `Cell` record and admin-configurable.

*GPS Failure Mitigation:* If GPS accuracy is below 50 metres, the system warns the leader. If the leader is outside the geofence radius, they may submit with a mandatory override justification note. The override is flagged in the session record and visible to the Zonal Leader. GPS override rate above 20% for a leader triggers an alert to the Central Admin.

**Online Meeting — Dynamic Token:**

For cells meeting on WhatsApp, Zoom, or other remote platforms, the system generates a dynamic **6-digit alphanumeric Meeting Token** when the session opens. The leader shares this token in the meeting chat. Members who are being marked present can see the token was active, providing social proof of attendance.

*The token itself is not entered by members.* It is a leader-side verification artifact. Future enhancement (Phase 3): members can self-check-in by entering the token in the Faith Hub mobile app, eliminating the need for the leader to manually mark attendance.

#### C.4 Attendance Marking Interface

The mobile attendance UI is a **swipe-based checklist** designed for speed:

- Members are listed alphabetically (configurable: alphabetical, or by last-seen recency)
- Swipe right = Present (green indicator)
- Swipe left = Absent (grey indicator)
- Tap = Opens member card with options: Present, Absent, Excused (with reason), Joined Late
- "Select All Present" button for full-attendance shortcut
- Late arrivals can be added any time during the OPEN window
- Real-time count display: "12 present / 3 absent / 2 not marked"

#### C.5 Session Submission

On submit:

```
[Mobile] Leader taps "Submit Report"
        ↓
[API] POST /api/attendance/submit
  Body: {
    sessionId,
    attendanceRecords: [{ memberId, status: 'PRESENT' | 'ABSENT' | 'EXCUSED' | 'LATE' }],
    firstTimers: [{ name, phone, referredBy?, email? }],
    gpsCoordinates?: { lat, lng, accuracy },
    meetingToken?: string,  // For online verification audit trail
    notes?: string,
    submittedAt: ISO8601
  }
  
  Server actions (in a single Prisma transaction):
  1. Validate session is in OPEN state
  2. Validate bearer token + extract userId
  3. Verify geofence OR token (based on cell type)
  4. Upsert AttendanceRecord for each member
  5. Create FirstTimerRecord + AssimilationTask for each first-timer
  6. Update Session.status → SUBMITTED
  7. Update Session.submittedAt, submittedBy
  8. Write EventOutbox { eventType: 'cas.attendance.session_completed', payload: { ... } }
  9. Trigger notification to ZonalLeader (push + in-app)
  
  All 9 steps in a single Prisma.$transaction(). If any step fails, full rollback.
```

#### C.6 WhatsApp Bridge

After successful submission, the app generates a formatted WhatsApp message and opens the WhatsApp share intent:

```
📊 *Cell Report — [Cell Name]*
📅 [Date] | [Time]
👥 Attendance: [count] members
✨ First Timers: [count]
🙏 [Any notes]

Submitted via CAS ✅
```

The message is pre-formatted using data from the submitted session. One tap → opens WhatsApp with the message pre-filled. This preserves existing communication habits while the digital record is already secured.

### 3.4 Module D — Dashboard & Analytics

#### D.1 Cell Leader Dashboard (Mobile Browser — PWA)

The home screen shows:
- Next scheduled session card (date, time, countdown)
- Global sync status indicator (synced/pending/offline)
- 4-week attendance trend chart (bar chart, simple, readable at a glance)
- Pending assimilation tasks (first-timer follow-ups due today)
- Quick access to: Start Session, Roster, First Timers, Reports

#### D.2 Zonal Leader Dashboard (All Devices — PWA)

- Zone summary: total cells, submitted this period, pending, attendance rate
- Cell health grid: each cell with its 4-week trend, colour-coded (green/amber/red)
- Outstanding reports: cells that haven't submitted — one-tap reminder to leader
- First-timer pipeline: all first-timers across the zone, assimilation status
- Zone approval: review and approve zone submissions before they flow to district/central

#### D.3 Central Admin Dashboard (Web Only)

- Cross-campus, cross-zone aggregated metrics
- Drill-down: campus → district → zone → cell → member
- Historical trends with configurable date ranges
- Attendance consistency scoring per cell and per leader
- Export: CSV, PDF report for any period
- Cell health alerts: cells with declining attendance, cells that missed consecutive meetings

#### D.4 Cell Health Scoring

The Cell Health Score (CHS) is a composite metric calculated from:

```typescript
interface CellHealthScore {
  attendanceConsistency: number;   // % of scheduled meetings that were held
  attendanceRate: number;           // Average attendance as % of roster size
  firstTimerRetention: number;      // % of first-timers who became regular members
  reportingPunctuality: number;     // % of reports submitted before the zone deadline
  growthTrend: number;              // 4-period slope of attendance count
}

// Composite score: weighted average, configurable via AdminConfig
// Default weights: consistency(30%) + rate(25%) + retention(20%) + punctuality(15%) + trend(10%)
```

The weighting formula is stored in `AdminConfig` and can be adjusted by the Central Admin without a code deployment.

### 3.5 Module E — Assimilation & Pastoral CRM

#### E.1 Assimilation Task System

Every first-timer automatically generates an `AssimilationTask` assigned to the cell leader:

```typescript
interface AssimilationTask {
  id: string;
  cellLeaderId: string;
  firstTimerId: string;
  type: 'INITIAL_CALL' | 'FOLLOW_UP' | 'INVITE_TO_NEXT_MEETING' | 'GROWTH_TRACK_REFERRAL';
  dueAt: Date;  // configurable window, default: 48h after first visit
  status: 'PENDING' | 'COMPLETED' | 'OVERDUE' | 'ESCALATED';
  notes?: string;
  completedAt?: Date;
  escalatedTo?: string;  // ZonalLeader userId if escalated
}
```

Leaders see their pending tasks on the home screen dashboard. Push notifications remind them of tasks due today. Tasks overdue by more than `taskEscalationHours` (default 72h, admin-configurable) are automatically escalated to the Zonal Leader.

#### E.2 Interaction Logging

Leaders can log pastoral interactions with existing members:
- **Interaction types:** Call, Follow-up, Check-in, Prayer, Visit
- Each interaction is timestamped and visible in the member's profile
- No message content is stored (privacy-preserving) — only type, timestamp, and a brief note

This data feeds a member engagement score in the CRM, allowing pastoral leaders to identify members who haven't been contacted in a while.

#### E.3 CRM Integration Pathway

When the Church Fellowship CRM is fully deployed, CAS will:
1. Write first-timer records to the CRM via the CIS event system rather than its own DB
2. Read member profiles from the CRM rather than maintaining a separate member table
3. Surface CRM-side engagement data (e.g., Growth Track completion, departmental membership) in the cell leader's view of each member

In the short term, CAS maintains its own member records and syncs to CIS. The CRM integration is Phase 3.

---

## 4. NON-FUNCTIONAL REQUIREMENTS

### 4.1 Performance

| Metric | Target | Rationale |
|---|---|---|
| Session submission latency | < 2 seconds (online) | Leader submitted — don't keep them waiting |
| PWA launch to ready | < 2.5 seconds | Cold start with service worker cache available |
| Attendance screen initial render | < 400ms | Roster loaded from IndexedDB cache immediately |
| Background sync (offline → online) | < 30 seconds | Data reaches server within one sync cycle of reconnecting |
| Zonal dashboard load | < 3 seconds | Cached aggregate, background refresh |

### 4.2 Offline-First Architecture

CAS must operate fully for core functions with **zero network connectivity**. This is non-negotiable for the target audience's environment.

**Offline-capable operations (100% functional offline):**
- Marking attendance for existing roster members
- Adding first-timers
- Viewing current session
- Viewing own roster
- Viewing recent reports
- Logging pastoral interactions

**Online-required operations (degrade gracefully):**
- OTP authentication (requires SMS)
- Session submission sync (queued until online)
- Assimilation task assignment notifications
- Cross-zone analytics

**Local Storage Strategy:**

CAS uses **IndexedDB** (via the `idb` library, wrapped in a typed service layer) as the client-side persistence store, matching the PWA patterns already established in the report-sys and MyHarvestHub estate. The sync strategy mirrors report-sys's `offlineQueue` utility:

```
Write path:  [UI] → [IndexedDB write, immediate] → [Sync queue add] → [Service Worker background sync]
Read path:   [UI] → [IndexedDB read] (always from local first, stale-while-revalidate)
Sync worker: [Online check] → [Batch POST to API] → [Server ACK] → [Clear from queue]
             [Offline] → [Background Sync API] → [Exponential backoff, max 5 retries, then DLQ]
```

The sync queue is an IndexedDB object store (`pending_operations`) with entries containing: `operationType`, `payload`, `localTimestamp`, `retries`, `maxRetries`. The **Background Sync API** (Service Worker) handles automatic retry when connectivity resumes — no polling required.

**Conflict Resolution:** If the same session is modified locally while also being modified on the server (e.g., admin edit + leader edit offline), the server's version wins on sync. The leader is notified: "Your offline changes to [Session] were updated by your Zonal Leader." No silent overwrites.

### 4.3 Security

**Authentication:** JWT in httpOnly cookies (access token: 15 minutes, refresh token: 7 days) — matching the exact auth pattern used in report-sys and MyHarvestHub. This is the standard for all Harvesters web PWAs. When the future Flutter mobile client is built, the API will additionally support bearer token auth via `Authorization: Bearer` header for that client context.

**Local Data Encryption:** All IndexedDB stores containing PII (member names, phone numbers, first-timer data) are encrypted at the application layer using the Web Crypto API before being written to IndexedDB. The encryption key is derived per-session from the authenticated JWT and never persisted separately.

**GPS Spoofing Mitigation:** The server cross-references the submitted GPS coordinate against:
1. The known cell coordinates in the `Cell` table
2. The device's IP-based geolocation (as a secondary signal, not blocking)
3. Consistency with previous submissions from that device

High-discrepancy submissions are flagged for review, not blocked (to avoid false positives from legitimate GPS inaccuracy).

**OTP Security:**
- OTPs are 6 digits, 10-minute TTL
- Maximum 3 attempts before lockout (15-minute coolout)
- Rate limit: 3 OTP requests per phone per hour
- OTP stored as bcrypt hash in Redis, not plaintext

**API Security:**
- All endpoints require `Authorization: Bearer <token>` (except `/api/auth/*`)
- JWT verified cryptographically on every request (not just structurally decoded)
- Role-based access enforced at route handler level via `requireRole(['CELL_LEADER', ...])` middleware
- Zod input validation on all request bodies before any DB operation
- All write endpoints are idempotent: session submission includes a `submissionKey` UUID generated client-side; server uses this as an idempotency key to prevent duplicate submissions

**HTTPS only.** The PWA is served exclusively over TLS. All API calls are same-origin or explicitly CORS-controlled. CSP headers are enforced matching the report-sys pattern.

### 4.4 Scalability

The CAS backend will face **burst traffic patterns**: many cell leaders submit simultaneously on Sunday evenings and midweek evenings. The architecture must handle this without degradation.

- Vercel's serverless functions handle horizontal scaling automatically
- Redis (Upstash) rate-limiting prevents thundering-herd on the OTP endpoint
- The attendance submission endpoint uses optimistic locking on the `Session` record to prevent race conditions during concurrent updates to the same session
- The EventOutbox worker processes in batches with rate limiting to avoid overloading the Reporting System bridge

**Capacity target:** 100+ concurrent session submissions within a 2-hour window without degradation.

### 4.5 Platform Compatibility

**PWA (Phase 1 — current scope):**
- Next.js 15, App Router — matches entire Harvesters PWA estate
- Mobile browsers: Chrome for Android 100+, Safari iOS 15.4+ (required for Background Sync API)
- Desktop browsers: Chrome 100+, Safari 15+, Firefox 100+, Edge 100+
- PWA installable on Android (Add to Home Screen) and iOS (Safari Share → Add to Home Screen)
- Service Worker: Workbox 7+ for cache strategies and background sync

**Native Mobile App (Phase 4 — future parallel track):**
- Flutter 3.22+ stable — Android 8.0 (API 26)+, iOS 13.0+
- All API contracts defined in this document are designed to serve both the PWA and the future Flutter client without modification

---

## 5. SYSTEM ARCHITECTURE

### 5.1 System Stack

| Layer | Technology | Rationale |
|---|---|---|
| **Frontend** | Next.js 15, App Router | Matches report-sys, MyHarvestHub, Faith Hub — one language, one pattern |
| **Styling** | Tailwind CSS v4 + CSS custom properties | Matches MyHarvestHub; enables the CAS design system (Section 6) |
| **State** | Zustand | Matches MyHarvestHub and DMHicc — lightweight, no boilerplate |
| **Offline / PWA** | Service Worker (Workbox 7) + IndexedDB (idb) | Standard PWA stack; Background Sync API for queue replay |
| **PWA Push** | Web Push API (VAPID) | Matches MyHarvestHub PushSubscription model; no native SDK needed |
| **Backend API** | Next.js 15 Route Handlers | Matches entire estate — same project, no separate server |
| **Backend Runtime** | Node.js (Vercel serverless + Edge middleware) | Matches report-sys deployment pattern |
| **Database** | PostgreSQL via Prisma | Matches all platforms in the estate |
| **Cache** | Upstash Redis | OTP storage, rate limiting, config cache — matches report-sys |
| **Auth** | JWT in httpOnly cookies (jose) | Matches report-sys and MyHarvestHub exactly |
| **Email** | Resend | Matches report-sys and MyHarvestHub |
| **SMS / OTP** | Termii (or Africa's Talking) | Nigerian number support, OTP delivery |
| **File Storage** | Cloudinary | Matches report-sys and MyHarvestHub |
| **Validation** | Zod | Matches all other platforms |
| **Future: Native Mobile** | Flutter 3.22+ | Parallel Phase 4 track — API contracts defined now, app built later |
| **Future: Mobile Push** | Firebase Cloud Messaging (FCM) | For the Flutter app; VAPID Web Push handles PWA push in the meantime |

### 5.2 Backend Directory Structure

```
cas/  (new Next.js 15 App Router project — PWA + API in one repo, matching report-sys structure)
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── request-otp/route.ts     # POST — OTP generation + SMS send
│   │   │   ├── verify-otp/route.ts      # POST — OTP verify → JWT issue
│   │   │   └── refresh/route.ts         # POST — token refresh
│   │   ├── v1/
│   │   │   ├── cells/
│   │   │   │   ├── route.ts             # GET (my cells) POST (admin: create)
│   │   │   │   └── [id]/
│   │   │   │       ├── route.ts         # GET cell detail
│   │   │   │       ├── roster/route.ts  # GET/POST/DELETE roster
│   │   │   │       └── sessions/route.ts # GET sessions for cell
│   │   │   ├── sessions/
│   │   │   │   ├── route.ts             # GET (my upcoming)
│   │   │   │   └── [id]/
│   │   │   │       ├── route.ts         # GET session detail
│   │   │   │       ├── attendance/route.ts # GET/PUT attendance records
│   │   │   │       └── submit/route.ts  # POST — final submission (idempotent)
│   │   │   ├── attendance/
│   │   │   │   └── submit/route.ts      # POST (unified submission endpoint)
│   │   │   ├── first-timers/
│   │   │   │   └── route.ts             # GET (my cell's) POST (during session)
│   │   │   ├── members/
│   │   │   │   ├── route.ts             # GET search
│   │   │   │   └── [id]/route.ts        # GET member profile
│   │   │   ├── tasks/
│   │   │   │   ├── route.ts             # GET my pending tasks
│   │   │   │   └── [id]/complete/route.ts # POST mark complete
│   │   │   ├── zones/
│   │   │   │   └── [id]/
│   │   │   │       ├── dashboard/route.ts  # GET zonal dashboard data
│   │   │   │       └── approve/route.ts    # POST zone period approval
│   │   │   ├── analytics/
│   │   │   │   ├── cell/[id]/route.ts   # GET cell-level analytics
│   │   │   │   └── zone/[id]/route.ts   # GET zone-level analytics
│   │   │   └── admin/
│   │   │       ├── users/route.ts       # CRUD user management
│   │   │       ├── cells/route.ts       # CRUD cell management
│   │   │       ├── config/route.ts      # GET/PUT admin config values
│   │   │       └── dashboard/route.ts   # Central admin overview
│   │   ├── cas-events/
│   │   │   └── sync/route.ts            # POST — internal: outbox worker calls this
│   │   ├── push/
│   │   │   └── subscribe/route.ts       # POST FCM token registration
│   │   └── health/route.ts              # GET system health check
├── config/
│   ├── roles.ts                         # Default role definitions (DB-overridable)
│   ├── defaults.ts                      # Default config values (DB-overridable)
│   └── routes.ts                        # Route registry + RBAC config
├── modules/
│   ├── auth/
│   │   ├── services/otpService.ts       # OTP generation, Redis storage, SMS dispatch
│   │   └── services/jwtService.ts       # Token generation, validation, refresh
│   ├── sessions/
│   │   ├── services/sessionService.ts   # Session lifecycle management
│   │   ├── services/verificationService.ts # GPS + token verification
│   │   └── services/submissionService.ts   # Submission + outbox write (transactional)
│   ├── members/
│   │   └── services/rosterService.ts    # Roster CRUD, transfer management
│   ├── firstTimers/
│   │   └── services/firstTimerService.ts # FT capture + CIS link + task creation
│   ├── assimilation/
│   │   └── services/taskService.ts      # Task CRUD, escalation, reminders
│   ├── analytics/
│   │   └── services/analyticsService.ts # Aggregation queries, health scoring
│   ├── notifications/
│   │   └── services/notificationService.ts # FCM push + in-app
│   ├── sync/
│   │   └── services/outboxWorker.ts     # EventOutbox polling + dispatch
│   └── pwa/
│       ├── services/pushService.ts        # VAPID Web Push subscription + delivery
│       └── services/swRegistration.ts     # Service worker registration + update prompts
├── lib/
│   ├── db/
│   │   └── prisma.ts                    # Prisma client singleton
│   ├── redis/
│   │   └── client.ts                    # Upstash Redis client singleton
│   ├── sms/
│   │   └── termii.ts                    # Termii adapter
│   ├── cis/
│   │   └── client.ts                    # CIS API client (link, lookup, emit event)
│   ├── middleware/
│   │   ├── auth.ts                      # JWT bearer validation middleware
│   │   └── requireRole.ts              # Role enforcement middleware
│   └── utils/
│       ├── apiResponse.ts               # Standard response envelope
│       ├── idempotency.ts               # Idempotency key guard (Redis-backed)
│       └── pagination.ts               # Cursor-based pagination helpers
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
├── middleware.ts                        # Edge: structural JWT validation (matches report-sys)
├── public/
│   ├── manifest.json                    # PWA manifest — name, icons, display: standalone
│   ├── sw.js                            # Compiled Service Worker (Workbox output)
│   └── icons/                           # PWA icons (192×192, 512×512, maskable)
└── types/
    └── global.ts
```

### 5.3 Prisma Schema (Full)

> **Estate-aligned:** All conventions match the real schemas across the estate. `uuid()` for IDs (matches report-sys and CIS). `@@map("snake_case")` on all models (matches report-sys and MyHarvestHub). `passwordHash` field name (matches report-sys and DMHicc). `AdminConfig` mirrors report-sys `AdminConfigEntry` versioned pattern. `canonicalUserId` is non-nullable — CAS is the first platform built CIS-first.

```prisma
generator client {
  provider = "prisma-client-js"
  output   = "./generated/client"
}

datasource db {
  provider = "postgresql"
}

// ──────────────────────────────────────────
// IDENTITY & AUTH
// ──────────────────────────────────────────

model User {
  id                String      @id @default(uuid())
  organisationId    String      @default("harvesters-org-prod")  // matches report-sys field name
  canonicalUserId   String      @unique  // NOT nullable — CAS registers with CIS on signup
  phone             String      @unique
  email             String?
  passwordHash      String      // matches report-sys + dmhicc naming
  firstName         String      // split names — matches all three systems
  lastName          String
  gender            CasGender?  // MALE | FEMALE | OTHER | PREFER_NOT_TO_SAY (superset of all estate values)
  profilePicture    String?
  role              CasRole     @default(CELL_LEADER)
  status            CasUserStatus @default(ACTIVE)
  isActive          Boolean     @default(true)  // matches report-sys + dmhicc pattern
  fcmToken          String?     // Firebase Cloud Messaging — mobile push
  fcmTokenUpdatedAt DateTime?
  lastActiveAt      DateTime?
  createdAt         DateTime    @default(now())
  updatedAt         DateTime    @updatedAt

  cellAssignments   CellAssignment[]
  zoneAssignment    ZoneAssignment?
  submittedSessions AttendanceSession[] @relation("SubmittedBy")
  firstTimersAdded  FirstTimerRecord[]  @relation("AddedBy")
  assimilationTasks AssimilationTask[]  @relation("AssignedTo")
  interactions      PastoralInteraction[] @relation("LoggedBy")
  notifications     Notification[]
  auditLogs         AuditLog[]          @relation("AuditActor")

  @@index([phone])
  @@index([canonicalUserId])
  @@index([organisationId, role, isActive])
  @@map("users")
}

enum CasRole {
  CELL_LEADER
  ZONAL_LEADER
  DISTRICT_LEADER
  CENTRAL_ADMIN
  DATA_ENTRY
}

enum CasUserStatus { ACTIVE INACTIVE SUSPENDED }

enum CasGender {
  MALE
  FEMALE
  OTHER
  PREFER_NOT_TO_SAY  // superset of MALE/FEMALE/OTHER (MHH) and MALE/FEMALE/PREFER_NOT_TO_SAY (report-sys)
}

// ──────────────────────────────────────────
// ORGANISATIONAL STRUCTURE
// ──────────────────────────────────────────

// NOTE: Campus and OrgUnit are read from the CIS org config API at runtime.
// CAS does NOT maintain its own campus table — it references CIS campusCode strings.
// Zone and Cell are CAS-owned as they are attendance-domain concepts.

model Zone {
  id            String   @id @default(uuid())
  organisationId String  @default("harvesters-org-prod")
  campusCode    String   // References CIS OrgUnit.code — NOT a FK, string reference
  name          String
  code          String
  isActive      Boolean  @default(true)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  cells         Cell[]
  assignments   ZoneAssignment[]

  @@unique([campusCode, code])
  @@index([campusCode, isActive])
  @@map("zones")
}

model ZoneAssignment {
  id        String   @id @default(uuid())
  userId    String   @unique
  zoneId    String
  role      String   @default("ZONAL_LEADER")
  since     DateTime @default(now())
  until     DateTime?
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  zone      Zone     @relation(fields: [zoneId], references: [id], onDelete: Cascade)

  @@map("zone_assignments")
}

model Cell {
  id              String    @id @default(uuid())
  organisationId  String    @default("harvesters-org-prod")
  zoneId          String
  name            String
  type            CellType  @default(PHYSICAL)
  meetingFrequency Frequency @default(WEEKLY)
  meetingDay      DayOfWeek
  meetingTimeUtc  String    // HH:mm 24-hour
  coordinates     Json?     // { lat: Float, lng: Float }
  geofenceRadiusM Int       @default(100)    // admin-configurable via AdminConfig
  interestTags    String[]  @default([])
  maxCapacity     Int?
  isActive        Boolean   @default(true)
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  zone            Zone      @relation(fields: [zoneId], references: [id], onDelete: Restrict)
  assignments     CellAssignment[]
  members         CellMember[]
  sessions        AttendanceSession[]

  @@index([zoneId, isActive])
  @@index([organisationId, isActive])
  @@map("cells")
}

enum CellType  { PHYSICAL ONLINE HYBRID }
enum Frequency { WEEKLY BIWEEKLY MONTHLY }
enum DayOfWeek { MONDAY TUESDAY WEDNESDAY THURSDAY FRIDAY SATURDAY SUNDAY }

model CellAssignment {
  id          String    @id @default(uuid())
  cellId      String
  userId      String
  role        String    @default("LEADER")   // LEADER | ASSISTANT
  isPrimary   Boolean   @default(true)
  since       DateTime  @default(now())
  until       DateTime?
  cell        Cell      @relation(fields: [cellId], references: [id], onDelete: Cascade)
  user        User      @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([cellId, userId])
  @@index([userId, until])    // query: find active assignments for a user
  @@map("cell_assignments")
}

model CellMember {
  id              String       @id @default(uuid())
  cellId          String
  userId          String?      // CAS User.id — null for members not on the app
  canonicalUserId String?      // CIS UUID — set async after lookup
  firstName       String       // split name — matches estate standard
  lastName        String
  phone           String?
  email           String?
  status          MemberStatus @default(ACTIVE)
  joinedAt        DateTime     @default(now())
  transferredAt   DateTime?
  transferredTo   String?      // destination cell id
  transferReason  String?

  cell              Cell        @relation(fields: [cellId], references: [id], onDelete: Restrict)
  attendanceRecords AttendanceRecord[]
  interactions      PastoralInteraction[]

  @@unique([cellId, phone])
  @@index([canonicalUserId])
  @@index([cellId, status])
  @@map("cell_members")
}

enum MemberStatus { ACTIVE INACTIVE TRANSFERRED GRADUATED }

// ──────────────────────────────────────────
// ATTENDANCE & SESSIONS
// ──────────────────────────────────────────

model AttendanceSession {
  id                 String        @id @default(uuid())
  cellId             String
  organisationId     String        @default("harvesters-org-prod")
  scheduledDate      DateTime
  scheduledTimeUtc   String
  windowOpenAt       DateTime
  windowCloseAt      DateTime
  status             SessionStatus @default(SCHEDULED)
  meetingToken       String?       // 6-char alphanumeric — ONLINE cells only
  meetingTokenExpiry DateTime?
  submittedById      String?       // matches report-sys naming: submittedById not submittedBy
  submittedAt        DateTime?
  approvedById       String?       // matches report-sys naming
  approvedAt         DateTime?
  gpsLat             Float?
  gpsLng             Float?
  gpsAccuracy        Float?
  gpsOverride        Boolean       @default(false)
  gpsOverrideReason  String?
  notes              String?
  period             String        // "2026-W18" — aligns with report-sys period field
  periodType         CasPeriodType @default(WEEKLY)   // mirrors report-sys ReportPeriodType
  periodYear         Int
  periodWeek         Int?
  submissionKey      String?       @unique   // client-generated UUID idempotency key
  conflictStatus     String?       // null | 'MANUAL_OVERRIDE_PENDING' | 'RESOLVED'
  source             String        @default("cas")   // 'cas' | 'manual' | 'import'
  externalRef        String?       // report-sys Report.id after bridge sync (matches Report.externalRef)
  createdAt          DateTime      @default(now())
  updatedAt          DateTime      @updatedAt

  cell               Cell          @relation(fields: [cellId], references: [id], onDelete: Restrict)
  submitter          User?         @relation("SubmittedBy", fields: [submittedById], references: [id], onDelete: SetNull)
  attendanceRecords  AttendanceRecord[]
  firstTimers        FirstTimerRecord[]
  eventOutbox        EventOutbox[]
  auditLogs          AuditLog[]

  @@index([cellId, period])
  @@index([status, period])
  @@index([organisationId, periodYear, periodType, status])
  @@map("attendance_sessions")
}

enum SessionStatus {
  SCHEDULED
  OPEN
  LOCKED
  SUBMITTED
  APPROVED
  REOPENED
  CANCELLED
}

enum CasPeriodType { WEEKLY MONTHLY }  // mirrors ReportPeriodType subset from report-sys

model AttendanceRecord {
  id          String           @id @default(uuid())
  sessionId   String
  memberId    String
  userId      String?          // CAS User.id — null if member not on app
  status      AttendanceStatus @default(NOT_MARKED)
  markedAt    DateTime?
  markedById  String?          // leader userId — matches report-sys naming convention
  notes       String?

  session     AttendanceSession @relation(fields: [sessionId], references: [id], onDelete: Cascade)
  member      CellMember        @relation(fields: [memberId], references: [id], onDelete: Restrict)

  @@unique([sessionId, memberId])
  @@index([sessionId, status])
  @@map("attendance_records")
}

enum AttendanceStatus { PRESENT ABSENT EXCUSED LATE NOT_MARKED }

// ──────────────────────────────────────────
// FIRST TIMERS & ASSIMILATION
// ──────────────────────────────────────────

model FirstTimerRecord {
  id                  String   @id @default(uuid())
  sessionId           String
  cellId              String
  organisationId      String   @default("harvesters-org-prod")
  addedById           String   // matches report-sys naming: *ById not *By
  canonicalUserId     String?  // set async after CIS lookup
  firstName           String   // split name
  lastName            String
  phone               String
  email               String?
  ageRange            String?
  referredByMemberId  String?
  attendedService     Boolean  @default(false)
  status              FTStatus @default(NEW)
  notes               String?
  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt

  session           AttendanceSession @relation(fields: [sessionId], references: [id], onDelete: Restrict)
  addedByUser       User              @relation("AddedBy", fields: [addedById], references: [id], onDelete: Restrict)
  assimilationTasks AssimilationTask[]

  @@index([cellId, status])
  @@index([canonicalUserId])
  @@index([organisationId, createdAt])
  @@map("first_timer_records")
}

enum FTStatus { NEW IN_PROGRESS ASSIMILATED INACTIVE LOST }

model AssimilationTask {
  id            String     @id @default(uuid())
  firstTimerId  String
  assignedToId  String     // matches report-sys naming: *Id suffix
  type          TaskType
  dueAt         DateTime
  status        TaskStatus @default(PENDING)
  completedAt   DateTime?
  escalatedAt   DateTime?
  escalatedToId String?    // matches naming convention
  outcome       String?
  notes         String?
  createdAt     DateTime   @default(now())
  updatedAt     DateTime   @updatedAt

  firstTimer    FirstTimerRecord @relation(fields: [firstTimerId], references: [id], onDelete: Cascade)
  assignee      User             @relation("AssignedTo", fields: [assignedToId], references: [id], onDelete: Restrict)

  @@index([assignedToId, status, dueAt])
  @@map("assimilation_tasks")
}

enum TaskType   { INITIAL_CALL FOLLOW_UP INVITE_TO_MEETING GROWTH_TRACK_REFERRAL }
enum TaskStatus { PENDING COMPLETED OVERDUE ESCALATED CANCELLED }

// ──────────────────────────────────────────
// PASTORAL INTERACTIONS
// ──────────────────────────────────────────

model PastoralInteraction {
  id          String          @id @default(uuid())
  memberId    String
  loggedById  String          // matches naming convention
  type        InteractionType
  notes       String?
  occurredAt  DateTime        @default(now())
  createdAt   DateTime        @default(now())

  member      CellMember @relation(fields: [memberId], references: [id], onDelete: Cascade)
  logger      User       @relation("LoggedBy", fields: [loggedById], references: [id], onDelete: Restrict)

  @@index([memberId, occurredAt])
  @@map("pastoral_interactions")
}

enum InteractionType { CALL FOLLOW_UP CHECK_IN PRAYER VISIT }

// ──────────────────────────────────────────
// NOTIFICATIONS
// ──────────────────────────────────────────

model Notification {
  id        String           @id @default(uuid())
  userId    String
  type      CasNotifType
  title     String
  message   String           // matches report-sys field name ('message' not 'body')
  link      String?          // matches myharvesthub field name
  isRead    Boolean          @default(false)
  readAt    DateTime?        // matches report-sys
  metadata  Json?
  createdAt DateTime         @default(now())

  user      User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId, isRead])
  @@index([createdAt])
  @@map("notifications")
}

enum CasNotifType {
  SESSION_SUBMITTED
  SESSION_APPROVED
  TASK_ASSIGNED
  TASK_OVERDUE
  TASK_ESCALATED
  FIRST_TIMER_ADDED
  ZONE_REPORT_READY
  SYSTEM
}

// ──────────────────────────────────────────
// ADMIN CONFIG
// Mirrors report-sys AdminConfigEntry pattern:
// append-only versioned log, highest version per namespace wins.
// ──────────────────────────────────────────

model AdminConfigEntry {
  id            String   @id @default(uuid())
  organisationId String  @default("harvesters-org-prod")   // added vs report-sys for multi-tenancy
  namespace     String   // 'sessions' | 'scoring' | 'assimilation' | 'reporting_bridge' | 'features'
  version       Int      @default(1)
  payload       Json     // full config snapshot for this namespace
  isFallback    Boolean  @default(false)
  actorId       String?  // who made this change
  notes         String?
  createdAt     DateTime @default(now())

  actor         User?    @relation("AdminConfigActor", fields: [actorId], references: [id], onDelete: SetNull)

  @@index([organisationId, namespace, version])
  @@index([namespace, createdAt])
  @@map("admin_config_entries")
}

// ──────────────────────────────────────────
// EVENT OUTBOX
// Matches the CIS EventOutbox contract exactly.
// Written in the same Prisma.$transaction() as the triggering domain write.
// ──────────────────────────────────────────

model EventOutbox {
  id                String       @id @default(uuid())
  sessionId         String?      // source session for attendance events
  eventType         String       // 'cas.attendance.session_completed' | 'cas.first_timer.added'
  eventVersion      String       @default("1.0")
  payload           Json
  cisIdempotencyKey String       @unique  // forwarded to CIS; CIS deduplicates on this
  status            OutboxStatus @default(PENDING)
  retries           Int          @default(0)
  maxRetries        Int          @default(5)
  lastError         String?
  createdAt         DateTime     @default(now())
  deliveredAt       DateTime?
  deadAt            DateTime?

  session           AttendanceSession? @relation(fields: [sessionId], references: [id], onDelete: SetNull)

  @@index([status, retries, createdAt])
  @@map("event_outbox")
}

enum OutboxStatus { PENDING IN_FLIGHT DELIVERED FAILED DEAD }

// ──────────────────────────────────────────
// AUDIT LOG
// Matches dmhicc CampaignAuditEvent pattern: before/after JSON diffs.
// actorId field naming matches report-sys ReportEvent.actorId.
// ──────────────────────────────────────────

model AuditLog {
  id          String   @id @default(uuid())
  actorId     String   // matches report-sys naming
  action      String
  entity      String
  entityId    String
  before      Json?    // matches dmhicc CampaignAuditEvent pattern
  after       Json?
  note        String?  // matches dmhicc field name
  requestId   String?  // matches report-sys AssetLifecycleEvent pattern
  ipAddress   String?
  createdAt   DateTime @default(now())

  actor       User     @relation("AuditActor", fields: [actorId], references: [id], onDelete: Restrict)

  @@index([entity, entityId])
  @@index([actorId, createdAt])
  @@map("audit_logs")
}
```

### 5.4 API Contract Specification (PWA + Future Mobile)

All API responses follow the standard Harvesters envelope (matches report-sys and MyHarvestHub):

```typescript
// Success
{ success: true, data: T, meta?: { page?, limit?, total?, cursor? } }

// Error
{ success: false, error: { code: string, message: string, details?: unknown } }
```

All timestamps are ISO 8601 UTC. All IDs are `uuid()` strings (matches report-sys and CIS convention).

**Critical API Contracts (frozen before PWA build begins; also future-proofed for Flutter mobile client):**

```typescript
// POST /api/auth/verify-otp
// Auth tokens are set as httpOnly cookies (PWA standard, matching report-sys).
// The response body also returns accessToken for future Flutter mobile client consumption.
Response: {
  success: true,
  data: {
    accessToken: string,   // Also set as httpOnly cookie
    user: {
      id: string,
      firstName: string,
      lastName: string,
      role: CasRole,
      canonicalUserId: string,
      assignments: { cellId: string, cellName: string, isPrimary: boolean }[]
    }
  }
}

// GET /api/v1/cells/[id]/roster
Response: {
  success: true,
  data: {
    cell: { id, name, type, nextSessionAt },
    members: {
      id: string,
      name: string,
      phone: string | null,
      avatarUrl: string | null,
      status: MemberStatus,
      lastAttendedAt: string | null
    }[]
  }
}

// GET /api/v1/sessions/[id]
Response: {
  success: true,
  data: {
    id: string,
    cellId: string,
    scheduledDate: string, // ISO 8601
    status: SessionStatus,
    windowOpenAt: string,
    windowCloseAt: string,
    meetingToken: string | null,  // Populated for ONLINE cells when session is OPEN
    attendanceRecords: {
      memberId: string,
      memberFirstName: string,
      memberLastName: string,
      status: AttendanceStatus
    }[]
  }
}

// POST /api/v1/sessions/[id]/submit  (or POST /api/v1/attendance/submit)
Body: {
  sessionId: string,
  submissionKey: string,  // Client-generated UUID for idempotency
  attendanceRecords: { memberId: string, status: AttendanceStatus, notes?: string }[],
  firstTimers: { name: string, phone: string, referredByMemberId?: string, email?: string }[],
  gpsCoordinates?: { lat: number, lng: number, accuracy: number },
  notes?: string
}
Response: {
  success: true,
  data: {
    sessionId: string,
    status: 'SUBMITTED',
    attendanceCount: number,
    firstTimerCount: number,
    whatsappMessage: string  // Pre-formatted WhatsApp summary text
  }
}
```

---

## 6. UI/UX DESIGN SYSTEM

### 6.1 Design Philosophy

CAS follows a **Glassy Bento** design language — a modern, premium aesthetic combining frosted-glass surface treatment, structured bento-box grid layouts, and sleek minimal interactions. It is **church-first, not tech-first**: approachable for a congregation of varied digital literacy while feeling contemporary enough to encourage pride of use and adoption.

This design system is defined for use with **Google Stitch** (AI-assisted UI generation) as the primary design tool. All token names, component names, and layout conventions in this section are written to be directly usable as Stitch prompts and component descriptors.

The system is implemented in **Tailwind CSS v4 + CSS custom properties** — the same approach used in MyHarvestHub — making every token directly portable to the Next.js codebase with zero translation layer.

### 6.2 CAS Design System — Glassy Bento

#### Color Tokens

```css
/* styles/tokens.css — import in globals.css */
:root {
  /* ── Brand ────────────────────────────────────── */
  --color-brand-navy:        #1A3C5E;   /* Primary brand — deep navy */
  --color-brand-amber:       #E8A020;   /* Accent — warm amber, CTAs */
  --color-brand-navy-light:  #2A5480;   /* Hover state on navy */

  /* ── Glass surfaces (the core aesthetic) ─────── */
  --glass-bg:                rgba(255, 255, 255, 0.08);
  --glass-bg-elevated:       rgba(255, 255, 255, 0.14);
  --glass-bg-card:           rgba(255, 255, 255, 0.10);
  --glass-border:            rgba(255, 255, 255, 0.18);
  --glass-border-strong:     rgba(255, 255, 255, 0.28);
  --glass-blur:              blur(16px);
  --glass-blur-heavy:        blur(24px);
  --glass-shadow:            0 4px 24px rgba(0, 0, 0, 0.18);
  --glass-shadow-elevated:   0 8px 40px rgba(0, 0, 0, 0.28);

  /* ── Background gradients (page backgrounds) ─── */
  --bg-gradient-primary:     linear-gradient(135deg, #1A3C5E 0%, #0F2439 55%, #1A2F4A 100%);
  --bg-gradient-surface:     linear-gradient(180deg, rgba(26,60,94,0.95) 0%, rgba(15,36,57,0.98) 100%);

  /* ── Semantic status colors ───────────────────── */
  --color-present:           #22C55E;   /* Attendance: present */
  --color-present-glass:     rgba(34, 197, 94, 0.15);
  --color-absent:            #94A3B8;   /* Attendance: absent */
  --color-absent-glass:      rgba(148, 163, 184, 0.10);
  --color-excused:           #F59E0B;   /* Attendance: excused */
  --color-excused-glass:     rgba(245, 158, 11, 0.15);
  --color-late:              #3B82F6;   /* Attendance: joined late */
  --color-late-glass:        rgba(59, 130, 246, 0.15);
  --color-alert:             #EF4444;   /* Error, overdue, at-risk */
  --color-alert-glass:       rgba(239, 68, 68, 0.15);

  /* ── Typography ───────────────────────────────── */
  --font-display:            'Inter', system-ui, sans-serif;
  --font-mono:               'JetBrains Mono', 'Fira Code', monospace;

  /* ── Radius (bento grid feel) ─────────────────── */
  --radius-sm:               8px;
  --radius-md:               14px;
  --radius-lg:               20px;
  --radius-xl:               28px;
  --radius-full:             9999px;

  /* ── Spacing grid ─────────────────────────────── */
  --bento-gap:               12px;      /* Gap between bento grid cells */
  --bento-gap-lg:            16px;
  --bento-pad:               20px;      /* Internal padding of bento cells */
  --bento-pad-sm:            14px;

  /* ── Motion ───────────────────────────────────── */
  --ease-spring:             cubic-bezier(0.34, 1.56, 0.64, 1);
  --ease-smooth:             cubic-bezier(0.4, 0, 0.2, 1);
  --duration-fast:           150ms;
  --duration-base:           250ms;
  --duration-slow:           400ms;
}
```

#### Core Component Patterns

**Glass Card** — the foundational surface component used for all bento cells:
```css
.glass-card {
  background:    var(--glass-bg-card);
  backdrop-filter: var(--glass-blur);
  -webkit-backdrop-filter: var(--glass-blur);
  border:        1px solid var(--glass-border);
  border-radius: var(--radius-lg);
  box-shadow:    var(--glass-shadow);
  padding:       var(--bento-pad);
}
.glass-card:hover {
  background:    var(--glass-bg-elevated);
  border-color:  var(--glass-border-strong);
  box-shadow:    var(--glass-shadow-elevated);
  transition:    all var(--duration-base) var(--ease-smooth);
}
```

**Bento Grid** — responsive grid that adapts from 1 → 2 → 3 columns:
```css
.bento-grid {
  display: grid;
  gap: var(--bento-gap);
  grid-template-columns: 1fr;                     /* mobile: 1 column */
}
@media (min-width: 640px) {
  .bento-grid { grid-template-columns: repeat(2, 1fr); }  /* tablet: 2 col */
}
@media (min-width: 1024px) {
  .bento-grid { grid-template-columns: repeat(3, 1fr); }  /* desktop: 3 col */
}
.bento-cell-span-2 { grid-column: span 2; }
.bento-cell-span-3 { grid-column: 1 / -1; }       /* full-width cell */
```

**Amber CTA Button** — primary action button:
```css
.btn-primary {
  background:    var(--color-brand-amber);
  color:         var(--color-brand-navy);
  font-weight:   700;
  border-radius: var(--radius-full);
  padding:       12px 28px;
  box-shadow:    0 4px 16px rgba(232, 160, 32, 0.35);
  transition:    transform var(--duration-fast) var(--ease-spring),
                 box-shadow var(--duration-fast) var(--ease-smooth);
}
.btn-primary:hover  { transform: translateY(-2px); box-shadow: 0 6px 24px rgba(232,160,32,0.45); }
.btn-primary:active { transform: translateY(0px);  box-shadow: 0 2px 8px rgba(232,160,32,0.3); }
```

**Attendance Status Pill** — used in the session checklist:
```css
.pill-present { background: var(--color-present-glass);  color: var(--color-present);  border: 1px solid var(--color-present); }
.pill-absent  { background: var(--color-absent-glass);   color: var(--color-absent);   border: 1px solid var(--color-absent); }
.pill-excused { background: var(--color-excused-glass);  color: var(--color-excused);  border: 1px solid var(--color-excused); }
.pill-late    { background: var(--color-late-glass);     color: var(--color-late);     border: 1px solid var(--color-late); }
/* All pills: border-radius: var(--radius-full); padding: 4px 12px; font-size: 12px; font-weight: 600; */
```

**Sync Status Indicator** — persistent, always visible:
```css
.sync-indicator {
  display:       flex;
  align-items:   center;
  gap:           6px;
  background:    var(--glass-bg);
  border:        1px solid var(--glass-border);
  border-radius: var(--radius-full);
  padding:       6px 14px;
  font-size:     12px;
  font-weight:   500;
  backdrop-filter: blur(8px);
}
/* States: .sync-synced (green dot), .sync-pending (amber pulse), .sync-offline (red dot) */
```

#### Google Stitch Prompt Library

Use these prompts verbatim in Stitch to generate on-brand screens:

**Dashboard home screen:**
> "Design a mobile PWA dashboard for a church cell attendance app using a glassy bento grid layout. Dark navy background (#1A3C5E to #0F2439 gradient). Three bento grid cells: (1) a large hero card showing next scheduled session with cell name, time countdown, and a prominent amber CTA button 'Start Session'; (2) a medium card showing 4-week attendance trend as a minimal line chart with a frosted glass surface; (3) a medium card showing pending first-timer follow-up tasks with a badge count. All cards use frosted glass (white 10% opacity, blur 16px, white 18% opacity border, 20px border radius). Amber accent #E8A020. Inter font. Show a top navigation bar with the Harvesters logo and a sync status pill indicator."

**Attendance session screen:**
> "Design a mobile PWA attendance marking screen. Dark navy background with frosted glass surfaces. Full-height scrollable list of member cards, each showing avatar initial, full name, and three status toggle buttons (Present green #22C55E, Absent grey #94A3B8, Late blue #3B82F6) styled as pill-shaped chips. At the top: a sticky glass card showing session name, live countdown timer to session close (90 min window), and a count '12 present / 3 absent / 2 unmarked'. At the bottom: a sticky glass action bar with a 'Add First Timer' ghost button and a prominent amber 'Submit Report' button. Bento card radius 20px. Amber #E8A020. Navy #1A3C5E."

**Zonal leader dashboard:**
> "Design a web PWA dashboard for a zonal church leader. Wider bento grid (2-3 columns). Dark navy gradient background. Top stat row: 4 glass metric cards showing total cells, submitted this week, pending, zone attendance rate. Below: a full-width glass card containing a cell health grid — each cell represented as a small bento card with cell name, 4-week mini bar chart, and a coloured health dot (green/amber/red). A second full-width card shows outstanding submissions with a list of leaders who haven't submitted and a one-tap reminder button per row. Amber accent buttons, frosted glass surfaces throughout, Inter font."

**First-timer quick-add form (in-session):**
> "Design a mobile bottom sheet form for quickly adding a first-time visitor to a church cell meeting. Slides up from the bottom of the screen. Frosted glass surface (white 14% opacity, blur 24px, 28px top border radius). Form fields: First Name, Last Name, Phone Number (numeric keyboard), 'Referred by' (dropdown of cell members). Two buttons at bottom: 'Cancel' ghost and 'Add First Timer' amber CTA. Minimal, fast, one-thumb reachable. Dark navy background visible behind the sheet."

### 6.3 PWA Screen Map (Next.js App Router)

All routes serve the full PWA — no separate admin/user URL splits. Role-based access is enforced at the route handler level; the UI renders the appropriate view based on the authenticated user's role.

```
/                        # Root — redirects to /dashboard (authenticated) or /login
/login                   # Phone + OTP entry (2-step), OR email + password for admins
/onboarding              # First-time setup: confirm profile, cell assignment display

/dashboard               # Role-aware home:
                         #   CELL_LEADER:   next session card, tasks, 4-week trend
                         #   ZONAL_LEADER:  zone summary bento, outstanding submissions
                         #   CENTRAL_ADMIN: cross-campus overview, drill-down entry

/session/[id]            # Live session — attendance checklist, countdown, first-timer add
/session/[id]/submit     # Submission review screen + WhatsApp share card

/roster/[cellId]         # Cell member roster with search + filter
/roster/[cellId]/[memberId]   # Member profile, attendance history, interaction log

/first-timers            # My cell's first-timers + assimilation pipeline
/first-timers/[id]       # Individual first-timer detail + task history

/tasks                   # My pending assimilation tasks (leader view)
/tasks/[id]              # Task detail + completion + note

/zones/[id]              # Zonal Leader: zone overview + cell health grid
/zones/[id]/approve      # Zone period approval interface

/cells                   # Cell registry (Zonal + Admin)
/cells/[id]              # Cell detail, session history, member list, assignment

/members                 # Church-wide canonical member search (Admin)
/members/[id]            # Member profile with cross-system data

/reports/[period]        # Period report aggregation by zone/campus
/analytics               # Cross-zone trends, health scoring, export

/config                  # AdminConfig interface (CENTRAL_ADMIN only)
/users                   # User management (CENTRAL_ADMIN)
/users/[id]              # User detail, role assignment

/settings                # Profile, notification prefs, offline data status, install prompt
```

### 6.4 Key UX Decisions (PWA-Specific)

**The 90-minute elastic window is visible everywhere.** A live countdown timer embedded in the session card on the dashboard and at the top of the session screen tells the leader exactly how long they have. Styled as an amber glass pill that pulses when under 15 minutes remain.

**Sync state is always visible.** A persistent sync status pill in the top navigation bar shows: ✅ Synced / 🔄 Syncing (animated) / ⏳ N pending (amber) / ⚠️ Offline — N queued (red). Leaders are never surprised by unreported data.

**The PWA install prompt is surfaced at the right moment.** After a leader completes their first successful session submission, a glass bottom sheet appears: "Add CAS to your home screen for one-tap access and offline support." This matches the install prompt pattern in report-sys.

**The WhatsApp share is one tap.** After submission, a pre-formatted WhatsApp summary is rendered as a glass card. One amber button opens `https://wa.me/?text=...` (the universal WhatsApp share URL). Works on mobile browser, desktop browser, and any future native app without platform-specific code.

**Touch targets are always ≥ 44×44px.** Every interactive element on mobile-sized viewports meets this minimum — no cramped UI on a 375px screen during a live meeting.

**Attendance marking is click/tap, not swipe.** The PWA uses explicit tap-to-cycle status (tap once = Present, tap again = Absent, tap again = Excused) with a clear glass pill visual state. Swipe gestures are avoided — they conflict with native browser scroll behaviour in a mobile web context and are not reliably distinguishable from scroll intent.

---

## 7. INTEGRATION ARCHITECTURE

### 7.1 Reporting System Integration (report-sys)

The CAS backend emits a `cas.attendance.session_completed` event via the EventOutbox every time a session is submitted. The report-sys CRM bridge endpoint consumes this event and auto-populates the relevant metric fields.

**Metric Mapping (configurable via AdminConfig):**

```typescript
const casToReportingMetricMap = {
  attendanceCount:    'cell_attendance_count',
  sessionHeld:        'cells_that_held',          // Increment by 1 per session
  firstTimerCount:    'first_timers_in_cell',
  firstTimerRetained: 'souls_saved_in_cell',       // After assimilation confirmation
};
```

This mapping is stored in the `AdminConfig` table under `namespace: 'reporting_bridge'` and is editable by the Central Admin without a code deployment.

**Idempotency:** The bridge endpoint checks `Report.externalRef = sessionId` before writing. If a record already exists with that `externalRef`, it updates rather than duplicates.

**Conflict tag:** If a leader manually enters attendance for the same period in report-sys, the conflict is tagged and presented to the admin for resolution (see Backend Architecture doc, section 4.2).

### 7.2 Canonical Identity Service (CIS) Integration

CAS is the **first platform in the estate to be built with CIS integration from day one**. This sets the pattern for future platforms.

**On user registration (OTP verify):**
1. CAS calls `POST /api/cis/users/link` with `{ email?, phone, platformName: 'cas', platformUserId: newUserId, platformRoles: [role] }`
2. CIS returns `canonicalUserId`
3. CAS stores `canonicalUserId` in `User.canonicalUserId`

**On first-timer capture:**
1. CAS calls `GET /api/cis/users/by-email?email=...` or `by-phone?phone=...`
2. If found: stores `canonicalUserId` in `FirstTimerRecord.canonicalUserId`
3. If not found: calls `POST /api/cis/users/link` with the first-timer data to create a canonical record
4. The first-timer is now discoverable across the entire Harvesters digital estate

**JWT:** CAS JWTs include `canonicalUserId` in the payload. This means any other platform that accepts the CAS JWT can resolve the user's identity without a CIS lookup.

### 7.3 Faith Hub Integration (Future — Phase 3)

When the Faith Hub mobile app is live and the Church CRM is deployed:

1. Cell members will be able to self-check-in to their cell session by entering the Meeting Token in the Faith Hub app
2. CAS will receive self-check-in signals via a webhook from Faith Hub
3. The cell leader's app will show real-time member arrivals during the live session window
4. First-timer profiles will automatically pre-fill from the Faith Hub profile if the first-timer is already a Faith Hub user

---

## 8. ENGINEERING EXECUTION PHASES

### Phase 0: Architecture & Contract Finalization (Weeks 1–2)

**Goal:** All contracts agreed before a line of production code is written.

**Web Developer Tasks:**
- Deploy CAS PostgreSQL database with the schema from Section 5.3
- Deploy CIS schema (`canonical_users`, `platforms`, `user_platform_links`)
- Register CAS platform in CIS `platforms` table; receive API key
- Implement CIS client in `lib/cis/client.ts`
- Implement `POST /api/auth/request-otp` and `POST /api/auth/verify-otp` (with SMS integration)
- Implement `POST /api/v1/cells/[id]/roster` and `GET /api/v1/sessions/[id]` (frozen mobile contracts)
- Write `.ai-context.md` for the CAS repo following the report-sys pattern
- Register CAS with Termii (or Africa's Talking) for SMS OTP

**Deliverables:** Working auth flow (phone → OTP → JWT → httpOnly cookie → user), empty dashboard rendered in Next.js, Prisma migrations applied, Service Worker registered.

---

### Phase 1: Core Attendance MVP (Weeks 3–6) — MAY 20 MILESTONE

**Goal:** Cell leaders can submit attendance. Data flows to the reporting system. Demonstrable to stakeholders.

**Web Developer Tasks:**
- Session lifecycle management (scheduler cron, open/lock jobs)
- `POST /api/v1/sessions/[id]/submit` with full Prisma transaction (Section 3.3.C.5)
- GPS geofence validation service
- Meeting token generation for online cells
- EventOutbox table + background worker (polling every 5 minutes via Vercel cron)
- report-sys CRM bridge endpoint (`POST /api/v1/cas-bridge/attendance` in report-sys)
- `GET /api/v1/zones/[id]/dashboard` for Zonal Leader
- Basic in-app notification (session submitted, task assigned)
- First-timer capture endpoint

**Frontend (Next.js) Tasks:**
- Dashboard screen: bento grid layout, next session card, sync status pill
- `/session/[id]` attendance checklist: tap-to-cycle status, countdown timer, first-timer quick-add sheet
- Session submission review screen + WhatsApp share card (`wa.me/?text=...`)
- GPS capture using browser Geolocation API (`navigator.geolocation.getCurrentPosition`)
- IndexedDB sync queue (`idb` library) — write locally first, submit to server in background
- Service Worker (Workbox): cache-first for static assets, network-first for API, background sync for submissions
- PWA manifest and install prompt after first successful submission

**Deliverables:**
- Cell leader completes a full session: opens checklist → marks attendance → adds first-timers → submits → WhatsApp share card appears
- Zonal Leader sees submitted sessions in their dashboard
- report-sys automatically shows cell attendance data for the period (no manual entry)
- Offline mode: submission queued in IndexedDB, syncs automatically via Background Sync API when online

---

### Phase 2: Assimilation, Analytics & Web Admin (Weeks 7–10)

**Goal:** The pastoral follow-up pipeline and leadership analytics are operational.

**Web Developer Tasks:**
- AssimilationTask auto-creation on first-timer submit
- Task escalation cron (overdue → escalate to Zonal Leader)
- FCM push notifications (task reminders, zone submission alerts)
- Full web admin panel: cells, users, config
- Cell health scoring analytics service
- `GET /api/v1/analytics/cell/[id]` and `GET /api/v1/analytics/zone/[id]`
- Admin config UI (`/config` route): edit geofence radius, elastic window, scoring weights, metric mapping
- Export endpoint: CSV/PDF for any period + scope

**Frontend (Next.js) Tasks:**
- Tasks screen (`/tasks`): bento list, due-date urgency colouring, completion flow
- PastoralInteraction logging on member profile screen
- Cell health trend chart on dashboard (Recharts — matches report-sys library choice)
- Reports history screen with period filter
- Member profile screen with attendance history timeline
- Notification preferences screen (Web Push opt-in)
- Manual sync override + offline data status in `/settings`

**Deliverables:**
- Full first-timer → follow-up → assimilation pipeline operational
- Cell health dashboard visible to leaders, zonal leaders, and admins
- All config values editable by Central Admin without code deployment

---

### Phase 3: CRM Integration & Self-Check-In (Weeks 11–14)

**Goal:** CAS becomes fully federated with the broader CRM and Faith Hub.

**Web Developer Tasks:**
- Switch member data reads to prefer CRM Core when available (CIS-mediated)
- Faith Hub self-check-in webhook endpoint
- Real-time session updates via SSE (server-sent events) for live session view
- Impersonation support (Central Admin can view as any cell leader)
- Multi-organization support validation (deploy with a second org ID)

**Frontend (Next.js) Tasks:**
- Real-time member arrival feed during live session (SSE consumer — matches report-sys live notification pattern)
- Faith Hub deep link / web redirect integration for self-check-in
- Advanced offline: full roster snapshot written to IndexedDB on first load, available immediately even with no network
- Refined install prompt UX based on Phase 1/2 adoption data

**Future Flutter Mobile App (Phase 4 — parallel track, not blocking):**
- Begin Flutter project scaffold using all API contracts defined in Phases 0–3
- Bearer token auth (same endpoints as PWA, different token delivery mechanism)
- Flutter offline: SharedPreferences for JWT, SQLite/Isar for roster/session cache
- FCM push notifications (replace VAPID Web Push for native delivery)
- Native GPS with higher accuracy than browser Geolocation API
- Native WhatsApp share intent (replaces `wa.me` URL approach)
- App Store / Play Store submission

**Deliverables:**
- Members can self-check-in via Faith Hub, eliminating manual marking
- CAS fully participates in the Harvesters Canonical Identity Service
- CAS data populates report-sys automatically with zero manual intervention

---

## 9. CONFIG-DRIVEN SYSTEM DESIGN

### 9.1 Admin-Editable Config Values

The following operational values are stored in `AdminConfig` and editable by a `CENTRAL_ADMIN` user via the web admin config interface. All reads fall back to compiled defaults when the DB value is absent, ensuring zero outage if the config table is unavailable.

| Namespace | Key | Default | Description |
|---|---|---|---|
| `sessions` | `elastic_window_minutes` | `90` | Minutes after scheduled start that session stays open |
| `sessions` | `window_open_before_minutes` | `30` | Minutes before start that session opens |
| `sessions` | `geofence_radius_default_m` | `100` | Default GPS geofence radius in metres |
| `sessions` | `token_length` | `6` | Length of online meeting token |
| `sessions` | `token_ttl_minutes` | `120` | How long meeting token is valid |
| `assimilation` | `initial_call_window_hours` | `48` | Hours after first visit to trigger initial call task |
| `assimilation` | `escalation_hours` | `72` | Hours overdue before task is escalated |
| `assimilation` | `escalation_target` | `ZONAL_LEADER` | Role to escalate to |
| `scoring` | `attendance_consistency_weight` | `0.30` | CHS weight: attendance consistency |
| `scoring` | `attendance_rate_weight` | `0.25` | CHS weight: attendance rate |
| `scoring` | `ft_retention_weight` | `0.20` | CHS weight: first-timer retention |
| `scoring` | `reporting_punctuality_weight` | `0.15` | CHS weight: reporting punctuality |
| `scoring` | `growth_trend_weight` | `0.10` | CHS weight: attendance growth trend |
| `reporting_bridge` | `attendance_metric_key` | `cell_attendance_count` | Report-sys metric key for attendance |
| `reporting_bridge` | `cells_held_metric_key` | `cells_that_held` | Report-sys metric key for sessions held |
| `reporting_bridge` | `first_timer_metric_key` | `first_timers_in_cell` | Report-sys metric key for first timers |
| `features` | `whatsapp_bridge_enabled` | `true` | Toggle WhatsApp share feature |
| `features` | `self_checkin_enabled` | `false` | Toggle Faith Hub self-check-in (Phase 3) |
| `features` | `gps_required` | `true` | Require GPS for physical meetings |
| `roles` | (role definitions) | See Section 3.1 | Custom role names/permissions |

### 9.2 Config Loading Pattern

Config is loaded at service startup, cached in Redis (TTL: `ADMIN_CONFIG_CACHE_TTL_SECONDS`, default 300), and refreshed on cache miss. Services never read config from DB directly — they read from Redis, which itself reads from DB. This means a config change takes effect within 5 minutes across all running instances with zero restart.

```typescript
// lib/config/configLoader.ts
export async function getConfig<T>(namespace: string, key: string, fallback: T): Promise<T> {
  const cacheKey = `config:${orgId}:${namespace}:${key}`;
  const cached = await redis.get(cacheKey);
  if (cached) return JSON.parse(cached) as T;
  
  const record = await prisma.adminConfig.findUnique({
    where: { orgId_namespace_key: { orgId, namespace, key } }
  });
  
  const value = record ? (record.value as T) : fallback;
  await redis.setex(cacheKey, 300, JSON.stringify(value));
  return value;
}
```

---

## 10. RISKS & MITIGATION

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| GPS inaccuracy in church buildings | High | Medium | Override flow with justification; admin alert on high override rate |
| Leaders don't adopt the app | Medium | High | WhatsApp Bridge lowers switching cost; strong onboarding; peer pressure via Zonal dashboard |
| Offline sync conflicts | Medium | Medium | Server-wins conflict policy; leader notification; admin resolution UI |
| OTP SMS delivery failure (Termii) | Low | High | Implement fallback SMS provider; OTP also deliverable via WhatsApp Business API |
| Report-sys bridge creates duplicate metrics | Low | High | Idempotency key (`externalRef = sessionId`); conflict detection UI |
| Burst traffic on Sunday evenings | Medium | High | Vercel auto-scaling; Redis-backed idempotency; batch outbox processing |
| PWA offline behaviour inconsistent across browsers | Medium | Medium | Test on Chrome Android + Safari iOS early in Phase 1; use Workbox's proven strategies |
| Web Push VAPID subscription expires or user revokes | Medium | Low | Re-check subscription status on every session start; graceful fallback to in-app-only notifications |

---

## 11. SUCCESS METRICS

| Metric | Target | Measurement Method |
|---|---|---|
| Reporting latency | < 10 min post-meeting | Median `submittedAt - scheduledDate` |
| Data accuracy | 0% discrepancy rate | Cross-check CAS aggregate vs. report-sys auto-populated values |
| Adoption rate | 85%+ active users in Month 3 | `(users with ≥1 session submitted in last 30 days) / total registered leaders` |
| Offline resilience | 100% core function offline | Automated test suite for offline mode |
| WhatsApp share rate | 70%+ of submissions | `whatsapp_share_tapped / sessions_submitted` |
| First-timer follow-up rate | 90%+ tasks completed within window | `completed_tasks / total_tasks` |
| Report-sys auto-population rate | 95%+ cell metrics auto-populated | `metrics_sourced_from_cas / total_cell_metrics` |

---

## 12. REVIEW & COLLABORATION CHECKPOINTS

### For the Web Developer (Phase 1–3 — PWA)

**Decision Checkpoint W1 — CIS Deployment.** Where does the CIS live? Options: (a) Standalone Next.js app on a new Vercel project; (b) A set of route handlers added to report-sys under `/api/cis/`; (c) A PostgreSQL schema in the existing report-sys database with dedicated access. Option (b) is recommended for speed given current team capacity.

**Decision Checkpoint W2 — SMS Provider.** Termii is listed as the recommended provider for Nigerian numbers. Do you have existing credentials or a vendor preference? If Africa's Talking is preferred (lower cost at volume), the `lib/sms/` adapter is straightforward to swap.

**Decision Checkpoint W3 — Vercel Cron.** The EventOutbox worker and session lifecycle jobs are specified as Vercel Cron jobs. Confirm your Vercel plan supports cron jobs at the required frequency (every 5 minutes for outbox, daily for session scheduling).

**Decision Checkpoint W4 — Browser Geolocation vs. IP Fallback.** The PWA uses `navigator.geolocation` for GPS verification. On iOS Safari, this requires an explicit user permission prompt. Decide whether to prompt on first session open or at the point of submission. The geofence validation service must handle `PERMISSION_DENIED` gracefully (fall through to the manual override flow).

**Note on Future Flutter Mobile App:** When Phase 4 begins, the Flutter developer will build against the same API endpoints. No API changes are required — the endpoints already support bearer token auth alongside cookie auth. The only backend addition for Flutter will be FCM push token storage (a simple `fcmToken String?` field on the User model, additive migration).

### For Organizational Leadership

**Stakeholder Checkpoint O1 — Meeting Token Approach.** The current spec for online cells uses a leader-generated token (not member self-entry). This was chosen to minimize friction on the leader side. Is there a preference for members to actively confirm attendance by entering the token? This affects adoption dynamics and should be validated with current cell leaders before Phase 1.

**Stakeholder Checkpoint O2 — WhatsApp Bridge Scope.** The spec sends a formatted text summary. Is there interest in also sending it to the Zonal Leader's WhatsApp group automatically (via WhatsApp Business API)? This is a Phase 3 consideration but affects whether a WhatsApp Business number needs to be registered now.

**Stakeholder Checkpoint O3 — First-Timer Data Privacy.** First-timer phone numbers and names are stored in the system. Confirm the organization's data retention policy and whether members are informed about digital data capture. This is needed before the system handles real personal data.

**Stakeholder Checkpoint O4 — Zonal Approval Requirement.** The spec includes a Zonal Leader approval step before data flows to the Central Admin. Is this approval mandatory, or should data flow automatically unless the Zonal Leader flags an issue? Mandatory approval adds oversight but may create bottlenecks if Zonal Leaders are slow to respond.

---

*Document v2.1 — May 2026 | Cell Attendance System PRD & Engineering Roadmap*  
*Corrected: PWA-first architecture (Next.js 15), Flutter mobile app as future Phase 4 parallel track*  
*Harvesters International Christian Centre | Internal Use Only*
