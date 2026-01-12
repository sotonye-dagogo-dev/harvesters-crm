// ============================================================================
// CONSTANTS FOR CHURCH FELLOWSHIP CRM
// ============================================================================

// ============================================================================
// USER ROLES
// ============================================================================

export const USER_ROLES = {
  SUPERADMIN: "SUPERADMIN" as const,
  LEADER: "LEADER" as const,
  MEMBER: "MEMBER" as const,
};

export const USER_ROLE_LABELS = {
  [USER_ROLES.SUPERADMIN]: "Super Admin",
  [USER_ROLES.LEADER]: "Group Leader",
  [USER_ROLES.MEMBER]: "Member",
};

// ============================================================================
// EMPLOYMENT STATUS
// ============================================================================

export const EMPLOYMENT_STATUS = {
  STUDENT: "STUDENT" as const,
  SELF_EMPLOYED: "SELF_EMPLOYED" as const,
  EMPLOYED: "EMPLOYED" as const,
  UNEMPLOYED: "UNEMPLOYED" as const,
};

export const EMPLOYMENT_STATUS_LABELS = {
  [EMPLOYMENT_STATUS.STUDENT]: "Student",
  [EMPLOYMENT_STATUS.SELF_EMPLOYED]: "Self-Employed",
  [EMPLOYMENT_STATUS.EMPLOYED]: "Employed",
  [EMPLOYMENT_STATUS.UNEMPLOYED]: "Unemployed",
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

export const MARITAL_STATUS_LABELS = {
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

export const MEETING_FREQUENCY_LABELS = {
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

export const INTERACTION_TYPE_LABELS = {
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

export const MEMBERSHIP_REQUEST_TYPE_LABELS = {
  [MEMBERSHIP_REQUEST_TYPES.JOIN]: "Join Group",
  [MEMBERSHIP_REQUEST_TYPES.TRANSFER]: "Transfer to Group",
};

export const MEMBERSHIP_REQUEST_STATUS = {
  PENDING: "PENDING" as const,
  APPROVED: "APPROVED" as const,
  REJECTED: "REJECTED" as const,
};

export const MEMBERSHIP_REQUEST_STATUS_LABELS = {
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
};

export const NOTIFICATION_TYPE_LABELS = {
  [NOTIFICATION_TYPES.MEETING_REMINDER]: "Meeting Reminder",
  [NOTIFICATION_TYPES.REQUEST_STATUS]: "Request Status Update",
  [NOTIFICATION_TYPES.ROLE_ASSIGNMENT]: "Role Assignment",
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
  ACCESS_TOKEN: "15m", // 15 minutes
  REFRESH_TOKEN: "7d", // 7 days
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

  // Analytics
  MEMBER_ANALYTICS: (id: string) => `/api/analytics/member/${id}`,
  GROUP_ANALYTICS: (id: string) => `/api/analytics/group/${id}`,
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

  // Superadmin
  SUPERADMIN_DASHBOARD: "/superadmin/dashboard",
  SUPERADMIN_GROUPS: "/superadmin/groups",
  SUPERADMIN_MEMBERS: "/superadmin/members",
  SUPERADMIN_ANALYTICS: "/superadmin/analytics",

  // Leader
  LEADER_DASHBOARD: "/leader/dashboard",
  LEADER_MY_GROUP: "/leader/my-group",
  LEADER_MEETINGS: "/leader/meetings",
  LEADER_MEMBERS: "/leader/members",

  // Member
  MEMBER_DASHBOARD: "/member/dashboard",
  MEMBER_MY_GROUP: "/member/my-group",
  MEMBER_HISTORY: "/member/history",

  // Profile
  PROFILE: "/profile",
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
};

// ============================================================================
// FILE UPLOAD
// ============================================================================

export const FILE_UPLOAD = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
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
};
