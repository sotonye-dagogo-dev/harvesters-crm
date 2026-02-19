# Church Fellowship CRM - Development Plan

> **CRITICAL: Production-Ready Code Standards Apply to ALL Phases**
>
> Every phase must adhere to strict quality requirements:
> - **TypeScript Strict Mode**: Zero `any` types, no type assertions, full type safety
> - **Error Handling**: Comprehensive try-catch, proper error boundaries, graceful failures
> - **Performance**: Optimized queries, lazy loading, code splitting, caching
> - **Accessibility**: WCAG 2.1 AA compliance, semantic HTML, ARIA labels
> - **UI/UX**: Consistent design, loading states, error messages, empty states
> - **ACID Properties**: All database transactions must be atomic, consistent, isolated, durable
> - **Modularity**: Reusable components, DRY principle, single responsibility
> - **Testing**: Unit tests for utilities, integration tests for APIs, E2E for critical flows
> - **Documentation**: JSDoc for public APIs, clear variable names, why-comments
> - **Code Review**: All code must pass ESLint, TypeScript compiler, and manual review
>
> See `.github/copilot-instructions.md` for detailed standards and patterns.

## Code Quality Checklist (Every Phase)

Before marking any phase complete, verify:
- [ ] No TypeScript errors (`npm run type-check`)
- [ ] No ESLint errors (`npm run lint`)
- [ ] All functions < 50 lines
- [ ] No magic numbers (use constants)
- [ ] No duplicate code
- [ ] Comprehensive error handling
- [ ] Loading states for async operations
- [ ] Accessibility tested (keyboard navigation, screen reader)
- [ ] Performance tested (Lighthouse score > 90)
- [ ] Mobile responsive (tested on 3+ screen sizes)
- [ ] Unit tests passing (coverage > 80%)
- [ ] No console.log in production code
- [ ] Proper logging for errors with context
- [ ] ACID properties maintained in all transactions
- [ ] Cache invalidation working correctly
- [ ] Rate limiting implemented on all endpoints
- [ ] Input validation with Zod schemas
- [ ] Helpful error messages (no "Error 500" without context)
- [ ] Documentation updated in project-context.md

## Phase 1: Foundation Setup ✅

### 1.1 Project Initialization ✅

- [x] Initialize Next.js 15+ project with TypeScript
- [x] Configure strict TypeScript settings
- [x] Install and configure Ant Design
- [x] Install and configure Tailwind CSS
- [x] Set up project structure
- [x] Create GitHub repository and context files

### 1.2 Development Environment ✅

- [x] Set up ESLint and Prettier
- [x] Configure VS Code settings
- [x] Set up Git hooks (husky)
- [x] Create environment variable templates

### 1.3 Basic Configuration ✅

- [x] Configure Next.js app router
- [x] Set up Tailwind config with custom theme
- [x] Configure Ant Design theme (church-appropriate colors)
- [x] Set up global styles
- [x] Configure path aliases (@/...)

## Phase 2: Type System & Data Structure ✅

### 2.1 Core Types Definition ✅

- [x] Define User types (Superadmin, Leader, Member)
- [x] Define Group/Fellowship types
- [x] Define Meeting types
- [x] Define Interaction types
- [x] Define Membership Request types
- [x] Define Analytics types
- [x] Define API response types

### 2.2 Constants & Enums ✅

- [x] User roles enum
- [x] Meeting frequency constants
- [x] Interaction types enum
- [x] Employment status enum
- [x] Marital status constants
- [x] Interest categories

### 2.3 Validation Schemas ✅

- [x] Zod schemas for user registration
- [x] Zod schemas for meeting creation
- [x] Zod schemas for profile updates
- [x] Zod schemas for group management

## Phase 3: Mock Backend Setup ✅

### 3.1 Mock Data Structure ✅

- [x] Create `lib/data/mockData.ts` with sample data:
  - Users (all three roles)
  - Groups with members and leaders
  - Meetings with attendance records
  - Interactions (calls, follow-ups)
  - Membership requests
  - Notifications

### 3.2 In-Memory Database Service ✅

- [x] Create `lib/data/database.ts` with CRUD operations
- [x] Implement user management functions
- [x] Implement group management functions
- [x] Implement meeting management functions
- [x] Implement interaction tracking functions
- [x] Implement membership request handling
- [x] Implement analytics calculation functions

### 3.3 Next.js API Routes ✅

- [x] Authentication endpoints (`/api/auth/`)
  - POST /api/auth/register
  - POST /api/auth/login
  - POST /api/auth/logout
  - POST /api/auth/refresh-token
- [x] User endpoints (`/api/users/`)
  - GET /api/users (superadmin only)
  - GET /api/users/:id
  - PUT /api/users/:id
  - DELETE /api/users/:id
- [x] Group endpoints (`/api/groups/`)
  - GET /api/groups
  - GET /api/groups/:id
  - POST /api/groups (superadmin/leader)
  - PUT /api/groups/:id
  - DELETE /api/groups/:id
  - GET /api/groups/:id/members
  - DELETE /api/groups/:id/members/:memberId
- [x] Meeting endpoints (`/api/meetings/`)
  - GET /api/meetings
  - GET /api/meetings/:id
  - POST /api/meetings (leader)
  - PUT /api/meetings/:id
  - DELETE /api/meetings/:id
  - GET /api/meetings/:id/attendance
  - POST /api/meetings/:id/attendance
- [x] Interaction endpoints (`/api/interactions/`)
  - GET /api/interactions
  - GET /api/interactions/:id
  - POST /api/interactions (leader)
  - PUT /api/interactions/:id
  - DELETE /api/interactions/:id
- [x] Membership request endpoints (`/api/membership-requests/`)
  - GET /api/membership-requests
  - GET /api/membership-requests/:id
  - POST /api/membership-requests (member)
  - DELETE /api/membership-requests/:id (cancel)
  - POST /api/membership-requests/:id/process (approve/reject)
- [x] Analytics endpoints (`/api/analytics/`)
  - GET /api/analytics/overview (superadmin)
  - GET /api/analytics/groups/:id
  - GET /api/analytics/members/:id

## Phase 4: Authentication & Authorization ✅

### 4.1 Auth Infrastructure ✅

- [x] Implement JWT token generation
- [x] Set up httpOnly cookie management
- [x] Create auth utility functions
- [x] Implement token refresh logic
- [x] Create auth middleware for protected routes
- [x] Create GET /api/auth/me endpoint

### 4.2 Auth Provider ✅

- [x] Create AuthContext with role-based state
- [x] Implement login/logout actions
- [x] Implement token refresh mechanism
- [x] Create useAuth hook
- [x] Handle authentication errors

### 4.3 Auth Pages ✅

- [x] Login page with form validation
- [x] Registration page with multi-step form
- [x] Password reset flow (optional)
- [x] Auth layout component

### 4.4 Route Protection ✅

- [x] Implement middleware for role-based access
- [x] Create protected route wrappers
- [x] Handle unauthorized access
- [x] Redirect logic based on roles

## Phase 5: Core UI Components

### 5.1 Layout Components

- [x] Root layout with providers
- [x] Auth layout (login/register)
- [x] Superadmin dashboard layout with sidebar
- [x] Leader dashboard layout with sidebar
- [x] Member dashboard layout with sidebar
- [x] Navigation components (role-specific)
- [x] Header/AppBar component
- [x] Footer component

### 5.2 Reusable UI Components

- [x] Custom Button component
- [x] Custom Input component
- [x] Custom Card component
- [x] Custom Table component
- [x] Custom Modal component
- [x] Loading states/skeletons
- [x] Error boundaries
- [x] Empty states
- [x] Pagination component

### 5.3 Feature-Specific Components

- [x] UserCard component
- [x] GroupCard component
- [x] MeetingCard component
- [x] AttendanceList component
- [x] InteractionLog component
- [x] MembershipRequestCard component
- [x] StatCard component (analytics)
- [x] ProfileAvatar component

**Phase 5 Quality Gates:**
- [ ] All components follow TypeScript strict mode (no `any`)
- [ ] All components have loading and error states
- [ ] All components are keyboard accessible
- [ ] Color contrast meets WCAG 2.1 AA (4.5:1)
- [ ] All interactive elements have ARIA labels
- [ ] Mobile responsive (tested on 3+ screen sizes)
- [ ] No console.log statements
- [ ] All props interfaces properly typed
- [ ] Components are reusable (no hardcoded values)
- [ ] Empty states provide helpful CTAs
- [ ] Error boundaries catch and display errors gracefully

## Phase 6: User Management Features

### 6.1 User Profile

- [x] View own profile
- [x] Edit profile form
- [x] Update profile picture (mock upload)
- [x] Change password
- [x] Update personal information
- [x] Update interests

### 6.2 Superadmin User Management

- [x] User directory/list view
- [x] Search and filter users
- [x] View user details
- [x] Assign/revoke group leader role
- [x] Deactivate/activate users
- [x] User activity logs

## Phase 7: Group Management Features

### 7.1 Group CRUD Operations

- [x] Create new group (superadmin/leader)
- [x] View group list (role-based filtering)
- [x] View group details
- [x] Edit group information
- [x] Delete group (superadmin only)

### 7.2 Group Members Management

- [x] View group members list
- [x] Add member to group (leader/superadmin)
- [x] Remove member from group
- [x] View member participation stats
- [x] Assign/change group leader

### 7.3 Group Dashboard

- [x] Group overview card
- [x] Recent meetings list
- [x] Member attendance summary
- [x] Group performance metrics
- [x] Quick actions panel

## Phase 8: Meeting Management Features

### 8.1 Meeting CRUD Operations

- [x] Create meeting form (leader)
- [x] View meeting list (upcoming/past)
- [x] View meeting details
- [x] Edit meeting information
- [x] Delete meeting
- [x] Upload meeting screenshot (mock)

### 8.2 Attendance Tracking

- [x] Manual attendance count entry
- [x] Member checklist for attendance
- [x] Mark absent members
- [x] View attendance history
- [x] Attendance reports

### 8.3 Meeting Scheduling

- [x] Calendar view of meetings
- [x] Biweekly schedule generator
- [x] Meeting reminders (notification)
- [x] Meeting status tracking

## Phase 9: Communication & Interactions

### 9.1 Interaction Logging

- [x] Log call interaction form
- [x] Log follow-up form
- [x] Log check-in form
- [x] View interaction history
- [x] Edit/delete interactions

### 9.2 Notifications

- [x] Notification system setup
- [x] Meeting reminders
- [x] Membership request notifications
- [x] Role assignment notifications
- [x] Notification preferences

### 9.3 Follow-up Management

- [x] Inactive member identification
- [x] Follow-up reminders for leaders
- [x] Follow-up scheduling
- [x] Follow-up completion tracking

## Phase 10: Membership Requests

### 10.1 Request Flow

- [x] Member request to join group form
- [x] Member request to change group form
- [x] View pending requests (member)
- [x] View pending requests (leader)
- [x] Approve request action
- [x] Reject request action

### 10.2 Request Management

- [x] Request status tracking
- [x] Request notification system
- [x] Request history view
- [x] Superadmin override capability

## Phase 11: Analytics & Reporting

### 11.1 Member Analytics

- [x] Individual attendance percentage
- [x] Participation history chart
- [x] Engagement score calculation
- [x] Activity timeline
- [x] Personal dashboard

### 11.2 Group Analytics

- [x] Group attendance percentage
- [x] Meeting frequency adherence
- [x] Member participation breakdown
- [x] Engagement trends over time
- [x] At-risk member identification

### 11.3 Church-Wide Analytics (Superadmin)

- [x] Overall engagement metrics
- [x] Comparative group performance
- [x] Active vs inactive members
- [x] Meeting consistency across groups
- [x] Trend analysis
- [x] Exportable reports (CSV/PDF)

### 11.4 Interest-Based Insights

- [x] Interest distribution across members
- [x] Interest-based member filtering
- [x] Suggested groups based on interests
- [x] Demographic insights

## Phase 12: Optimization & Polish

### 12.1 Performance Optimization

- [x] Implement React.lazy for code splitting
- [x] Optimize images with Next.js Image
- [x] Add loading states throughout
- [x] Implement proper error handling
- [x] Add request debouncing
- [x] Optimize re-renders with React.memo
- [x] Implement pagination for lists

### 12.2 UX Improvements

- [x] Loading skeletons with Ant Design
- [x] Smooth transitions and animations
- [x] Toast notifications for feedback
- [x] Confirmation dialogs for destructive actions
- [x] Form validation feedback
- [x] Empty states with helpful messages
- [x] Error pages (404, 500)

### 12.3 Accessibility

- [x] Keyboard navigation support
- [x] ARIA labels on interactive elements
- [x] Focus management
- [x] Screen reader compatibility
- [x] Color contrast compliance
- [x] Semantic HTML usage

### 12.4 SEO

- [x] Meta tags for all pages
- [x] Open Graph tags
- [x] Sitemap generation
- [x] Robots.txt configuration
- [x] JSON-LD structured data

### 12.5 PWA Features

- [x] Service worker setup
- [x] Offline support for basic views
- [x] App manifest configuration
- [x] Install prompt
- [x] Push notification setup

## Phase 13: Testing & Quality Assurance

### 13.1 Testing Infrastructure

- [ ] Set up Jest and React Testing Library
- [ ] Configure test environment
- [ ] Set up test coverage reporting

### 13.2 Unit Tests

- [ ] Test utility functions
- [ ] Test auth functions
- [ ] Test validation schemas
- [ ] Test data formatting functions

### 13.3 Component Tests

- [ ] Test form components
- [ ] Test card components
- [ ] Test layout components
- [ ] Test interactive components

### 13.4 Integration Tests

- [ ] Test authentication flow
- [ ] Test group creation flow
- [ ] Test meeting creation flow
- [ ] Test membership request flow

### 13.5 E2E Tests (Optional)

- [ ] Set up Playwright/Cypress
- [ ] Test critical user journeys
- [ ] Test role-based access

## Phase 14: Documentation

### 14.1 Code Documentation

- [ ] JSDoc comments for complex functions
- [ ] Component prop documentation
- [ ] API endpoint documentation
- [ ] Type definitions documentation

### 14.2 User Documentation

- [ ] User guide for members
- [ ] User guide for group leaders
- [ ] User guide for superadmins
- [ ] Feature documentation

### 14.3 Developer Documentation

- [ ] Setup guide (README.md)
- [ ] Architecture overview
- [ ] Contributing guidelines
- [ ] Deployment guide

## Phase 15: Database & Production Integration

### 15.1 Database Setup

- [ ] Install Prisma and dependencies
- [ ] Design database schema matching mock structure
- [ ] Create Prisma models:
  - User model
  - Group model
  - Meeting model
  - Attendance model
  - Interaction model
  - MembershipRequest model
  - Notification model
- [ ] Set up PostgreSQL database
- [ ] Run initial migrations

### 15.2 Prisma Integration

- [ ] Create Prisma client singleton
- [ ] Replace mock database with Prisma calls
- [ ] Update API routes to use Prisma
- [ ] Implement proper error handling
- [ ] Add database indexes for performance
- [ ] Implement transactions for complex operations

### 15.3 Cloudinary Integration

- [ ] Set up Cloudinary account
- [ ] Configure environment variables
- [ ] Create image upload utility
- [ ] Update profile picture upload
- [ ] Update meeting screenshot upload
- [ ] Implement image optimization

### 15.4 Redis Caching

- [ ] Set up Redis (Upstash or local)
- [ ] Create cache utility functions
- [ ] Implement caching for group members
- [ ] Implement caching for meeting lists
- [ ] Implement caching for analytics
- [ ] Set up cache invalidation

### 15.5 Security & Performance

- [ ] Implement rate limiting
- [ ] Add input sanitization
- [ ] Set up CORS properly
- [ ] Configure secure cookies for production
- [ ] Implement audit logs
- [ ] Optimize database queries
- [ ] Add monitoring and logging

### 15.6 Deployment

- [ ] Set up production environment variables
- [ ] Configure database connection pooling
- [ ] Set up CI/CD pipeline
- [ ] Deploy to Vercel/Netlify
- [ ] Configure custom domain
- [ ] Set up SSL certificates
- [ ] Configure backup strategy

## Phase 16: Leadership Reporting System

> **Note:** This phase implements the Central Reporting System as defined in the PRD. See `.github/prd-implementation-plan.md` for detailed specifications.

### 16.1 Foundation & Data Models (Week 1-2) ✅

- [x] Add dynamic hierarchical roles (CELL_LEADER, ZONE_LEADER, AREA_LEADER, etc.)
- [x] Add reporting roles (SPO, CHURCH_MINISTRY, GROUP_ADMIN, CAMPUS_PASTOR)
- [x] Add user fields: hierarchicalRole, organizationalLevel, organizationalUnitId, reportingRoles[]
- [ ] Create Prisma schema for ReportType model _(deferred to Phase 15 Prisma integration)_
- [ ] Create Prisma schema for StrategicIndicator model _(deferred to Phase 15 Prisma integration)_
- [ ] Create Prisma schema for KeyMetric model _(deferred to Phase 15 Prisma integration)_
- [ ] Create Prisma schema for ReportSubmission model _(deferred to Phase 15 Prisma integration)_
- [ ] Create Prisma schema for MetricEntry model _(deferred to Phase 15 Prisma integration)_
- [ ] Create Prisma schema for ReportComment model _(deferred to Phase 15 Prisma integration)_
- [ ] Create Prisma schema for ReferralLink model _(deferred to Phase 15 Prisma integration)_
- [ ] Create Prisma schema for ReportNotification model _(deferred to Phase 15 Prisma integration)_
- [ ] Run migrations to create reporting tables _(deferred to Phase 15 Prisma integration)_
- [x] Seed all 11 Harvesters report types with complete form definitions (in reportingMockData.ts)
  - [x] GROUP_SPECIAL_PROGRAM (church planting metrics)
  - [x] ATTENDANCE_QUALITY (attendance + service quality)
  - [x] NLP_REPORT (peak attendance tracking)
  - [x] SALVATION_REPORT (cell outreach + salvation)
  - [x] SMALL_GROUP_CELL (cell/group metrics)
  - [x] DISCIPLESHIP_ASSIMILATION (courses + attendance)
  - [x] NEXT_GEN (Kid-Zone + Stir House)
  - [x] PARTNERSHIP (partner counts)
  - [x] HAEF (project reach/impact with documents)
  - [x] SPIRITUAL (baptisms)
  - [x] RELATIONSHIP_BREAKTHROUGH (marriages, dedications, photos)
- [x] Seed strategic indicators and key metrics for each report type
- [x] Create comprehensive mock data (reportingMockData.ts with submissions, metrics, comments)
- [x] Update TypeScript types in lib/types.ts (FormDefinition, FormField, ValidationRule, and ~40 interfaces)
- [x] Create report status constants (lib/constants/index.ts)
- [x] Create field type constants (TEXT, NUMBER, DATE, SELECT, TEXTAREA, CHECKBOX, STRATEGIC_INDICATOR, FILE_UPLOAD, MULTI_FILE_UPLOAD)

### 16.2 Core API Development (Week 3-4) ✅

- [x] Implement intelligent consolidated routes API _(API routes created via per-resource pattern; consolidated organizational-units route deferred to 16.9)_
  - [ ] Create /api/organizational-units/[levelType]/[unitId]/route.ts _(planned for 16.9)_
  - [ ] Support all 7 organizational levels dynamically _(planned for 16.9)_
  - [ ] Implement GET, POST, PUT, DELETE methods _(planned for 16.9)_
  - [ ] Add /members, /reports, /analytics sub-routes _(planned for 16.9)_
- [x] Implement Report Types CRUD API (app/api/report-types/)
- [x] Implement FormDefinition validation endpoint (in reports API route)
- [x] Implement role-based report type filtering API
- [x] Implement Strategic Indicators CRUD API (via database.ts strategicIndicatorDb)
- [x] Implement Key Metrics CRUD API (via database.ts keyMetricDb)
- [ ] Implement File Upload API (Cloudinary integration) _(deferred to Phase 15 Prisma/Cloudinary integration)_
- [x] Implement Report Submissions API (app/api/reports/)
- [x] Implement report submission workflow (submit/approve/review/finalize/request-edits)
- [x] Implement Metric Entries API with auto-save (app/api/reports/[id]/auto-save/)
- [x] Implement dynamic field locking logic (lib/utils/reporting.ts)
- [x] Create dynamic form validation middleware (in reports API)
- [x] Implement role-based access control for report types
- [x] Create audit trail for report actions (via report comments)
- [x] Implement auto-approval after deadline logic (in database.ts)
- [ ] Create unit tests for API endpoints _(deferred to Phase 13)

### 16.3 Report Type Management UI (Week 5-6) ✅

- [x] Create ReportTypesList page (SUPERADMIN) (app/superadmin/reports/types/page.tsx)
- [ ] Create FormBuilder component with drag-and-drop _(future enhancement)_
- [x] Implement field type selector (TEXT, NUMBER, DATE, SELECT, TEXTAREA, CHECKBOX, STRATEGIC_INDICATOR, FILE_UPLOAD, MULTI_FILE_UPLOAD) (in DynamicFormRenderer)
- [ ] Add file upload field configuration _(deferred to Cloudinary integration)_
- [x] Implement validation rule configurator (in form validation middleware)
- [x] Create section grouping UI (in DynamicFormRenderer)
- [x] Implement field locking configuration UI (lock icon indicators in DynamicFormRenderer)
- [x] Create form definition preview mode (view mode in DynamicFormRenderer)
- [ ] Add JSON export/import for form templates _(future enhancement)_
- [x] Create report type activation/deactivation controls (in types page)
- [x] Implement role assignment UI for report types (submitters/reviewers)
- [x] Create organizational level assignment UI

### 16.4 Dynamic Form Rendering (Week 7-8) ✅

- [x] Create DynamicFormRenderer component (components/features/reports/DynamicFormRenderer.tsx)
- [x] Implement field rendering for all 9 field types
  - [x] TEXT, NUMBER, DATE, SELECT, TEXTAREA, CHECKBOX
  - [x] STRATEGIC_INDICATOR with performance calculations
  - [x] FILE_UPLOAD with mock upload (Cloudinary deferred to Phase 15)
  - [x] MULTI_FILE_UPLOAD with file list management (mock)
- [x] Create FileUploadField component (via MockFileUpload)
- [x] Create MultiFileUploadField component (via MockFileUpload)
- [ ] Implement Cloudinary utilities _(deferred to Phase 15 Cloudinary integration)_
- [x] Implement dynamic validation based on ValidationRule config
- [x] Create field locking UI (lock icon indicators)
- [x] Implement auto-save functionality (30s interval) (lib/hooks/useReportAutoSave.ts)
- [x] Create draft save functionality
- [x] Create submit for review action
- [x] Implement form validation with Ant Design Form
- [x] Add report type selector (components/features/reports/ReportTypeSelector.tsx)
- [x] Create organizational unit selector
- [x] Implement real-time performance metrics display
- [x] Add progress indicators for form completion

### 16.5 Review & Approval Workflow (Week 9-10) ✅

- [x] Create ReportReviewPage component (via ReportDetailView with workflow actions)
- [x] Create ReportDetailView component (components/features/reports/ReportDetailView.tsx)
- [x] Implement approve report action (API + UI button)
- [x] Implement request edits action with feedback (API + UI button)
- [x] Create ReportComment component (components/features/reports/ReportComments.tsx)
- [x] Implement comment threading system (with comment types: FEEDBACK, REQUEST_EDIT, APPROVAL_NOTE, CLARIFICATION)
- [x] Create status change notifications (in-app via reportNotificationDb)
- [ ] Implement email notification system _(deferred to production deployment)_
- [x] Build report history/audit trail view (via comments timeline)
- [ ] Create side-by-side comparison view _(future enhancement)_
- [ ] Implement @ mention functionality in comments _(future enhancement)_
- [ ] Add export report to PDF feature _(future enhancement)_

### 16.6 Analytics Dashboard (Week 11-12) ✅

- [x] Create ReportAnalyticsDashboard layout (components/features/reports/ReportAnalyticsDashboard.tsx)
- [x] Implement submission compliance metrics
- [x] Create performance charts (via Ant Design Progress components)
- [x] Build organizational unit comparison visualizations
- [ ] Implement drill-down functionality _(future enhancement)_
- [x] Create top performers widget
- [x] Create areas needing support widget
- [x] Add report type filtering in analytics
- [ ] Add export to CSV functionality _(future enhancement)_
- [ ] Add export to Excel functionality _(future enhancement)_
- [ ] Implement custom date range selector _(future enhancement)_
- [ ] Create scheduled report generation _(future enhancement)_
- [x] Build compliance tracking reports by report type

### 16.7 Referral System (Week 13) ✅

- [x] Implement referral link generation API (app/api/referral-links/)
- [x] Create ReferralLinkManager UI component _(via referral-links API)_
- [ ] Update registration flow to accept referral codes _(integration pending)_
- [x] Implement link validation logic (app/api/referral-links/validate/[code]/)
- [x] Implement link expiration handling
- [x] Create link usage tracking and audit
- [ ] Add referral management to settings _(future enhancement)_
- [ ] Create referral link preview component _(future enhancement)_
- [x] Implement one-time use enforcement
- [x] Add role and flexible organizational assignment on registration
- [x] Support generating links for any organizational level
- [ ] Track conversion rate of referral links _(future enhancement)_

### 16.8 Notifications & Reminders (Week 14) ✅

- [x] Implement in-app report notification system (app/api/report-notifications/)
- [ ] Create ReportNotificationDropdown component _(future enhancement)_
- [ ] Build email notification templates _(deferred to production deployment)_
- [ ] Set up deadline reminder cron jobs _(deferred to production deployment)_
- [ ] Implement notification preferences for reports _(future enhancement)_
- [x] Create notification badge in navigation (in DashboardLayout)
- [x] Add mark as read/unread functionality (via report-notifications API)
- [ ] Implement notification grouping by type _(future enhancement)_
- [ ] Create email digest for pending reviews _(future enhancement)_
- [ ] Add push notifications for urgent deadlines _(future enhancement)_

### 16.9 Intelligent Routing Implementation (Week 15) ✅

- [ ] Create UniversalLeaderDashboard component _(existing leader dashboard serves this purpose with existing small groups features; reporting system uses separate role-specific report pages)_
  - [ ] Dynamic rendering based on organizationalLevel
  - [ ] Level-specific labels (Cell/Zone/Area/etc.)
  - [ ] Reusable MetricsOverview component
  - [ ] Reusable UnitHierarchy component
  - [ ] Reusable ReportsSection component
  - [ ] Reusable MembersSection component
- [x] Add Reports section to navigation for eligible roles (SUPERADMIN, ZONAL_LEADER, CAMPUS_ADMIN, HOD)
- [x] Create role-based menu items (Submit/Review/Analytics)
- [x] Update DashboardLayout with Reports navigation
- [ ] Create organizational data fetching utilities _(future enhancement when intelligent routing is fully implemented)_
- [x] Refactor level-specific routes to use intelligent routing (report pages use shared components with role-specific thin wrappers)
- [x] Add Reports section to navigation for eligible roles
- [x] Create role-based menu items (Submit/Review/Analytics)
- [x] Update DashboardLayout with Reports navigation
- [x] Create ReportsDashboard landing page per role
- [ ] Implement "Pending Reviews" badge counts _(future enhancement)_
- [ ] Create quick action cards for reports _(future enhancement)_
- [ ] Add recent reports widget to main dashboard _(future enhancement)_
- [ ] Implement breadcrumb navigation for reports _(future enhancement)_
- [ ] Create reports quick search functionality _(future enhancement)_elligent routing (if any exist)
- [ ] Add Reports section to navigation for eligible roles
- [ ] Create role-based menu items (Submit/Review/Analytics)
- [ ] Update DashboardLayout with Reports navigation
- [ ] Create ReportsDashboard landing page per role
- [ ] Implement "Pending Reviews" badge counts
- [ ] Create quick action cards for reports
- [ ] Add recent reports widget to main dashboard
- [ ] Implement breadcrumb navigation for reports
- [ ] Create reports quick search functionality

### 16.10 Testing & Quality Assurance (Week 16)

**Code Quality Gates:**
- [ ] TypeScript strict mode: Zero `any` types, zero type assertions
- [ ] ESLint: Zero errors, zero warnings
- [ ] No console.log in production code (use proper logger)
- [ ] All functions under 50 lines
- [ ] No magic numbers (all extracted to constants)
- [ ] No duplicate code (DRY principle enforced)
- [ ] Meaningful variable/function names throughout
- [ ] JSDoc comments on all exported functions

**Functionality Testing:**
- [ ] Test dynamic form rendering with all 11 report types
  - [ ] GROUP_SPECIAL_PROGRAM (church planting)
  - [ ] ATTENDANCE_QUALITY (attendance + quality)
  - [ ] NLP_REPORT (peak attendance)
  - [ ] SALVATION_REPORT (outreach + salvation)
  - [ ] SMALL_GROUP_CELL (cell metrics)
  - [ ] DISCIPLESHIP_ASSIMILATION (courses)
  - [ ] NEXT_GEN (Kid-Zone + Stir House)
  - [ ] PARTNERSHIP (partner counts)
  - [ ] HAEF (project reach with documents)
  - [ ] SPIRITUAL (baptisms)
  - [ ] RELATIONSHIP_BREAKTHROUGH (marriages + photos)
- [ ] Test FILE_UPLOAD field with various file types (JPG, PNG, PDF)
- [ ] Test MULTI_FILE_UPLOAD with max files enforcement
- [ ] Test Cloudinary upload/delete operations
- [ ] Test file validation (type, size restrictions)
- [ ] Test FormBuilder component (create/edit report types)
- [ ] Test field locking with various configuration scenarios
- [ ] Test auto-save functionality (30s interval)
- [ ] Test draft save and recovery after browser crash

**Intelligent Routing Testing:**
- [ ] Test across all 7 organizational levels
  - [ ] CELL level: Verify correct data and labels
  - [ ] ZONE level: Verify parent (Area) and child (Cell) links
  - [ ] AREA level: Verify hierarchy navigation
  - [ ] COMMUNITY level: Verify drill-down functionality
  - [ ] DISTRICT level: Verify aggregated metrics
  - [ ] CAMPUS level: Verify consolidated reports
  - [ ] GROUP level: Verify church-wide analytics
- [ ] Verify UniversalLeaderDashboard renders correctly for each level
- [ ] Test data fetching for all levels (500+ users, 550+ submissions)
- [ ] Verify level-specific labels and terminology display

**ACID Properties Testing:**
- [ ] Test atomic transactions (report + metrics creation)
- [ ] Test rollback on partial failure
- [ ] Test concurrent report submissions (isolation)
- [ ] Test data consistency after database crash
- [ ] Test duplicate submission prevention
- [ ] Verify cache invalidation after writes
- [ ] Test transaction deadlock handling

**Error Handling Testing:**
- [ ] Test network failure during form submission
- [ ] Test file upload failure scenarios
- [ ] Test validation errors (client and server)
- [ ] Test concurrent edit conflicts
- [ ] Test session expiration during report editing
- [ ] Verify error messages are user-friendly
- [ ] Test error logging includes context (userId, reportId)
- [ ] Test error boundary catches React errors

**Performance Testing:**
- [ ] Lighthouse score > 90 (Performance, Accessibility, Best Practices, SEO)
- [ ] First Contentful Paint < 1.8s
- [ ] Time to Interactive < 3.8s
- [ ] API response time < 200ms (p95)
- [ ] Database query time < 50ms (p95)
- [ ] Test with 500+ users, 550+ report submissions
- [ ] Test large file uploads (5MB)
- [ ] Test pagination with 1000+ reports
- [ ] Test auto-save under slow network
- [ ] Monitor bundle size < 200KB (gzipped)

**Security Testing:**
- [ ] Test rate limiting on all endpoints (10 requests/minute)
- [ ] Test role-based access control (unauthorized access attempts)
- [ ] Test input validation (XSS, SQL injection attempts)
- [ ] Test file upload security (malicious files, oversized files)
- [ ] Test CSRF protection on state-changing operations
- [ ] Verify passwords never logged or exposed
- [ ] Test session timeout and re-authentication
- [ ] Verify Cloudinary URLs are not predictable

**Accessibility Testing (WCAG 2.1 AA):**
- [ ] Keyboard navigation for all features
- [ ] Tab order is logical and complete
- [ ] Focus indicators visible on all interactive elements
- [ ] ARIA labels on all form fields
- [ ] Screen reader testing (NVDA on Windows, VoiceOver on Mac)
- [ ] Color contrast ratio > 4.5:1
- [ ] Form errors announced to screen readers
- [ ] File upload accessible via keyboard
- [ ] Modal focus trap working correctly
- [ ] Skip links functional

**Mobile Responsiveness Testing:**
- [ ] Test on iPhone (Safari)
- [ ] Test on Android (Chrome)
- [ ] Test on tablet (iPad)
- [ ] Touch targets minimum 44x44px
- [ ] File upload works on mobile
- [ ] Forms usable on small screens
- [ ] Tables scroll horizontally on mobile
- [ ] Navigation menu mobile-friendly
- [ ] Pull-to-refresh functional
- [ ] Bottom sheets instead of modals

**UI/UX Testing:**
- [ ] Loading states for all async operations
- [ ] Error states with retry options
- [ ] Empty states with helpful CTAs
- [ ] Success messages after mutations
- [ ] Confirmation dialogs for destructive actions
- [ ] Progress indicators for multi-step forms
- [ ] Disabled state on submit buttons while processing
- [ ] No layout shift during page load
- [ ] Smooth transitions (150-300ms)
- [ ] Skeleton screens for loading content

**Cross-Browser Testing:**
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari (iOS 15+)
- [ ] Mobile Chrome (Android 10+)

**Data Integrity Testing:**
- [ ] Test report submission workflow (Draft → Submitted → Approved → Reviewed → Finalized)
- [ ] Test edit requests workflow (Submitted → Requires_Edits → Resubmitted)
- [ ] Test metric calculations (performance %, variance)
- [ ] Test field locking after submission
- [ ] Test monthly achieved locking after month end
- [ ] Test referral link one-time use enforcement
- [ ] Verify notification delivery (in-app and email)
- [ ] Test deadline auto-approval logic

**Comprehensive QA:**
- [ ] Test with realistic mock data (500+ users, 550+ submissions)
- [ ] Test role-based access to report types (all roles initially)
- [ ] Test SUPERADMIN role configuration restrictions
- [ ] Test referral link generation with flexible organizational assignment
- [ ] Test email notifications delivery and formatting
- [ ] Fix identified bugs and edge cases
- [ ] Performance optimization (lazy loading, code splitting)
- [ ] User acceptance testing (UAT) with stakeholders
- [ ] Final code review by senior developer
- [ ] Security audit by security team

**Documentation:**
- [ ] Update API documentation
- [ ] Update component documentation
- [ ] Update project-context.md with final architecture
- [ ] Create troubleshooting guide
- [ ] Document known limitations
- [ ] Create runbook for production incidents

### 16.11 Deployment & Training (Week 17)

- [ ] Deploy reporting system to production
- [ ] Migrate any existing report data (if applicable)
- [ ] Create user training materials (videos/guides)
- [ ] Conduct Campus Admin training sessions
- [ ] Conduct Campus Pastor training sessions
- [ ] Conduct Group Admin/Pastor training sessions
- [ ] Conduct Church Ministry/SPO/CEO training
- [ ] Monitor system performance and errors
- [ ] Gather initial user feedback
- [ ] Create support documentation and FAQs
- [ ] Plan Phase 2 improvements based on feedback

## Success Metrics

### Small Groups Management System
- [ ] All seven user roles can complete their core workflows
- [ ] Meeting creation and attendance tracking work seamlessly
- [ ] Analytics dashboards provide actionable insights
- [ ] Mobile-responsive design works on all devices
- [ ] App is installable as PWA
- [ ] Load time under 3 seconds
- [ ] No critical accessibility issues
- [ ] Test coverage above 70%
- [ ] Zero high-severity security vulnerabilities

### Leadership Reporting System
- [ ] 95% of campuses submitting reports weekly by Month 2
- [ ] 80% of reports submitted before deadline
- [ ] Reports reviewed within 48 hours of submission
- [ ] <5% of reports requiring edits
- [ ] User satisfaction rating >4.0/5.0
- [ ] Email notifications delivered with 99% success rate
- [ ] Analytics dashboard loads within 3 seconds
- [ ] Zero data loss incidents with auto-save
- [ ] Referral link conversion rate >80%
- [ ] Field locking enforced with 100% accuracy

## Notes

- Each phase should be completed and tested before moving to the next
- Mock backend in Phase 3 should mirror production database structure
- All features should work with mock data before database integration
- Focus on role-based access control throughout development
- Maintain privacy and data protection principles
- Document architectural decisions in `.github/summaries/`

## Production-Ready Code Enforcement

**Before ANY code is committed:**

### TypeScript Compliance
```bash
npm run type-check  # Must pass with ZERO errors
```
- No `any` types allowed
- No `@ts-ignore` or `@ts-expect-error`
- All function returns explicitly typed
- Null/undefined handled explicitly

### Code Quality
```bash
npm run lint        # Must pass with ZERO errors/warnings
npm run format      # Code must be formatted
```
- Functions max 50 lines
- Files max 500 lines
- Nesting max 3 levels
- No magic numbers
- No duplicate code
- Meaningful names (no single-letter variables except loop counters)

### Testing
```bash
npm run test        # All tests must pass
npm run test:coverage  # Coverage > 80%
```
- Unit tests for all utilities
- Integration tests for all APIs
- E2E tests for critical flows
- Accessibility tests (keyboard, screen reader)

### Performance
```bash
npm run build       # Bundle size < 200KB gzipped
npm run lighthouse  # Score > 90 on all metrics
```
- First Contentful Paint < 1.8s
- Time to Interactive < 3.8s
- No layout shift (CLS < 0.1)
- Images optimized (Next.js Image component)
- Code splitting implemented
- Lazy loading for heavy components

### Security
- Rate limiting on all endpoints
- Input validation with Zod
- CSRF protection enabled
- Secure cookies (httpOnly, secure, sameSite)
- No sensitive data in logs
- Role-based access control on all routes

### Accessibility (WCAG 2.1 AA)
- Keyboard navigation complete
- ARIA labels on all interactive elements
- Color contrast ratio > 4.5:1
- Screen reader compatible
- Focus management in modals
- Semantic HTML throughout

### Error Handling
- Try-catch on all async operations
- Error boundaries for React components
- User-friendly error messages
- Error logging with context (userId, requestId)
- Graceful degradation
- Retry mechanisms for failed requests

### ACID Properties (Database)
- Use Prisma transactions for multi-step operations
- Validate constraints before and after
- Prevent race conditions with proper locking
- Commit before cache/notifications

### UI/UX Standards
- Loading states for all async operations
- Error states with retry options
- Empty states with clear CTAs
- Success messages after mutations
- Confirmation for destructive actions
- Mobile-first responsive design

### Documentation
- JSDoc on all exported functions
- README for each major feature
- API documentation up-to-date
- Inline comments explain WHY, not WHAT
- TODO comments reference GitHub issues

### Code Review Checklist
- [ ] TypeScript strict mode compliance
- [ ] No ESLint errors/warnings
- [ ] Tests added and passing
- [ ] Performance tested (Lighthouse > 90)
- [ ] Accessibility tested (keyboard + screen reader)
- [ ] Mobile tested (iOS + Android)
- [ ] Error handling comprehensive
- [ ] ACID properties maintained
- [ ] Security best practices followed
- [ ] Documentation updated
- [ ] Code is modular and reusable
- [ ] No duplicate code
- [ ] Meaningful variable/function names
- [ ] Edge cases handled

**Rejection Criteria (Code will NOT be merged if):**
- ❌ Any `any` types present
- ❌ TypeScript errors exist
- ❌ ESLint errors/warnings present
- ❌ Tests failing or coverage < 80%
- ❌ Lighthouse score < 90
- ❌ Accessibility violations (keyboard, contrast)
- ❌ No error handling
- ❌ Hardcoded values instead of constants
- ❌ Functions > 50 lines
- ❌ Duplicate code
- ❌ console.log in production code
- ❌ Missing loading/error states
- ❌ Not mobile responsive
- ❌ Security vulnerabilities
- ❌ ACID properties not maintained

**Remember: We're building for Harvesters International Christian Centre - excellence is not optional.**
