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

enum UserRole {
  SUPERADMIN = "SUPERADMIN",
  LEADER = "LEADER",
  MEMBER = "MEMBER",
}

enum Gender {
  MALE = "MALE",
  FEMALE = "FEMALE",
}

enum EmploymentStatus {
  STUDENT = "STUDENT",
  SELF_EMPLOYED = "SELF_EMPLOYED",
  EMPLOYED = "EMPLOYED",
  UNEMPLOYED = "UNEMPLOYED",
  RETIRED = "RETIRED",
}

enum MaritalStatus {
  SINGLE = "SINGLE",
  MARRIED = "MARRIED",
  DIVORCED = "DIVORCED",
  WIDOWED = "WIDOWED",
}

enum MeetingFrequency {
  WEEKLY = "WEEKLY",
  BIWEEKLY = "BIWEEKLY",
  MONTHLY = "MONTHLY",
}

enum InteractionType {
  CALL = "CALL",
  FOLLOW_UP = "FOLLOW_UP",
  CHECK_IN = "CHECK_IN",
}

enum MembershipRequestType {
  JOIN = "JOIN",
  TRANSFER = "TRANSFER",
}

enum MembershipRequestStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
}

enum NotificationType {
  MEETING_REMINDER = "MEETING_REMINDER",
  REQUEST_STATUS = "REQUEST_STATUS",
  ROLE_ASSIGNMENT = "ROLE_ASSIGNMENT",
  FOLLOW_UP_REMINDER = "FOLLOW_UP_REMINDER",
  NEW_REQUEST = "NEW_REQUEST",
}

// ============================================================================
// USER TYPES
// ============================================================================

interface User {
  id: string;
  email: string;
  password: string; // Bcrypt hashed
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
  groupId?: string;
  avatar?: string; // Cloudinary URL or base64 in mock
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface UserProfile extends Omit<User, "password"> {
  group?: Group;
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
  groupId?: string;
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
  // Admin fields
  groupId?: string;
  isActive?: boolean;
  role?: UserRole;
}

// ============================================================================
// GROUP TYPES
// ============================================================================

interface Group {
  id: string;
  name: string;
  description: string;
  meetingFrequency: MeetingFrequency;
  leaderId: string;
  memberCount: number;
  createdAt: string;
  updatedAt: string;
}

interface GroupWithDetails extends Group {
  leader: UserProfile;
  members: UserProfile[];
  recentMeetings: Meeting[];
  attendanceRate?: number;
}

interface CreateGroupInput {
  name: string;
  description: string;
  meetingFrequency: MeetingFrequency;
  leaderId: string;
}

interface UpdateGroupInput {
  name?: string;
  description?: string;
  meetingFrequency?: MeetingFrequency;
  leaderId?: string;
}

// ============================================================================
// MEETING TYPES
// ============================================================================

interface Meeting {
  id: string;
  groupId: string;
  date: string; // ISO date
  startTime: string;
  endTime: string;
  attendeeCount: number;
  attendeeIds: string[];
  screenshotUrl?: string; // Cloudinary URL or base64
  notes?: string;
  createdById: string;
  createdAt: string;
  updatedAt: string;
}

interface MeetingWithDetails extends Meeting {
  group: Group;
  createdBy: UserProfile;
  attendees: UserProfile[];
}

interface CreateMeetingInput {
  groupId: string;
  date: string;
  startTime: string;
  endTime: string;
  attendeeCount?: number;
  attendeeIds?: string[];
  screenshotUrl?: string;
  notes?: string;
}

interface UpdateMeetingInput {
  date?: string;
  startTime?: string;
  endTime?: string;
  attendeeCount?: number;
  attendeeIds?: string[];
  screenshotUrl?: string;
  notes?: string;
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
  toGroupId: string;
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
  toGroup: Group;
  respondedBy?: UserProfile;
}

interface CreateMembershipRequestInput {
  toGroupId: string;
  fromGroupId?: string;
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
  relatedId?: string; // Meeting ID, Request ID, etc.
  read: boolean;
  createdAt: string;
}

interface NotificationWithDetails extends appNotification {
  user: UserProfile;
}

// ============================================================================
// ANALYTICS TYPES
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

interface ChurchWideAnalytics {
  totalMembers: number;
  activeMembers: number;
  inactiveMembers: number;
  totalGroups: number;
  activeGroups: number;
  totalMeetings: number;
  overallAttendanceRate: number;
  averageEngagementScore: number;
  atRiskMemberCount: number;
  interestDistribution: Record<string, number>;
  groupPerformance: Array<{
    groupId: string;
    groupName: string;
    attendanceRate: number;
    memberCount: number;
  }>;
}

// ============================================================================
// API-SPECIFIC RESPONSE TYPES
// ============================================================================

// Member Dashboard & Analytics
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

// Group/Leader Dashboard & Analytics
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

// Superadmin Dashboard & Analytics
interface SuperadminDashboardAnalytics {
  totalUsers: number;
  totalGroups: number;
  recentMeetings: number;
  recentInteractions: number;
  activeUsers: number;
  activeGroups: number;
}

interface SuperadminAnalyticsOverview {
  overview: {
    totalUsers: number;
    totalGroups: number;
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
    attendanceRate: number;
    lastMeeting?: string;
    lastInteraction?: string;
  }>;
  topPerformingGroups: Array<{
    groupId: string;
    groupName: string;
    leaderName: string;
    attendanceRate: number;
    memberCount: number;
    meetingCount: number;
  }>;
  interestDistribution: Record<string, number>;
}

// Follow-up Types
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
  lastAttendance?: string;
  lastInteraction?: string;
  daysSinceLastAttendance: number;
  totalMeetingsMissed: number;
  attendanceRate: number;
}

// Meeting History
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
  group?: Group;
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
  groupId?: string;
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
  leaderId?: string;
}

interface MeetingFormValues {
  date: string;
  startTime: string;
  endTime: string;
  attendanceMethod: "count" | "checklist";
  attendeeCount?: number;
  attendeeIds?: string[];
  notes?: string;
  screenshot?: File | string;
}

interface InteractionFormValues {
  memberId: string;
  type: InteractionType;
  notes?: string;
  timestamp?: string;
}

interface MembershipRequestFormValues {
  toGroupId: string;
  message?: string;
}

// ============================================================================
// FILTER & SORT TYPES
// ============================================================================

interface UserFilters {
  role?: UserRole;
  groupId?: string;
  isActive?: boolean;
  search?: string;
}

interface GroupFilters {
  leaderId?: string;
  search?: string;
}

interface MeetingFilters {
  groupId?: string;
  dateFrom?: string;
  dateTo?: string;
  createdById?: string;
}

interface InteractionFilters {
  leaderId?: string;
  memberId?: string;
  type?: InteractionType;
  dateFrom?: string;
  dateTo?: string;
}

interface MembershipRequestFilters {
  memberId?: string;
  toGroupId?: string;
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
