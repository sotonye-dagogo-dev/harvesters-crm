// ============================================================================
// CONSTANTS FOR CHURCH FELLOWSHIP CRM
// ============================================================================

// ============================================================================
// USER ROLES (7-TIER HIERARCHY)
// ============================================================================

export const USER_ROLES = {
  SUPERADMIN: "SUPERADMIN" as const,
  ZONAL_LEADER: "ZONAL_LEADER" as const,
  CAMPUS_ADMIN: "CAMPUS_ADMIN" as const,
  HOD: "HOD" as const,
  SMALL_GROUP_LEADER: "SMALL_GROUP_LEADER" as const,
  CELL_LEADER: "CELL_LEADER" as const,
  MEMBER: "MEMBER" as const,
};

export const USER_ROLE_LABELS: Record<string, string> = {
  [USER_ROLES.SUPERADMIN]: "Super Admin",
  [USER_ROLES.ZONAL_LEADER]: "Zonal Leader",
  [USER_ROLES.CAMPUS_ADMIN]: "Campus Admin",
  [USER_ROLES.HOD]: "Head of Department",
  [USER_ROLES.SMALL_GROUP_LEADER]: "Small Group Leader",
  [USER_ROLES.CELL_LEADER]: "Cell Leader",
  [USER_ROLES.MEMBER]: "Member",
};

/** Hierarchy order: lower number = higher authority */
export const HIERARCHY_ORDER: Record<string, number> = {
  [USER_ROLES.SUPERADMIN]: 0,
  [USER_ROLES.ZONAL_LEADER]: 1,
  [USER_ROLES.CAMPUS_ADMIN]: 2,
  [USER_ROLES.HOD]: 3,
  [USER_ROLES.SMALL_GROUP_LEADER]: 4,
  [USER_ROLES.CELL_LEADER]: 5,
  [USER_ROLES.MEMBER]: 6,
};

/** Returns true if roleA is above roleB in the hierarchy */
export const isAboveInHierarchy = (roleA: string, roleB: string): boolean => {
  return (HIERARCHY_ORDER[roleA] ?? 99) < (HIERARCHY_ORDER[roleB] ?? 99);
};

/** Returns true if the role is a leadership role (not regular member) */
export const isLeadershipRole = (role: string): boolean => {
  return role !== USER_ROLES.MEMBER;
};

/** Returns the roles that are below a given role in the hierarchy */
export const getRolesBelow = (role: string): string[] => {
  const order = HIERARCHY_ORDER[role] ?? 99;
  return Object.entries(HIERARCHY_ORDER)
    .filter(([, v]) => v > order)
    .map(([k]) => k);
};

/** Returns the roles that are at or below a given role */
export const getRolesAtOrBelow = (role: string): string[] => {
  const order = HIERARCHY_ORDER[role] ?? 99;
  return Object.entries(HIERARCHY_ORDER)
    .filter(([, v]) => v >= order)
    .map(([k]) => k);
};

// ============================================================================
// MEETING LEVELS
// ============================================================================

export const MEETING_LEVELS = {
  ALL: "ALL" as const,
  ZONE: "ZONE" as const,
  CAMPUS: "CAMPUS" as const,
  DEPARTMENT: "DEPARTMENT" as const,
  SMALL_GROUP: "SMALL_GROUP" as const,
  CELL: "CELL" as const,
};

export const MEETING_LEVEL_LABELS: Record<string, string> = {
  [MEETING_LEVELS.ALL]: "All Members (Church-wide)",
  [MEETING_LEVELS.ZONE]: "Zone Level",
  [MEETING_LEVELS.CAMPUS]: "Campus Level",
  [MEETING_LEVELS.DEPARTMENT]: "Department Level",
  [MEETING_LEVELS.SMALL_GROUP]: "Small Group Level",
  [MEETING_LEVELS.CELL]: "Cell Level",
};

/** Which roles can create meetings at which levels */
export const MEETING_LEVEL_PERMISSIONS: Record<string, string[]> = {
  [USER_ROLES.SUPERADMIN]: [
    MEETING_LEVELS.ALL,
    MEETING_LEVELS.ZONE,
    MEETING_LEVELS.CAMPUS,
    MEETING_LEVELS.DEPARTMENT,
    MEETING_LEVELS.SMALL_GROUP,
    MEETING_LEVELS.CELL,
  ],
  [USER_ROLES.ZONAL_LEADER]: [
    MEETING_LEVELS.ZONE,
    MEETING_LEVELS.CAMPUS,
    MEETING_LEVELS.DEPARTMENT,
    MEETING_LEVELS.SMALL_GROUP,
    MEETING_LEVELS.CELL,
  ],
  [USER_ROLES.CAMPUS_ADMIN]: [
    MEETING_LEVELS.CAMPUS,
    MEETING_LEVELS.DEPARTMENT,
    MEETING_LEVELS.SMALL_GROUP,
    MEETING_LEVELS.CELL,
  ],
  [USER_ROLES.HOD]: [
    MEETING_LEVELS.DEPARTMENT,
    MEETING_LEVELS.SMALL_GROUP,
    MEETING_LEVELS.CELL,
  ],
  [USER_ROLES.SMALL_GROUP_LEADER]: [
    MEETING_LEVELS.SMALL_GROUP,
    MEETING_LEVELS.CELL,
  ],
  [USER_ROLES.CELL_LEADER]: [MEETING_LEVELS.CELL],
  [USER_ROLES.MEMBER]: [],
};

// ============================================================================
// CAMPAIGN CONSTANTS
// ============================================================================

export const CAMPAIGN_STATUS = {
  DRAFT: "DRAFT" as const,
  ACTIVE: "ACTIVE" as const,
  EXPIRED: "EXPIRED" as const,
  ARCHIVED: "ARCHIVED" as const,
};

export const CAMPAIGN_STATUS_LABELS: Record<string, string> = {
  [CAMPAIGN_STATUS.DRAFT]: "Draft",
  [CAMPAIGN_STATUS.ACTIVE]: "Active",
  [CAMPAIGN_STATUS.EXPIRED]: "Expired",
  [CAMPAIGN_STATUS.ARCHIVED]: "Archived",
};

export const CAMPAIGN_MEDIA_TYPES = {
  IMAGE: "IMAGE" as const,
  VIDEO: "VIDEO" as const,
  LINK: "LINK" as const,
  TEXT: "TEXT" as const,
};

export const CAMPAIGN_INTERACTION_TYPES = {
  VIEW: "VIEW" as const,
  CLICK: "CLICK" as const,
  SHARE: "SHARE" as const,
  SCREENSHOT: "SCREENSHOT" as const,
  SKIP: "SKIP" as const,
  BACK: "BACK" as const,
  LINK_CLICK: "LINK_CLICK" as const,
};

/** Campaign display duration in milliseconds (24 hours) */
export const CAMPAIGN_DURATION_MS = 24 * 60 * 60 * 1000;

// ============================================================================
// INVITE LINK TYPES
// ============================================================================

export const INVITE_LINK_TYPES = {
  CAMPUS: "CAMPUS" as const,
  ZONE: "ZONE" as const,
  DEPARTMENT: "DEPARTMENT" as const,
  SMALL_GROUP: "SMALL_GROUP" as const,
  CELL: "CELL" as const,
  MEETING: "MEETING" as const,
  CAMPAIGN: "CAMPAIGN" as const,
};

export const INVITE_LINK_TYPE_LABELS: Record<string, string> = {
  [INVITE_LINK_TYPES.CAMPUS]: "Campus Invite",
  [INVITE_LINK_TYPES.ZONE]: "Zone Invite",
  [INVITE_LINK_TYPES.DEPARTMENT]: "Department Invite",
  [INVITE_LINK_TYPES.SMALL_GROUP]: "Small Group Invite",
  [INVITE_LINK_TYPES.CELL]: "Cell Invite",
  [INVITE_LINK_TYPES.MEETING]: "Meeting Invite",
  [INVITE_LINK_TYPES.CAMPAIGN]: "Campaign Share",
};

// ============================================================================
// EMPLOYMENT STATUS
// ============================================================================

export const EMPLOYMENT_STATUS = {
  STUDENT: "STUDENT" as const,
  SELF_EMPLOYED: "SELF_EMPLOYED" as const,
  EMPLOYED: "EMPLOYED" as const,
  UNEMPLOYED: "UNEMPLOYED" as const,
  RETIRED: "RETIRED" as const,
};

export const EMPLOYMENT_STATUS_LABELS: Record<string, string> = {
  [EMPLOYMENT_STATUS.STUDENT]: "Student",
  [EMPLOYMENT_STATUS.SELF_EMPLOYED]: "Self-Employed",
  [EMPLOYMENT_STATUS.EMPLOYED]: "Employed",
  [EMPLOYMENT_STATUS.UNEMPLOYED]: "Unemployed",
  [EMPLOYMENT_STATUS.RETIRED]: "Retired",
};

// ============================================================================
// MARITAL STATUS
// ============================================================================

export const MARITAL_STATUS = {
  SINGLE: "SINGLE" as const,
  MARRIED: "MARRIED" as const,
  DIVORCED: "DIVORCED" as const,
  WIDOWED: "WIDOWED" as const,
};

export const MARITAL_STATUS_LABELS: Record<string, string> = {
  [MARITAL_STATUS.SINGLE]: "Single",
  [MARITAL_STATUS.MARRIED]: "Married",
  [MARITAL_STATUS.DIVORCED]: "Divorced",
  [MARITAL_STATUS.WIDOWED]: "Widowed",
};

// ============================================================================
// MEETING FREQUENCY
// ============================================================================

export const MEETING_FREQUENCY = {
  WEEKLY: "WEEKLY" as const,
  BIWEEKLY: "BIWEEKLY" as const,
  MONTHLY: "MONTHLY" as const,
};

export const MEETING_FREQUENCY_LABELS: Record<string, string> = {
  [MEETING_FREQUENCY.WEEKLY]: "Weekly",
  [MEETING_FREQUENCY.BIWEEKLY]: "Biweekly (Every 2 weeks)",
  [MEETING_FREQUENCY.MONTHLY]: "Monthly",
};

// ============================================================================
// INTERACTION TYPES
// ============================================================================

export const INTERACTION_TYPES = {
  CALL: "CALL" as const,
  FOLLOW_UP: "FOLLOW_UP" as const,
  CHECK_IN: "CHECK_IN" as const,
};

export const INTERACTION_TYPE_LABELS: Record<string, string> = {
  [INTERACTION_TYPES.CALL]: "Phone Call",
  [INTERACTION_TYPES.FOLLOW_UP]: "Follow-up",
  [INTERACTION_TYPES.CHECK_IN]: "Check-in",
};

// ============================================================================
// MEMBERSHIP REQUEST
// ============================================================================

export const MEMBERSHIP_REQUEST_TYPES = {
  JOIN: "JOIN" as const,
  TRANSFER: "TRANSFER" as const,
};

export const MEMBERSHIP_REQUEST_TYPE_LABELS: Record<string, string> = {
  [MEMBERSHIP_REQUEST_TYPES.JOIN]: "Join Group",
  [MEMBERSHIP_REQUEST_TYPES.TRANSFER]: "Transfer to Group",
};

export const MEMBERSHIP_REQUEST_STATUS = {
  PENDING: "PENDING" as const,
  APPROVED: "APPROVED" as const,
  REJECTED: "REJECTED" as const,
};

export const MEMBERSHIP_REQUEST_STATUS_LABELS: Record<string, string> = {
  [MEMBERSHIP_REQUEST_STATUS.PENDING]: "Pending",
  [MEMBERSHIP_REQUEST_STATUS.APPROVED]: "Approved",
  [MEMBERSHIP_REQUEST_STATUS.REJECTED]: "Rejected",
};

// ============================================================================
// NOTIFICATION TYPES
// ============================================================================

export const NOTIFICATION_TYPES = {
  MEETING_REMINDER: "MEETING_REMINDER" as const,
  REQUEST_STATUS: "REQUEST_STATUS" as const,
  ROLE_ASSIGNMENT: "ROLE_ASSIGNMENT" as const,
  FOLLOW_UP_REMINDER: "FOLLOW_UP_REMINDER" as const,
  NEW_REQUEST: "NEW_REQUEST" as const,
  CAMPAIGN_NEW: "CAMPAIGN_NEW" as const,
  REFERRAL_CONVERSION: "REFERRAL_CONVERSION" as const,
};

export const NOTIFICATION_TYPE_LABELS: Record<string, string> = {
  [NOTIFICATION_TYPES.MEETING_REMINDER]: "Meeting Reminder",
  [NOTIFICATION_TYPES.REQUEST_STATUS]: "Request Status Update",
  [NOTIFICATION_TYPES.ROLE_ASSIGNMENT]: "Role Assignment",
  [NOTIFICATION_TYPES.FOLLOW_UP_REMINDER]: "Follow-up Reminder",
  [NOTIFICATION_TYPES.NEW_REQUEST]: "New Request",
  [NOTIFICATION_TYPES.CAMPAIGN_NEW]: "New Campaign",
  [NOTIFICATION_TYPES.REFERRAL_CONVERSION]: "Referral Conversion",
};

// ============================================================================
// INTEREST CATEGORIES
// ============================================================================

export const INTEREST_CATEGORIES = [
  "Bible Study",
  "Prayer",
  "Worship",
  "Youth Ministry",
  "Children's Ministry",
  "Music",
  "Teaching",
  "Evangelism",
  "Community Service",
  "Counseling",
  "Technology",
  "Administration",
  "Sports & Recreation",
  "Arts & Crafts",
  "Hospitality",
  "Mentorship",
  "Writing",
  "Media & Communications",
  "Healthcare",
  "Education",
] as const;

// ============================================================================
// PAGINATION
// ============================================================================

export const PAGINATION_DEFAULTS = {
  PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  DEFAULT_PAGE: 1,
};

// ============================================================================
// JWT & AUTH
// ============================================================================

export const TOKEN_EXPIRY = {
  ACCESS_TOKEN: "15m",
  REFRESH_TOKEN: "7d",
};

export const COOKIE_NAMES = {
  ACCESS_TOKEN: "accessToken",
  REFRESH_TOKEN: "refreshToken",
};

// ============================================================================
// API ROUTES
// ============================================================================

export const API_ROUTES = {
  // Auth
  REGISTER: "/api/auth/register",
  LOGIN: "/api/auth/login",
  LOGOUT: "/api/auth/logout",
  REFRESH_TOKEN: "/api/auth/refresh-token",

  // Users
  USERS: "/api/users",
  USER_BY_ID: (id: string) => `/api/users/${id}`,
  USER_ROLE: (id: string) => `/api/users/${id}/role`,

  // Org Structure
  CAMPUSES: "/api/campuses",
  CAMPUS_BY_ID: (id: string) => `/api/campuses/${id}`,
  ZONES: "/api/zones",
  ZONE_BY_ID: (id: string) => `/api/zones/${id}`,
  DEPARTMENTS: "/api/departments",
  DEPARTMENT_BY_ID: (id: string) => `/api/departments/${id}`,
  CELLS: "/api/cells",
  CELL_BY_ID: (id: string) => `/api/cells/${id}`,

  // Groups
  GROUPS: "/api/groups",
  GROUP_BY_ID: (id: string) => `/api/groups/${id}`,
  GROUP_MEMBERS: (id: string) => `/api/groups/${id}/members`,
  GROUP_MEMBER: (groupId: string, memberId: string) =>
    `/api/groups/${groupId}/members/${memberId}`,

  // Meetings
  MEETINGS: "/api/meetings",
  MEETING_BY_ID: (id: string) => `/api/meetings/${id}`,
  MEETING_ATTENDANCE: (id: string) => `/api/meetings/${id}/attendance`,

  // Interactions
  INTERACTIONS: "/api/interactions",
  INTERACTION_BY_ID: (id: string) => `/api/interactions/${id}`,

  // Membership Requests
  MEMBERSHIP_REQUESTS: "/api/membership-requests",
  MEMBERSHIP_REQUEST_BY_ID: (id: string) => `/api/membership-requests/${id}`,
  APPROVE_REQUEST: (id: string) => `/api/membership-requests/${id}/approve`,
  REJECT_REQUEST: (id: string) => `/api/membership-requests/${id}/reject`,

  // Campaigns
  CAMPAIGNS: "/api/campaigns",
  CAMPAIGN_BY_ID: (id: string) => `/api/campaigns/${id}`,
  CAMPAIGN_INTERACTIONS: (id: string) => `/api/campaigns/${id}/interactions`,
  CAMPAIGN_ANALYTICS: (id: string) => `/api/campaigns/${id}/analytics`,
  ACTIVE_CAMPAIGNS: "/api/campaigns/active",

  // Invite Links / Referrals
  INVITE_LINKS: "/api/invite-links",
  INVITE_LINK_BY_CODE: (code: string) => `/api/invite-links/${code}`,
  INVITE_LINK_VISIT: (code: string) => `/api/invite-links/${code}/visit`,
  REFERRAL_STATS: (userId: string) => `/api/referrals/${userId}/stats`,

  // Analytics
  MEMBER_ANALYTICS: (id: string) => `/api/analytics/member/${id}`,
  GROUP_ANALYTICS: (id: string) => `/api/analytics/group/${id}`,
  CAMPUS_ANALYTICS: (id: string) => `/api/analytics/campus/${id}`,
  ZONE_ANALYTICS: (id: string) => `/api/analytics/zone/${id}`,
  HIERARCHY_ANALYTICS: "/api/analytics/hierarchy",
  CHURCH_ANALYTICS: "/api/analytics/church",
  EXPORT_ANALYTICS: "/api/analytics/export",
} as const;

// ============================================================================
// APP ROUTES
// ============================================================================

export const APP_ROUTES = {
  HOME: "/",

  // Auth
  LOGIN: "/login",
  REGISTER: "/register",

  // Campaign
  CAMPAIGNS: "/campaigns",
  CAMPAIGN_VIEW: (id: string) => `/campaigns/${id}`,
  CAMPAIGN_SHARED: (id: string, ref: string) => `/campaigns/${id}?ref=${ref}`,

  // Superadmin
  SUPERADMIN_DASHBOARD: "/superadmin/dashboard",
  SUPERADMIN_CAMPUSES: "/superadmin/campuses",
  SUPERADMIN_ZONES: "/superadmin/zones",
  SUPERADMIN_DEPARTMENTS: "/superadmin/departments",
  SUPERADMIN_GROUPS: "/superadmin/groups",
  SUPERADMIN_CELLS: "/superadmin/cells",
  SUPERADMIN_MEMBERS: "/superadmin/members",
  SUPERADMIN_ANALYTICS: "/superadmin/analytics",
  SUPERADMIN_CAMPAIGNS: "/superadmin/campaigns",
  SUPERADMIN_REFERRALS: "/superadmin/referrals",

  // Zonal Leader
  ZONAL_LEADER_DASHBOARD: "/zonal-leader/dashboard",
  ZONAL_LEADER_CAMPUSES: "/zonal-leader/campuses",
  ZONAL_LEADER_GROUPS: "/zonal-leader/groups",
  ZONAL_LEADER_MEMBERS: "/zonal-leader/members",
  ZONAL_LEADER_MEETINGS: "/zonal-leader/meetings",
  ZONAL_LEADER_ANALYTICS: "/zonal-leader/analytics",

  // Campus Admin
  CAMPUS_ADMIN_DASHBOARD: "/campus-admin/dashboard",
  CAMPUS_ADMIN_DEPARTMENTS: "/campus-admin/departments",
  CAMPUS_ADMIN_GROUPS: "/campus-admin/groups",
  CAMPUS_ADMIN_MEMBERS: "/campus-admin/members",
  CAMPUS_ADMIN_MEETINGS: "/campus-admin/meetings",
  CAMPUS_ADMIN_ANALYTICS: "/campus-admin/analytics",

  // HOD
  HOD_DASHBOARD: "/hod/dashboard",
  HOD_GROUPS: "/hod/groups",
  HOD_MEMBERS: "/hod/members",
  HOD_MEETINGS: "/hod/meetings",
  HOD_ANALYTICS: "/hod/analytics",

  // Leader (Small Group Leader)
  LEADER_DASHBOARD: "/leader/dashboard",
  LEADER_MY_GROUP: "/leader/my-group",
  LEADER_MEETINGS: "/leader/meetings",
  LEADER_MEMBERS: "/leader/members",
  LEADER_ANALYTICS: "/leader/analytics",

  // Cell Leader
  CELL_LEADER_DASHBOARD: "/cell-leader/dashboard",
  CELL_LEADER_MY_CELL: "/cell-leader/my-cell",
  CELL_LEADER_MEETINGS: "/cell-leader/meetings",
  CELL_LEADER_MEMBERS: "/cell-leader/members",

  // Member
  MEMBER_DASHBOARD: "/member/dashboard",
  MEMBER_MY_GROUP: "/member/my-group",
  MEMBER_HISTORY: "/member/history",

  // Profile
  PROFILE: "/profile",

  // Invite
  INVITE: (code: string) => `/invite/${code}`,
} as const;

// ============================================================================
// ENGAGEMENT THRESHOLDS
// ============================================================================

export const ENGAGEMENT_THRESHOLDS = {
  AT_RISK_SCORE: 40,
  GOOD_ATTENDANCE: 70,
  EXCELLENT_ATTENDANCE: 90,
  MAX_MISSED_MEETINGS: 3,
  INACTIVE_DAYS: 30,
};

// ============================================================================
// VALIDATION RULES
// ============================================================================

export const VALIDATION_RULES = {
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_MAX_LENGTH: 100,
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 50,
  EMAIL_MAX_LENGTH: 100,
  PHONE_MIN_LENGTH: 10,
  PHONE_MAX_LENGTH: 15,
  GROUP_NAME_MIN_LENGTH: 3,
  GROUP_NAME_MAX_LENGTH: 100,
  NOTES_MAX_LENGTH: 1000,
  MESSAGE_MAX_LENGTH: 500,
  AGE_MIN: 10,
  AGE_MAX: 120,
  CAMPAIGN_TITLE_MAX: 200,
  CAMPAIGN_CONTENT_MAX: 5000,
};

// ============================================================================
// FILE UPLOAD
// ============================================================================

export const FILE_UPLOAD = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  MAX_VIDEO_SIZE: 50 * 1024 * 1024, // 50MB
  ALLOWED_IMAGE_TYPES: ["image/jpeg", "image/jpg", "image/png", "image/webp"],
  ALLOWED_VIDEO_TYPES: ["video/mp4", "video/webm", "video/ogg"],
  ALLOWED_IMAGE_EXTENSIONS: [".jpg", ".jpeg", ".png", ".webp"],
  ALLOWED_VIDEO_EXTENSIONS: [".mp4", ".webm", ".ogg"],
  // Keep backward compat
  ALLOWED_TYPES: ["image/jpeg", "image/jpg", "image/png", "image/webp"],
  ALLOWED_EXTENSIONS: [".jpg", ".jpeg", ".png", ".webp"],
};

// ============================================================================
// DATE & TIME FORMATS
// ============================================================================

export const DATE_FORMATS = {
  DISPLAY: "MMM D, YYYY",
  INPUT: "YYYY-MM-DD",
  TIME: "h:mm A",
  DATETIME: "MMM D, YYYY h:mm A",
  ISO: "YYYY-MM-DDTHH:mm:ss.SSSZ",
};

// ============================================================================
// CHART COLORS (for data visualizations)
// ============================================================================

export const CHART_COLORS = {
  primary: "#16a34a", // green-600
  success: "#16a34a", // green-600 (alias for primary)
  secondary: "#2563eb", // blue-600
  warning: "#d97706", // amber-600
  danger: "#dc2626", // red-600
  info: "#7c3aed", // violet-600
  palette: [
    "#16a34a",
    "#2563eb",
    "#d97706",
    "#dc2626",
    "#7c3aed",
    "#db2777",
    "#0891b2",
    "#65a30d",
    "#ea580c",
    "#4f46e5",
  ],
};

// ============================================================================
// ERROR MESSAGES
// ============================================================================

export const ERROR_MESSAGES = {
  UNAUTHORIZED: "You are not authorized to perform this action",
  NOT_FOUND: "Resource not found",
  VALIDATION_ERROR: "Please check your input and try again",
  SERVER_ERROR: "An error occurred. Please try again later",
  NETWORK_ERROR: "Network error. Please check your connection",
  INVALID_CREDENTIALS: "Invalid email or password",
  EMAIL_EXISTS: "Email already registered",
  WEAK_PASSWORD: "Password must be at least 8 characters",
  PASSWORDS_NOT_MATCH: "Passwords do not match",
  CAMPAIGN_EXPIRED: "This campaign has expired",
  INVITE_EXPIRED: "This invite link has expired",
  INVITE_INVALID: "This invite link is no longer valid",
};

// ============================================================================
// SUCCESS MESSAGES
// ============================================================================

export const SUCCESS_MESSAGES = {
  REGISTER_SUCCESS: "Registration successful! Please login.",
  LOGIN_SUCCESS: "Welcome back!",
  LOGOUT_SUCCESS: "You have been logged out",
  UPDATE_SUCCESS: "Updated successfully",
  CREATE_SUCCESS: "Created successfully",
  DELETE_SUCCESS: "Deleted successfully",
  APPROVE_SUCCESS: "Request approved",
  REJECT_SUCCESS: "Request rejected",
  CAMPAIGN_PUBLISHED: "Campaign published and will be active for 24 hours",
  INVITE_CREATED: "Invite link created successfully",
  INVITE_ACCEPTED: "Welcome! You have successfully joined",
};
