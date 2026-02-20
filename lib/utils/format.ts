/**
 * Centralized date & number formatting utilities.
 *
 * All visible date rendering MUST use these helpers to guarantee
 * a consistent "20 Feb 2026" style across the application.
 *
 * Library: date-fns (tree-shakeable, already a project dependency).
 */

import { format as fnsFormat, formatDistanceToNow as fnsDistanceToNow } from "date-fns";

// ─── Format Tokens (date-fns) ───────────────────────────────────────────────

/** Canonical format strings — date-fns flavour. */
export const DATE_DISPLAY = {
  /** 20 Feb 2026 */
  DATE: "d MMM yyyy",
  /** 20 Feb 2026 at 3:30 PM */
  DATETIME: "d MMM yyyy 'at' h:mm a",
  /** 20 Feb 2026, 3:30 PM  (compact) */
  DATETIME_COMPACT: "d MMM yyyy, h:mm a",
  /** Friday, 20 Feb 2026 */
  DATE_LONG: "EEEE, d MMM yyyy",
  /** 3:30 PM */
  TIME: "h:mm a",
  /** 20 Feb */
  DATE_SHORT: "d MMM",
  /** Feb 2026 */
  MONTH_YEAR: "MMM yyyy",
} as const;

/**
 * Dayjs-flavour equivalents — used only where Ant Design DatePicker
 * requires a `format` prop string (dayjs tokens differ from date-fns).
 */
export const DAYJS_DISPLAY = {
  /** 20 Feb 2026 */
  DATE: "D MMM YYYY",
  /** 20 Feb 2026 at h:mm A */
  DATETIME: "D MMM YYYY [at] h:mm A",
  /** h:mm A */
  TIME: "h:mm A",
} as const;

// ─── Helper Functions ───────────────────────────────────────────────────────

/** Coerce any date-like value to a Date object. */
function toDate(value: string | number | Date): Date {
  if (value instanceof Date) return value;
  return new Date(value);
}

/**
 * Format a date for display: **20 Feb 2026**
 *
 * @example formatDate("2026-02-20")          → "20 Feb 2026"
 * @example formatDate(new Date())            → "20 Feb 2026"
 * @example formatDate(meeting.createdAt)     → "20 Feb 2026"
 */
export function formatDate(value: string | number | Date): string {
  return fnsFormat(toDate(value), DATE_DISPLAY.DATE);
}

/**
 * Format a date-time for display: **20 Feb 2026 at 3:30 PM**
 */
export function formatDateTime(value: string | number | Date): string {
  return fnsFormat(toDate(value), DATE_DISPLAY.DATETIME);
}

/**
 * Compact date-time: **20 Feb 2026, 3:30 PM**
 */
export function formatDateTimeCompact(value: string | number | Date): string {
  return fnsFormat(toDate(value), DATE_DISPLAY.DATETIME_COMPACT);
}

/**
 * Long-form date: **Friday, 20 Feb 2026**
 */
export function formatDateLong(value: string | number | Date): string {
  return fnsFormat(toDate(value), DATE_DISPLAY.DATE_LONG);
}

/**
 * Time only: **3:30 PM**
 */
export function formatTime(value: string | number | Date): string {
  return fnsFormat(toDate(value), DATE_DISPLAY.TIME);
}

/**
 * Short date (no year): **20 Feb**
 */
export function formatDateShort(value: string | number | Date): string {
  return fnsFormat(toDate(value), DATE_DISPLAY.DATE_SHORT);
}

/**
 * Month + year: **Feb 2026**
 */
export function formatMonthYear(value: string | number | Date): string {
  return fnsFormat(toDate(value), DATE_DISPLAY.MONTH_YEAR);
}

/**
 * Relative time: **3 hours ago**, **in 2 days**
 */
export function formatRelativeTime(
  value: string | number | Date,
  options?: { addSuffix?: boolean }
): string {
  return fnsDistanceToNow(toDate(value), { addSuffix: options?.addSuffix ?? true });
}
