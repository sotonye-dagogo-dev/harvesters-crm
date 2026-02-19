# Harvesters Small Groups CRM - Project Context

## Project Vision

Harvesters Small Groups CRM is a centralized, data-driven web application built exclusively for Harvesters International Christian Centre. The platform enables effective management of small group meetings, tracks member engagement, and supports pastoral care through structured insights, accountability, and informed decision-making. 

Founded on December 13th, 2003, by Pastor Bolaji Idowu, Harvesters has grown from a handful of people to over 70,000 worshippers across multiple locations in Nigeria, the United Kingdom, and the United States of America. This platform supports Harvesters' vision of changing lives by pioneering thriving churches in key global cities that bring hope, connect people with God, influence culture, and lead people to become fully devoted followers of Christ.

The platform provides visibility into member participation, group health, and leadership effectiveness while remaining simple, respectful of privacy, and aligned with Harvesters' operations and values.

## Production-Ready Development Standards

**CRITICAL: This project demands enterprise-level code quality**

### Code Quality Non-Negotiables

1. **TypeScript Strict Mode**
   - Zero tolerance for `any` types
   - No type assertions (`as`) - fix root types instead
   - Full null/undefined handling
   - Discriminated unions for variant types
   - Generic types for reusable components

2. **Error Handling Excellence**
   - Try-catch for all async operations
   - React Error Boundaries for UI errors
   - Specific error types for different failures
   - User-friendly error messages
   - Error logging with context (user ID, request ID, stack trace)
   - Never expose internal errors to users

3. **ACID Properties (Database Operations)**
   - **Atomicity**: All-or-nothing transactions (use Prisma.$transaction)
   - **Consistency**: Validate constraints before and after operations
   - **Isolation**: Prevent race conditions with proper locking
   - **Durability**: Commit to database before cache/notifications

4. **Performance Standards**
   - First Contentful Paint < 1.8s
   - Largest Contentful Paint < 2.5s
   - Time to Interactive < 3.8s
   - API Response Time < 200ms (p95)
   - Database Query Time < 50ms (p95)
   - Bundle Size < 200KB (gzipped)

5. **Accessibility Requirements (WCAG 2.1 AA)**
   - Semantic HTML5 elements
   - Proper ARIA labels and roles
   - Keyboard navigation for all features
   - Color contrast ratio 4.5:1 minimum
   - Screen reader compatibility
   - Focus management in modals

6. **UI/UX Excellence**
   - Loading states for all async operations
   - Error states with retry options
   - Empty states with clear CTAs
   - Confirmation for destructive actions
   - Optimistic UI updates where appropriate
   - Mobile-first responsive design
   - Touch targets minimum 44x44px

7. **Security Best Practices**
   - Rate limiting on all endpoints
   - Input validation with Zod schemas
   - SQL injection prevention (Prisma parameterized queries)
   - XSS prevention (React escaping)
   - CSRF protection (SameSite cookies)
   - Secure password hashing (bcrypt 10+ rounds)
   - Role-based access control at API level

8. **Testing Requirements**
   - Unit tests for utilities (80%+ coverage)
   - Integration tests for API endpoints
   - E2E tests for critical user flows
   - Accessibility testing (keyboard, screen reader)
   - Performance testing (Lighthouse)
   - Cross-browser testing (Chrome, Safari, Firefox)
   - Mobile testing (iOS Safari, Android Chrome)

9. **Code Organization**
   - Single Responsibility Principle
   - DRY (Don't Repeat Yourself)
   - Functions max 50 lines
   - Max 3 levels of nesting
   - No magic numbers (use constants)
   - Meaningful variable/function names
   - JSDoc for public APIs

10. **Monitoring & Logging**
    - Structured logging (JSON format)
    - Log levels (error, warn, info, debug)
    - Context in logs (userId, requestId, timestamp)
    - Error tracking (Sentry or similar)
    - Performance monitoring (Vercel Analytics)
    - Database query monitoring
    - API response time tracking

### Architecture Decisions

- **Modularity**: Reusable components across all organizational levels
- **Dynamism**: Configuration-driven features (no hardcoding)
- **Scalability**: Designed for 100,000+ users, 10,000+ groups
- **Maintainability**: Clear patterns, comprehensive docs, type safety
- **Extensibility**: Easy to add new report types, organizational levels

## Core Features

### 1. User Management & Access Control

- **Dynamic Role System**: 
  - **Small Groups Hierarchy (Organizational)**: Cell → Zone → Area → Community → District → Campus → Group
    * Each level has a Leader role (e.g., Cell Leader, Zone Leader, etc.)
    * System designed for flexibility to accommodate future organizational levels
  - **Reporting System Roles**: CEO (SUPERADMIN) → SPO → Church Ministry → Group Admin → Campus Pastor → Campus Leaders
  - **Note**: Users can have both hierarchical and reporting roles simultaneously
- **Profile Management**: Comprehensive member profiles with demographics, interests, and contact info
- **Role Assignment**: Dynamic role assignment and management by authorized leadership
- **Referral-Based Onboarding**: Generate unique registration links with pre-assigned roles and flexible organizational unit assignments
- **User Directory**: Centralized directory with search and filtering capabilities

### 2. Group & Fellowship Management

- **Group Creation**: Superadmins and leaders can create and manage groups
- **Member Assignment**: Flexible member-group associations
- **Group Metadata**: Name, description, meeting frequency, assigned leaders
- **Group Performance**: Dashboard showing health metrics and engagement

### 3. Meeting & Attendance Tracking

- **Biweekly Scheduling**: Default meeting frequency with customization
- **Manual Logging**: Leaders log meetings with date, time, duration
- **Attendance Capture**: Numeric count or member-by-member checkbox
- **Screenshot Upload**: WhatsApp call screenshots or other proof of meeting
- **Attendance History**: Comprehensive tracking of member participation

### 4. Communication & Pastoral Care

- **Interaction Logging**: Track calls, follow-ups, and check-ins
- **Timestamped Records**: Complete history of leader-member interactions
- **Follow-up Reminders**: Automated prompts for inactive member outreach
- **Interaction Analytics**: Frequency and effectiveness metrics

### 5. Membership Requests & Transfers

- **Join Requests**: Members can request to join specific groups
- **Transfer Requests**: Members can request to change groups
- **Leader Approval**: Group leaders approve or reject requests
- **Transfer History**: Complete audit trail of member movements
- **Superadmin Override**: Church leadership can reassign as needed

### 6. Engagement Metrics & Analytics

- **Member-Level Metrics**: Attendance percentage, participation history, engagement scoring
- **Group-Level Metrics**: Group attendance, meeting frequency adherence, comparative performance
- **Church-Wide Dashboard**: Overall engagement, trend analysis, at-risk identification
- **Exportable Reports**: CSV/PDF exports for leadership review

### 7. Interest-Based Insights

- **Interest Tagging**: Members select interests during onboarding
- **Interest-Based Filtering**: Find members with similar interests
- **Group Recommendations**: Suggest optimal groups based on interests and demographics
- **Fellowship Alignment**: Data-driven member grouping for better engagement

### 8. Leadership Reporting System (NEW)

- **Dynamic Report Types**: Multiple report templates with different form fields and validation rules
  * Report types are configurable via FormBuilder (no code changes needed)
  * Each report type has its own access control (role-based submission and review)
  * Supports organizational levels: Cell, Zone, Area, Community, District, Campus, Group
- **Form Definition System**: Visual form builder for creating/editing report types
  * 7 field types: TEXT, NUMBER, DATE, SELECT, TEXTAREA, CHECKBOX, STRATEGIC_INDICATOR
  * Dynamic validation rules (REQUIRED, MIN, MAX, PATTERN, CUSTOM)
  * Section grouping for logical field organization
  * Field-level locking configuration
- **Strategic Indicators**: Define key performance indicators (KPIs) embedded within report forms
- **Weekly Report Submission**: Leaders submit reports using dynamic forms tailored to their role
- **Hierarchical Approval Workflow**: Campus Leaders → Campus Pastor → Group Admin → Church Ministry → SPO → CEO
- **Key Metrics Tracking**: Monthly goals, achieved values, and year-on-year targets with auto-calculated performance
- **Field Locking**: Configurable per-field locking (after submission, after date, or after first value)
- **Report Status Management**: Track DRAFT, SUBMITTED, REQUIRES_EDITS, APPROVED, REVIEWED, FINALIZED states
- **Email Notifications**: Automated notifications for submission, edits requested, approval, and deadlines
- **Referral-Based Registration**: Generate unique referral links with flexible organizational unit assignment
- **Analytics Dashboard**: Performance visualization and compliance tracking across all organizational levels
- **Auto-Save**: Real-time auto-save (30-second intervals) during report entry to prevent data loss
- **Audit Trail**: Complete history of report submissions, edits, reviews, and approvals
- **Deadline Management**: Auto-approval if no reviewer action taken within defined timeframe

## Technical Architecture

### Frontend Stack

- **Next.js 15+**: App Router for modern React patterns
- **TypeScript**: Strict mode for type safety
- **Ant Design**: Comprehensive UI component library
- **Tailwind CSS**: Utility-first styling for customization
- **React Context**: Global state management for auth and user role

### Authentication & Authorization

- **JWT Tokens**: Access and refresh token pattern
- **httpOnly Cookies**: Secure token storage
- **Token Refresh**: Automatic renewal before expiration
- **Role-Based Access Control**: Enforced at middleware, API, and UI levels
- **Protected Routes**: Route guards based on user role

### State Management

- **AuthContext**: User authentication state and role information
- **Server State**: Server Components for data fetching
- **Server Actions**: Mutations and form submissions
- **Local State**: Component-level state with hooks

### PWA Features

- **Offline Support**: Service workers for basic offline functionality
- **Installable**: Add to home screen on mobile devices
- **Push Notifications**: Meeting reminders and updates
- **Responsive Design**: Mobile-first approach

### Data Flow

```
User Action → Server Action/API Route → Mock DB/Prisma → Response
           ↓
    Update UI (optimistic) → Revalidate → Final State
```

### Intelligent Routing Architecture (Phase 16)

**Key Principle**: Consolidated routes reduce code duplication and improve maintainability

**API Routes**:
- Single route handles all organizational levels: `/api/organizational-units/[levelType]/[unitId]`
- Supports: CELL, ZONE, AREA, COMMUNITY, DISTRICT, CAMPUS, GROUP
- Dynamic data fetching based on `levelType` parameter
- Sub-routes for members, reports, analytics

**Page Routes**:
- Universal leader dashboard: `/leader/dashboard`
- Intelligent rendering based on user's `organizationalLevel`
- Same components, different data and labels
- Eliminates 6+ duplicate level-specific pages

**Benefits**:
- Single source of truth for organizational unit logic
- Easier to add new organizational levels (no code changes needed)
- Consistent behavior across all levels
- Reduced maintenance burden
- Better type safety with TypeScript

## Mock Backend Structure (Phases 3-4)

### TypeScript Mock Database

```typescript
// lib/data/mockData.ts
const users: User[] = [...]; // 500+ users across all roles and organizational levels
const groups: Group[] = [...];
const meetings: Meeting[] = [...];
const interactions: Interaction[] = [...];
const membershipRequests: MembershipRequest[] = [...];
const notifications: Notification[] = [...];

// Leadership Reporting System Mock Data
const reportTypes: ReportType[] = [...]; // All 11 Harvesters report types with complete FormDefinitions
const strategicIndicators: StrategicIndicator[] = [...];
const keyMetrics: KeyMetric[] = [...];
const reportSubmissions: ReportSubmission[] = [...]; // 550+ submissions (50+ per report type)
const metricEntries: MetricEntry[] = [...];
const reportComments: ReportComment[] = [...];
const referralLinks: ReferralLink[] = [...];
const reportNotifications: ReportNotification[] = [...];
```

### Mock Data Scale (Phase 16 Requirements)

**Comprehensive Mock Data for Testing:**
- **500+ Users**: Realistic distribution across all roles (SUPERADMIN, SPO, CHURCH_MINISTRY, GROUP_ADMIN, ZONAL_LEADER, CAMPUS_ADMIN, HOD, SMALL_GROUP_LEADER, CELL_LEADER, MEMBER)
- **Complete Organizational Hierarchy**:
  - 5 Groups (regions)
  - 75 Campuses (15 per group)
  - 600+ Districts (8+ per campus)
  - 3000+ Communities (5+ per district)
  - 15000+ Areas (5+ per community)
  - 75000+ Zones (5+ per area)
  - 375000+ Cells (5+ per zone)
- **550+ Report Submissions**: 50+ submissions per report type with varied statuses (DRAFT, SUBMITTED, REQUIRES_EDITS, APPROVED, REVIEWED, FINALIZED)
- **Time Distribution**: Reports spanning 12 months with realistic weekly submissions
- **File Uploads**: Mock Cloudinary URLs for reports with FILE_UPLOAD and MULTI_FILE_UPLOAD fields
- **Varied Performance**: Mix of EXCEEDING, ON_TRACK, and BELOW_TARGET performance metrics

### In-Memory Database Service

```typescript
// lib/data/database.ts
export const db = {
  users: {
    find: (id: string) => User | undefined,
    findMany: (filter?) => User[],
    create: (data) => User,
    update: (id, data) => User,
    delete: (id) => void,
  },
  groups: { /* similar CRUD operations */ },
  meetings: { /* similar CRUD operations */ },
  organizationalUnits: { /* intelligent queries for any level type */ },
  reportTypes: { /* CRUD for report type management */ },
  reportSubmissions: { /* CRUD with flexible organizational filtering */ },
  // ... other resources
};
```

### Next.js API Routes

All endpoints in `/app/api/` directory:

**Small Groups Management:**
- Authentication: `/api/auth/*`
- Users: `/api/users/*`
- Groups: `/api/groups/*`
- Meetings: `/api/meetings/*`
- Interactions: `/api/interactions/*`
- Membership Requests: `/api/membership-requests/*`
- Analytics: `/api/analytics/*`

**Leadership Reporting System:**
- Intelligent Consolidated Routes: `/api/organizational-units/[levelType]/[unitId]/*` (supports all 7 levels: CELL, ZONE, AREA, COMMUNITY, DISTRICT, CAMPUS, GROUP)
  - GET/PUT/DELETE `/api/organizational-units/:levelType/:unitId`
  - GET `/api/organizational-units/:levelType/:unitId/members`
  - GET `/api/organizational-units/:levelType/:unitId/reports`
  - GET `/api/organizational-units/:levelType/:unitId/analytics`
- Report Types: `/api/report-types/*`
- Strategic Indicators: `/api/strategic-indicators/*`
- Key Metrics: `/api/key-metrics/*`
- Report Submissions: `/api/reports/*`
- Metric Entries: `/api/metric-entries/*`
- Report Comments: `/api/reports/:id/comments`
- Referral Links: `/api/referral-links/*`
- Report Notifications: `/api/report-notifications/*`
- Report Analytics: `/api/analytics/reports/*`
- File Upload: `/api/cloudinary/upload`, `/api/cloudinary/delete`

## Production Database Architecture (Phase 15)

### Database Stack

- **ORM**: Prisma (v5.x)
- **Database**: PostgreSQL (14+)
- **Caching**: Redis (Upstash)
- **File Storage**: Cloudinary

### Database Models

#### User Model

- **Fields**: id, email (unique), password (bcrypt), firstName, lastName, phone, whatsappPhone, location, age, maritalStatus, employmentStatus, interests[], role (enum), hierarchicalRole, organizationalLevel, organizationalUnitId, reportingRoles[], groupId, avatar (Cloudinary URL), isActive, createdAt, updatedAt
- **Relations**: group (n:1), ledGroups (1:n), meetings (1:n via group), interactions (1:n as recipient), reportsSubmitted (1:n), reportsReviewed (1:n), reportsApproved (1:n), reportsFinalReviewed (1:n), reportComments (1:n), reportNotifications (1:n), referralLinksCreated (1:n), referralLinkUsed (n:1)
- **Indexes**: email, role, groupId, isActive, [organizationalLevel, organizationalUnitId]

#### Group Model

- **Fields**: id, name, description, meetingFrequency, leaderId, createdAt, updatedAt
- **Relations**: leader (n:1 with User), members (1:n), meetings (1:n)
- **Indexes**: leaderId, createdAt

#### Meeting Model

- **Fields**: id, groupId, date, startTime, endTime, attendeeCount, attendeeIds[], screenshotUrl (Cloudinary), notes, createdById, createdAt, updatedAt
- **Relations**: group (n:1), createdBy (n:1 with User), attendance (1:n)
- **Indexes**: groupId, date (DESC), createdById

#### Attendance Model

- **Fields**: id, meetingId, memberId, present (boolean), createdAt
- **Relations**: meeting (n:1), member (n:1 with User)
- **Unique**: [meetingId, memberId]
- **Indexes**: meetingId, memberId

#### Interaction Model

- **Fields**: id, leaderId, memberId, type (CALL/FOLLOW_UP/CHECK_IN), notes, timestamp, createdAt
- **Relations**: leader (n:1 with User), member (n:1 with User)
- **Indexes**: leaderId, memberId, type, timestamp (DESC)

#### MembershipRequest Model

- **Fields**: id, memberId, fromGroupId, toGroupId, type (JOIN/TRANSFER), status (PENDING/APPROVED/REJECTED), requestedAt, respondedAt, respondedById
- **Relations**: member (n:1 with User), fromGroup (n:1), toGroup (n:1), respondedBy (n:1 with User)
- **Indexes**: memberId, status, requestedAt (DESC)

#### Notification Model

- **Fields**: id, userId, type (MEETING_REMINDER/REQUEST_STATUS/ROLE_ASSIGNMENT), title, message, relatedId, read, createdAt
- **Relations**: user (n:1)
- **Indexes**: [userId, read], createdAt (DESC)

#### ReportType Model (NEW - Reporting System)

- **Fields**: id, name, description, code (unique), category, formDefinition (JSON with sections[], fields[], validationRules[]), allowedSubmitterRoles[], allowedReviewerRoles[], frequency, organizationalLevel, isActive, createdAt, updatedAt
- **Relations**: submissions (1:n with ReportSubmission)
- **Indexes**: [code, isActive], [category, organizationalLevel]
- **FormDefinition Structure**: Contains sections with fields of types: TEXT, NUMBER, DATE, SELECT, TEXTAREA, CHECKBOX, STRATEGIC_INDICATOR, FILE_UPLOAD, MULTI_FILE_UPLOAD
- **11 Harvesters Report Types**:
  1. GROUP_SPECIAL_PROGRAM (church planting metrics)
  2. ATTENDANCE_QUALITY (attendance + service quality indicators)
  3. NLP_REPORT (peak attendance tracking)
  4. SALVATION_REPORT (cell outreach + church salvation)
  5. SMALL_GROUP_CELL (cell/group metrics)
  6. DISCIPLESHIP_ASSIMILATION (courses + attendance)
  7. NEXT_GEN (Kid-Zone + Stir House metrics)
  8. PARTNERSHIP (partner counts)
  9. HAEF (project reach/impact with MULTI_FILE_UPLOAD for documents)
  10. SPIRITUAL (baptisms)
  11. RELATIONSHIP_BREAKTHROUGH (marriages, dedications, testimonies with FILE_UPLOAD for photos)

#### StrategicIndicator Model (NEW - Reporting System)

- **Fields**: id, name, description, category, isActive, displayOrder, applicableRoles[], campusLevel, groupLevel, createdAt, updatedAt
- **Relations**: keyMetrics (1:n), metricEntries (1:n)
- **Indexes**: [category, isActive]

#### KeyMetric Model (NEW - Reporting System)

- **Fields**: id, strategicIndicatorId, name, description, dataType, unit, isRequired, minValue, maxValue, allowNegative, autoCalculate, calculationFormula, displayOrder, isActive, createdAt, updatedAt
- **Relations**: strategicIndicator (n:1), metricEntries (1:n)
- **Indexes**: [strategicIndicatorId, isActive]

#### ReportSubmission Model (NEW - Reporting System)

- **Fields**: id, reportTypeId, reportYear, reportMonth, reportWeek, periodStartDate, periodEndDate, submittedById, submitterRole, organizationalLevelType (CELL/ZONE/AREA/COMMUNITY/DISTRICT/CAMPUS/GROUP), organizationalUnitId, formData (JSON - includes Cloudinary URLs for uploaded files), status, reviewedById, reviewedAt, reviewerNotes, approvedById, approvedAt, approverNotes, finalReviewedById, finalReviewedAt, finalReviewerRole, submittedAt, lastEditedAt, isLocked, createdAt, updatedAt
- **Relations**: reportType (n:1), submittedBy (n:1), reviewedBy (n:1), approvedBy (n:1), finalReviewedBy (n:1), metricEntries (1:n), comments (1:n), notifications (1:n)
- **Unique**: [reportTypeId, organizationalUnitId, reportYear, reportWeek]
- **Indexes**: [status, submittedById], [organizationalLevelType, organizationalUnitId], [reportYear, reportMonth]
- **File Storage**: Uploaded files stored in Cloudinary with URLs in formData JSON, organized by uploadFolder (reports, evidence, attachments)

#### MetricEntry Model (NEW - Reporting System)

- **Fields**: id, reportSubmissionId, keyMetricId, strategicIndicatorId, monthlyGoal, monthlyAchieved, yearOnYearGoal, performancePercentage, variance, monthlyGoalLocked, monthlyAchievedLocked, yearOnYearGoalLocked, lastSavedAt, createdAt, updatedAt
- **Relations**: keyMetric (n:1), strategicIndicator (n:1), reportSubmission (n:1)
- **Unique**: [reportSubmissionId, keyMetricId]
- **Indexes**: [reportSubmissionId]

#### ReportComment Model (NEW - Reporting System)

- **Fields**: id, reportSubmissionId, userId, userRole, commentType, content, metricEntryId, isInternal, createdAt, updatedAt
- **Relations**: user (n:1), reportSubmission (n:1)
- **Indexes**: [reportSubmissionId, createdAt]

#### ReferralLink Model (NEW - Reporting System)

- **Fields**: id, code (unique), createdById, createdByRole, assignedRole, organizationalLevelType, organizationalUnitId, isUsed, usedById, usedAt, expiresAt, isActive, createdAt, updatedAt
- **Relations**: createdBy (n:1), usedBy (n:1)
- **Indexes**: [code, isUsed], [createdById], [organizationalLevelType, organizationalUnitId]

#### ReportNotification Model (NEW - Reporting System)

- **Fields**: id, userId, reportSubmissionId, notificationType, title, message, isRead, readAt, emailSent, emailSentAt, createdAt
- **Relations**: user (n:1), reportSubmission (n:1)
- **Indexes**: [userId, isRead, createdAt]

### Analytics & Algorithms

#### Member Engagement Scoring

```typescript
score =
  attendanceRate * 0.5 +
  interactionFrequency * 0.3 +
  daysActiveMembership * 0.2;
```

#### At-Risk Member Identification

- No attendance in last 3 meetings
- No leader interactions in last 30 days
- Engagement score below threshold (< 40)

#### Group Health Metrics

- Average attendance percentage
- Meeting frequency adherence
- Member retention rate
- Leader interaction frequency
- Response time to membership requests

#### Church-Wide Analytics

- Total active members vs inactive
- Overall attendance trends
- Group performance comparison
- Interest distribution analysis
- Leadership effectiveness metrics

### Caching Strategy

#### Cache Keys

- User profile: `user:{userId}`
- Group members: `group:{groupId}:members`
- Group meetings: `group:{groupId}:meetings`
- Member analytics: `analytics:member:{userId}`
- Group analytics: `analytics:group:{groupId}`
- Church-wide metrics: `analytics:church`

#### Cache TTLs

- User profiles: 15 minutes
- Group data: 10 minutes
- Meeting lists: 5 minutes
- Analytics: 30 minutes

#### Invalidation Rules

- On profile update: Clear user cache
- On member join/leave: Clear group members cache
- On meeting creation: Clear group meetings cache
- On attendance update: Clear all related analytics caches
- On interaction log: Clear member analytics cache

### Rate Limiting

#### IP-based (Unauthenticated)

- 100 requests per minute
- Applied to login, registration endpoints

#### User-based (Authenticated)

- 300 requests per minute (general)
- 10 meeting creations per hour
- 30 interaction logs per hour
- 20 membership requests per day

#### Implementation

- Redis-based sliding window
- Returns 429 with Retry-After header
- Separate limits per endpoint category

### Image Management

#### Cloudinary Integration

- **Upload Folders**: `church-crm/avatars`, `church-crm/meetings`
- **Transformations**:
  - Avatars: 300×300, crop fill, face gravity, auto quality
  - Meeting screenshots: 800px width, auto quality, auto format
- **Allowed Formats**: jpg, png, webp
- **Max File Size**: 5MB
- **Security**: Signed uploads, restricted folders

#### Image Operations

- Upload: Validate → Convert to base64 → Cloudinary → Store URL
- Update: Delete old → Upload new → Update record
- Delete: Extract public ID → Cloudinary destroy
- Validation: Client-side (type, size) + server-side

### Security Best Practices

- **Password Hashing**: bcrypt with 12 salt rounds
- **Input Validation**: Zod schemas for all inputs
- **SQL Injection Prevention**: Prisma parameterized queries
- **XSS Prevention**: Sanitize user-generated content
- **CSRF Protection**: SameSite cookies, token verification
- **Rate Limiting**: All endpoints protected
- **Audit Logs**: Track sensitive operations (role changes, member transfers)
- **Data Access Control**: Role-based filtering at query level

### Performance Optimizations

#### Database

- Indexes on frequently queried fields
- Composite indexes for complex queries
- Connection pooling (Prisma default)
- Select only needed fields
- Batch operations where possible
- Cursor-based pagination

#### Caching

- Redis for frequently accessed data
- Cache-aside pattern
- Invalidate on writes
- Short TTLs for balance

#### API Response

- Gzip compression
- Minimal payloads
- Paginated results (20 items default)
- HTTP caching headers

## Design System

### Color Palette

- **Primary**: `#1B4B3E` (Deep Church Green)
- **Secondary**: `#8B7355` (Warm Brown)
- **Accent**: `#D4A373` (Golden Accent)
- **Success**: `#52c41a` (Ant Design default)
- **Warning**: `#faad14` (Ant Design default)
- **Error**: `#ff4d4f` (Ant Design default)
- **Neutrals**: Gray scale from 50-900
- **Base**: White `#ffffff`, Dark `#141414`

### Typography

- **Primary Font**: Inter
- **Fallbacks**: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto
- **Scale**: Ant Design default scale

### Spacing

- Consistent use of Tailwind spacing utilities
- 4px base unit (Tailwind default)

### Components

- Ant Design components as foundation
- Custom styling with Tailwind
- Consistent border radius (6px)
- Subtle shadows for elevation
- Smooth transitions (200ms)

## User Flows

### Member Registration Flow

1. User enters personal details (name, email, phone)
2. Selects demographic info (age, marital status, employment)
3. Chooses interests from predefined list
4. Optionally selects a group to join
5. Account created with Member role
6. Email verification (optional)
7. Redirect to member dashboard

### Group Leader Meeting Creation Flow

1. Leader navigates to "Create Meeting" in their group
2. Fills in date, start time, end time
3. Optionally adds meeting notes
4. Uploads screenshot of meeting call (if available)
5. Selects attendance tracking method (count or checklist)
6. If checklist: marks present/absent for each member
7. If count: enters total number of attendees
8. Submits meeting record
9. Meeting appears in group history

### Membership Request Flow

1. Member browses available groups
2. Clicks "Request to Join" on desired group
3. Optionally adds message explaining request
4. Request sent to group leader
5. Leader receives notification
6. Leader reviews member profile and request
7. Leader approves or rejects with optional message
8. Member receives notification of decision
9. If approved: member moved to new group
10. If rejected: can request different group

### Superadmin Group Analytics Flow

1. Superadmin navigates to Analytics dashboard
2. Views church-wide overview (total groups, members, meetings)
3. Selects specific group for detailed analysis
4. Reviews attendance trends (chart over time)
5. Identifies at-risk members (low engagement)
6. Views leader interaction frequency
7. Compares group performance against church average
8. Exports report as CSV or PDF for leadership meeting

## API Endpoints

### Authentication

- `POST /api/auth/register` - Create new user account
- `POST /api/auth/login` - Authenticate user, return tokens
- `POST /api/auth/logout` - Invalidate refresh token
- `POST /api/auth/refresh-token` - Get new access token

### Users

- `GET /api/users` - List users (superadmin only, paginated)
- `GET /api/users/:id` - Get user profile
- `PUT /api/users/:id` - Update user profile
- `DELETE /api/users/:id` - Deactivate user (superadmin)
- `PUT /api/users/:id/role` - Change user role (superadmin)

### Groups

- `GET /api/groups` - List groups (role-filtered)
- `GET /api/groups/:id` - Get group details
- `POST /api/groups` - Create group (superadmin/leader)
- `PUT /api/groups/:id` - Update group info
- `DELETE /api/groups/:id` - Delete group (superadmin)
- `GET /api/groups/:id/members` - List group members
- `POST /api/groups/:id/members` - Add member to group
- `DELETE /api/groups/:id/members/:memberId` - Remove member

### Meetings

- `GET /api/meetings` - List meetings (role-filtered, paginated)
- `GET /api/meetings/:id` - Get meeting details
- `POST /api/meetings` - Create meeting (leader)
- `PUT /api/meetings/:id` - Update meeting
- `DELETE /api/meetings/:id` - Delete meeting (leader/superadmin)
- `POST /api/meetings/:id/attendance` - Log attendance

### Interactions

- `GET /api/interactions` - List interactions (role-filtered)
- `POST /api/interactions` - Log interaction (leader)
- `PUT /api/interactions/:id` - Update interaction
- `DELETE /api/interactions/:id` - Delete interaction

### Membership Requests

- `GET /api/membership-requests` - List requests (role-filtered)
- `POST /api/membership-requests` - Create request (member)
- `PUT /api/membership-requests/:id/approve` - Approve request (leader)
- `PUT /api/membership-requests/:id/reject` - Reject request (leader)

### Analytics

- `GET /api/analytics/member/:id` - Member engagement metrics
- `GET /api/analytics/group/:id` - Group performance metrics
- `GET /api/analytics/church` - Church-wide analytics (superadmin)
- `GET /api/analytics/export` - Export analytics report

### Strategic Indicators (Reporting System)

- `GET /api/strategic-indicators` - List all active indicators
- `GET /api/strategic-indicators/:id` - Get indicator details
- `POST /api/strategic-indicators` - Create indicator (superadmin)
- `PUT /api/strategic-indicators/:id` - Update indicator (superadmin)
- `DELETE /api/strategic-indicators/:id` - Soft delete (superadmin)

### Key Metrics (Reporting System)

- `GET /api/key-metrics` - List all metrics
- `GET /api/key-metrics/:id` - Get metric details
- `GET /api/strategic-indicators/:id/metrics` - Get metrics for indicator
- `POST /api/key-metrics` - Create metric (superadmin)
- `PUT /api/key-metrics/:id` - Update metric (superadmin)
- `DELETE /api/key-metrics/:id` - Soft delete (superadmin)

### Report Templates (Reporting System)

- `GET /api/report-templates` - List templates for user role
- `GET /api/report-templates/:id` - Get template details
- `POST /api/report-templates` - Create template (superadmin)
- `PUT /api/report-templates/:id` - Update template (superadmin)
- `DELETE /api/report-templates/:id` - Delete template (superadmin)

### Report Submissions (Reporting System)

- `GET /api/reports` - List reports (role-filtered, paginated)
- `GET /api/reports/:id` - Get report details with metrics
- `POST /api/reports` - Create draft report
- `PUT /api/reports/:id` - Update draft/editable report
- `DELETE /api/reports/:id` - Delete draft report
- `POST /api/reports/:id/submit` - Submit report (status → SUBMITTED)
- `POST /api/reports/:id/request-edits` - Request edits (status → REQUIRES_EDITS)
- `POST /api/reports/:id/approve` - Approve report (status → APPROVED)
- `POST /api/reports/:id/review` - Mark as reviewed (status → REVIEWED)
- `GET /api/reports/:id/history` - Get report audit trail
- `POST /api/reports/:id/auto-save` - Auto-save metric entries

### Metric Entries (Reporting System)

- `GET /api/reports/:reportId/metrics` - Get all metric entries for report
- `POST /api/reports/:reportId/metrics` - Bulk create/update entries
- `PUT /api/metric-entries/:id` - Update single metric entry
- `POST /api/metric-entries/:id/lock` - Lock specific field

### Report Comments (Reporting System)

- `GET /api/reports/:reportId/comments` - Get comments for report
- `POST /api/reports/:reportId/comments` - Add comment/feedback
- `PUT /api/comments/:id` - Edit own comment
- `DELETE /api/comments/:id` - Delete own comment

### Referral Links (Reporting System)

- `GET /api/referral-links` - List user's created links
- `POST /api/referral-links` - Generate new referral link
- `GET /api/referral-links/:code/validate` - Validate link during registration
- `POST /api/referral-links/:code/use` - Use link during registration
- `DELETE /api/referral-links/:id` - Deactivate referral link

### Report Notifications (Reporting System)

- `GET /api/report-notifications` - Get user's report notifications
- `PUT /api/report-notifications/:id/read` - Mark notification as read
- `PUT /api/report-notifications/read-all` - Mark all as read
- `DELETE /api/report-notifications/:id` - Delete notification

### Report Analytics (Reporting System)

- `GET /api/analytics/reports/overview` - Church-wide report metrics
- `GET /api/analytics/reports/campus/:id` - Campus report analytics
- `GET /api/analytics/reports/zone/:id` - Zone report analytics
- `GET /api/analytics/reports/performance` - Performance trends over time
- `GET /api/analytics/reports/compliance` - Submission compliance rates

## Role-Based Access Matrix

### Small Groups Management

| Feature               | Member   | Cell Leader   | Small Group Leader | HOD          | Campus Admin | Zonal Leader | Superadmin |
| --------------------- | -------- | ------------- | ------------------ | ------------ | ------------ | ------------ | ---------- |
| View own profile      | ✅       | ✅            | ✅                 | ✅           | ✅           | ✅           | ✅         |
| Edit own profile      | ✅       | ✅            | ✅                 | ✅           | ✅           | ✅           | ✅         |
| View own group        | ✅       | ✅            | ✅                 | ✅           | ✅           | ✅           | ✅         |
| View all groups       | ❌       | ❌            | ❌                 | Department   | Campus       | Zone         | ✅         |
| Create group          | ❌       | Limited       | Limited            | Limited      | ✅           | ✅           | ✅         |
| Edit group            | ❌       | Own group     | Own group          | Own dept     | Campus       | Zone         | ✅         |
| Delete group          | ❌       | ❌            | ❌                 | ❌           | Limited      | Limited      | ✅         |
| Create meeting        | ❌       | Own cell      | Own group          | Department   | Campus       | Zone         | ✅         |
| Log attendance        | ❌       | Own cell      | Own group          | Department   | Campus       | Zone         | ✅         |
| Log interactions      | ❌       | Own cell      | Own group          | Department   | Campus       | Zone         | ✅         |
| Request membership    | ✅       | ✅            | ✅                 | ✅           | N/A          | N/A          | N/A        |
| Approve requests      | ❌       | Own cell      | Own group          | Department   | Campus       | Zone         | ✅         |
| View member analytics | Own only | Cell members  | Group members      | Dept members | Campus       | Zone         | All        |
| View group analytics  | Own only | Own cell      | Own group          | Department   | Campus       | Zone         | All        |
| View church analytics | ❌       | ❌            | ❌                 | ❌           | Limited      | Zone         | ✅         |
| Assign roles          | ❌       | ❌            | ❌                 | ❌           | Limited      | Limited      | ✅         |
| Manage users          | ❌       | ❌            | ❌                 | ❌           | Limited      | Limited      | ✅         |

### Leadership Reporting System

| Feature                       | HOD (Campus Admin) | Campus Admin | Campus Pastor | Group Admin | Group Pastor (Zonal) | Church Ministry | SPO  | CEO (Superadmin) |
| ----------------------------- | ------------------ | ------------ | ------------- | ----------- | -------------------- | --------------- | ---- | ---------------- |
| Submit weekly report          | ✅                 | ❌           | ❌            | Via HODs    | ❌                   | ❌              | ❌   | ❌               |
| Submit group report           | ❌                 | ❌           | ❌            | ✅          | ❌                   | ❌              | ❌   | ❌               |
| Review reports                | ❌                 | ❌           | Campus only   | Campus set  | Zone only            | All             | All  | All              |
| Approve reports               | ❌                 | ❌           | Campus only   | ❌          | Zone only            | ❌              | ❌   | ❌               |
| Request edits                 | ❌                 | ❌           | Campus only   | Campus set  | Zone only            | Yes             | Yes  | Yes              |
| Mark as reviewed              | ❌                 | ❌           | ❌            | ✅          | ✅                   | ✅              | ✅   | ✅               |
| View analytics dashboard      | Department         | Campus       | Campus        | Group       | Zone                 | All             | All  | All              |
| Manage strategic indicators   | ❌                 | ❌           | ❌            | ❌          | ❌                   | ❌              | ❌   | ✅               |
| Manage report templates       | ❌                 | ❌           | ❌            | ❌          | ❌                   | ❌              | ❌   | ✅               |
| Generate referral links       | Limited            | Limited      | ✅            | ✅          | ✅                   | ✅              | ✅   | ✅               |
| Export reports                | Own dept           | Campus       | Campus        | Group       | Zone                 | All             | All  | All              |
| View compliance tracking      | ❌                 | ❌           | Campus        | Group       | Zone                 | All             | All  | All              |
| Override auto-approval        | ❌                 | ❌           | ❌            | ❌          | ❌                   | ❌              | ❌   | ✅               |
| Access audit trail            | Own reports        | Campus       | Campus        | Group       | Zone                 | All             | All  | All              |

## Data Privacy & Compliance

- Members can only view their own detailed data
- Leaders can only access data for their group members
- Superadmins have full access but are church-trusted leadership
- Personal information (phone numbers, addresses) is protected
- Audit logs track all sensitive operations
- Data export capabilities for members to request their data
- Secure deletion process for account removal
- No third-party data sharing without explicit consent

## Success Metrics

- **Adoption Rate**: Percentage of church members using the system
- **Active Groups**: Number of groups with regular meetings
- **Meeting Consistency**: Percentage of groups meeting at scheduled frequency
- **Attendance Tracking**: Percentage of meetings with logged attendance
- **Member Engagement**: Average attendance rate across all members
- **Leader Adoption**: Percentage of leaders actively logging activities
- **At-Risk Identification**: Number of inactive members identified and re-engaged
- **Request Response Time**: Average time to approve/reject membership requests
- **System Uptime**: Target 99.5% availability
- **Mobile Usage**: Percentage of access from mobile devices

## Future Enhancements (Out of Scope for MVP)

- Built-in messaging between leaders and members
- Video calling integration
- Financial contribution tracking
- Event management beyond regular meetings
- AI-driven insights and recommendations
- Multi-church support with shared resources
- Mobile native apps (iOS/Android)
- Advanced prayer request management
- Volunteer scheduling and management
- Resource library and document sharing
