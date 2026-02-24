# Reporting System Implementation Plan
## Based on Harvesters International Christian Center Central Reporting System PRD

**Document Version:** 2.0  
**Last Updated:** February 17, 2026  
**Status:** Planning Phase

---

## Executive Summary

This document outlines the implementation plan for integrating the Central Reporting System (as defined in the Reporting System PRD) into the existing Harvesters CRM application. The reporting system will enable standardized weekly report submission, review, and approval across the church's hierarchical structure while maintaining the existing small groups management functionality.

### Key Objectives

1. Implement a weekly reporting system for campus administrators and leadership
2. Create a role-based report submission and approval workflow
3. Build strategic indicator and key metrics tracking
4. Develop analytics dashboards for leadership oversight
5. Implement referral-based registration system
6. Maintain backward compatibility with existing small groups features
7. **Build intelligent consolidated routing for all organizational levels**
8. **Implement media upload capability in report forms**
9. **Ensure modular, reusable components with production-ready code**
10. **Create rich, comprehensive mock data for all report types**

---

## 1. System Architecture Overview

### 1.1 Dual-System Approach

The application will support **two parallel but integrated systems**:

#### **System A: Small Groups Management** (Existing)
- **Purpose:** Track member participation in small group meetings
- **Organizational Hierarchy:** Cell → Zone → Area → Community → District → Campus → Group
- **Each Level Has:** A leader responsible for that organizational unit
- **Key Features:** Meeting attendance, interactions, member enrollment, campaigns
- **Users:** All members and leaders at every hierarchical level
- **Note:** Hierarchy is designed to be dynamic to accommodate future organizational levels

#### **System B: Leadership Reporting** (New - From PRD)
- **Purpose:** Standardized reporting from campus leadership to executive leadership
- **Reporting Hierarchy:** Campus Leaders → Campus Pastor → Group Admin → Church Ministry → SPO → CEO
- **Key Features:** Multiple report types, strategic indicators, key metrics, approval workflow, analytics
- **Report Types:** Dynamic form templates with role-based access
- **Users:** Leadership roles only (Campus Pastor and above)

### 1.2 Role Mapping & Integration

**Organizational Hierarchy (Small Groups System):**
```
Cell → Zone → Area → Community → District → Campus → Group
```

Each level has a **Leader** role that can be dynamically assigned. The system supports flexible role assignment to accommodate future organizational restructuring.

**Reporting System Roles:**

| Role | Reporting Responsibility | Access to System A | Access to System B |
|------|-------------------------|-------------------|-------------------|
| CEO | Final oversight of all reports | Full Access | Full Access |
| SPO | Reviews all group reports | Read Access | Full Access |
| Church Ministry | Central repository & review | Read Access | Review & Store |
| Group Admin | Consolidates campus reports | Limited Access | Consolidate & Submit |
| Campus Pastor | Reviews & approves campus reports | Campus Access | Review & Approve |
| Campus Leaders | Submit departmental reports | Department Access | Submit Reports |

**Implementation Notes:**
- Roles in System A (Small Groups) are dynamic and tied to organizational hierarchy levels
- Roles in System B (Reporting) are specific and permission-based
- A user can have both a hierarchical role (e.g., Campus Leader) and a reporting role (e.g., Campus Pastor)

### 1.3 Extended User Role Enum

```typescript
export enum UserRole {
  // Executive & Administrative
  SUPERADMIN = 'SUPERADMIN', // CEO
  SPO = 'SPO',
  CHURCH_MINISTRY = 'CHURCH_MINISTRY',
  
  // Dynamic Hierarchical Roles (Small Groups)
  // These map to organizational levels: Cell → Zone → Area → Community → District → Campus → Group
  GROUP_LEADER = 'GROUP_LEADER',
  CAMPUS_LEADER = 'CAMPUS_LEADER',
  DISTRICT_LEADER = 'DISTRICT_LEADER',
  COMMUNITY_LEADER = 'COMMUNITY_LEADER',
  AREA_LEADER = 'AREA_LEADER',
  ZONE_LEADER = 'ZONE_LEADER',
  CELL_LEADER = 'CELL_LEADER',
  
  // Reporting-Specific Roles
  GROUP_ADMIN = 'GROUP_ADMIN',
  CAMPUS_PASTOR = 'CAMPUS_PASTOR',
  
  // Base Role
  MEMBER = 'MEMBER',
}

// Future-proof design: New organizational levels can be added without breaking existing code
```

### 1.4 Intelligent Routing Architecture

**Key Principle:** Minimize code duplication by using a single API route and page route for all level leaders, with intelligent rendering based on the user's organizational level and role.

#### Consolidated API Routes Pattern

```typescript
// Instead of separate routes for each level:
// ❌ /api/groups/cell/:id
// ❌ /api/groups/zone/:id
// ❌ /api/groups/area/:id
// ❌ /api/groups/community/:id
// ❌ /api/groups/district/:id
// ❌ /api/groups/campus/:id

// Use ONE intelligent route:
// ✅ /api/organizational-units/:levelType/:unitId
// Example: /api/organizational-units/CAMPUS/campus-123
// Example: /api/organizational-units/ZONE/zone-456

// Route handler dynamically queries based on levelType
export async function GET(request: Request, { params }: { params: { levelType: string, unitId: string } }) {
  const { levelType, unitId } = params;
  const user = await getAuthenticatedUser();
  
  // Verify user has access to this level and unit
  if (!canAccessUnit(user, levelType, unitId)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }
  
  // Fetch data dynamically based on level type
  const data = await fetchOrganizationalUnitData(levelType, unitId);
  
  return NextResponse.json(data);
}
```

#### Consolidated Page Routes Pattern

```typescript
// Instead of:
// ❌ /leader/cell/dashboard
// ❌ /leader/zone/dashboard
// ❌ /leader/area/dashboard
// etc.

// Use ONE intelligent route:
// ✅ /leader/dashboard
// Component determines level from user's organizationalLevel

// Page component:
export default function LeaderDashboard() {
  const { user } = useAuth();
  const level = user.organizationalLevel; // 'CELL', 'ZONE', 'AREA', etc.
  const unitId = user.organizationalUnitId;
  
  return (
    <UniversalLeaderDashboard
      level={level}
      unitId={unitId}
      role={user.role}
    />
  );
}
```

#### Benefits of Intelligent Routing

1. **Single Source of Truth**: One codebase for all levels
2. **Easier Maintenance**: Fix bugs once, applies to all levels
3. **Scalability**: Add new organizational levels without creating new routes
4. **Reduced Bundle Size**: Less code duplication
5. **Consistent UX**: Same interface across all levels with level-appropriate data

---

## 2. Data Model Design

### 2.1 Report Type / Form Definition Model

```typescript
interface ReportType {
  id: string;
  name: string; // e.g., "Campus Weekly Report", "Ministry Performance Report"
  description?: string;
  code: string; // Unique identifier (e.g., "CAMPUS_WEEKLY")
  category: 'CAMPUS' | 'GROUP' | 'MINISTRY' | 'SPECIAL';
  
  // Form structure
  formDefinition: FormDefinition; // Dynamic form schema
  
  // Access control
  allowedSubmitterRoles: UserRole[]; // Who can submit this report type
  allowedReviewerRoles: UserRole[]; // Who can review/approve
  
  // Submission settings
  frequency: 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY' | 'AD_HOC';
  isActive: boolean;
  
  // Hierarchical scope
  organizationalLevel?: 'CELL' | 'ZONE' | 'AREA' | 'COMMUNITY' | 'DISTRICT' | 'CAMPUS' | 'GROUP';
  
  createdAt: Date;
  updatedAt: Date;
}

interface FormDefinition {
  sections: FormSection[];
  validationRules: ValidationRule[];
}

interface FormSection {
  id: string;
  title: string;
  description?: string;
  displayOrder: number;
  fields: FormField[];
}

interface FormField {
  id: string;
  name: string;
  label: string;
  type: 'TEXT' | 'NUMBER' | 'DATE' | 'SELECT' | 'TEXTAREA' | 'CHECKBOX' | 'STRATEGIC_INDICATOR' | 'FILE_UPLOAD' | 'MULTI_FILE_UPLOAD';
  placeholder?: string;
  helpText?: string;
  isRequired: boolean;
  
  // For strategic indicators
  strategicIndicatorId?: string;
  
  // For select fields
  options?: { label: string; value: string }[];
  
  // For file upload fields
  acceptedFileTypes?: string[]; // e.g., ['image/*', 'application/pdf']
  maxFileSize?: number; // in MB
  maxFiles?: number; // for MULTI_FILE_UPLOAD
  uploadFolder?: 'reports' | 'attachments' | 'evidence'; // Cloudinary folder
  
  // Validation
  minValue?: number;
  maxValue?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  
  // Field locking
  lockAfterSubmission?: boolean;
  lockAfterDate?: boolean; // Lock at end of reporting period
  
  displayOrder: number;
}

interface ValidationRule {
  fieldId: string;
  ruleType: 'REQUIRED' | 'MIN' | 'MAX' | 'PATTERN' | 'CUSTOM';
  value?: any;
  errorMessage: string;
}
```

### 2.1.1 Harvesters Report Types (As Defined)

Based on organizational requirements, the following report types will be implemented with their specific fields:

#### 1. Group Report - Special Program

**Code:** `GROUP_SPECIAL_PROGRAM`  
**Category:** GROUP  
**Frequency:** AD_HOC  
**Fields:**

**Section: Church Planting Program**
- Number of Church Plantings (NUMBER, required)
- Number of Church Planters (NUMBER, required)
- Number of Church Planters Small Group (NUMBER, required)

**Section: Program Metrics**
- Reach (NUMBER, required)
- Distribution (NUMBER, required)
- Volunteers (NUMBER, required)
- Registration (NUMBER, required)
- Attendance (NUMBER, required)
- Salvation (NUMBER, required)
- Assimilation (NUMBER, required)
- Next Step (NUMBER, required)
- Workers Attendance (NUMBER, required)
- First Timers (NUMBER, required)

#### 2. Attendance & Quality of Program Report

**Code:** `ATTENDANCE_QUALITY`  
**Category:** CAMPUS  
**Frequency:** WEEKLY  
**Fields:**

**Section: Attendance Metrics**
- Sunday Attendance (NUMBER, required)
- First Timer Attendance (NUMBER, required)
- Workers Attendance (NUMBER, required)
- Midweek Attendance (NUMBER, required)

**Section: Service Quality Indicators**
- Sound (SELECT, options: Excellent/Good/Fair/Poor)
- Light (SELECT, options: Excellent/Good/Fair/Poor)
- Staging (SELECT, options: Excellent/Good/Fair/Poor)
- Music (SELECT, options: Excellent/Good/Fair/Poor)
- Parking Space (SELECT, options: Excellent/Good/Fair/Poor)
- Greeters (SELECT, options: Excellent/Good/Fair/Poor)
- Ushers and Protocol (SELECT, options: Excellent/Good/Fair/Poor)

#### 3. NLP Report

**Code:** `NLP_REPORT`  
**Category:** SPECIAL  
**Frequency:** AD_HOC  
**Fields:**
- NLP Peak Attendance (NUMBER, required)

#### 4. Salvation Report

**Code:** `SALVATION_REPORT`  
**Category:** MINISTRY  
**Frequency:** WEEKLY  
**Fields:**
- Salvation in Cell Outreach (NUMBER, required)
- Salvation in Church (NUMBER, required)

#### 5. Small Group / Cell Report

**Code:** `SMALL_GROUP_CELL`  
**Category:** CAMPUS  
**Frequency:** WEEKLY  
**Fields:**
- Number of Cells/Small Groups (NUMBER, required)
- Number of Leaders (NUMBER, required)
- Number of Assistant Leaders (NUMBER, required)
- Attendance (NUMBER, required)

#### 6. Discipleship / Assimilation Report

**Code:** `DISCIPLESHIP_ASSIMILATION`  
**Category:** MINISTRY  
**Frequency:** MONTHLY  
**Fields:**
- Name of Courses (TEXTAREA, required)
- Number of Courses (NUMBER, required)
- Attendance (NUMBER, required)
- Number of Pastoral Leaders (NUMBER, required)

#### 7. Next Gen Report

**Code:** `NEXT_GEN`  
**Category:** MINISTRY  
**Frequency:** WEEKLY  
**Fields:**

**Section: Next Gen 1 (Kid-Zone)**
- Total Attendance (NUMBER, required)
- First Timer Attendance (NUMBER, required)
- Assimilation (NUMBER, required)

**Section: Next Gen 2 (Stir House)**
- Total Attendance (NUMBER, required)
- First Timer Attendance (NUMBER, required)
- Assimilation (NUMBER, required)

#### 8. Partnership Report

**Code:** `PARTNERSHIP`  
**Category:** MINISTRY  
**Frequency:** MONTHLY  
**Fields:**
- Number of Partners (NUMBER, required)

#### 9. HAEF Report

**Code:** `HAEF`  
**Category:** SPECIAL  
**Frequency:** QUARTERLY  
**Fields:**
- Project Reach (NUMBER, required)
- Project Impact (TEXTAREA, required)
- Supporting Documents (MULTI_FILE_UPLOAD, accepted: PDF/Images, max 10 files)

#### 10. Spiritual Report

**Code:** `SPIRITUAL`  
**Category:** MINISTRY  
**Frequency:** MONTHLY  
**Fields:**
- Number of People Baptized (NUMBER, required)

#### 11. Relationship Breakthrough Report

**Code:** `RELATIONSHIP_BREAKTHROUGH`  
**Category:** MINISTRY  
**Frequency:** MONTHLY  
**Fields:**
- Number of Marriages Conducted (NUMBER, required)
- Number of Babies Dedicated (NUMBER, required)
- Number of Testimonies Captured (NUMBER, required)
- Evidence Photos (MULTI_FILE_UPLOAD, accepted: image/*, max 20 files, optional)

**Initial Access Configuration:**
- All report types initially accessible to all leadership roles
- SUPERADMIN can configure role-specific access via Report Type Management UI
- Future phases will implement granular role-based restrictions

### 2.2 Strategic Indicator Model

```typescript
interface StrategicIndicator {
  id: string;
  name: string; // e.g., "Membership Growth", "Attendance"
  description?: string;
  category: 'MEMBERSHIP' | 'ATTENDANCE' | 'FINANCE' | 'PROGRAMS' | 'OUTREACH';
  isActive: boolean;
  displayOrder: number;
  
  keyMetrics?: KeyMetric[]; // Related metrics
  
  createdAt: Date;
  updatedAt: Date;
}
```

### 2.3 Key Metric Model

```typescript
interface KeyMetric {
  id: string;
  strategicIndicatorId: string;
  name: string; // e.g., "New Members Added", "First Timers"
  description?: string;
  dataType: 'NUMBER' | 'PERCENTAGE' | 'CURRENCY';
  unit?: string; // e.g., "people", "%", "₦"
  
  // Validation rules
  isRequired: boolean;
  minValue?: number;
  maxValue?: number;
  
  // Calculation settings
  allowNegative: boolean;
  autoCalculate: boolean; // If calculated from other metrics
  calculationFormula?: string; // JSON formula
  
  displayOrder: number;
  isActive: boolean;
  
  strategicIndicator?: StrategicIndicator;
  
  createdAt: Date;
  updatedAt: Date;
}
```

### 2.4 Report Submission Model (Updated)

```typescript
interface ReportSubmission {
  id: string;
  reportTypeId: string; // Links to ReportType (replaces templateId)
  
  // Reporting period
  reportYear: number;
  reportMonth: number; // 1-12
  reportWeek?: number; // 1-53 (for weekly reports)
  periodStartDate: Date;
  periodEndDate: Date;
  
  // Who and where
  submittedById: string; // User ID
  submitterRole: UserRole;
  
  // Organizational context (flexible hierarchy)
  organizationalLevelType: 'CELL' | 'ZONE' | 'AREA' | 'COMMUNITY' | 'DISTRICT' | 'CAMPUS' | 'GROUP';
  organizationalUnitId: string; // ID of the cell, zone, campus, etc.
  
  // Form data (dynamic based on report type)
  formData: Record<string, any>; // Stores all form field values
  
  // Workflow status
  status: ReportStatus;
  
  // Approval chain
  reviewedById?: string;
  reviewedAt?: Date;
  reviewerNotes?: string;
  
  approvedById?: string;
  approvedAt?: Date;
  approverNotes?: string;
  
  finalReviewedById?: string; // Church Ministry, SPO, CEO
  finalReviewedAt?: Date;
  finalReviewerRole?: UserRole;
  
  // Submission metadata
  submittedAt?: Date;
  lastEditedAt?: Date;
  isLocked: boolean; // Locked after approval or deadline
  
  // Related data
  reportType?: ReportType;
  metricEntries?: MetricEntry[]; // Only if report includes strategic indicators
  submittedBy?: User;
  
  createdAt: Date;
  updatedAt: Date;
}

enum ReportStatus {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  REQUIRES_EDITS = 'REQUIRES_EDITS',
  APPROVED = 'APPROVED',
  REVIEWED = 'REVIEWED', // By Group Admin, Group Pastor
  FINALIZED = 'FINALIZED', // By Church Ministry/SPO/CEO
}
```

### 2.5 Metric Entry Model

```typescript
interface MetricEntry {
  id: string;
  reportSubmissionId: string;
  keyMetricId: string;
  strategicIndicatorId: string;
  
  // The three main values (FR10)
  monthlyGoal?: number;
  monthlyAchieved?: number;
  yearOnYearGoal?: number;
  
  // Calculated fields
  performancePercentage?: number; // (achieved/goal) * 100
  variance?: number; // achieved - goal
  
  // Field locking (FR18-FR22)
  monthlyGoalLocked: boolean;
  monthlyAchievedLocked: boolean;
  yearOnYearGoalLocked: boolean;
  
  // Auto-save tracking
  lastSavedAt: Date;
  
  // Related data
  keyMetric?: KeyMetric;
  reportSubmission?: ReportSubmission;
  
  createdAt: Date;
  updatedAt: Date;
}
```

### 2.6 Report Comment Model

```typescript
interface ReportComment {
  id: string;
  reportSubmissionId: string;
  userId: string;
  userRole: UserRole;
  
  commentType: 'FEEDBACK' | 'REQUEST_EDIT' | 'APPROVAL_NOTE' | 'CLARIFICATION';
  content: string;
  
  // Optional reference to specific metric
  metricEntryId?: string;
  
  isInternal: boolean; // Only visible to reviewers
  
  user?: User;
  reportSubmission?: ReportSubmission;
  
  createdAt: Date;
  updatedAt: Date;
}
```

### 2.7 Referral Link Model (FR47-FR58)

```typescript
interface ReferralLink {
  id: string;
  code: string; // Unique alphanumeric code
  
  // Who created this link
  createdById: string;
  createdByRole: UserRole;
  
  // What role does this link assign
  assignedRole: UserRole;
  
  // Organizational assignment (flexible for any hierarchy level)
  organizationalLevelType?: 'CELL' | 'ZONE' | 'AREA' | 'COMMUNITY' | 'DISTRICT' | 'CAMPUS' | 'GROUP';
  organizationalUnitId?: string; // ID of the specific unit
  
  // Usage tracking
  isUsed: boolean;
  usedById?: string;
  usedAt?: Date;
  
  // Validity
  expiresAt?: Date;
  isActive: boolean;
  
  // Related data
  createdBy?: User;
  usedBy?: User;
  
  createdAt: Date;
  updatedAt: Date;
}
```

### 2.8 Report Notification Model

```typescript
interface ReportNotification {
  id: string;
  userId: string;
  reportSubmissionId: string;
  
  notificationType: 'REPORT_SUBMITTED' | 'EDITS_REQUESTED' | 'REPORT_APPROVED' | 'AVAILABLE_FOR_REVIEW' | 'DEADLINE_APPROACHING';
  
  title: string;
  message: string;
  
  isRead: boolean;
  readAt?: Date;
  
  // Email notification
  emailSent: boolean;
  emailSentAt?: Date;
  
  user?: User;
  reportSubmission?: ReportSubmission;
  
  createdAt: Date;
}
```

---

## 3. Database Schema (Prisma)

### 3.1 Schema Extensions

```prisma
// Extended User model
model User {
  // ... existing fields ...
  
  // Hierarchical role assignment
  hierarchicalRole     String? // CELL_LEADER, ZONE_LEADER, etc.
  organizationalLevel  String? // CELL, ZONE, AREA, COMMUNITY, DISTRICT, CAMPUS, GROUP
  organizationalUnitId String? // ID of their assigned unit
  
  // Reporting roles
  reportingRoles       String[] // Can have multiple: ["CAMPUS_PASTOR", "GROUP_ADMIN"]
  
  // New reporting relationships
  reportsSubmitted      ReportSubmission[] @relation("Submitter")
  reportsReviewed       ReportSubmission[] @relation("Reviewer")
  reportsApproved       ReportSubmission[] @relation("Approver")
  reportsFinalReviewed  ReportSubmission[] @relation("FinalReviewer")
  
  reportComments        ReportComment[]
  reportNotifications   ReportNotification[]
  
  referralLinksCreated  ReferralLink[] @relation("Creator")
  referralLinkUsed      ReferralLink? @relation("User")
}

// New models
model ReportType {
  id                    String   @id @default(cuid())
  name                  String
  description           String?
  code                  String   @unique // e.g., "CAMPUS_WEEKLY"
  category              String   // CAMPUS, GROUP, MINISTRY, SPECIAL
  formDefinition        Json     // Stores FormDefinition as JSON
  allowedSubmitterRoles String[] // Array of UserRole enums
  allowedReviewerRoles  String[]
  frequency             String   // WEEKLY, MONTHLY, QUARTERLY, YEARLY, AD_HOC
  organizationalLevel   String?  // CELL, ZONE, AREA, etc.
  isActive              Boolean  @default(true)
  
  submissions           ReportSubmission[]
  
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt
  
  @@index([code, isActive])
  @@index([category, organizationalLevel])
}
model StrategicIndicator {
  id                String   @id @default(cuid())
  name              String
  description       String?
  category          String   // MEMBERSHIP, ATTENDANCE, FINANCE, PROGRAMS, OUTREACH
  isActive          Boolean  @default(true)
  displayOrder      Int      @default(0)
  applicableRoles   String[] // Array of UserRole enums
  campusLevel       Boolean  @default(true)
  groupLevel        Boolean  @default(false)
  
  keyMetrics        KeyMetric[]
  metricEntries     MetricEntry[]
  
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  
  @@index([category, isActive])
}

model KeyMetric {
  id                    String   @id @default(cuid())
  strategicIndicatorId  String
  name                  String
  description           String?
  dataType              String   @default("NUMBER") // NUMBER, PERCENTAGE, CURRENCY
  unit                  String?
  isRequired            Boolean  @default(false)
  minValue              Float?
  maxValue              Float?
  allowNegative         Boolean  @default(false)
  autoCalculate         Boolean  @default(false)
  calculationFormula    String?  @db.Text
  displayOrder          Int      @default(0)
  isActive              Boolean  @default(true)
  
  strategicIndicator    StrategicIndicator @relation(fields: [strategicIndicatorId], references: [id], onDelete: Cascade)
  metricEntries         MetricEntry[]
  
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt
  
  @@index([strategicIndicatorId, isActive])
}

model ReportTemplate {
  id                    String   @id @default(cuid())
  name                  String
  description           String?
  frequency             String   // WEEKLY, MONTHLY, QUARTERLY, YEARLY
  submitterRole         String
  reviewerRole          String
  approverRole          String
  strategicIndicatorIds String[] // Array of indicator IDs
  submissionDay         Int?
  submissionDeadlineHour Int     @default(23)
  autoApprovalDays      Int?
  isActive              Boolean  @default(true)
  
  submissions           ReportSubmission[]
  
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt
  
  @@index([submitterRole, isActive])
}

model ReportSubmission {
  id                      String   @id @default(cuid())
  reportTypeId            String
  reportYear              Int
  reportMonth             Int
  reportWeek              Int?
  periodStartDate         DateTime
  periodEndDate           DateTime
  
  submittedById           String
  submitterRole           String
  
  // Flexible organizational assignment (supports any level: CELL, ZONE, AREA, etc.)
  organizationalLevelType String   // CELL, ZONE, AREA, COMMUNITY, DISTRICT, CAMPUS, GROUP
  organizationalUnitId    String   // ID of the specific unit
  
  // Dynamic form data stores all field values from FormDefinition
  formData                Json     // { fieldName: value, ... }
  
  status                  String   @default("DRAFT") // DRAFT, SUBMITTED, REQUIRES_EDITS, APPROVED, REVIEWED, FINALIZED
  
  reviewedById            String?
  reviewedAt              DateTime?
  reviewerNotes           String?  @db.Text
  
  approvedById            String?
  approvedAt              DateTime?
  approverNotes           String?  @db.Text
  
  finalReviewedById       String?
  finalReviewedAt         DateTime?
  finalReviewerRole       String?
  
  submittedAt             DateTime?
  lastEditedAt            DateTime?
  isLocked                Boolean  @default(false)
  
  reportType              ReportType @relation(fields: [reportTypeId], references: [id])
  submittedBy             User     @relation("Submitter", fields: [submittedById], references: [id])
  reviewedBy              User?    @relation("Reviewer", fields: [reviewedById], references: [id])
  approvedBy              User?    @relation("Approver", fields: [approvedById], references: [id])
  finalReviewedBy         User?    @relation("FinalReviewer", fields: [finalReviewedById], references: [id])
  
  metricEntries           MetricEntry[]
  comments                ReportComment[]
  notifications           ReportNotification[]
  
  createdAt               DateTime @default(now())
  updatedAt               DateTime @updatedAt
  
  @@unique([reportTypeId, organizationalUnitId, reportYear, reportWeek])
  @@index([status, submittedById])
  @@index([organizationalLevelType, organizationalUnitId])
  @@index([reportYear, reportMonth])
}

model MetricEntry {
  id                      String   @id @default(cuid())
  reportSubmissionId      String
  keyMetricId             String
  strategicIndicatorId    String
  
  monthlyGoal             Float?
  monthlyAchieved         Float?
  yearOnYearGoal          Float?
  performancePercentage   Float?
  variance                Float?
  
  monthlyGoalLocked       Boolean  @default(false)
  monthlyAchievedLocked   Boolean  @default(false)
  yearOnYearGoalLocked    Boolean  @default(false)
  
  lastSavedAt             DateTime @default(now())
  
  keyMetric               KeyMetric @relation(fields: [keyMetricId], references: [id])
  strategicIndicator      StrategicIndicator @relation(fields: [strategicIndicatorId], references: [id])
  reportSubmission        ReportSubmission @relation(fields: [reportSubmissionId], references: [id], onDelete: Cascade)
  
  createdAt               DateTime @default(now())
  updatedAt               DateTime @updatedAt
  
  @@unique([reportSubmissionId, keyMetricId])
  @@index([reportSubmissionId])
}

model ReportComment {
  id                  String   @id @default(cuid())
  reportSubmissionId  String
  userId              String
  userRole            String
  commentType         String   // FEEDBACK, REQUEST_EDIT, APPROVAL_NOTE, CLARIFICATION
  content             String   @db.Text
  metricEntryId       String?
  isInternal          Boolean  @default(false)
  
  user                User     @relation(fields: [userId], references: [id])
  reportSubmission    ReportSubmission @relation(fields: [reportSubmissionId], references: [id], onDelete: Cascade)
  
  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt
  
  @@index([reportSubmissionId, createdAt])
}

model ReferralLink {
  id                      String   @id @default(cuid())
  code                    String   @unique
  createdById             String
  createdByRole           String
  assignedRole            String
  
  // Flexible organizational assignment (supports any level)
  organizationalLevelType String?  // CELL, ZONE, AREA, COMMUNITY, DISTRICT, CAMPUS, GROUP
  organizationalUnitId    String?  // ID of the specific unit
  
  isUsed                  Boolean  @default(false)
  usedById                String?  @unique
  usedAt                  DateTime?
  expiresAt               DateTime?
  isActive                Boolean  @default(true)
  
  createdBy               User     @relation("Creator", fields: [createdById], references: [id])
  usedBy                  User?    @relation("User", fields: [usedById], references: [id])
  
  createdAt               DateTime @default(now())
  updatedAt               DateTime @updatedAt
  
  @@index([code, isUsed])
  @@index([createdById])
  @@index([organizationalLevelType, organizationalUnitId])
}

model ReportNotification {
  id                  String   @id @default(cuid())
  userId              String
  reportSubmissionId  String
  notificationType    String   // REPORT_SUBMITTED, EDITS_REQUESTED, REPORT_APPROVED, AVAILABLE_FOR_REVIEW, DEADLINE_APPROACHING
  title               String
  message             String   @db.Text
  isRead              Boolean  @default(false)
  readAt              DateTime?
  emailSent           Boolean  @default(false)
  emailSentAt         DateTime?
  
  user                User     @relation(fields: [userId], references: [id])
  reportSubmission    ReportSubmission @relation(fields: [reportSubmissionId], references: [id], onDelete: Cascade)
  
  createdAt           DateTime @default(now())
  
  @@index([userId, isRead, createdAt])
}

// Add relations to existing models
// Note: With flexible organizationalLevelType/UnitId pattern,
// we no longer need explicit relations to Zone, Campus, etc.
// The reporting system is now level-agnostic for future scalability
```

---

## 4. API Endpoints Design

### 4.0 Intelligent Consolidated Routes (New Pattern)

**Principle:** Use single intelligent routes that handle all organizational levels dynamically, reducing code duplication and maintenance overhead.

```
# Organizational Unit Management (replaces separate routes for cell/zone/area/etc.)
GET    /api/organizational-units/:levelType/:unitId        (Get unit details)
PUT    /api/organizational-units/:levelType/:unitId        (Update unit)
GET    /api/organizational-units/:levelType/:unitId/members (Get members)
GET    /api/organizational-units/:levelType/:unitId/meetings (Get meetings)
GET    /api/organizational-units/:levelType/:unitId/reports  (Get reports)
GET    /api/organizational-units/:levelType/:unitId/analytics (Get analytics)

# Examples:
# GET /api/organizational-units/CAMPUS/campus-vi
# GET /api/organizational-units/ZONE/zone-lagos
# GET /api/organizational-units/CELL/cell-surulere-01

# Leader Dashboard Data (single endpoint for all levels)
GET    /api/leader/dashboard                              (Returns level-appropriate data based on auth user)

# Parameters:
# - Automatically detects user's organizationalLevel and organizationalUnitId
# - Returns tailored dashboard data for that specific level
# - Works for CELL_LEADER, ZONE_LEADER, AREA_LEADER, etc.
```

### 4.1 Report Types API (New - For Dynamic Forms)

```
GET    /api/report-types                      (List available report types for user role)
GET    /api/report-types/:id                  (Get report type with form definition)
GET    /api/report-types/code/:code           (Get report type by code)
POST   /api/report-types                      (Create - SUPERADMIN, CEO, SPO only)
PUT    /api/report-types/:id                  (Update - SUPERADMIN, CEO, SPO only)
PUT    /api/report-types/:id/access           (Update role access - SUPERADMIN only)
DELETE /api/report-types/:id                  (Deactivate - SUPERADMIN, CEO, SPO only)

GET    /api/report-types/:id/preview          (Preview form structure)
POST   /api/report-types/:id/validate         (Validate form data before submit)
```

### 4.2 Strategic Indicators API

```
GET    /api/strategic-indicators              (List all active indicators)
GET    /api/strategic-indicators/:id          (Get indicator details)
POST   /api/strategic-indicators              (Create - SUPERADMIN only)
PUT    /api/strategic-indicators/:id          (Update - SUPERADMIN only)
DELETE /api/strategic-indicators/:id          (Soft delete - SUPERADMIN only)
```

### 4.2 Key Metrics API

```
GET    /api/key-metrics                       (List all metrics)
GET    /api/key-metrics/:id                   (Get metric details)
GET    /api/strategic-indicators/:id/metrics  (Get metrics for indicator)
POST   /api/key-metrics                       (Create - SUPERADMIN only)
PUT    /api/key-metrics/:id                   (Update - SUPERADMIN only)
DELETE /api/key-metrics/:id                   (Soft delete - SUPERADMIN only)
```

### 4.3 Report Templates API

```
GET    /api/report-templates                  (List templates for user role)
GET    /api/report-templates/:id              (Get template details)
POST   /api/report-templates                  (Create - SUPERADMIN only)
PUT    /api/report-templates/:id              (Update - SUPERADMIN only)
DELETE /api/report-templates/:id              (Delete - SUPERADMIN only)
```

### 4.4 Report Submissions API

```
GET    /api/reports                           (List reports - role-filtered)
GET    /api/reports/:id                       (Get report details)
POST   /api/reports                           (Create draft report)
PUT    /api/reports/:id                       (Update draft/editable report)
DELETE /api/reports/:id                       (Delete draft report)

POST   /api/reports/:id/submit                (Submit report - status → SUBMITTED)
POST   /api/reports/:id/request-edits         (Request edits - status → REQUIRES_EDITS)
POST   /api/reports/:id/approve               (Approve report - status → APPROVED)
POST   /api/reports/:id/review                (Mark as reviewed - status → REVIEWED)

GET    /api/reports/:id/history               (Get report audit trail)
POST   /api/reports/:id/auto-save             (Auto-save metric entries)
```

### 4.5 Metric Entries API

```
GET    /api/reports/:reportId/metrics         (Get all metric entries for report)
POST   /api/reports/:reportId/metrics         (Bulk create/update metric entries)
PUT    /api/metric-entries/:id                (Update single metric entry)
POST   /api/metric-entries/:id/lock           (Lock specific field)
```

### 4.6 Report Comments API

```
GET    /api/reports/:reportId/comments        (Get comments for report)
POST   /api/reports/:reportId/comments        (Add comment/feedback)
PUT    /api/comments/:id                      (Edit own comment)
DELETE /api/comments/:id                      (Delete own comment)
```

### 4.7 Referral Links API

```
GET    /api/referral-links                    (List user's created links)
POST   /api/referral-links                    (Generate new referral link)
GET    /api/referral-links/:code/validate     (Validate link during registration)
POST   /api/referral-links/:code/use          (Use link during registration)
DELETE /api/referral-links/:id                (Deactivate link)
```

### 4.8 Report Notifications API

```
GET    /api/report-notifications              (Get user's notifications)
PUT    /api/report-notifications/:id/read     (Mark as read)
PUT    /api/report-notifications/read-all     (Mark all as read)
DELETE /api/report-notifications/:id          (Delete notification)
```

### 4.9 Report Analytics API

```
GET    /api/analytics/reports/overview        (Church-wide report metrics)
GET    /api/analytics/reports/organizational-unit/:levelType/:unitId (Unit-level analytics)
GET    /api/analytics/reports/performance     (Performance trends)
GET    /api/analytics/reports/compliance      (Submission compliance rates)
```

### 4.10 File Upload API (New - For Report Media)

```
POST   /api/upload/report-attachment          (Upload single file)
POST   /api/upload/report-attachments         (Upload multiple files)
DELETE /api/upload/:publicId                  (Delete uploaded file from Cloudinary)
GET    /api/upload/:reportId/files            (Get all files for a report)

# File upload flow:
# 1. Client selects files
# 2. Validates file type and size
# 3. Converts to base64
# 4. POST to /api/upload/report-attachment
# 5. Server uploads to Cloudinary
# 6. Returns Cloudinary URL
# 7. Client stores URL in form data
```

---

## 4.11 Code Quality & Architecture Standards

### 4.11.1 Modular Component Design

**Principles:**
- **Single Responsibility**: Each component does one thing well
- **Composability**: Small components combine to build complex UIs
- **Reusability**: Components work across different contexts
- **Testability**: Easy to unit test in isolation

**Component Architecture:**

```typescript
// ❌ Bad: Monolithic component
function ReportForm() {
  // 500 lines of code handling everything
}

// ✅ Good: Modular composition
function ReportForm({ reportType }) {
  return (
    <Form>
      <FormHeader reportType={reportType} />
      <DynamicFormRenderer formDefinition={reportType.formDefinition} />
      <FormActions onSave={handleSave} onSubmit={handleSubmit} />
    </Form>
  );
}

// Each subcomponent is reusable:
// - FormHeader: Used in report preview, email templates
// - DynamicFormRenderer: Core component, reused everywhere
// - FormActions: Reused in all form contexts
```

**Shared Components Library:**

```
components/
  ui/                          # Base UI components
    Button.tsx
    Input.tsx
    Card.tsx
    Table.tsx
    FileUpload.tsx           # NEW: Reusable file upload
    
  features/
    reports/
      DynamicFormRenderer.tsx  # Core dynamic form engine
      FormBuilder.tsx          # Report type builder
      ReportCard.tsx           # Report display card
      ReportStatusBadge.tsx    # Status indicator
      FileUploadField.tsx      # Report file upload field
      
    organizational/
      UniversalLeaderDashboard.tsx  # Works for ALL levels
      UnitAnalytics.tsx             # Level-agnostic analytics
      UnitMembersList.tsx           # Reusable member list
```

### 4.11.2 Production-Ready Code Standards

**TypeScript:**
- No `any` types (use `unknown` with type guards)
- Strict null checks enabled
- Proper interface definitions for all data structures
- Exhaustive switch statements for enums

**Error Handling:**
```typescript
// ✅ Proper error handling
try {
  const report = await submitReport(data);
  showSuccessToast('Report submitted successfully');
  router.push(`/reports/${report.id}`);
} catch (error) {
  if (error instanceof ValidationError) {
    showErrorToast(error.message);
    highlightInvalidFields(error.fields);
  } else if (error instanceof NetworkError) {
    showErrorToast('Network error. Your draft has been saved.');
    await saveLocalDraft(data);
  } else {
    logger.error('Unexpected error during report submission', { error, userId, reportId });
    showErrorToast('An unexpected error occurred. Please try again.');
  }
}
```

**Performance:**
- Memoize expensive computations with `useMemo`
- Optimize re-renders with `React.memo`
- Lazy load heavy components
- Implement virtual scrolling for long lists
- Code split by route

**Accessibility:**
- WCAG 2.1 AA compliance
- Proper ARIA labels
- Keyboard navigation support
- Focus management
- Screen reader tested

### 4.11.3 Mock Data Requirements

**Comprehensive Coverage:**

Mock data must include:

1. **All 11 Report Types** with realistic data:
   - GROUP_SPECIAL_PROGRAM
   - ATTENDANCE_QUALITY
   - NLP_REPORT
   - SALVATION_REPORT
   - SMALL_GROUP_CELL
   - DISCIPLESHIP_ASSIMILATION
   - NEXT_GEN
   - PARTNERSHIP
   - HAEF
   - SPIRITUAL
   - RELATIONSHIP_BREAKTHROUGH

2. **Multiple Report Submissions** for each type:
   - At least 50 submissions per report type
   - Varied statuses: DRAFT, SUBMITTED, REQUIRES_EDITS, APPROVED, REVIEWED, FINALIZED
   - Different time periods: Current week, last 12 weeks, last 12 months
   - Different organizational units: Multiple cells, zones, areas, campuses

3. **All Organizational Levels** represented:
   - 5 Groups
   - 15 Campuses per group
   - 8 Districts per campus
   - 5 Communities per district
   - 4 Areas per community
   - 6 Zones per area
   - 10 Cells per zone

4. **Diverse User Profiles**:
   - 500+ mock users
   - Representatives from each organizational level
   - Multiple roles per user where applicable
   - Realistic Nigerian, UK, and US names and locations

5. **Rich Interaction Data**:
   - Comments on reports
   - Audit trails
   - Notifications
   - File attachments (mock Cloudinary URLs)

**Mock Data Structure:**

```typescript
// lib/data/mockData.ts
export const mockReportTypes: ReportType[] = [
  {
    id: 'rt-001',
    name: 'Group Report - Special Program',
    code: 'GROUP_SPECIAL_PROGRAM',
    category: 'GROUP',
    formDefinition: {
      sections: [
        {
          id: 'sec-001',
          title: 'Church Planting Program',
          fields: [
            {
              id: 'field-001',
              name: 'churchPlantings',
              label: 'Number of Church Plantings',
              type: 'NUMBER',
              isRequired: true,
              minValue: 0,
              displayOrder: 1
            },
            // ... all other fields
          ]
        },
        // ... all other sections
      ]
    },
    allowedSubmitterRoles: ['GROUP_LEADER', 'CAMPUS_LEADER', 'SUPERADMIN'],
    allowedReviewerRoles: ['CAMPUS_PASTOR', 'GROUP_ADMIN', 'SPO', 'SUPERADMIN'],
    frequency: 'AD_HOC',
    isActive: true,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01')
  },
  // ... all 11 report types
];

export const mockReportSubmissions: ReportSubmission[] = [
  // 50+ submissions for each report type
  {
    id: 'rs-001',
    reportTypeId: 'rt-001',
    reportYear: 2026,
    reportMonth: 2,
    reportWeek: 7,
    periodStartDate: new Date('2026-02-10'),
    periodEndDate: new Date('2026-02-16'),
    submittedById: 'user-123',
    submitterRole: 'CAMPUS_LEADER',
    organizationalLevelType: 'CAMPUS',
    organizationalUnitId: 'campus-vi',
    formData: {
      churchPlantings: 3,
      churchPlanters: 12,
      churchPlantersSmallGroup: 8,
      reach: 5000,
      distribution: 3500,
      // ... all field data
    },
    status: 'SUBMITTED',
    submittedAt: new Date('2026-02-17T10:30:00'),
    createdAt: new Date('2026-02-15'),
    updatedAt: new Date('2026-02-17T10:30:00')
  },
  // ... 550+ total submissions
];
```



### 5.1 Navigation Structure

#### Existing Navigation (Small Groups)
Remains unchanged for all users:
- Dashboard
- My Group/Unit (varies by hierarchical level)
- Meetings
- Members
- Analytics
- etc.

#### New Navigation Section (Reporting)
Add new menu section based on user's reporting role(s):

**For Campus Leaders (Any Level: Cell, Zone, Area, Community, District, Campus):**
```
📊 Reports
  └─ Submit Reports
  └─ My Submissions
  └─ Unit Reports
```

**For Campus Pastor:**
```
📊 Reports
  └─ Pending Reviews
  └─ Approved Reports
  └─ Campus Overview
  └─ Generate Referral Links
```

**For Group Admin:**
```
📊 Reports
  └─ Campus Reports (Consolidated)
  └─ Submit Group Report
  └─ Group Overview
  └─ Generate Referral Links
```

**For Church Ministry:**
```
📊 Reports
  └─ All Submissions (Central Repository)
  └─ Compliance Tracking
  └─ Report Archive
  └─ Audit Logs
```

**For SPO / CEO (SUPERADMIN):**
```
📊 Reports
  └─ All Submissions
  └─ Analytics Dashboard
  └─ Report Types Management
  └─ Strategic Indicators
  └─ Compliance Tracking
  └─ Generate Referral Links (All Levels)
```

### 5.2 Dynamic Form Components (New Architecture)

#### DynamicFormRenderer Component
**Purpose:** Render report forms dynamically based on ReportType's FormDefinition

**Props:**
```typescript
interface DynamicFormRendererProps {
  reportType: ReportType;
  initialData?: Record<string, any>;
  mode: 'create' | 'edit' | 'view';
  onSave: (formData: Record<string, any>) => Promise<void>;
  onSubmit: (formData: Record<string, any>) => Promise<void>;
  autoSaveInterval?: number; // Default: 30000ms
}
```

**Features:**
- Renders form fields based on FormDefinition schema
- Supports 7 field types: TEXT, NUMBER, DATE, SELECT, TEXTAREA, CHECKBOX, STRATEGIC_INDICATOR
- Automatic validation based on ValidationRule
- Field locking based on configuration
- Auto-save for draft reports
- Performance calculation for STRATEGIC_INDICATOR fields
- Accessibility-compliant (WCAG 2.1 AA)

**Example Usage:**
```tsx
<DynamicFormRenderer
  reportType={campusWeeklyReportType}
  mode="edit"
  initialData={existingReportData}
  onSave={handleAutoSave}
  onSubmit={handleSubmitReport}
  autoSaveInterval={30000}
/>
```

#### FormBuilder Component (SUPERADMIN only)
**Purpose:** Visual editor for creating/editing ReportType form definitions

**Features:**
- Drag-and-drop field arrangement
- Field type selector
- Validation rule configurator
- Section grouping
- Field locking configuration
- Preview mode
- JSON export/import

**Page:** `/superadmin/report-types/:id/builder`

**Layout:**
```
┌─────────────────────────────────────────────────────────┐
│ Report Type Builder: Campus Weekly Report               │
├───────────────┬─────────────────────────────────────────┤
│ FIELD PALETTE │ FORM PREVIEW                            │
│               │                                         │
│ [➕ Text]     │ Section: Membership Metrics             │
│ [➕ Number]   │ ┌─────────────────────────────────────┐ │
│ [➕ Date]     │ │ New Members (Number)                │ │
│ [➕ Select]   │ │ Required | Min: 0 | Locked: No      │ │
│ [➕ Textarea] │ ├─────────────────────────────────────┤ │
│ [➕ Checkbox] │ │ First Timers (Number)               │ │
│ [➕ Indicator]│ │ Required | Min: 0                   │ │
│               │ └─────────────────────────────────────┘ │
│ [➕ Section]  │                                         │
│               │ Section: Attendance Metrics             │
│ [💾 Save]     │ ┌─────────────────────────────────────┐ │
│ [👁️ Preview]  │ │ Sunday Service (Number)             │ │
│ [📤 Export]   │ └─────────────────────────────────────┘ │
└───────────────┴─────────────────────────────────────────┘
```

### 5.3 Report Submission Form (Using DynamicFormRenderer)

**Page:** `/reports/submit`

**Layout:**
```
┌─────────────────────────────────────────────────────────┐
│ Weekly Report Submission                                │
│ Week 7, 2026 (Feb 10 - Feb 16)              [Auto-save]│
├─────────────────────────────────────────────────────────┤
│                                                         │
│ Strategic Indicator: Membership Growth                  │
│ ┌─────────────────────────────────────────────────────┐│
│ │ Key Metric: New Members Added                       ││
│ │                                                      ││
│ │ Monthly Goal:        [___50___] 🔒                  ││
│ │ Monthly Achieved:    [___42___]                     ││
│ │ Year-on-Year Goal:   [__600___] 🔒                  ││
│ │                                                      ││
│ │ Performance: 84% (42/50) ⚠️ -8                      ││
│ └─────────────────────────────────────────────────────┘│
│                                                         │
│ ┌─────────────────────────────────────────────────────┐│
│ │ Key Metric: First Timers                            ││
│ │                                                      ││
│ │ Monthly Goal:        [___30___] 🔒                  ││
│ │ Monthly Achieved:    [___35___]                     ││
│ │ Year-on-Year Goal:   [__360___] 🔒                  ││
│ │                                                      ││
│ │ Performance: 117% (35/30) ✅ +5                     ││
│ └─────────────────────────────────────────────────────┘│
│                                                         │
│ Strategic Indicator: Attendance                         │
│ ... (more metrics)                                      │
│                                                         │
│ [Save Draft]  [Submit for Review]                      │
└─────────────────────────────────────────────────────────┘
```

**Features:**
- Real-time auto-save every 30 seconds
- Lock icons (🔒) for locked fields
- Performance indicators (✅ exceeding, ⚠️ below target)
- Visual feedback for validation errors
- Progress bar showing completion percentage
- Tooltip help text for each metric

### 5.3 Report Review Page (Campus Pastor)

**Page:** `/reports/review/:id`

**Layout:**
```
┌─────────────────────────────────────────────────────────┐
│ ← Back to Reviews                                       │
│                                                         │
│ Weekly Report - Information Technology Department       │
│ Week 7, 2026 │ Submitted by: John Doe │ Feb 17, 10:30 AM│
│ Status: 🟡 SUBMITTED                                    │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ [Summary] [Detailed Metrics] [Comments] [History]       │
│                                                         │
│ ┌─────────────────────────────────────────────────────┐│
│ │ MEMBERSHIP GROWTH                        Overall: 92%││
│ │ • New Members: 42/50 (84%) ⚠️                       ││
│ │ • First Timers: 35/30 (117%) ✅                     ││
│ │ • Retention Rate: 95/100 (95%) ✅                   ││
│ ├─────────────────────────────────────────────────────┤│
│ │ ATTENDANCE                               Overall: 88%││
│ │ • Sunday Service: 450/500 (90%)                     ││
│ │ • Midweek Service: 200/250 (80%)                    ││
│ └─────────────────────────────────────────────────────┘│
│                                                         │
│ Reviewer Notes:                                         │
│ ┌─────────────────────────────────────────────────────┐│
│ │ [Add your feedback here...]                         ││
│ │                                                      ││
│ │                                                      ││
│ └─────────────────────────────────────────────────────┘│
│                                                         │
│ [Request Edits]  [Approve Report]                      │
└─────────────────────────────────────────────────────────┘
```

**Features:**
- Side-by-side comparison with previous weeks
- Highlight significant variances (>20% change)
- Comment threading for clarifications
- Ability to @ mention submitter
- Export to PDF
- Timeline view of submission history

### 5.4 Analytics Dashboard (Church Ministry/SPO/CEO)

**Page:** `/reports/analytics`

**Layout:**
```
┌─────────────────────────────────────────────────────────┐
│ Church-Wide Reporting Dashboard                         │
│ [This Week] [This Month] [Q1 2026] [Custom Range]       │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ Submission Compliance                                   │
│ ┌────────────┬────────────┬────────────┬────────────┐  │
│ │ On Time    │ Late       │ Pending    │ Missing    │  │
│ │    85%     │    10%     │     3%     │     2%     │  │
│ │  (34/40)   │   (4/40)   │   (1/40)   │   (1/40)   │  │
│ └────────────┴────────────┴────────────┴────────────┘  │
│                                                         │
│ Performance by Zone                                     │
│ ┌─────────────────────────────────────────────────────┐│
│ │ [Bar Chart: Zones vs. Average Performance %]        ││
│ │                                                      ││
│ │ Lagos Zone       ████████████████░░ 88%             ││
│ │ Abuja Zone       ██████████████████ 95%             ││
│ │ PH Zone          ████████████░░░░░░ 76%             ││
│ │ UK Zone          ██████████████░░░░ 82%             ││
│ │ US Zone          ████████████████░░ 90%             ││
│ └─────────────────────────────────────────────────────┘│
│                                                         │
│ Top Performing Campuses   │   Areas Needing Support    │
│ ┌─────────────────────────┼───────────────────────────┐│
│ │ 1. VI Campus (98%)      │ 1. Ikeja Campus (65%)     ││
│ │ 2. Kubwa Campus (96%)   │ 2. Lekki Campus (68%)     ││
│ │ 3. NYC Campus (94%)     │ 3. Atlanta Campus (70%)   ││
│ └─────────────────────────┴───────────────────────────┘│
│                                                         │
│ [View Detailed Reports] [Export Summary] [Download CSV] │
└─────────────────────────────────────────────────────────┘
```

**Features:**
- Interactive charts (Recharts library)
- Drill-down capability (Zone → Campus → Department)
- Real-time status updates
- Customizable date ranges
- Export to Excel/PDF
- Scheduled email reports

### 5.5 Referral Link Generator

**Page:** `/settings/referral-links`

**Layout:**
```
┌─────────────────────────────────────────────────────────┐
│ Invite Users via Referral Links                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ Create New Referral Link:                              │
│ ┌─────────────────────────────────────────────────────┐│
│ │ Role to Assign:      [Campus Admin ▼]              ││
│ │ Campus:              [VI Campus ▼]                  ││
│ │ Department:          [IT Department ▼]              ││
│ │ Expiration (days):   [30] (Optional)                ││
│ │                                                      ││
│ │ [Generate Link]                                     ││
│ └─────────────────────────────────────────────────────┘│
│                                                         │
│ Active Links:                                           │
│ ┌─────────────────────────────────────────────────────┐│
│ │ Role        │ Context      │ Status  │ Actions      ││
│ ├─────────────┼──────────────┼─────────┼──────────────┤│
│ │ Campus Admin│ VI - IT Dept │ Unused  │ [Copy][Del] ││
│ │ HOD         │ Lekki Campus │ ✓ Used  │ [View]      ││
│ │ Group Leader│ Abuja Zone   │ Expired │ [Archive]   ││
│ └─────────────────────────────────────────────────────┘│
│                                                         │
│ Registration Link Preview:                              │
│ https://crm.harvesters.org/register?ref=ABC123DEF456    │
│ [Copy to Clipboard]                                     │
└─────────────────────────────────────────────────────────┘
```

---

## 6. Implementation Phases

### Phase 1: Foundation & Data Models (Week 1-2)

**Tasks:**
- [ ] Update UserRole enum with dynamic hierarchical roles (CELL_LEADER, ZONE_LEADER, etc.)
- [ ] Add reporting roles (SPO, CHURCH_MINISTRY, GROUP_ADMIN, CAMPUS_PASTOR)
- [ ] Create Report Type & Form Definition models in Prisma
- [ ] Create Strategic Indicator & Key Metric models
- [ ] Create Report Submission model with flexible organizationalLevelType/UnitId
- [ ] Create Referral Link model with flexible organizational assignment
- [ ] Run migrations to create database tables
- [ ] **Seed all 11 Harvesters report types with complete form definitions**
- [ ] **Create comprehensive mock data (500+ users, 550+ report submissions)**
- [ ] **Generate mock organizational hierarchy (5 groups, 75 campuses, 600+ districts, etc.)**
- [ ] Seed strategic indicators and key metrics
- [ ] Update type definitions in `lib/types.ts`
- [ ] Create constants for report statuses, frequencies, field types (including FILE_UPLOAD)

**Report Types to Seed:**
1. GROUP_SPECIAL_PROGRAM
2. ATTENDANCE_QUALITY
3. NLP_REPORT
4. SALVATION_REPORT
5. SMALL_GROUP_CELL
6. DISCIPLESHIP_ASSIMILATION
7. NEXT_GEN
8. PARTNERSHIP
9. HAEF
10. SPIRITUAL
11. RELATIONSHIP_BREAKTHROUGH

**Deliverables:**
- Database schema fully implemented with flexible hierarchy support
- All 11 report types seeded with realistic field definitions
- Rich mock data covering all organizational levels
- TypeScript interfaces for FormDefinition, FormField, ValidationRule
- Production-ready seed data for testing

### Phase 2: Core API Development (Week 3-4)

**Tasks:**
- [ ] **Implement intelligent consolidated routing (/api/organizational-units/:levelType/:unitId)**
- [ ] **Refactor existing level-specific API routes to use consolidated pattern**
- [ ] Implement Report Types CRUD API
- [ ] **Implement role access configuration endpoint for report types**
- [ ] Implement FormDefinition validation endpoint
- [ ] Implement Strategic Indicators CRUD API
- [ ] Implement Key Metrics CRUD API
- [ ] Implement Report Submissions API with flexible organizationalUnitId
- [ ] Implement Metric Entries API with auto-save
- [ ] **Implement file upload API (Cloudinary integration)**
- [ ] **Implement multi-file upload endpoint**
- [ ] Implement field locking logic (FR18-FR22)
- [ ] Create dynamic form validation middleware
- [ ] Implement role-based access control for report types
- [ ] Create referral link generation API

**Deliverables:**
- Intelligent consolidated API routes working for all levels
- Complete API endpoints for reporting system
- File upload to Cloudinary functional
- Dynamic form validation working
- Role-based report type filtering
- Automated tests for critical workflows
- API documentation

### Phase 3: Report Type Management UI (Week 5-6)

**Tasks:**
- [ ] Create Report Types list page (SUPERADMIN)
- [ ] Create FormBuilder component with drag-and-drop
- [ ] Implement field type selector (9 types: TEXT, NUMBER, DATE, SELECT, TEXTAREA, CHECKBOX, STRATEGIC_INDICATOR, FILE_UPLOAD, MULTI_FILE_UPLOAD)
- [ ] **Implement file upload field configuration (file types, size limits, max files)**
- [ ] Implement validation rule configurator
- [ ] Create section grouping UI
- [ ] Add field locking configuration
- [ ] Implement form definition preview mode
- [ ] Add JSON export/import for form templates
- [ ] Create report type activation/deactivation controls
- [ ] **Build role access configuration UI (who can submit/review each report type)**

**Deliverables:**
- Functional FormBuilder component with all field types
- Report type management interface
- Role access configuration working
- Ability to create new report types without code changes

### Phase 4: Dynamic Form Rendering (Week 7-8)

**Tasks:**
- [ ] Create DynamicFormRenderer component (modular, reusable)
- [ ] Implement field rendering for all 9 field types
- [ ] **Create FileUploadField component (single file)**
- [ ] **Create MultiFileUploadField component (multiple files)**
- [ ] **Integrate Cloudinary upload in file fields**
- [ ] Add STRATEGIC_INDICATOR field type with performance calculations
- [ ] Implement dynamic validation based on ValidationRule
- [ ] Create field locking UI (with lock icon indicators)
- [ ] Add auto-save functionality (every 30 seconds)
- [ ] Implement draft save and submit flows
- [ ] Create progress indicators for form completion
- [ ] Add report type selector (filters by user role)
- [ ] Build organizational unit selector (flexible for any level)

**Deliverables:**
- Functional DynamicFormRenderer component
- All 9 field types rendering correctly (including file uploads)
- File upload to Cloudinary working
- Auto-save working
- Locked fields properly displayed
- Form validates dynamically based on configured rules

### Phase 5: Review & Approval Workflow (Week 9-10)

**Tasks:**
- [ ] Create Report Review page
- [ ] Implement approval/request edits actions
- [ ] Create Report Comments component
- [ ] Build comment threading system
- [ ] Implement status change notifications
- [ ] Create email notification system (FR30)
- [ ] Build report history/audit trail view
- [ ] Implement auto-approval after deadline

**Deliverables:**
- Complete review and approval workflow
- Email notifications functional
- Audit trail visible

### Phase 6: Analytics Dashboard (Week 11-12)

**Tasks:**
- [ ] Create Analytics Dashboard layout
- [ ] Implement submission compliance metrics
- [ ] Build performance charts (Recharts)
- [ ] Create organizational unit comparison views (works for any level)
- [ ] Implement drill-down functionality
- [ ] Add export to CSV/PDF features
- [ ] Create scheduled report generation
- [ ] Build compliance tracking reports
- [ ] Add report type filtering in analytics

**Deliverables:**
- Interactive analytics dashboard
- Export functionality working
- Performance insights visible across all organizational levels

### Phase 7: Referral System (Week 13)

**Tasks:**
- [ ] Implement referral link generation API with flexible organizational assignment
- [ ] Create referral link management UI
- [ ] Update registration flow to handle referral codes
- [ ] Implement link validation and expiration
- [ ] Create link usage tracking
- [ ] Add link management to settings (role-based visibility)
- [ ] Implement audit trail for link usage
- [ ] Support generating links for any organizational level

**Deliverables:**
- Referral-based registration functional
- Link management interface complete
- Works for all organizational levels

### Phase 8: Intelligent Routing Refactor (Week 14)

**Tasks:**
- [ ] **Create UniversalLeaderDashboard component (works for all levels)**
- [ ] **Implement /leader/dashboard page (single page for all leader types)**
- [ ] **Create level-detection logic in dashboard component**
- [ ] **Refactor existing level-specific pages to use universal components**
- [ ] **Update navigation to use consolidated routes**
- [ ] **Create UnitAnalytics component (level-agnostic)**
- [ ] **Create UnitMembersList component (reusable across levels)**
- [ ] **Remove redundant page routes for different levels**
- [ ] **Update TypeScript types for flexible routing**
- [ ] **Test routing with users at different organizational levels**

**Deliverables:**
- Single dashboard page working for all level leaders
- Consolidated routing implemented
- Reduced codebase size and maintenance overhead
- Consistent UX across all organizational levels

### Phase 9: Notifications & Reminders (Week 15)

**Tasks:**
- [ ] Implement in-app notification system
- [ ] Create notification dropdown component
- [ ] Build email notification templates
- [ ] Set up deadline reminder cron jobs
- [ ] Implement notification preferences
- [ ] Create notification badge system
- [ ] Add mark as read functionality

**Deliverables:**
- Complete notification system
- Email reminders working
- User preferences functional

### Phase 10: Testing & Refinement (Week 16-17)

**Tasks:**
- [ ] **Test all 11 report types with dynamic form rendering**
- [ ] **Test file upload functionality (single and multi-file)**
- [ ] **Test Cloudinary integration and file deletion**
- [ ] **Test intelligent routing with users at different organizational levels**
- [ ] **Verify consolidated API routes work for all levels**
- [ ] Test field locking across different scenarios
- [ ] Test role access configuration for report types
- [ ] Comprehensive QA testing for all user roles
- [ ] **Test with rich mock data (verify 550+ report submissions render correctly)**
- [ ] Fix bugs and edge cases
- [ ] Performance optimization (lazy loading, code splitting)
- [ ] Security audit (file upload validation, XSS prevention)
- [ ] Accessibility testing (WCAG 2.1 AA) - including file upload components
- [ ] Mobile responsiveness testing
- [ ] User acceptance testing (UAT)
- [ ] Documentation updates

**Deliverables:**
- Bug-free reporting system
- All 11 report types working correctly
- File uploads functional and secure
- Intelligent routing working across all levels
- Performance optimized
- Security validated
- Production-ready code

### Phase 11: Deployment & Training (Week 18)

**Tasks:**
- [ ] Production deployment
- [ ] Data migration (if needed)
- [ ] Create user training materials
- [ ] Conduct admin training sessions
- [ ] Monitor system performance
- [ ] Gather user feedback
- [ ] Plan iterative improvements

**Deliverables:**
- Live reporting system
- Training materials
- Support documentation

---

## 7. Technical Implementation Details

### 7.1 Dynamic Form Rendering System

```typescript
// components/features/reports/DynamicFormRenderer.tsx
import { Form } from 'antd';
import { useAutoSave } from '@/lib/hooks/useAutoSave';
import { validateFormData } from '@/lib/utils/formValidation';

interface DynamicFormRendererProps {
  reportType: ReportType;
  initialData?: Record<string, any>;
  mode: 'create' | 'edit' | 'view';
  onSave: (formData: Record<string, any>) => Promise<void>;
  onSubmit: (formData: Record<string, any>) => Promise<void>;
  autoSaveInterval?: number;
}

export function DynamicFormRenderer({
  reportType,
  initialData,
  mode,
  onSave,
  onSubmit,
  autoSaveInterval = 30000
}: DynamicFormRendererProps) {
  const [form] = Form.useForm();
  const formDefinition: FormDefinition = reportType.formDefinition;
  
  // Auto-save hook
  const { isSaving, lastSaved } = useAutoSave(
    form.getFieldsValue(),
    onSave,
    autoSaveInterval
  );
  
  // Render field based on type
  const renderField = (field: FormField) => {
    const isLocked = checkFieldLock(field, initialData);
    const rules = buildValidationRules(field.validation);
    
    switch (field.type) {
      case 'TEXT':
        return <Input disabled={isLocked || mode === 'view'} />;
      
      case 'NUMBER':
        return <InputNumber disabled={isLocked || mode === 'view'} />;
      
      case 'DATE':
        return <DatePicker disabled={isLocked || mode === 'view'} />;
      
      case 'SELECT':
        return (
          <Select disabled={isLocked || mode === 'view'}>
            {field.options?.map(opt => (
              <Select.Option key={opt.value} value={opt.value}>
                {opt.label}
              </Select.Option>
            ))}
          </Select>
        );
      
      case 'TEXTAREA':
        return <TextArea disabled={isLocked || mode === 'view'} rows={4} />;
      
      case 'CHECKBOX':
        return <Checkbox disabled={isLocked || mode === 'view'}>{field.label}</Checkbox>;
      
      case 'STRATEGIC_INDICATOR':
        return (
          <StrategicIndicatorField
            field={field}
            disabled={isLocked || mode === 'view'}
          />
        );
      
      default:
        return null;
    }
  };
  
  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={initialData}
      onFinish={handleSubmit}
    >
      {formDefinition.sections.map(section => (
        <Card key={section.id} title={section.title} className="mb-4">
          {section.description && <p className="text-gray-600 mb-4">{section.description}</p>}
          
          {section.fields.map(field => (
            <Form.Item
              key={field.id}
              name={field.name}
              label={
                <span>
                  {field.label}
                  {checkFieldLock(field, initialData) && <LockOutlined className="ml-2" />}
                </span>
              }
              rules={buildValidationRules(field.validation)}
              help={field.helpText}
            >
              {renderField(field)}
            </Form.Item>
          ))}
        </Card>
      ))}
      
      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-500">
          {isSaving && 'Saving...'}
          {lastSaved && !isSaving && `Last saved: ${format(lastSaved, 'HH:mm:ss')}`}
        </span>
        
        {mode !== 'view' && (
          <Space>
            <Button onClick={() => onSave(form.getFieldsValue())}>
              Save Draft
            </Button>
            <Button type="primary" htmlType="submit">
              Submit Report
            </Button>
          </Space>
        )}
      </div>
    </Form>
  );
}

// Build Ant Design validation rules from FormField validation config
function buildValidationRules(validation?: ValidationRule[]): any[] {
  if (!validation) return [];
  
  return validation.map(rule => {
    switch (rule.type) {
      case 'REQUIRED':
        return { required: true, message: rule.message };
      
      case 'MIN':
        return { 
          type: 'number', 
          min: rule.value, 
          message: rule.message 
        };
      
      case 'MAX':
        return { 
          type: 'number', 
          max: rule.value, 
          message: rule.message 
        };
      
      case 'PATTERN':
        return { 
          pattern: new RegExp(rule.value), 
          message: rule.message 
        };
      
      case 'CUSTOM':
        return { 
          validator: (_, value) => {
            // Execute custom validation function
            const isValid = eval(rule.value)(value);
            return isValid ? Promise.resolve() : Promise.reject(rule.message);
          }
        };
      
      default:
        return {};
    }
  });
}

// Check if field is locked based on configuration
function checkFieldLock(field: FormField, data?: Record<string, any>): boolean {
  if (!field.lockingConfig || !data) return false;
  
  const { lockAfterSubmit, lockAfterDate, lockAfterValue } = field.lockingConfig;
  
  if (lockAfterSubmit && data.status !== 'DRAFT') {
    return true;
  }
  
  if (lockAfterDate) {
    const lockDate = new Date(lockAfterDate);
    if (new Date() > lockDate) {
      return true;
    }
  }
  
  if (lockAfterValue && data[field.name] !== undefined) {
    return true; // Lock after first value entry
  }
  
  return false;
}
```

### 7.2 Auto-Save Mechanism

```typescript
// hooks/useAutoSave.ts
export function useAutoSave(
  reportId: string,
  metricEntries: MetricEntry[],
  interval: number = 30000 // 30 seconds
) {
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  
  useEffect(() => {
    const timer = setInterval(async () => {
      if (metricEntries.length > 0) {
        setIsSaving(true);
        try {
          await fetch(`/api/reports/${reportId}/auto-save`, {
            method: 'POST',
            body: JSON.stringify({ metricEntries }),
            headers: { 'Content-Type': 'application/json' }
          });
          setLastSaved(new Date());
        } catch (error) {
          console.error('Auto-save failed:', error);
        } finally {
          setIsSaving(false);
        }
      }
    }, interval);
    
    return () => clearInterval(timer);
  }, [reportId, metricEntries, interval]);
  
  return { isSaving, lastSaved };
}
```

### 7.2 Field Locking Logic

```typescript
// utils/reportLocking.ts
export function canEditField(
  field: 'monthlyGoal' | 'monthlyAchieved' | 'yearOnYearGoal',
  metricEntry: MetricEntry,
  reportStatus: ReportStatus,
  currentDate: Date
): boolean {
  // Can't edit if report is locked
  if (reportStatus === 'APPROVED' || reportStatus === 'REVIEWED') {
    return false;
  }
  
  // Check field-specific locks
  if (field === 'monthlyGoal' && metricEntry.monthlyGoalLocked) {
    return false;
  }
  
  if (field === 'yearOnYearGoal' && metricEntry.yearOnYearGoalLocked) {
    return false;
  }
  
  if (field === 'monthlyAchieved') {
    // Lock at end of month
    const reportMonth = metricEntry.reportSubmission?.reportMonth;
    const reportYear = metricEntry.reportSubmission?.reportYear;
    
    if (reportMonth && reportYear) {
      const endOfMonth = new Date(reportYear, reportMonth, 0); // Last day of month
      if (currentDate > endOfMonth) {
        return false;
      }
    }
    
    if (metricEntry.monthlyAchievedLocked) {
      return false;
    }
  }
  
  return true;
}
```

### 7.3 Email Notification Service

```typescript
// lib/utils/emailService.ts
export async function sendReportNotificationEmail(
  userId: string,
  notificationType: string,
  reportSubmission: ReportSubmission
) {
  const user = await db.users.findById(userId);
  if (!user?.email) return;
  
  const templates = {
    REPORT_SUBMITTED: {
      subject: `New Report Submitted - Week ${reportSubmission.reportWeek}`,
      body: `A new report has been submitted by ${reportSubmission.submittedBy?.firstName} and requires your review.`
    },
    EDITS_REQUESTED: {
      subject: `Report Edits Requested - Week ${reportSubmission.reportWeek}`,
      body: `Your submitted report requires edits. Please review the feedback and resubmit.`
    },
    REPORT_APPROVED: {
      subject: `Report Approved - Week ${reportSubmission.reportWeek}`,
      body: `Your report for Week ${reportSubmission.reportWeek} has been approved.`
    },
    AVAILABLE_FOR_REVIEW: {
      subject: `Report Ready for Review - Week ${reportSubmission.reportWeek}`,
      body: `A consolidated report is now available for your review.`
    },
    DEADLINE_APPROACHING: {
      subject: `Report Deadline Approaching - Week ${reportSubmission.reportWeek}`,
      body: `Reminder: Your weekly report is due in 24 hours.`
    }
  };
  
  const template = templates[notificationType];
  if (!template) return;
  
  // TODO: Integrate with email service (SendGrid, AWS SES, etc.)
  // For now, log to console
  console.log(`Email to ${user.email}: ${template.subject}`);
  
  // Store notification record
  await db.reportNotifications.create({
    userId,
    reportSubmissionId: reportSubmission.id,
    notificationType,
    title: template.subject,
    message: template.body,
    emailSent: true,
    emailSentAt: new Date()
  });
}
```

### 7.4 Performance Calculation

```typescript
// utils/metricCalculations.ts
export function calculateMetricPerformance(metricEntry: MetricEntry) {
  const { monthlyGoal, monthlyAchieved } = metricEntry;
  
  if (!monthlyGoal || !monthlyAchieved) {
    return null;
  }
  
  const percentage = (monthlyAchieved / monthlyGoal) * 100;
  const variance = monthlyAchieved - monthlyGoal;
  
  return {
    performancePercentage: Math.round(percentage * 10) / 10, // 1 decimal place
    variance: Math.round(variance),
    status: percentage >= 100 ? 'EXCEEDING' : percentage >= 80 ? 'ON_TRACK' : 'BELOW_TARGET'
  };
}

export function calculateIndicatorPerformance(
  metricEntries: MetricEntry[]
): number {
  const performances = metricEntries
    .map(calculateMetricPerformance)
    .filter(p => p !== null)
    .map(p => p!.performancePercentage);
  
  if (performances.length === 0) return 0;
  
  const average = performances.reduce((a, b) => a + b, 0) / performances.length;
  return Math.round(average * 10) / 10;
}
```

### 7.5 Referral Code Generation

```typescript
// utils/referralCode.ts
import { customAlphabet } from 'nanoid';

const nanoid = customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', 12);

export function generateReferralCode(): string {
  return nanoid(); // Returns: ABC123DEF456
}

export function validateReferralCode(code: string): boolean {
  return /^[A-Z0-9]{12}$/.test(code);
}
```

---

## 8. Security Considerations

### 8.1 Role-Based Access Control

```typescript
// middleware/reportAuthorization.ts
export async function authorizeReportAccess(
  userId: string,
  reportId: string,
  action: 'view' | 'edit' | 'submit' | 'review' | 'approve'
): Promise<boolean> {
  const user = await db.users.findById(userId);
  const report = await db.reportSubmissions.findById(reportId);
  
  if (!user || !report) return false;
  
  switch (action) {
    case 'view':
      // Can view if submitter, reviewer, approver, or leadership
      return (
        report.submittedById === userId ||
        canReviewReport(user.role, report) ||
        ['SUPERADMIN', 'SPO', 'CHURCH_MINISTRY'].includes(user.role)
      );
      
    case 'edit':
      // Can edit if submitter and report is DRAFT or REQUIRES_EDITS
      return (
        report.submittedById === userId &&
        ['DRAFT', 'REQUIRES_EDITS'].includes(report.status) &&
        !report.isLocked
      );
      
    case 'submit':
      // Can submit if submitter and report is DRAFT or REQUIRES_EDITS
      return (
        report.submittedById === userId &&
        ['DRAFT', 'REQUIRES_EDITS'].includes(report.status)
      );
      
    case 'review':
      // Can review if appropriate role in hierarchy
      return canReviewReport(user.role, report);
      
    case 'approve':
      // Can approve if Campus Pastor, Group Pastor, or leadership
      return ['CAMPUS_ADMIN', 'ZONAL_LEADER', 'SUPERADMIN'].includes(user.role);
      
    default:
      return false;
  }
}
```

### 8.2 Data Validation

```typescript
// validation/reportSchemas.ts
import { z } from 'zod';

export const metricEntrySchema = z.object({
  keyMetricId: z.string().cuid(),
  monthlyGoal: z.number().min(0).optional(),
  monthlyAchieved: z.number().min(0).optional(),
  yearOnYearGoal: z.number().min(0).optional(),
});

export const reportSubmissionSchema = z.object({
  templateId: z.string().cuid(),
  reportWeek: z.number().min(1).max(53),
  reportMonth: z.number().min(1).max(12),
  reportYear: z.number().min(2020).max(2100),
  campusId: z.string().cuid(),
  metricEntries: z.array(metricEntrySchema).min(1),
});
```

### 8.3 Audit Trail

```typescript
// All report status changes logged
export async function logReportAction(
  reportId: string,
  userId: string,
  action: string,
  previousStatus: string,
  newStatus: string,
  notes?: string
) {
  await db.reportAuditLog.create({
    reportSubmissionId: reportId,
    userId,
    action,
    previousStatus,
    newStatus,
    notes,
    ipAddress: getClientIP(),
    userAgent: getUserAgent(),
    timestamp: new Date()
  });
}
```

---

## 9. Success Metrics

### 9.1 System Adoption
- **Target:** 95% of campuses submitting reports weekly by Month 2
- **Measure:** Weekly submission rate

### 9.2 Timeliness
- **Target:** 80% of reports submitted before deadline
- **Measure:** On-time submission percentage

### 9.3 Review Efficiency
- **Target:** Reports reviewed within 48 hours of submission
- **Measure:** Average time from submission to approval

### 9.4 Data Quality
- **Target:** <5% of reports requiring edits
- **Measure:** Edit request rate

### 9.5 User Satisfaction
- **Target:** >4.0/5.0 user rating
- **Measure:** Post-implementation survey

---

## 10. Risks & Mitigation

| Risk | Impact | Likelihood | Mitigation Strategy |
|------|--------|------------|---------------------|
| User resistance to new system | High | Medium | Comprehensive training, phased rollout, champion users |
| Data migration errors | High | Low | Thorough testing, backup strategy, rollback plan |
| Performance issues with analytics | Medium | Medium | Implement caching, optimize queries, use Redis |
| Email notification failures | Medium | Low | Queue system, retry logic, fallback to in-app only |
| Deadline enforcement conflicts | Low | Medium | Clear communication, grace period, admin override |

---

## 11. Open Questions

1. **Strategic Indicators:** Should these be configurable by SUPERADMIN or hardcoded based on church leadership input?
2. **Historical Data:** Do we need to migrate any existing report data from Excel/Word documents?
3. **Email Service:** Which email provider should we integrate (SendGrid, AWS SES, Mailgun)?
4. **Report Templates:** How many different templates do we need (Weekly Campus, Monthly Group, Quarterly Zone)?
5. **Performance Benchmarks:** What are the target goals for each metric per campus/zone?
6. **Mobile App:** Is a future mobile app required for report submission on-the-go?

---

## 12. Next Steps

1. **Stakeholder Review:** Present this plan to Church Ministry, SPO, CEO for approval
2. **Finalize Strategic Indicators:** Get definitive list of indicators and metrics from leadership
3. **Development Kickoff:** Begin Phase 1 implementation
4. **Weekly Standups:** Track progress and address blockers
5. **Pilot Program:** Select 2-3 campuses for initial testing
6. **Iterative Feedback:** Gather feedback and refine before full rollout

---

## Appendix A: Key PRD Requirements Mapping

| PRD Requirement | Implementation Plan Section |
|----------------|----------------------------|
| FR1-FR4: Dashboard navigation | Section 5.1 - Navigation Structure |
| FR5-FR7: Role-based fields | Section 2 - Data Models, Section 7.1 - RBAC |
| FR8-FR17: Strategic indicators & metrics | Section 2.1-2.2 - Data Models, Section 3.1 - Prisma Schema |
| FR18-FR23: Field locking | Section 7.2 - Field Locking Logic |
| FR24-FR26: Role access & permissions | Section 7.1 - Authorization |
| FR27-FR29: Editing control | Section 2.4 - Report Status, Section 7.2 - Locking |
| FR30: Notifications | Section 2.8 - Notifications, Section 7.3 - Email Service |
| FR44-FR46: Weekly reporting | Section 2.3-2.4 - Templates & Submissions |
| FR47-FR58: Referral registration | Section 2.7 - Referral Links, Section 7.5 - Code Generation |
| NFR: Performance | Section 7 - Technical Implementation |
| NFR: Security | Section 8 - Security Considerations |

---

**End of Implementation Plan**
