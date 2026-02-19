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
  // Administrative / reporting leadership roles
  SPO = "SPO",
  CHURCH_MINISTRY = "CHURCH_MINISTRY",
  GROUP_ADMIN = "GROUP_ADMIN",
  // Organizational hierarchy leaders (highest → lowest)
  GROUP_LEADER = "GROUP_LEADER",
  CAMPUS_PASTOR = "CAMPUS_PASTOR",
  CAMPUS_LEADER = "CAMPUS_LEADER",
  DISTRICT_LEADER = "DISTRICT_LEADER",
  COMMUNITY_LEADER = "COMMUNITY_LEADER",
  AREA_LEADER = "AREA_LEADER",
  ZONE_LEADER = "ZONE_LEADER",
  CELL_LEADER = "CELL_LEADER",
  // Regular member
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
// REPORTING SYSTEM ENUMS
// ============================================================================

export enum ReportStatus {
  DRAFT = "DRAFT",
  SUBMITTED = "SUBMITTED",
  REQUIRES_EDITS = "REQUIRES_EDITS",
  APPROVED = "APPROVED",
  REVIEWED = "REVIEWED",
  FINALIZED = "FINALIZED",
}

export enum ReportCategory {
  CAMPUS = "CAMPUS",
  GROUP = "GROUP",
  MINISTRY = "MINISTRY",
  SPECIAL = "SPECIAL",
}

export enum ReportFrequency {
  WEEKLY = "WEEKLY",
  MONTHLY = "MONTHLY",
  QUARTERLY = "QUARTERLY",
  YEARLY = "YEARLY",
  AD_HOC = "AD_HOC",
}

export enum FormFieldType {
  TEXT = "TEXT",
  NUMBER = "NUMBER",
  DATE = "DATE",
  SELECT = "SELECT",
  TEXTAREA = "TEXTAREA",
  CHECKBOX = "CHECKBOX",
  STRATEGIC_INDICATOR = "STRATEGIC_INDICATOR",
  FILE_UPLOAD = "FILE_UPLOAD",
  MULTI_FILE_UPLOAD = "MULTI_FILE_UPLOAD",
}

export enum OrganizationalLevel {
  CELL = "CELL",
  ZONE = "ZONE",
  AREA = "AREA",
  COMMUNITY = "COMMUNITY",
  DISTRICT = "DISTRICT",
  CAMPUS = "CAMPUS",
  GROUP = "GROUP",
}

export enum StrategicIndicatorCategory {
  MEMBERSHIP = "MEMBERSHIP",
  ATTENDANCE = "ATTENDANCE",
  FINANCE = "FINANCE",
  PROGRAMS = "PROGRAMS",
  OUTREACH = "OUTREACH",
}

export enum MetricDataType {
  NUMBER = "NUMBER",
  PERCENTAGE = "PERCENTAGE",
  CURRENCY = "CURRENCY",
}

export enum ReportCommentType {
  FEEDBACK = "FEEDBACK",
  REQUEST_EDIT = "REQUEST_EDIT",
  APPROVAL_NOTE = "APPROVAL_NOTE",
  CLARIFICATION = "CLARIFICATION",
}

export enum ReportNotificationKind {
  REPORT_SUBMITTED = "REPORT_SUBMITTED",
  EDITS_REQUESTED = "EDITS_REQUESTED",
  REPORT_APPROVED = "REPORT_APPROVED",
  AVAILABLE_FOR_REVIEW = "AVAILABLE_FOR_REVIEW",
  DEADLINE_APPROACHING = "DEADLINE_APPROACHING",
}

export enum ValidationRuleType {
  REQUIRED = "REQUIRED",
  MIN = "MIN",
  MAX = "MAX",
  PATTERN = "PATTERN",
  CUSTOM = "CUSTOM",
}

// ============================================================================
// HIERARCHY LEVEL - ordered from highest to lowest
// ============================================================================

export const HIERARCHY_ORDER: Record<UserRole, number> = {
  [UserRole.SUPERADMIN]: 0,
  [UserRole.SPO]: 1,
  [UserRole.CHURCH_MINISTRY]: 1,
  [UserRole.GROUP_ADMIN]: 2,
  [UserRole.GROUP_LEADER]: 3,
  [UserRole.CAMPUS_PASTOR]: 4,
  [UserRole.CAMPUS_LEADER]: 4,
  [UserRole.DISTRICT_LEADER]: 5,
  [UserRole.COMMUNITY_LEADER]: 6,
  [UserRole.AREA_LEADER]: 7,
  [UserRole.ZONE_LEADER]: 8,
  [UserRole.CELL_LEADER]: 9,
  [UserRole.MEMBER]: 10,
};

// ============================================================================
// GLOBAL TYPE DECLARATIONS
// ============================================================================
// All interfaces and types below are globally available without imports
// ============================================================================

declare global {
  // ============================================================================
  // ORGANIZATIONAL UNIT TYPES
  // ============================================================================

  interface Campus {
    id: string;
    name: string;
    description: string;
    location: string;
    country: string;
    zoneId: string;
    adminId: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
  }

  interface Zone {
    id: string;
    name: string;
    description: string;
    region?: string;
    leaderId: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
  }

  interface Department {
    id: string;
    name: string;
    description: string;
    campusId: string;
    zoneId?: string;
    leaderId: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
  }

  interface SmallGroup {
    id: string;
    name: string;
    description: string;
    campusId: string;
    zoneId: string;
    departmentId?: string;
    leaderId: string;
    meetingFrequency: MeetingFrequency;
    memberCount: number;
    inviteCode?: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
  }

  interface Cell {
    id: string;
    name: string;
    description: string;
    campusId: string;
    zoneId: string;
    departmentId?: string;
    groupId: string;
    leaderId: string;
    meetingFrequency: MeetingFrequency;
    memberCount: number;
    inviteCode?: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
  }

  // ============================================================================
  // ORG UNIT WITH DETAILS
  // ============================================================================

  interface CampusWithDetails extends Campus {
    zone: Zone;
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
    zone?: Zone;
    leader?: UserProfile;
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
    zoneId: string;
    adminId: string;
  }

  interface UpdateCampusInput {
    name?: string;
    description?: string;
    location?: string;
    country?: string;
    zoneId?: string;
    adminId?: string;
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
    leaderId: string;
  }

  interface UpdateDepartmentInput {
    name?: string;
    description?: string;
    campusId?: string;
    zoneId?: string;
    leaderId?: string;
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
  // GROUP TYPES (BACKWARD COMPAT - MAPS TO SmallGroup)
  // ============================================================================

  // Group is an alias for SmallGroup (maintained for backward compatibility)
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

  interface appNotification {
    id: string;
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
    relatedId?: string;
    read: boolean;
    createdAt: string;
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
  // REPORTING SYSTEM TYPES
  // ============================================================================

  // --- Form Definition Types ---

  interface FormFieldOption {
    label: string;
    value: string;
  }

  interface FormFieldLockingConfig {
    lockAfterSubmit?: boolean;
    lockAfterDate?: string;
    lockAfterValue?: boolean;
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
export {};
