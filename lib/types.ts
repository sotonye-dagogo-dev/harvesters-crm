
// ============================================================================
// GLOBAL TYPES FOR CHURCH FELLOWSHIP CRM
// ============================================================================
// This file defines all TypeScript types and interfaces used throughout the
// application. It's included in tsconfig.json so these types are globally
// available without imports.
// ============================================================================

// ============================================================================
// ENUMS
// ============================================================================

export enum UserRole {
  // Top-level admin
  SUPERADMIN = "SUPERADMIN",
  GROUP_PASTOR = "GROUP_PASTOR",
  GROUP_ADMIN = "GROUP_ADMIN",
  CAMPUS_PASTOR = "CAMPUS_PASTOR",
  CAMPUS_ADMIN = "CAMPUS_ADMIN",
  ZONAL_LEADER = "ZONAL_LEADER",
  HOD = "HOD",
  SMALL_GROUP_LEADER = "SMALL_GROUP_LEADER",
  CELL_LEADER = "CELL_LEADER",
  DATA_ENTRY = "DATA_ENTRY",
  MEMBER = "MEMBER",
}

export enum Gender {
  MALE = "MALE",
  FEMALE = "FEMALE",
}

export enum EmploymentStatus {
  STUDENT = "STUDENT",
  SELF_EMPLOYED = "SELF_EMPLOYED",
  EMPLOYED = "EMPLOYED",
  UNEMPLOYED = "UNEMPLOYED",
  RETIRED = "RETIRED",
}

export enum MaritalStatus {
  SINGLE = "SINGLE",
  MARRIED = "MARRIED",
  DIVORCED = "DIVORCED",
  WIDOWED = "WIDOWED",
}

export enum MeetingFrequency {
  WEEKLY = "WEEKLY",
  BIWEEKLY = "BIWEEKLY",
  MONTHLY = "MONTHLY",
}

export enum InteractionType {
  CALL = "CALL",
  FOLLOW_UP = "FOLLOW_UP",
  CHECK_IN = "CHECK_IN",
}

export enum MembershipRequestType {
  JOIN = "JOIN",
  TRANSFER = "TRANSFER",
}

export enum MembershipRequestStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
}

export enum NotificationType {
  MEETING_REMINDER = "MEETING_REMINDER",
  REQUEST_STATUS = "REQUEST_STATUS",
  ROLE_ASSIGNMENT = "ROLE_ASSIGNMENT",
  FOLLOW_UP_REMINDER = "FOLLOW_UP_REMINDER",
  NEW_REQUEST = "NEW_REQUEST",
  CAMPAIGN_NEW = "CAMPAIGN_NEW",
  REFERRAL_CONVERSION = "REFERRAL_CONVERSION",
  // Report notifications
  REPORT_SUBMITTED = "REPORT_SUBMITTED",
  REPORT_EDITS_REQUESTED = "REPORT_EDITS_REQUESTED",
  REPORT_APPROVED = "REPORT_APPROVED",
  REPORT_REVIEWED = "REPORT_REVIEWED",
  REPORT_EDIT_APPROVED = "REPORT_EDIT_APPROVED",
  REPORT_EDIT_REJECTED = "REPORT_EDIT_REJECTED",
  REPORT_UPDATE_REQUEST_SUBMITTED = "REPORT_UPDATE_REQUEST_SUBMITTED",
  REPORT_UPDATE_REQUEST_APPROVED = "REPORT_UPDATE_REQUEST_APPROVED",
  REPORT_UPDATE_REQUEST_REJECTED = "REPORT_UPDATE_REQUEST_REJECTED",
  REPORT_DEADLINE_REMINDER = "REPORT_DEADLINE_REMINDER",
  REPORT_DEADLINE_FINAL = "REPORT_DEADLINE_FINAL",
}

export enum CampaignStatus {
  DRAFT = "DRAFT",
  ACTIVE = "ACTIVE",
  EXPIRED = "EXPIRED",
  ARCHIVED = "ARCHIVED",
}

export enum CampaignMediaType {
  IMAGE = "IMAGE",
  VIDEO = "VIDEO",
  LINK = "LINK",
  TEXT = "TEXT",
}

export enum CampaignInteractionType {
  VIEW = "VIEW",
  CLICK = "CLICK",
  SHARE = "SHARE",
  SCREENSHOT = "SCREENSHOT",
  SKIP = "SKIP",
  BACK = "BACK",
  LINK_CLICK = "LINK_CLICK",
}

export enum MeetingLevel {
  ALL = "ALL",
  ZONE = "ZONE",
  CAMPUS = "CAMPUS",
  DEPARTMENT = "DEPARTMENT",
  SMALL_GROUP = "SMALL_GROUP",
  CELL = "CELL",
}

export enum InviteLinkType {
  CAMPUS = "CAMPUS",
  ZONE = "ZONE",
  DEPARTMENT = "DEPARTMENT",
  SMALL_GROUP = "SMALL_GROUP",
  CELL = "CELL",
  MEETING = "MEETING",
  CAMPAIGN = "CAMPAIGN",
}

// ============================================================================
// REPORT ENUMS
// ============================================================================

export enum ReportStatus {
  DRAFT = "DRAFT",
  SUBMITTED = "SUBMITTED",
  REQUIRES_EDITS = "REQUIRES_EDITS",
  APPROVED = "APPROVED",
  REVIEWED = "REVIEWED",
  LOCKED = "LOCKED",
}

export enum ReportEventType {
  CREATED = "CREATED",
  SUBMITTED = "SUBMITTED",
  EDIT_REQUESTED = "EDIT_REQUESTED",
  EDIT_SUBMITTED = "EDIT_SUBMITTED",
  EDIT_APPROVED = "EDIT_APPROVED",
  EDIT_REJECTED = "EDIT_REJECTED",
  EDIT_APPLIED = "EDIT_APPLIED",
  APPROVED = "APPROVED",
  REVIEWED = "REVIEWED",
  LOCKED = "LOCKED",
  DEADLINE_PASSED = "DEADLINE_PASSED",
  UPDATE_REQUESTED = "UPDATE_REQUESTED",
  UPDATE_APPROVED = "UPDATE_APPROVED",
  UPDATE_REJECTED = "UPDATE_REJECTED",
  DATA_ENTRY_CREATED = "DATA_ENTRY_CREATED",
  TEMPLATE_VERSION_NOTE = "TEMPLATE_VERSION_NOTE",
  FIELD_UNLOCKED = "FIELD_UNLOCKED",
  AUTO_APPROVED = "AUTO_APPROVED",
}

export enum ReportPeriodType {
  WEEKLY = "WEEKLY",
  MONTHLY = "MONTHLY",
  YEARLY = "YEARLY",
}

export enum MetricFieldType {
  NUMBER = "NUMBER",
  PERCENTAGE = "PERCENTAGE",
  TEXT = "TEXT",
  CURRENCY = "CURRENCY",
}

export enum ReportEditStatus {
  DRAFT = "DRAFT",
  SUBMITTED = "SUBMITTED",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
}

export enum ReportUpdateRequestStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
}

// ============================================================================
// HIERARCHY LEVEL - ordered from highest to lowest
// ============================================================================

export const HIERARCHY_ORDER: Record<UserRole, number> = {
  [UserRole.SUPERADMIN]: 0,
  [UserRole.GROUP_PASTOR]: 1,
  [UserRole.GROUP_ADMIN]: 2,
  [UserRole.CAMPUS_PASTOR]: 3,
  [UserRole.CAMPUS_ADMIN]: 4,
  [UserRole.ZONAL_LEADER]: 5,
  [UserRole.HOD]: 6,
  [UserRole.SMALL_GROUP_LEADER]: 7,
  [UserRole.CELL_LEADER]: 8,
  [UserRole.DATA_ENTRY]: 9,
  [UserRole.MEMBER]: 10,
};

// ============================================================================
// GLOBAL TYPE DECLARATIONS
// ============================================================================
// All interfaces and types below are globally available without imports
// ============================================================================

declare global {
  // ============================================================================
  // UNIVERSAL ORG UNIT BASE INTERFACE
  // ============================================================================
  // Single base shape shared by ALL organisational levels (Cell, Zone, Area,
  // Community, District, Campus, Group). Each concrete interface extends this
  // with level-specific required/optional fields.
  //
  // Why: Adding a new org level means extending OrgUnitBase, not creating an
  // entirely new interface from scratch. Utility functions can work generically
  // with OrgUnitBase for listing, searching, breadcrumbs, etc.
  // ============================================================================

  interface OrgUnitBase {
    id: string;
    name: string;
    description: string;
    /** The hierarchy level key this entity belongs to (e.g. "CELL", "CAMPUS", "GROUP") */
    orgLevel: string;
    /** ID of the direct parent org unit (null for top-level entities) */
    parentId: string | null;
    /** The hierarchy level of the parent (mirrors OrgLevelConfig.parentLevel) */
    parentLevel: string | null;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;

    // ── Optional fields driven by OrgLevelConfig flags ──
    /** Leader assigned to this unit */
    leaderId?: string;
    /** Admin assigned to this unit (hasAdmin levels) */
    adminId?: string;
    /** Country scope (hasCountry levels like Group) */
    country?: string;
    /** Regional scope (hasRegion levels like Zone) */
    region?: string;
    /** Physical address (hasLocation levels) */
    address?: string;
    /** Display-friendly location string (e.g. "Lekki, Lagos") */
    location?: string;
    /** Latitude for map features (hasLocation levels) */
    latitude?: number;
    /** Longitude for map features (hasLocation levels) */
    longitude?: number;
    /** Contact phone (hasLocation levels) */
    phone?: string;
    /** Department association (hasDepartment levels) */
    departmentId?: string;
    /** Meeting schedule (hasMeetingFrequency levels) */
    meetingFrequency?: MeetingFrequency;
    /** Tracked member count (hasMemberCount levels) */
    memberCount?: number;
    /** Referral / join code (hasInviteCode levels) */
    inviteCode?: string;
  }

  // ============================================================================
  // TOP-LEVEL ORG GROUP (highest hierarchy level)
  // ============================================================================

  interface OrgGroup extends OrgUnitBase {
    orgLevel: "GROUP";
    parentId: null;
    parentLevel: null;
    /** Country this Group entity covers (e.g. "Nigeria", "United Kingdom") */
    country: string;
    region?: string;
    leaderId: string;
  }

  interface OrgGroupWithDetails extends OrgGroup {
    leader?: UserProfile;
    campuses: Campus[];
    totalMembers: number;
    totalCampuses: number;
  }

  interface CreateOrgGroupInput {
    name: string;
    description: string;
    country: string;
    region?: string;
    leaderId: string;
  }

  interface UpdateOrgGroupInput {
    name?: string;
    description?: string;
    country?: string;
    region?: string;
    leaderId?: string;
    isActive?: boolean;
  }

  // ============================================================================
  // ORGANIZATIONAL UNIT TYPES — All extend OrgUnitBase
  // ============================================================================
  // Every org unit inherits from OrgUnitBase:
  //   id, name, description, orgLevel, parentId, parentLevel,
  //   isActive, createdAt, updatedAt,
  //   + optional: leaderId, adminId, country, region, address, location,
  //     latitude, longitude, phone, departmentId, meetingFrequency,
  //     memberCount, inviteCode
  //
  // Level-specific interfaces narrow optional fields to required where needed
  // and add any level-specific fields (e.g. hodId on Department).
  // ============================================================================

  interface Campus extends OrgUnitBase {
    orgLevel: "CAMPUS";
    /** Parent OrgGroup ID — the top-level organisational group */
    parentId: string;
    parentLevel: "GROUP";
    /** Campus administrator (narrowed to required) */
    adminId: string;
    /** Country where the campus is located (narrowed to required) */
    country: string;
    /** Display-friendly location label, e.g. "Lekki, Lagos" (narrowed to required) */
    location: string;
  }

  interface Zone extends OrgUnitBase {
    orgLevel: "ZONE";
    /** Zone leader (narrowed to required) */
    leaderId: string;
  }

  interface Department extends OrgUnitBase {
    orgLevel: "DEPARTMENT";
    /** Campus this department belongs to (denormalised cross-reference) */
    campusId: string;
    /** OrgGroup association (denormalised cross-reference) */
    zoneId?: string;
    /** Head of Department — department-specific field */
    hodId: string;
  }

  interface SmallGroup extends OrgUnitBase {
    orgLevel: "SMALL_GROUP";
    /** Campus this group belongs to (denormalised) */
    campusId: string;
    /** OrgGroup (top-level zone) this group belongs to (denormalised) */
    zoneId: string;
    /** Group leader (narrowed to required) */
    leaderId: string;
    /** Meeting schedule (narrowed to required) */
    meetingFrequency: MeetingFrequency;
    /** Tracked member count (narrowed to required) */
    memberCount: number;
  }

  interface Cell extends OrgUnitBase {
    orgLevel: "CELL";
    /** Parent SmallGroup this cell belongs to */
    groupId: string;
    /** Campus reference (denormalised) */
    campusId: string;
    /** OrgGroup reference (denormalised) */
    zoneId: string;
    /** Cell leader (narrowed to required) */
    leaderId: string;
    /** Meeting schedule (narrowed to required) */
    meetingFrequency: MeetingFrequency;
    /** Tracked member count (narrowed to required) */
    memberCount: number;
  }

  // ============================================================================
  // ORG UNIT WITH DETAILS
  // ============================================================================

  interface CampusWithDetails extends Campus {
    /** Parent OrgGroup entity */
    orgGroup?: OrgGroup;
    admin?: UserProfile;
    departments: Department[];
    groups: SmallGroup[];
    cells: Cell[];
    totalMembers: number;
    totalGroups: number;
    totalCells: number;
    totalDepartments: number;
  }

  interface ZoneWithDetails extends Zone {
    leader?: UserProfile;
    campuses: Campus[];
    departments: Department[];
    groups: SmallGroup[];
    totalMembers: number;
    totalCampuses: number;
    totalDepartments: number;
  }

  interface DepartmentWithDetails extends Department {
    campus: Campus;
    hod?: UserProfile;
    groups: SmallGroup[];
    totalMembers: number;
    totalGroups: number;
  }

  interface SmallGroupWithDetails extends SmallGroup {
    campus: Campus;
    zone: Zone;
    department?: Department;
    leader?: UserProfile;
    members: UserProfile[];
    cells: Cell[];
    recentMeetings: Meeting[];
    attendanceRate?: number;
  }

  interface CellWithDetails extends Cell {
    campus: Campus;
    zone: Zone;
    department?: Department;
    group: SmallGroup;
    leader?: UserProfile;
    members: UserProfile[];
    recentMeetings: Meeting[];
    attendanceRate?: number;
  }

  // ============================================================================
  // CREATE/UPDATE INPUTS FOR ORG UNITS
  // ============================================================================

  interface CreateCampusInput {
    name: string;
    description: string;
    location: string;
    country: string;
    /** Parent OrgGroup ID */
    parentId: string;
    adminId: string;
    address?: string;
    latitude?: number;
    longitude?: number;
    phone?: string;
  }

  interface UpdateCampusInput {
    name?: string;
    description?: string;
    location?: string;
    country?: string;
    /** Parent OrgGroup ID */
    parentId?: string;
    adminId?: string;
    address?: string;
    latitude?: number;
    longitude?: number;
    phone?: string;
    isActive?: boolean;
  }

  interface CreateZoneInput {
    name: string;
    description: string;
    region?: string;
    leaderId: string;
  }

  interface UpdateZoneInput {
    name?: string;
    description?: string;
    region?: string;
    leaderId?: string;
    isActive?: boolean;
  }

  interface CreateDepartmentInput {
    name: string;
    description: string;
    campusId: string;
    zoneId?: string;
    hodId: string;
  }

  interface UpdateDepartmentInput {
    name?: string;
    description?: string;
    campusId?: string;
    zoneId?: string;
    hodId?: string;
    isActive?: boolean;
  }

  interface CreateSmallGroupInput {
    name: string;
    description: string;
    campusId: string;
    zoneId: string;
    departmentId?: string;
    leaderId: string;
    meetingFrequency: MeetingFrequency;
  }

  interface UpdateSmallGroupInput {
    name?: string;
    description?: string;
    departmentId?: string;
    leaderId?: string;
    meetingFrequency?: MeetingFrequency;
    inviteCode?: string;
    isActive?: boolean;
  }

  interface CreateCellInput {
    name: string;
    description: string;
    campusId: string;
    zoneId: string;
    departmentId?: string;
    groupId: string;
    leaderId: string;
    meetingFrequency: MeetingFrequency;
  }

  interface UpdateCellInput {
    name?: string;
    description?: string;
    departmentId?: string;
    leaderId?: string;
    meetingFrequency?: MeetingFrequency;
    inviteCode?: string;
    isActive?: boolean;
  }

  // ============================================================================
  // USER TYPES (UPDATED FOR HIERARCHY)
  // ============================================================================

  interface User {
    id: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone: string;
    whatsappPhone?: string;
    location?: string;
    age?: number;
    maritalStatus?: MaritalStatus;
    employmentStatus?: EmploymentStatus;
    interests: string[];
    role: UserRole;
    campusId?: string;
    zoneId?: string;
    departmentId?: string;
    groupId?: string;
    cellId?: string;
    avatar?: string;
    isActive: boolean;
    invitedById?: string;
    inviteCode?: string;
    createdAt: string;
    updatedAt: string;
  }

  interface UserProfile extends Omit<User, "password"> {
    campus?: Campus;
    zone?: Zone;
    department?: Department;
    group?: SmallGroup;
    cell?: Cell;
    attendanceRate?: number;
    engagementScore?: number;
  }

  interface CreateUserInput {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone: string;
    whatsappPhone?: string;
    location?: string;
    age?: number;
    maritalStatus?: MaritalStatus;
    employmentStatus?: EmploymentStatus;
    interests?: string[];
    campusId?: string;
    zoneId?: string;
    departmentId?: string;
    groupId?: string;
    cellId?: string;
    invitedById?: string;
    inviteCode?: string;
  }

  interface UpdateUserInput {
    firstName?: string;
    lastName?: string;
    phone?: string;
    whatsappPhone?: string;
    location?: string;
    age?: number;
    maritalStatus?: MaritalStatus;
    employmentStatus?: EmploymentStatus;
    interests?: string[];
    avatar?: string;
    campusId?: string;
    zoneId?: string;
    departmentId?: string;
    groupId?: string;
    cellId?: string;
    isActive?: boolean;
    role?: UserRole;
  }

  // ============================================================================
  // GROUP TYPES (Convenience alias — Group ≡ SmallGroup)
  // ============================================================================

  /** Short alias used throughout the codebase. SmallGroup is the canonical name. */
  type Group = SmallGroup;

  interface GroupWithDetails extends Group {
    leader?: UserProfile;
    members: UserProfile[];
    cells: Cell[];
    recentMeetings: Meeting[];
    attendanceRate?: number;
  }

  interface CreateGroupInput {
    name: string;
    description: string;
    meetingFrequency: MeetingFrequency;
    leaderId: string;
    campusId?: string;
    zoneId?: string;
    departmentId?: string;
  }

  interface UpdateGroupInput {
    name?: string;
    description?: string;
    meetingFrequency?: MeetingFrequency;
    leaderId?: string;
    campusId?: string;
    zoneId?: string;
    departmentId?: string;
    inviteCode?: string;
    isActive?: boolean;
  }

  // ============================================================================
  // MEETING TYPES (UPDATED FOR HIERARCHY)
  // ============================================================================

  interface Meeting {
    id: string;
    title?: string;
    date: string;
    startTime: string;
    endTime: string;
    topic?: string;
    attendeeCount: number;
    attendeeIds: string[];
    screenshotUrl?: string;
    notes?: string;
    createdById: string;
    level: MeetingLevel;
    campusId?: string;
    zoneId?: string;
    departmentId?: string;
    groupId?: string;
    cellId?: string;
    isBroadcast?: boolean;
    isTemplate?: boolean;
    targetGroupIds?: string[];
    targetCellIds?: string[];
    templateId?: string;
    campusNotes?: CampusMeetingNotes;
    createdAt: string;
    updatedAt: string;
  }

  interface CampusMeetingNotes {
    totalCells?: number;
    cellsHeld?: number;
    newGroups?: number;
    firstTimers?: number;
    testimonies?: string[];
    salvations?: number;
    additionalNotes?: string;
  }

  interface MeetingWithDetails extends Meeting {
    campus?: Campus;
    zone?: Zone;
    department?: Department;
    group?: Group;
    cell?: Cell;
    createdBy: UserProfile;
    attendees: UserProfile[];
  }

  interface CreateMeetingInput {
    title?: string;
    date: string;
    startTime: string;
    endTime: string;
    topic?: string;
    attendeeCount?: number;
    attendeeIds?: string[];
    screenshotUrl?: string;
    notes?: string;
    level: MeetingLevel;
    campusId?: string;
    zoneId?: string;
    departmentId?: string;
    groupId?: string;
    cellId?: string;
    isBroadcast?: boolean;
    isTemplate?: boolean;
    targetGroupIds?: string[];
    targetCellIds?: string[];
    campusNotes?: CampusMeetingNotes;
  }

  interface UpdateMeetingInput {
    title?: string;
    date?: string;
    startTime?: string;
    endTime?: string;
    topic?: string;
    attendeeCount?: number;
    attendeeIds?: string[];
    screenshotUrl?: string;
    notes?: string;
    level?: MeetingLevel;
    campusNotes?: CampusMeetingNotes;
  }

  // ============================================================================
  // ATTENDANCE TYPES
  // ============================================================================

  interface Attendance {
    id: string;
    meetingId: string;
    memberId: string;
    present: boolean;
    createdAt: string;
  }

  interface AttendanceRecord extends Attendance {
    member: UserProfile;
    meeting: Meeting;
  }

  // ============================================================================
  // INTERACTION TYPES
  // ============================================================================

  interface Interaction {
    id: string;
    leaderId: string;
    memberId: string;
    type: InteractionType;
    notes?: string;
    timestamp: string;
    groupId?: string;
    cellId?: string;
    campusId?: string;
    zoneId?: string;
    departmentId?: string;
    createdAt: string;
  }

  interface InteractionWithDetails extends Interaction {
    leader: UserProfile;
    member: UserProfile;
  }

  interface CreateInteractionInput {
    memberId: string;
    type: InteractionType;
    notes?: string;
    timestamp?: string;
  }

  interface UpdateInteractionInput {
    type?: InteractionType;
    notes?: string;
    timestamp?: string;
  }

  // ============================================================================
  // MEMBERSHIP REQUEST TYPES
  // ============================================================================

  interface MembershipRequest {
    id: string;
    memberId: string;
    fromGroupId?: string;
    fromCellId?: string;
    toGroupId?: string;
    toCellId?: string;
    toCampusId?: string;
    toZoneId?: string;
    toDepartmentId?: string;
    type: MembershipRequestType;
    status: MembershipRequestStatus;
    message?: string;
    requestedAt: string;
    respondedAt?: string;
    respondedById?: string;
    responseMessage?: string;
  }

  interface MembershipRequestWithDetails extends MembershipRequest {
    member: UserProfile;
    fromGroup?: Group;
    toGroup?: Group;
    fromCell?: Cell;
    toCell?: Cell;
    respondedBy?: UserProfile;
  }

  interface CreateMembershipRequestInput {
    toGroupId?: string;
    toCellId?: string;
    toCampusId?: string;
    toZoneId?: string;
    toDepartmentId?: string;
    fromGroupId?: string;
    fromCellId?: string;
    type: MembershipRequestType;
    message?: string;
  }

  interface RespondToRequestInput {
    status: MembershipRequestStatus.APPROVED | MembershipRequestStatus.REJECTED;
    responseMessage?: string;
  }

  // ============================================================================
  // NOTIFICATION TYPES
  // ============================================================================

  /** Notification delivery channel */
  type NotificationChannel = "in_app" | "email" | "both";

  interface appNotification {
    id: string;
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
    relatedId?: string;
    read: boolean;
    createdAt: string;
    /** Delivery channel — defaults to "both" */
    channel?: NotificationChannel;
    /** Whether the email counterpart has been "sent" (simulated) */
    emailSent?: boolean;
    /** Simulated email metadata (populated for email/both channels) */
    emailMeta?: {
      to: string;
      subject: string;
      body: string;
      sentAt?: string;
    };
  }

  interface NotificationWithDetails extends appNotification {
    user: UserProfile;
  }

  // ============================================================================
  // CAMPAIGN TYPES
  // ============================================================================

  interface CampaignMedia {
    id: string;
    type: CampaignMediaType;
    url: string;
    thumbnailUrl?: string;
    altText?: string;
    order: number;
  }

  interface Campaign {
    id: string;
    title: string;
    description: string;
    content: string;
    media: CampaignMedia[];
    mediaType?: CampaignMediaType; // Primary media type for simplified access
    mediaUrl?: string; // Primary media URL for simplified access
    thumbnailUrl?: string; // Primary thumbnail URL for simplified access
    ctaText?: string;
    ctaUrl?: string;
    createdById: string;
    status: CampaignStatus;
    targetAudience?: string[]; // Target audience categories
    publishedAt?: string;
    expiresAt?: string;
    metaTitle?: string;
    metaDescription?: string;
    metaImage?: string;
    targetLevel?: MeetingLevel;
    targetCampusId?: string;
    targetZoneId?: string;
    targetDepartmentId?: string;
    targetGroupId?: string;
    targetCellId?: string;
    viewCount: number;
    likeCount?: number; // Number of likes
    clickCount: number;
    shareCount: number;
    createdAt: string;
    updatedAt: string;
  }

  interface CampaignWithDetails extends Campaign {
    createdBy: UserProfile;
    interactions: CampaignInteraction[];
    isActive: boolean;
  }

  interface CampaignInteraction {
    id: string;
    campaignId: string;
    userId?: string;
    type: CampaignInteractionType;
    referralCode?: string;
    metadata?: Record<string, unknown>;
    createdAt: string;
  }

  interface CreateCampaignInput {
    title: string;
    description: string;
    content: string;
    media?: CampaignMedia[];
    ctaText?: string;
    ctaUrl?: string;
    metaTitle?: string;
    metaDescription?: string;
    metaImage?: string;
    targetLevel?: MeetingLevel;
    targetCampusId?: string;
    targetZoneId?: string;
    publishImmediately?: boolean;
  }

  interface UpdateCampaignInput {
    title?: string;
    description?: string;
    content?: string;
    media?: CampaignMedia[];
    ctaText?: string;
    ctaUrl?: string;
    metaTitle?: string;
    metaDescription?: string;
    metaImage?: string;
    targetLevel?: MeetingLevel;
    targetCampusId?: string;
    targetZoneId?: string;
    targetDepartmentId?: string;
    targetGroupId?: string;
    targetCellId?: string;
    status?: CampaignStatus;
    expiresAt?: string;
  }

  // ============================================================================
  // REFERRAL / INVITE LINK TYPES
  // ============================================================================

  interface InviteLink {
    id: string;
    code: string;
    createdById: string;
    type: InviteLinkType;
    targetId: string;
    assignRole?: UserRole;
    expiresAt?: string;
    maxUses?: number;
    isActive: boolean;
    visitCount: number;
    conversionCount: number;
    createdAt: string;
    updatedAt: string;
  }

  interface InviteLinkVisit {
    id: string;
    inviteLinkId: string;
    visitorUserId?: string;
    visitorIp?: string;
    referrer?: string;
    userAgent?: string;
    ipAddress?: string;
    converted: boolean;
    convertedUserId?: string;
    createdAt: string;
  }

  interface ReferralStats {
    userId: string;
    totalInvitesSent: number;
    totalVisits: number;
    totalConversions: number;
    conversionRate: number;
    topPerformingLink?: InviteLink;
    invitees: Array<{
      userId: string;
      name: string;
      joinedAt: string;
      via: InviteLinkType;
    }>;
  }

  interface CreateInviteLinkInput {
    type: InviteLinkType;
    targetId: string;
    assignRole?: UserRole;
    expiresAt?: string;
  }

  // ============================================================================
  // ANALYTICS TYPES (UPDATED FOR HIERARCHY)
  // ============================================================================

  interface MemberAnalytics {
    userId: string;
    attendanceRate: number;
    totalMeetings: number;
    attendedMeetings: number;
    missedMeetings: number;
    engagementScore: number;
    lastInteraction?: string;
    interactionCount: number;
    isAtRisk: boolean;
  }

  interface GroupAnalytics {
    groupId: string;
    attendanceRate: number;
    totalMeetings: number;
    averageAttendance: number;
    memberCount: number;
    activeMembers: number;
    atRiskMembers: number;
    meetingFrequencyAdherence: number;
    leaderInteractionRate: number;
  }

  interface CampusAnalytics {
    campusId: string;
    campusName: string;
    zoneId: string;
    zoneName: string;
    totalMembers: number;
    totalDepartments: number;
    totalGroups: number;
    totalCells: number;
    totalMeetings: number;
    overallAttendanceRate: number;
    zonePerformance: Array<{
      zoneId: string;
      zoneName: string;
      attendanceRate: number;
      memberCount: number;
    }>;
    campusMeetingSummary?: CampusMeetingNotes;
  }

  interface ZoneAnalytics {
    zoneId: string;
    zoneName: string;
    totalCampuses: number;
    totalMembers: number;
    totalGroups: number;
    totalCells: number;
    totalMeetings: number;
    attendanceRate: number;
    groupPerformance: Array<{
      groupId: string;
      groupName: string;
      attendanceRate: number;
      memberCount: number;
    }>;
  }

  interface HierarchyAnalytics {
    level: MeetingLevel;
    entityId: string;
    entityName: string;
    period: string;
    totalMeetings: number;
    averageAttendance: number;
    attendanceRate: number;
    totalMembers: number;
    activeMembers: number;
    atRiskMembers: number;
    trendData: Array<{
      date: string;
      attendance: number;
      meetings: number;
    }>;
  }

  interface ChurchWideAnalytics {
    totalMembers: number;
    activeMembers: number;
    inactiveMembers: number;
    totalCampuses: number;
    totalZones: number;
    totalDepartments: number;
    totalGroups: number;
    totalCells: number;
    activeGroups: number;
    totalMeetings: number;
    overallAttendanceRate: number;
    averageEngagementScore: number;
    atRiskMemberCount: number;
    interestDistribution: Record<string, number>;
    campusPerformance: Array<{
      campusId: string;
      campusName: string;
      attendanceRate: number;
      memberCount: number;
      groupCount: number;
    }>;
    groupPerformance: Array<{
      groupId: string;
      groupName: string;
      attendanceRate: number;
      memberCount: number;
    }>;
    campaignStats: {
      totalCampaigns: number;
      activeCampaigns: number;
      totalViews: number;
      totalShares: number;
    };
    referralStats: {
      totalReferrals: number;
      totalConversions: number;
      conversionRate: number;
    };
  }

  // ============================================================================
  // API-SPECIFIC RESPONSE TYPES
  // ============================================================================

  interface MemberDashboardAnalytics {
    attendanceRate: number;
    totalMeetings: number;
    meetingsAttended: number;
    totalInteractions: number;
    engagementLevel: "HIGH" | "MEDIUM" | "LOW" | "AT_RISK";
  }

  interface MemberAnalyticsResponse {
    attendancePercentage: number;
    totalMeetings: number;
    attendedMeetings: number;
    missedMeetings: number;
    interactionCount: number;
    lastInteractionDate: string | null;
    engagementScore: number;
    memberSince: string;
    recentActivity: Array<{
      id: string;
      type: string;
      title: string;
      date: string;
      status?: string;
    }>;
  }

  interface GroupDashboardAnalytics {
    group: {
      id: string;
      name: string;
      description: string;
      leader: {
        id: string;
        name: string;
      };
    };
    summary: {
      totalMembers: number;
      totalMeetings: number;
      totalInteractions: number;
      averageAttendance: number;
      attendanceRate: number;
    };
    memberEngagement: Array<{
      memberId: string;
      memberName: string;
      totalMeetings: number;
      meetingsAttended: number;
      attendanceRate: number;
      totalInteractions: number;
      lastAttendance?: string;
    }>;
    interactionsByType: Record<string, number>;
    atRiskMembers: Array<{
      memberId: string;
      memberName: string;
      attendanceRate: number;
      lastAttendance?: string;
    }>;
    highlyEngagedMembers: Array<{
      memberId: string;
      memberName: string;
      attendanceRate: number;
      totalInteractions: number;
    }>;
  }

  interface LeaderAnalyticsResponse {
    groupName: string;
    totalMembers: number;
    activeMembers: number;
    atRiskMembers: number;
    averageAttendance: number;
    totalMeetings: number;
    meetingFrequencyAdherence: number;
    memberPerformance: Array<{
      member: User;
      attendanceRate: number;
      meetingsAttended: number;
      totalMeetings: number;
      engagementScore: number;
      status: "excellent" | "good" | "fair" | "at-risk";
    }>;
    recentTrend: "improving" | "stable" | "declining";
  }

  interface SuperadminDashboardAnalytics {
    totalUsers: number;
    totalCampuses: number;
    totalZones: number;
    totalGroups: number;
    totalCells: number;
    recentMeetings: number;
    recentInteractions: number;
    activeUsers: number;
    activeGroups: number;
    activeCampaigns: number;
  }

  interface SuperadminAnalyticsOverview {
    overview: {
      totalUsers: number;
      totalCampuses: number;
      totalZones: number;
      totalDepartments: number;
      totalGroups: number;
      totalCells: number;
      totalMeetings: number;
      totalInteractions: number;
      activeUsers: number;
      activeGroups: number;
      inactiveUsers: number;
    };
    engagementMetrics: {
      overallAttendanceRate: number;
      averageGroupSize: number;
      averageMeetingsPerGroup: number;
      totalInteractionsLastMonth: number;
    };
    atRiskMembers: Array<{
      id: string;
      name: string;
      groupId: string;
      groupName: string;
      campusName: string;
      attendanceRate: number;
      lastMeeting?: string;
      lastInteraction?: string;
    }>;
    topPerformingGroups: Array<{
      groupId: string;
      groupName: string;
      leaderName: string;
      campusName: string;
      attendanceRate: number;
      memberCount: number;
      meetingCount: number;
    }>;
    campusPerformance: Array<{
      campusId: string;
      campusName: string;
      memberCount: number;
      groupCount: number;
      attendanceRate: number;
    }>;
    interestDistribution: Record<string, number>;
  }

  interface FollowUpReminder {
    id: string;
    memberId: string;
    memberName: string;
    groupId: string;
    lastMeetingDate?: string;
    lastInteractionDate?: string;
    daysSinceLastContact: number;
    attendanceRate: number;
    status: "overdue" | "due_soon" | "at_risk";
    priority: "high" | "medium" | "low";
  }

  interface InactiveMember {
    id: string;
    name: string;
    email: string;
    phone: string;
    groupId: string;
    groupName: string;
    campusName?: string;
    lastAttendance?: string;
    lastInteraction?: string;
    daysSinceLastAttendance: number;
    totalMeetingsMissed: number;
    attendanceRate: number;
  }

  interface MeetingHistory {
    meetings: Meeting[];
    attendanceRecords: Array<{
      meetingId: string;
      date: string;
      groupName: string;
      attended: boolean;
      notes?: string;
    }>;
    summary: {
      totalMeetings: number;
      attended: number;
      missed: number;
      attendanceRate: number;
    };
  }

  // ============================================================================
  // CAMPAIGN ANALYTICS
  // ============================================================================

  interface CampaignAnalytics {
    campaignId: string;
    title: string;
    totalViews: number;
    uniqueViews: number;
    totalClicks: number;
    totalShares: number;
    totalScreenshots: number;
    skipCount: number;
    backCount: number;
    engagementRate: number;
    sharesByUser: Array<{
      userId: string;
      userName: string;
      shareCount: number;
      visitsGenerated: number;
      conversions: number;
    }>;
    interactionTimeline: Array<{
      timestamp: string;
      type: CampaignInteractionType;
      count: number;
    }>;
  }

  // ============================================================================
  // DATA VISUALIZATION TYPES
  // ============================================================================

  interface ChartDataPoint {
    label: string;
    value: number;
    color?: string;
  }

  interface TimeSeriesData {
    date: string;
    value: number;
    category?: string;
  }

  interface PerformanceMetric {
    label: string;
    current: number;
    previous: number;
    change: number;
    changePercent: number;
    trend: "up" | "down" | "stable";
  }

  // ============================================================================
  // AUTH TYPES
  // ============================================================================

  interface LoginCredentials {
    email: string;
    password: string;
  }

  interface RegisterInput extends CreateUserInput {
    confirmPassword: string;
  }

  interface AuthTokens {
    accessToken: string;
    refreshToken: string;
  }

  interface AuthUser extends Omit<User, "password"> {
    campus?: Campus;
    zone?: Zone;
    department?: Department;
    group?: Group;
    cell?: Cell;
  }

  interface AuthState {
    user: AuthUser | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
  }

  // ============================================================================
  // API RESPONSE TYPES
  // ============================================================================

  interface ApiResponse<T = unknown> {
    data?: T;
    message?: string;
    error?: string;
    success: boolean;
  }

  interface PaginatedResponse<T = unknown> {
    data: T[];
    total: number;
    page: number;
    pageSize: number;
    hasMore: boolean;
  }

  interface ApiError {
    message: string;
    code?: string;
    status?: number;
    details?: Record<string, unknown>;
  }

  // ============================================================================
  // UTILITY TYPES
  // ============================================================================

  type WithId<T> = T & { id: string };

  type WithTimestamps<T> = T & {
    createdAt: string;
    updatedAt: string;
  };

  type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

  type RequireAtLeastOne<T, Keys extends keyof T = keyof T> = Pick<
    T,
    Exclude<keyof T, Keys>
  > &
    {
      [K in Keys]-?: Required<Pick<T, K>> & Partial<Pick<T, Exclude<Keys, K>>>;
    }[Keys];

  // ============================================================================
  // FORM TYPES
  // ============================================================================

  interface LoginFormValues {
    email: string;
    password: string;
    remember?: boolean;
  }

  interface RegisterFormValues {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    whatsappPhone?: string;
    password: string;
    confirmPassword: string;
    location?: string;
    age?: number;
    maritalStatus?: MaritalStatus;
    employmentStatus?: EmploymentStatus;
    interests?: string[];
    campusId?: string;
    zoneId?: string;
    groupId?: string;
    cellId?: string;
    inviteCode?: string;
  }

  interface ProfileFormValues {
    firstName: string;
    lastName: string;
    phone: string;
    whatsappPhone?: string;
    location?: string;
    age?: number;
    maritalStatus?: MaritalStatus;
    employmentStatus?: EmploymentStatus;
    interests: string[];
  }

  interface GroupFormValues {
    name: string;
    description: string;
    meetingFrequency: MeetingFrequency;
    campusId?: string;
    zoneId?: string;
    departmentId?: string;
    leaderId?: string;
  }

  interface MeetingFormValues {
    title?: string;
    date: string;
    startTime: string;
    endTime: string;
    level: MeetingLevel;
    attendanceMethod: "count" | "checklist";
    attendeeCount?: number;
    attendeeIds?: string[];
    notes?: string;
    screenshot?: File | string;
    campusNotes?: CampusMeetingNotes;
  }

  interface CampaignFormValues {
    title: string;
    description: string;
    content: string;
    media?: File[];
    ctaText?: string;
    ctaUrl?: string;
    targetLevel?: MeetingLevel;
    targetCampusId?: string;
    targetZoneId?: string;
    publishImmediately?: boolean;
  }

  interface InteractionFormValues {
    memberId: string;
    type: InteractionType;
    notes?: string;
    timestamp?: string;
  }

  interface MembershipRequestFormValues {
    toGroupId?: string;
    toCellId?: string;
    message?: string;
  }

  // ============================================================================
  // FILTER & SORT TYPES
  // ============================================================================

  interface UserFilters {
    role?: UserRole;
    campusId?: string;
    zoneId?: string;
    departmentId?: string;
    groupId?: string;
    cellId?: string;
    isActive?: boolean;
    search?: string;
  }

  interface GroupFilters {
    campusId?: string;
    zoneId?: string;
    departmentId?: string;
    leaderId?: string;
    search?: string;
    isActive?: boolean;
  }

  interface MeetingFilters {
    level?: MeetingLevel;
    campusId?: string;
    zoneId?: string;
    departmentId?: string;
    groupId?: string;
    cellId?: string;
    dateFrom?: string;
    dateTo?: string;
    startDate?: string;
    endDate?: string;
    search?: string;
    createdById?: string;
  }

  interface CampaignFilters {
    status?: CampaignStatus;
    createdById?: string;
    targetLevel?: MeetingLevel;
    targetCampusId?: string;
    search?: string;
  }

  interface InteractionFilters {
    leaderId?: string;
    memberId?: string;
    type?: InteractionType;
    dateFrom?: string;
    dateTo?: string;
    startDate?: string;
    endDate?: string;
  }

  interface MembershipRequestFilters {
    memberId?: string;
    toGroupId?: string;
    toCellId?: string;
    status?: MembershipRequestStatus;
    type?: MembershipRequestType;
  }

  type SortOrder = "asc" | "desc";

  interface SortOptions {
    field: string;
    order: SortOrder;
  }

  interface PaginationOptions {
    page: number;
    pageSize: number;
  }

  interface QueryOptions {
    filters?: Record<string, unknown>;
    sort?: SortOptions;
    pagination?: PaginationOptions;
  }

  // ============================================================================
  // ORGANIZATIONAL HIERARCHY TYPES (NEW: Area, Community, District)
  // ============================================================================

  interface Area {
    id: string;
    name: string;
    description: string;
    zoneIds: string[];
    campusId: string;
    leaderId?: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
  }

  interface Community {
    id: string;
    name: string;
    description: string;
    areaIds: string[];
    campusId: string;
    leaderId?: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
  }

  interface District {
    id: string;
    name: string;
    description: string;
    communityIds: string[];
    campusId: string;
    leaderId?: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
  }

  interface CreateAreaInput {
    name: string;
    description: string;
    zoneIds?: string[];
    campusId: string;
    leaderId?: string;
  }

  interface UpdateAreaInput {
    name?: string;
    description?: string;
    zoneIds?: string[];
    leaderId?: string;
    isActive?: boolean;
  }

  interface CreateCommunityInput {
    name: string;
    description: string;
    areaIds?: string[];
    campusId: string;
    leaderId?: string;
  }

  interface UpdateCommunityInput {
    name?: string;
    description?: string;
    areaIds?: string[];
    leaderId?: string;
    isActive?: boolean;
  }

  interface CreateDistrictInput {
    name: string;
    description: string;
    communityIds?: string[];
    campusId: string;
    leaderId?: string;
  }

  interface UpdateDistrictInput {
    name?: string;
    description?: string;
    communityIds?: string[];
    leaderId?: string;
    isActive?: boolean;
  }

  // ============================================================================
  // REPORT TEMPLATE TYPES (Superadmin-configurable, data-driven)
  // ============================================================================

  interface ReportTemplateMetric {
    id: string;
    sectionId: string;
    name: string;
    description?: string;
    fieldType: MetricFieldType;
    isRequired: boolean;
    minValue?: number;
    maxValue?: number;
    order: number;
    /** Whether this metric captures a Monthly Goal value */
    capturesGoal: boolean;
    /** Whether this metric captures a Monthly Achieved value */
    capturesAchieved: boolean;
    /** Whether this metric captures a Year-on-Year Goal value */
    capturesYoY: boolean;
  }

  interface ReportTemplateSection {
    id: string;
    templateId: string;
    name: string;
    description?: string;
    order: number;
    isRequired: boolean;
    /** Optional sub-sections for grouping (e.g., "Church Planting" under "Report Summary") */
    subSections?: ReportTemplateSubSection[];
    metrics: ReportTemplateMetric[];
  }

  interface ReportTemplateSubSection {
    id: string;
    sectionId: string;
    name: string;
    description?: string;
    order: number;
    metrics: ReportTemplateMetric[];
  }

  interface ReportTemplate {
    id: string;
    name: string;
    description?: string;
    version: number;
    sections: ReportTemplateSection[];
    isActive: boolean;
    isDefault: boolean;
    createdById: string;
    /** Optional scope: if set, this template applies only to a specific campus */
    campusId?: string;
    /** Optional scope: if set, this template applies only to a specific group */
    groupId?: string;
    createdAt: string;
    updatedAt: string;
  }

  interface ReportTemplateVersion {
    id: string;
    templateId: string;
    versionNumber: number;
    /** Full snapshot of the template at this version */
    snapshot: ReportTemplate;
    createdAt: string;
    createdById: string;
    changeNotes?: string;
  }

  interface ReportFieldPermission {
    templateId: string;
    sectionId: string;
    role: UserRole;
    canEdit: boolean;
    canView: boolean;
  }

  interface CreateReportTemplateInput {
    name: string;
    description?: string;
    sections: CreateTemplateSectionInput[];
    isDefault?: boolean;
    campusId?: string;
    groupId?: string;
  }

  interface UpdateReportTemplateInput {
    name?: string;
    description?: string;
    sections?: CreateTemplateSectionInput[];
    isActive?: boolean;
    isDefault?: boolean;
    campusId?: string;
    groupId?: string;
    changeNotes?: string;
  }

  interface CreateTemplateSectionInput {
    name: string;
    description?: string;
    order: number;
    isRequired: boolean;
    subSections?: CreateTemplateSubSectionInput[];
    metrics: CreateTemplateMetricInput[];
  }

  interface CreateTemplateSubSectionInput {
    name: string;
    description?: string;
    order: number;
    metrics: CreateTemplateMetricInput[];
  }

  interface CreateTemplateMetricInput {
    name: string;
    description?: string;
    fieldType: MetricFieldType;
    isRequired: boolean;
    minValue?: number;
    maxValue?: number;
    order: number;
    capturesGoal: boolean;
    capturesAchieved: boolean;
    capturesYoY: boolean;
  }

  // ============================================================================
  // REPORT TYPES (Core report entities)
  // ============================================================================

  interface PeriodicReport {
    id: string;
    templateId: string;
    templateVersionId: string;
    campusId: string;
    groupId?: string;
    periodType: ReportPeriodType;
    periodYear: number;
    periodMonth: number;
    periodWeek?: number;
    status: ReportStatus;
    submittedById: string;
    reviewedById?: string;
    approvedById?: string;
    deadline: string;
    lockedAt?: string;
    /** Whether this report was created through the Data Entry interface */
    isDataEntry: boolean;
    /** The Data Entry user who created this report (if applicable) */
    dataEntryById?: string;
    /** The custom date set by Data Entry for historical reports */
    dataEntryDate?: string;
    notes?: string;
    sections: ReportSection[];
    createdAt: string;
    updatedAt: string;
  }

  interface ReportSection {
    id: string;
    reportId: string;
    templateSectionId: string;
    /** Snapshot of section name from template at creation time */
    sectionName: string;
    order: number;
    metrics: ReportMetric[];
  }

  interface ReportMetric {
    id: string;
    reportSectionId: string;
    templateMetricId: string;
    /** Snapshot of metric name from template at creation time */
    metricName: string;
    fieldType: MetricFieldType;
    monthlyGoal?: number;
    monthlyAchieved?: number;
    yoyGoal?: number;
    textValue?: string;
    /** Auto-calculated: (monthlyAchieved / monthlyGoal) * 100 */
    computedPercentage?: number;
    isLocked: boolean;
    lockedAt?: string;
    lockedById?: string;
    order: number;
  }

  interface ReportWithDetails extends PeriodicReport {
    template?: ReportTemplate;
    templateVersion?: ReportTemplateVersion;
    campus?: Campus;
    group?: SmallGroup;
    submittedBy?: UserProfile;
    reviewedBy?: UserProfile;
    approvedBy?: UserProfile;
    dataEntryBy?: UserProfile;
    events?: ReportEvent[];
    edits?: ReportEdit[];
    updateRequests?: ReportUpdateRequest[];
  }

  // ============================================================================
  // REPORT EDIT TYPES (Separate entity for revision tracking)
  // ============================================================================

  interface ReportEdit {
    id: string;
    reportId: string;
    submittedById: string;
    status: ReportEditStatus;
    reason?: string;
    sections: ReportEditSection[];
    reviewedById?: string;
    reviewNotes?: string;
    rejectionReason?: string;
    createdAt: string;
    updatedAt: string;
  }

  interface ReportEditSection {
    id: string;
    reportEditId: string;
    templateSectionId: string;
    sectionName: string;
    order: number;
    metrics: ReportEditMetric[];
  }

  interface ReportEditMetric {
    id: string;
    reportEditSectionId: string;
    templateMetricId: string;
    metricName: string;
    fieldType: MetricFieldType;
    monthlyGoal?: number;
    monthlyAchieved?: number;
    yoyGoal?: number;
    textValue?: string;
    /** The original value from the parent report (for diff display) */
    originalMonthlyGoal?: number;
    originalMonthlyAchieved?: number;
    originalYoyGoal?: number;
    originalTextValue?: string;
    order: number;
  }

  interface ReportEditWithDetails extends ReportEdit {
    report?: PeriodicReport;
    submittedBy?: UserProfile;
    reviewedBy?: UserProfile;
  }

  interface CreateReportEditInput {
    reportId: string;
    submittedById: string;
    reason?: string;
    sections: CreateReportEditSectionInput[];
  }

  interface CreateReportEditSectionInput {
    templateSectionId: string;
    sectionName: string;
    order: number;
    metrics: CreateReportEditMetricInput[];
  }

  interface CreateReportEditMetricInput {
    templateMetricId: string;
    metricName: string;
    fieldType: MetricFieldType;
    monthlyGoal?: number;
    monthlyAchieved?: number;
    yoyGoal?: number;
    textValue?: string;
    originalMonthlyGoal?: number;
    originalMonthlyAchieved?: number;
    originalYoyGoal?: number;
    order: number;
  }

  // ============================================================================
  // REPORT UPDATE REQUEST TYPES (Post-deadline changes)
  // ============================================================================

  interface ReportUpdateRequest {
    id: string;
    reportId: string;
    requestedById: string;
    reason: string;
    sections: ReportEditSection[];
    status: ReportUpdateRequestStatus;
    reviewedById?: string;
    reviewNotes?: string;
    rejectionReason?: string;
    createdAt: string;
    updatedAt: string;
  }

  interface ReportUpdateRequestWithDetails extends ReportUpdateRequest {
    report?: PeriodicReport;
    requestedBy?: UserProfile;
    reviewedBy?: UserProfile;
  }

  interface CreateReportUpdateRequestInput {
    reportId: string;
    requestedById: string;
    reason: string;
    sections: CreateReportEditSectionInput[];
  }

  // ============================================================================
  // REPORT EVENT / AUDIT TRAIL TYPES
  // ============================================================================

  interface ReportEvent {
    id: string;
    reportId: string;
    eventType: ReportEventType;
    actorId: string;
    timestamp: string;
    /** JSON details about what changed */
    details?: Record<string, unknown>;
    previousStatus?: ReportStatus;
    newStatus?: ReportStatus;
    /** Reference to a version snapshot if one was created */
    snapshotId?: string;
  }

  interface ReportEventWithDetails extends ReportEvent {
    actor?: UserProfile;
  }

  interface ReportVersion {
    id: string;
    reportId: string;
    versionNumber: number;
    /** Full snapshot of the report at this version */
    snapshot: PeriodicReport;
    createdAt: string;
    createdById: string;
    reason?: string;
  }

  // ============================================================================
  // REPORT ANALYTICS TYPES
  // ============================================================================

  interface ReportAnalytics {
    metricName: string;
    totalGoal: number;
    totalAchieved: number;
    achievementRate: number;
    yoyGrowth: number;
    reportCount: number;
  }

  interface ReportComplianceSummary {
    campusId: string;
    campusName: string;
    totalExpected: number;
    submitted: number;
    onTime: number;
    late: number;
    missing: number;
    compliancePercentage: number;
  }

  interface ReportDashboardStats {
    totalReports: number;
    draftReports: number;
    submittedReports: number;
    approvedReports: number;
    requiresEditsReports: number;
    lockedReports: number;
    overdueReports: number;
    complianceRate: number;
  }

  // ============================================================================
  // ROLE CONFIG TYPES (Data-driven role system)
  // ============================================================================

  interface RoleNavItem {
    key: string;
    label: string;
    icon: string;
    path: string;
    children?: RoleNavItem[];
  }

  interface RoleConfig {
    role: UserRole;
    label: string;
    hierarchyOrder: number;
    dashboardRoute: string;
    /** Whether this role can create new reports */
    canCreateReports: boolean;
    /** Whether this role can review reports */
    canReviewReports: boolean;
    /** Whether this role can approve reports */
    canApproveReports: boolean;
    /** Whether this role can manage report templates */
    canManageTemplates: boolean;
    /** Whether this role has data entry capabilities */
    canDataEntry: boolean;
    /** Scope of report visibility: 'all' | 'group' | 'campus' | 'own' */
    reportVisibilityScope: "all" | "group" | "campus" | "own" | "none";
    /** Navigation items for this role */
    navItems: RoleNavItem[];
    /** Whether this role is a leadership role */
    isLeadership: boolean;
    /** Route prefix for this role */
    routePrefix: string;
  }

  // ============================================================================
  // ORG HIERARCHY CONFIG TYPES (Data-driven org structure)
  // ============================================================================

  interface OrgLevelConfig {
    level: string;
    label: string;
    pluralLabel: string;
    parentLevel: string | null;
    childLevel: string | null;
    membersPerUnit: number;
    leaderRole: UserRole | null;
    hasAdmin: boolean;
    hasPastor: boolean;
    /** Whether entities at this level can have geolocation (address, lat, lng, phone) */
    hasLocation: boolean;
    /** Whether entities at this level have a meeting frequency */
    hasMeetingFrequency: boolean;
    /** Whether entities at this level have invite codes */
    hasInviteCode: boolean;
    /** Whether entities at this level track member counts */
    hasMemberCount: boolean;
    /** Whether entities at this level can belong to a department */
    hasDepartment: boolean;
    /** Whether entities at this level have a country field */
    hasCountry: boolean;
    /** Whether entities at this level have a region field */
    hasRegion: boolean;
  }

  // ============================================================================
  // DEPARTMENT CONFIG TYPES (Data-driven department registry)
  // ============================================================================

  interface DepartmentConfig {
    /** Stable key used as ID prefix (e.g. "worship" → "dept-worship") */
    key: string;
    /** Display name */
    name: string;
    /** Short description of the department's focus */
    description: string;
    /** Default icon key for UI rendering */
    icon: string;
    /** Whether this department is available across all campuses */
    isGlobal: boolean;
  }

  // ============================================================================
  // REPORT FORM & FILTER TYPES
  // ============================================================================

  interface ReportFilters {
    campusId?: string;
    groupId?: string;
    periodType?: ReportPeriodType;
    periodYear?: number;
    periodMonth?: number;
    periodWeek?: number;
    status?: ReportStatus;
    templateId?: string;
    search?: string;
    isDataEntry?: boolean;
    submittedById?: string;
    dateFrom?: string;
    dateTo?: string;
  }

  interface ReportFormValues {
    templateId: string;
    campusId: string;
    groupId?: string;
    periodType: ReportPeriodType;
    periodYear: number;
    periodMonth: number;
    periodWeek?: number;
    notes?: string;
    /** For data entry: the actual date this report covers */
    dataEntryDate?: string;
    /** Section metric values keyed by metricId */
    metrics: Record<string, {
      monthlyGoal?: number;
      monthlyAchieved?: number;
      yoyGoal?: number;
      textValue?: string;
    }>;
  }

  interface ReportTemplateFormValues {
    name: string;
    description?: string;
    isDefault: boolean;
    campusId?: string;
    groupId?: string;
    sections: Array<{
      name: string;
      description?: string;
      order: number;
      isRequired: boolean;
      subSections?: Array<{
        name: string;
        description?: string;
        order: number;
        metrics: Array<{
          name: string;
          description?: string;
          fieldType: MetricFieldType;
          isRequired: boolean;
          minValue?: number;
          maxValue?: number;
          order: number;
          capturesGoal: boolean;
          capturesAchieved: boolean;
          capturesYoY: boolean;
        }>;
      }>;
      metrics: Array<{
        name: string;
        description?: string;
        fieldType: MetricFieldType;
        isRequired: boolean;
        minValue?: number;
        maxValue?: number;
        order: number;
        capturesGoal: boolean;
        capturesAchieved: boolean;
        capturesYoY: boolean;
      }>;
    }>;
  }

  interface CreateReportInput {
    templateId: string;
    templateVersionId: string;
    campusId: string;
    groupId?: string;
    periodType: ReportPeriodType;
    periodYear: number;
    periodMonth: number;
    periodWeek?: number;
    submittedById: string;
    deadline: string;
    notes?: string;
    isDataEntry?: boolean;
    dataEntryById?: string;
    dataEntryDate?: string;
    sections?: CreateReportSectionInput[];
  }

  interface CreateReportSectionInput {
    templateSectionId: string;
    sectionName: string;
    order: number;
    metrics: CreateReportMetricInput[];
  }

  interface CreateReportMetricInput {
    templateMetricId: string;
    metricName: string;
    fieldType: MetricFieldType;
    monthlyGoal?: number;
    monthlyAchieved?: number;
    yoyGoal?: number;
    textValue?: string;
    order: number;
  }

  interface UpdateReportInput {
    notes?: string;
    sections?: CreateReportSectionInput[];
  }

  interface FormField {
    id: string;
    name: string;
    label: string;
    type: FormFieldType;
    placeholder?: string;
    helpText?: string;
    isRequired: boolean;
    strategicIndicatorId?: string;
    options?: FormFieldOption[];
    acceptedFileTypes?: string[];
    maxFileSize?: number;
    maxFiles?: number;
    uploadFolder?: string;
    minValue?: number;
    maxValue?: number;
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    lockAfterSubmission?: boolean;
    lockAfterDate?: boolean;
    lockingConfig?: FormFieldLockingConfig;
    displayOrder: number;
  }

  interface FormSection {
    id: string;
    title: string;
    description?: string;
    displayOrder: number;
    fields: FormField[];
  }

  interface ValidationRule {
    fieldId: string;
    ruleType: ValidationRuleType;
    value?: string | number | boolean;
    errorMessage: string;
  }

  interface FormDefinition {
    sections: FormSection[];
    validationRules: ValidationRule[];
  }

  // --- Report Type ---

  interface ReportType {
    id: string;
    name: string;
    description?: string;
    code: string;
    category: ReportCategory;
    formDefinition: FormDefinition;
    allowedSubmitterRoles: string[];
    allowedReviewerRoles: string[];
    frequency: ReportFrequency;
    organizationalLevel?: OrganizationalLevel;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
  }

  // --- Strategic Indicator ---

  interface StrategicIndicator {
    id: string;
    name: string;
    description?: string;
    category: StrategicIndicatorCategory;
    isActive: boolean;
    displayOrder: number;
    applicableRoles?: string[];
    campusLevel: boolean;
    groupLevel: boolean;
    keyMetrics?: KeyMetric[];
    createdAt: string;
    updatedAt: string;
  }

  // --- Key Metric ---

  interface KeyMetric {
    id: string;
    strategicIndicatorId: string;
    name: string;
    description?: string;
    dataType: MetricDataType;
    unit?: string;
    isRequired: boolean;
    minValue?: number;
    maxValue?: number;
    allowNegative: boolean;
    autoCalculate: boolean;
    calculationFormula?: string;
    displayOrder: number;
    isActive: boolean;
    strategicIndicator?: StrategicIndicator;
    createdAt: string;
    updatedAt: string;
  }

  // --- Report Submission ---

  interface ReportSubmission {
    id: string;
    reportTypeId: string;
    reportYear: number;
    reportMonth: number;
    reportWeek?: number;
    periodStartDate: string;
    periodEndDate: string;
    submittedById: string;
    submitterRole: string;
    organizationalLevelType: OrganizationalLevel;
    organizationalUnitId: string;
    formData: Record<string, unknown>;
    status: ReportStatus;
    reviewedById?: string;
    reviewedAt?: string;
    reviewerNotes?: string;
    approvedById?: string;
    approvedAt?: string;
    approverNotes?: string;
    finalReviewedById?: string;
    finalReviewedAt?: string;
    finalReviewerRole?: string;
    submittedAt?: string;
    lastEditedAt?: string;
    isLocked: boolean;
    reportType?: ReportType;
    metricEntries?: MetricEntry[];
    comments?: ReportComment[];
    submittedBy?: User;
    createdAt: string;
    updatedAt: string;
  }

  // --- Metric Entry ---

  interface MetricEntry {
    id: string;
    reportSubmissionId: string;
    keyMetricId: string;
    strategicIndicatorId: string;
    monthlyGoal?: number;
    monthlyAchieved?: number;
    yearOnYearGoal?: number;
    performancePercentage?: number;
    variance?: number;
    monthlyGoalLocked: boolean;
    monthlyAchievedLocked: boolean;
    yearOnYearGoalLocked: boolean;
    lastSavedAt: string;
    keyMetric?: KeyMetric;
    strategicIndicator?: StrategicIndicator;
    reportSubmission?: ReportSubmission;
    createdAt: string;
    updatedAt: string;
  }

  // --- Report Comment ---

  interface ReportComment {
    id: string;
    reportSubmissionId: string;
    userId: string;
    userRole: string;
    commentType: ReportCommentType;
    content: string;
    metricEntryId?: string;
    isInternal: boolean;
    user?: User;
    reportSubmission?: ReportSubmission;
    createdAt: string;
    updatedAt: string;
  }

  // --- Referral Link ---

  interface ReferralLink {
    id: string;
    code: string;
    createdById: string;
    createdByRole: string;
    assignedRole: string;
    organizationalLevelType?: OrganizationalLevel;
    organizationalUnitId?: string;
    isUsed: boolean;
    usedById?: string;
    usedAt?: string;
    expiresAt?: string;
    isActive: boolean;
    createdBy?: User;
    usedBy?: User;
    createdAt: string;
    updatedAt: string;
  }

  // --- Report Notification ---

  interface ReportNotification {
    id: string;
    userId: string;
    reportSubmissionId: string;
    notificationType: ReportNotificationKind;
    title: string;
    message: string;
    isRead: boolean;
    readAt?: string;
    emailSent: boolean;
    emailSentAt?: string;
    user?: User;
    reportSubmission?: ReportSubmission;
    createdAt: string;
  }

  // --- Create/Update Inputs ---

  interface CreateReportSubmissionInput {
    reportTypeId: string;
    reportYear: number;
    reportMonth: number;
    reportWeek?: number;
    periodStartDate: string;
    periodEndDate: string;
    organizationalLevelType: OrganizationalLevel;
    organizationalUnitId: string;
    formData: Record<string, unknown>;
  }

  interface UpdateReportSubmissionInput {
    formData?: Record<string, unknown>;
    status?: ReportStatus;
    reviewerNotes?: string;
    approverNotes?: string;
  }

  interface CreateReportCommentInput {
    commentType: ReportCommentType;
    content: string;
    metricEntryId?: string;
    isInternal?: boolean;
  }

  interface CreateReferralLinkInput {
    assignedRole: string;
    organizationalLevelType?: OrganizationalLevel;
    organizationalUnitId?: string;
    expiresInDays?: number;
  }

  interface CreateMetricEntryInput {
    keyMetricId: string;
    strategicIndicatorId: string;
    monthlyGoal?: number;
    monthlyAchieved?: number;
    yearOnYearGoal?: number;
  }

  // --- Reporting Filters ---

  interface ReportSubmissionFilters {
    reportTypeId?: string;
    reportTypeCode?: string;
    status?: ReportStatus;
    submittedById?: string;
    organizationalLevelType?: OrganizationalLevel;
    organizationalUnitId?: string;
    reportYear?: number;
    reportMonth?: number;
    reportWeek?: number;
    search?: string;
  }

  interface ReportTypeFilters {
    category?: ReportCategory;
    frequency?: ReportFrequency;
    organizationalLevel?: OrganizationalLevel;
    isActive?: boolean;
    search?: string;
  }

  // --- Reporting Analytics ---

  interface ReportComplianceMetrics {
    totalExpected: number;
    totalSubmitted: number;
    onTime: number;
    late: number;
    pending: number;
    missing: number;
    complianceRate: number;
  }

  interface ReportPerformanceMetrics {
    organizationalUnitId: string;
    organizationalUnitName: string;
    levelType: OrganizationalLevel;
    totalSubmissions: number;
    averagePerformance: number;
    metricBreakdown: Array<{
      metricName: string;
      goal: number;
      achieved: number;
      performancePercentage: number;
    }>;
  }

  interface ReportAnalyticsOverview {
    compliance: ReportComplianceMetrics;
    topPerformers: ReportPerformanceMetrics[];
    areasNeedingSupport: ReportPerformanceMetrics[];
    submissionsByStatus: Record<string, number>;
    trendData: Array<{
      period: string;
      submissions: number;
      complianceRate: number;
    }>;
  }
} // End of declare global

// ============================================================================
// MODULE EXPORTS (for use as values, not types)
// ============================================================================
// Export statement to ensure this file is treated as a module
export { };
