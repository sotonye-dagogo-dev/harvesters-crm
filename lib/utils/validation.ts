import { z } from "zod";
import {
  VALIDATION_RULES,
  USER_ROLES,
  EMPLOYMENT_STATUS,
  MARITAL_STATUS,
  MEETING_FREQUENCY,
  INTERACTION_TYPES,
  MEMBERSHIP_REQUEST_TYPES,
  MEMBERSHIP_REQUEST_STATUS,
} from "@/lib/constants";

// ============================================================================
// USER VALIDATION SCHEMAS
// ============================================================================

export const registerSchema = z
  .object({
    firstName: z
      .string()
      .min(VALIDATION_RULES.NAME_MIN_LENGTH, "First name is too short")
      .max(VALIDATION_RULES.NAME_MAX_LENGTH, "First name is too long"),
    lastName: z
      .string()
      .min(VALIDATION_RULES.NAME_MIN_LENGTH, "Last name is too short")
      .max(VALIDATION_RULES.NAME_MAX_LENGTH, "Last name is too long"),
    email: z
      .string()
      .email("Invalid email address")
      .max(VALIDATION_RULES.EMAIL_MAX_LENGTH, "Email is too long"),
    password: z
      .string()
      .min(
        VALIDATION_RULES.PASSWORD_MIN_LENGTH,
        `Password must be at least ${VALIDATION_RULES.PASSWORD_MIN_LENGTH} characters`
      )
      .max(VALIDATION_RULES.PASSWORD_MAX_LENGTH, "Password is too long"),
    confirmPassword: z.string().optional(),
    phone: z
      .string()
      .min(VALIDATION_RULES.PHONE_MIN_LENGTH, "Phone number is too short")
      .max(VALIDATION_RULES.PHONE_MAX_LENGTH, "Phone number is too long")
      .regex(/^[0-9+\-\s()]+$/, "Invalid phone number"),
    whatsappPhone: z
      .string()
      .min(VALIDATION_RULES.PHONE_MIN_LENGTH, "Phone number is too short")
      .max(VALIDATION_RULES.PHONE_MAX_LENGTH, "Phone number is too long")
      .regex(/^[0-9+\-\s()]+$/, "Invalid phone number")
      .optional()
      .or(z.literal("")),
    dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
    gender: z.enum(["MALE", "FEMALE"]),
    address: z.string().min(1, "Address is required"),
    location: z.string().optional(),
    age: z
      .number()
      .int()
      .min(VALIDATION_RULES.AGE_MIN, "Age is too low")
      .max(VALIDATION_RULES.AGE_MAX, "Age is too high")
      .optional()
      .or(z.nan()),
    maritalStatus: z.enum([
      MARITAL_STATUS.SINGLE,
      MARITAL_STATUS.MARRIED,
      MARITAL_STATUS.DIVORCED,
      MARITAL_STATUS.WIDOWED,
    ]),
    employmentStatus: z.enum([
      EMPLOYMENT_STATUS.STUDENT,
      EMPLOYMENT_STATUS.SELF_EMPLOYED,
      EMPLOYMENT_STATUS.EMPLOYED,
      EMPLOYMENT_STATUS.UNEMPLOYED,
    ]),
    interests: z.array(z.string()).optional().default([]),
    groupId: z.string().optional(),
  })
  .refine(
    (data) => !data.confirmPassword || data.password === data.confirmPassword,
    {
      message: "Passwords do not match",
      path: ["confirmPassword"],
    }
  );

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
  remember: z.boolean().optional(),
});

export const updateProfileSchema = z.object({
  firstName: z
    .string()
    .min(VALIDATION_RULES.NAME_MIN_LENGTH, "First name is too short")
    .max(VALIDATION_RULES.NAME_MAX_LENGTH, "First name is too long"),
  lastName: z
    .string()
    .min(VALIDATION_RULES.NAME_MIN_LENGTH, "Last name is too short")
    .max(VALIDATION_RULES.NAME_MAX_LENGTH, "Last name is too long"),
  phone: z
    .string()
    .min(VALIDATION_RULES.PHONE_MIN_LENGTH, "Phone number is too short")
    .max(VALIDATION_RULES.PHONE_MAX_LENGTH, "Phone number is too long")
    .regex(/^[0-9+\-\s()]+$/, "Invalid phone number"),
  whatsappPhone: z
    .string()
    .min(VALIDATION_RULES.PHONE_MIN_LENGTH, "Phone number is too short")
    .max(VALIDATION_RULES.PHONE_MAX_LENGTH, "Phone number is too long")
    .regex(/^[0-9+\-\s()]+$/, "Invalid phone number")
    .optional()
    .or(z.literal("")),
  location: z.string().optional(),
  age: z
    .number()
    .int()
    .min(VALIDATION_RULES.AGE_MIN, "Age is too low")
    .max(VALIDATION_RULES.AGE_MAX, "Age is too high")
    .optional()
    .or(z.nan()),
  maritalStatus: z
    .enum([
      MARITAL_STATUS.SINGLE,
      MARITAL_STATUS.MARRIED,
      MARITAL_STATUS.DIVORCED,
      MARITAL_STATUS.WIDOWED,
    ])
    .optional(),
  employmentStatus: z
    .enum([
      EMPLOYMENT_STATUS.STUDENT,
      EMPLOYMENT_STATUS.SELF_EMPLOYED,
      EMPLOYMENT_STATUS.EMPLOYED,
      EMPLOYMENT_STATUS.UNEMPLOYED,
    ])
    .optional(),
  interests: z.array(z.string()).default([]),
});

export const updateUserSchema = updateProfileSchema.extend({
  groupId: z.string().optional(),
  isActive: z.boolean().optional(),
  role: z
    .enum([
      USER_ROLES.SUPERADMIN as "SUPERADMIN",
      USER_ROLES.LEADER as "LEADER",
      USER_ROLES.MEMBER as "MEMBER",
    ])
    .optional(),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(
        VALIDATION_RULES.PASSWORD_MIN_LENGTH,
        `Password must be at least ${VALIDATION_RULES.PASSWORD_MIN_LENGTH} characters`
      )
      .max(VALIDATION_RULES.PASSWORD_MAX_LENGTH, "Password is too long"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

// ============================================================================
// GROUP VALIDATION SCHEMAS
// ============================================================================

export const createGroupSchema = z.object({
  name: z
    .string()
    .min(VALIDATION_RULES.GROUP_NAME_MIN_LENGTH, "Group name is too short")
    .max(VALIDATION_RULES.GROUP_NAME_MAX_LENGTH, "Group name is too long"),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(VALIDATION_RULES.NOTES_MAX_LENGTH, "Description is too long"),
  meetingFrequency: z.enum([
    MEETING_FREQUENCY.WEEKLY,
    MEETING_FREQUENCY.BIWEEKLY,
    MEETING_FREQUENCY.MONTHLY,
  ]),
  leaderId: z.string().min(1, "Leader is required"),
});

export const updateGroupSchema = z.object({
  name: z
    .string()
    .min(VALIDATION_RULES.GROUP_NAME_MIN_LENGTH, "Group name is too short")
    .max(VALIDATION_RULES.GROUP_NAME_MAX_LENGTH, "Group name is too long")
    .optional(),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(VALIDATION_RULES.NOTES_MAX_LENGTH, "Description is too long")
    .optional(),
  meetingFrequency: z
    .enum([
      MEETING_FREQUENCY.WEEKLY,
      MEETING_FREQUENCY.BIWEEKLY,
      MEETING_FREQUENCY.MONTHLY,
    ])
    .optional(),
  leaderId: z.string().min(1, "Leader is required").optional(),
});

// ============================================================================
// MEETING VALIDATION SCHEMAS
// ============================================================================

export const createMeetingSchema = z.object({
  groupId: z.string().min(1, "Group is required"),
  date: z.string().min(1, "Date is required"),
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().min(1, "End time is required"),
  attendanceMethod: z.enum(["count", "checklist"]),
  attendeeCount: z.number().int().min(0).optional(),
  attendeeIds: z.array(z.string()).optional(),
  notes: z
    .string()
    .max(VALIDATION_RULES.NOTES_MAX_LENGTH, "Notes are too long")
    .optional(),
  screenshotUrl: z.string().optional(),
});

export const updateMeetingSchema = z.object({
  date: z.string().min(1, "Date is required").optional(),
  startTime: z.string().min(1, "Start time is required").optional(),
  endTime: z.string().min(1, "End time is required").optional(),
  attendeeCount: z.number().int().min(0).optional(),
  attendeeIds: z.array(z.string()).optional(),
  notes: z
    .string()
    .max(VALIDATION_RULES.NOTES_MAX_LENGTH, "Notes are too long")
    .optional(),
  screenshotUrl: z.string().optional(),
});

// ============================================================================
// INTERACTION VALIDATION SCHEMAS
// ============================================================================

export const createInteractionSchema = z.object({
  memberId: z.string().min(1, "Member is required"),
  type: z.enum([
    INTERACTION_TYPES.CALL,
    INTERACTION_TYPES.FOLLOW_UP,
    INTERACTION_TYPES.CHECK_IN,
  ]),
  notes: z
    .string()
    .max(VALIDATION_RULES.NOTES_MAX_LENGTH, "Notes are too long")
    .optional(),
  timestamp: z.string().optional(),
});

export const updateInteractionSchema = z.object({
  type: z
    .enum([
      INTERACTION_TYPES.CALL,
      INTERACTION_TYPES.FOLLOW_UP,
      INTERACTION_TYPES.CHECK_IN,
    ])
    .optional(),
  notes: z
    .string()
    .max(VALIDATION_RULES.NOTES_MAX_LENGTH, "Notes are too long")
    .optional(),
  timestamp: z.string().optional(),
});

// ============================================================================
// MEMBERSHIP REQUEST VALIDATION SCHEMAS
// ============================================================================

export const createMembershipRequestSchema = z.object({
  toGroupId: z.string().min(1, "Group is required"),
  fromGroupId: z.string().optional(),
  type: z.enum([
    MEMBERSHIP_REQUEST_TYPES.JOIN,
    MEMBERSHIP_REQUEST_TYPES.TRANSFER,
  ]),
  message: z
    .string()
    .max(VALIDATION_RULES.MESSAGE_MAX_LENGTH, "Message is too long")
    .optional(),
});

export const respondToRequestSchema = z.object({
  status: z.enum([
    MEMBERSHIP_REQUEST_STATUS.APPROVED,
    MEMBERSHIP_REQUEST_STATUS.REJECTED,
  ]),
  responseMessage: z
    .string()
    .max(VALIDATION_RULES.MESSAGE_MAX_LENGTH, "Message is too long")
    .optional(),
});

// ============================================================================
// QUERY VALIDATION SCHEMAS
// ============================================================================

export const paginationSchema = z.object({
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(100).default(20),
});

export const sortSchema = z.object({
  field: z.string(),
  order: z.enum(["asc", "desc"]).default("desc"),
});

export const userFiltersSchema = z.object({
  role: z
    .enum([
      USER_ROLES.SUPERADMIN as "SUPERADMIN",
      USER_ROLES.LEADER as "LEADER",
      USER_ROLES.MEMBER as "MEMBER",
    ])
    .optional(),
  groupId: z.string().optional(),
  isActive: z.boolean().optional(),
  search: z.string().optional(),
});

export const groupFiltersSchema = z.object({
  leaderId: z.string().optional(),
  search: z.string().optional(),
});

export const meetingFiltersSchema = z.object({
  groupId: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  createdById: z.string().optional(),
});

export const interactionFiltersSchema = z.object({
  leaderId: z.string().optional(),
  memberId: z.string().optional(),
  type: z
    .enum([
      INTERACTION_TYPES.CALL,
      INTERACTION_TYPES.FOLLOW_UP,
      INTERACTION_TYPES.CHECK_IN,
    ])
    .optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
});

export const membershipRequestFiltersSchema = z.object({
  memberId: z.string().optional(),
  toGroupId: z.string().optional(),
  status: z
    .enum([
      MEMBERSHIP_REQUEST_STATUS.PENDING,
      MEMBERSHIP_REQUEST_STATUS.APPROVED,
      MEMBERSHIP_REQUEST_STATUS.REJECTED,
    ])
    .optional(),
  type: z
    .enum([MEMBERSHIP_REQUEST_TYPES.JOIN, MEMBERSHIP_REQUEST_TYPES.TRANSFER])
    .optional(),
});

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export function validateData<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): {
  success: boolean;
  data?: T;
  errors?: Record<string, string>;
} {
  try {
    const validatedData = schema.parse(data);
    return { success: true, data: validatedData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string> = {};
      error.issues.forEach((err) => {
        const path = err.path.join(".");
        errors[path] = err.message;
      });
      return { success: false, errors };
    }
    return { success: false, errors: { _general: "Validation failed" } };
  }
}

export function validateDataAsync<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): Promise<{ success: boolean; data?: T; errors?: Record<string, string> }> {
  return new Promise((resolve) => {
    const result = validateData(schema, data);
    resolve(result);
  });
}
