"use client";

import { Tag } from "antd";
import { ReactNode } from "react";

// ─── Color Maps ─────────────────────────────────────────────────────────────

const STATUS_COLORS: Record<string, Record<string, string>> = {
  // General states (active/inactive/pending)
  status: {
    active: "success",
    inactive: "default",
    pending: "warning",
    suspended: "error",
    enabled: "success",
    disabled: "default",
  },

  // User/member roles
  role: {
    SUPERADMIN: "red",
    GROUP_PASTOR: "volcano",
    GROUP_ADMIN: "orange",
    CAMPUS_PASTOR: "gold",
    ZONAL_LEADER: "purple",
    CAMPUS_ADMIN: "geekblue",
    HOD: "blue",
    SMALL_GROUP_LEADER: "cyan",
    CELL_LEADER: "lime",
    DATA_ENTRY: "magenta",
    MEMBER: "green",
  },

  // Meeting attendance
  attendance: {
    present: "success",
    absent: "error",
    late: "warning",
    excused: "default",
  },

  // Request/approval status
  request: {
    PENDING: "warning",
    APPROVED: "success",
    REJECTED: "error",
    CANCELLED: "default",
  },

  // Report status (matches REPORT_STATUS_COLORS from constants)
  report: {
    DRAFT: "default",
    SUBMITTED: "processing",
    REQUIRES_EDITS: "warning",
    APPROVED: "success",
    REVIEWED: "cyan",
    LOCKED: "error",
  },

  // Report edit status
  reportEdit: {
    DRAFT: "orange",
    SUBMITTED: "blue",
    APPROVED: "green",
    REJECTED: "red",
  },

  // Risk levels
  risk: {
    low: "green",
    medium: "orange",
    high: "red",
    critical: "red",
  },

  // Priority levels
  priority: {
    LOW: "blue",
    MEDIUM: "orange",
    HIGH: "red",
    URGENT: "red",
  },

  // Interaction types
  interaction: {
    CALL: "blue",
    FOLLOW_UP: "green",
    CHECK_IN: "purple",
    VISIT: "green",
    MESSAGE: "purple",
  },

  // Follow-up status
  followUp: {
    COMPLETED: "green",
    PENDING: "blue",
    OVERDUE: "red",
  },

  // Campaign status
  campaign: {
    ACTIVE: "success",
    DRAFT: "processing",
    EXPIRED: "default",
    ARCHIVED: "warning",
  },

  // Action types (activity logs)
  action: {
    CREATE: "green",
    UPDATE: "blue",
    DELETE: "red",
    LOGIN: "cyan",
    LOGOUT: "default",
    APPROVE: "green",
    REJECT: "red",
  },

  // Membership request type
  requestType: {
    JOIN: "blue",
    TRANSFER: "purple",
  },

  // Member engagement status
  engagement: {
    active: "green",
    "at-risk": "orange",
    inactive: "red",
  },
};

// ─── Helper to get color ────────────────────────────────────────────────────

function getColor(
  status: string,
  category?: string,
  colorOverride?: string
): string {
  if (colorOverride) return colorOverride;

  // Try the specified category first
  if (category && STATUS_COLORS[category]) {
    const color = STATUS_COLORS[category][status];
    if (color) return color;
  }

  // Fall back to searching all categories
  for (const cat of Object.values(STATUS_COLORS)) {
    if (cat[status]) return cat[status];
  }

  return "default";
}

// ─── Format status label ────────────────────────────────────────────────────

function formatLabel(status: string): string {
  return status
    .replace(/_/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

// ─── StatusBadge Component ──────────────────────────────────────────────────

export type StatusCategory =
  | "status"
  | "role"
  | "attendance"
  | "request"
  | "report"
  | "reportEdit"
  | "risk"
  | "priority"
  | "interaction"
  | "followUp"
  | "campaign"
  | "action"
  | "requestType"
  | "engagement";

interface StatusBadgeProps {
  /** The status value to display */
  status: string;
  /** Category hint for accurate color resolution */
  category?: StatusCategory;
  /** Override the auto-detected color (any Antd Tag color) */
  color?: string;
  /** Custom display label (defaults to formatted status string) */
  label?: string;
  /** Optional leading icon */
  icon?: ReactNode;
  /** Whether to render as a bordered outline instead of filled */
  bordered?: boolean;
  /** Additional CSS class */
  className?: string;
}

export default function StatusBadge({
  status,
  category,
  color,
  label,
  icon,
  bordered = true,
  className = "",
}: StatusBadgeProps) {
  const resolvedColor = getColor(status, category, color);
  const displayLabel = label || formatLabel(status);

  return (
    <Tag
      color={resolvedColor}
      bordered={bordered}
      icon={icon}
      className={`inline-flex items-center gap-1 ${className}`}
    >
      {displayLabel}
    </Tag>
  );
}

// ─── Boolean Status (Active/Inactive) ───────────────────────────────────────

interface BooleanBadgeProps {
  value: boolean;
  trueLabel?: string;
  falseLabel?: string;
  trueColor?: string;
  falseColor?: string;
  icon?: ReactNode;
  className?: string;
}

export function BooleanBadge({
  value,
  trueLabel = "Active",
  falseLabel = "Inactive",
  trueColor = "success",
  falseColor = "default",
  icon,
  className = "",
}: BooleanBadgeProps) {
  return (
    <Tag
      color={value ? trueColor : falseColor}
      icon={icon}
      className={`inline-flex items-center gap-1 ${className}`}
    >
      {value ? trueLabel : falseLabel}
    </Tag>
  );
}

// ─── Exports for direct access to color maps ────────────────────────────────

export { STATUS_COLORS, getColor, formatLabel };
