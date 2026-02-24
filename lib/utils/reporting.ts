// ============================================================================
// REPORTING SYSTEM UTILITIES
// ============================================================================
import { PERFORMANCE_THRESHOLDS } from "@/lib/constants";
import { ReportStatus, ReportFrequency } from "../types";

/**
 * Calculate performance percentage for a metric entry
 * @param achieved - Actual value achieved
 * @param goal - Target goal value
 * @returns Performance percentage rounded to 1 decimal place, or null if not calculable
 */
export function calculatePerformance(
  achieved: number | null | undefined,
  goal: number | null | undefined
): number | null {
  if (goal === null || goal === undefined || goal <= 0) return null;
  if (achieved === null || achieved === undefined) return null;
  return Math.round((achieved / goal) * 100 * 10) / 10;
}

/**
 * Calculate variance (achieved - goal)
 * @param achieved - Actual value achieved
 * @param goal - Target goal value
 * @returns Variance rounded to nearest integer, or null if not calculable
 */
export function calculateVariance(
  achieved: number | null | undefined,
  goal: number | null | undefined
): number | null {
  if (goal === null || goal === undefined) return null;
  if (achieved === null || achieved === undefined) return null;
  return Math.round(achieved - goal);
}

/**
 * Determine performance status for a metric based on percentage
 */
export function getPerformanceStatus(
  percentage: number | null
): "EXCEEDING" | "ON_TRACK" | "BELOW_TARGET" | null {
  if (percentage === null) return null;
  if (percentage >= PERFORMANCE_THRESHOLDS.EXCEEDING) return "EXCEEDING";
  if (percentage >= PERFORMANCE_THRESHOLDS.ON_TRACK) return "ON_TRACK";
  return "BELOW_TARGET";
}

/**
 * Calculate overall indicator performance from metric entries
 */
export function calculateIndicatorPerformance(
  metricEntries: MetricEntry[]
): number {
  const performances = metricEntries
    .map((entry) =>
      calculatePerformance(entry.monthlyAchieved, entry.monthlyGoal)
    )
    .filter((p): p is number => p !== null);

  if (performances.length === 0) return 0;

  const average =
    performances.reduce((sum, val) => sum + val, 0) / performances.length;
  return Math.round(average * 10) / 10;
}

/**
 * Check if a form field should be locked based on its locking config
 */
export function isFieldLocked(
  field: FormField,
  reportStatus: ReportStatus,
  existingValue?: unknown
): boolean {
  if (!field.lockingConfig) return false;

  // Report already approved/reviewed/finalized
  const lockedStatuses: ReportStatus[] = [
    ReportStatus.APPROVED,
    ReportStatus.REVIEWED,
    ReportStatus.FINALIZED,
  ];
  if (lockedStatuses.includes(reportStatus)) return true;

  const config = field.lockingConfig;

  // Lock after initial submission
  if (config.lockAfterSubmit && reportStatus !== ReportStatus.DRAFT) {
    return true;
  }

  // Lock after a specific date
  if (config.lockAfterDate) {
    const lockDate = new Date(config.lockAfterDate);
    if (new Date() > lockDate) return true;
  }

  // Lock after first value entry
  if (
    config.lockAfterValue &&
    existingValue !== undefined &&
    existingValue !== null &&
    existingValue !== ""
  ) {
    return true;
  }

  return false;
}

/**
 * Check if a user can edit a specific metric field
 */
export function canEditMetricField(
  field: "monthlyGoal" | "monthlyAchieved" | "yearOnYearGoal",
  metricEntry: MetricEntry,
  reportStatus: ReportStatus,
  currentDate: Date = new Date()
): boolean {
  const lockedStatuses: ReportStatus[] = [
    ReportStatus.APPROVED,
    ReportStatus.REVIEWED,
    ReportStatus.FINALIZED,
  ];
  if (lockedStatuses.includes(reportStatus)) return false;

  if (field === "monthlyGoal" && metricEntry.monthlyGoalLocked) return false;
  if (field === "yearOnYearGoal" && metricEntry.yearOnYearGoalLocked)
    return false;

  if (field === "monthlyAchieved") {
    if (metricEntry.monthlyAchievedLocked) return false;
    // Time-based lock for monthly achieved — lock after end of the report month
    const reportYear = new Date(metricEntry.createdAt).getFullYear();
    const reportMonth = new Date(metricEntry.createdAt).getMonth();
    const endOfMonth = new Date(reportYear, reportMonth + 1, 0, 23, 59, 59);
    if (currentDate > endOfMonth) return false;
  }

  return true;
}

/**
 * Validate form data against a FormDefinition
 * Returns an array of error messages, empty if valid
 */
export function validateFormData(
  formData: Record<string, unknown>,
  formDefinition: FormDefinition
): string[] {
  const errors: string[] = [];

  for (const section of formDefinition.sections) {
    for (const field of section.fields) {
      const value = formData[field.name];

      // Required check
      if (
        field.isRequired &&
        (value === undefined || value === null || value === "")
      ) {
        errors.push(`${field.label} is required.`);
        continue;
      }

      // Skip further checks if value is empty and not required
      if (value === undefined || value === null || value === "") continue;

      // Number validation
      if (field.type === "NUMBER") {
        const numValue = typeof value === "number" ? value : Number(value);
        if (isNaN(numValue)) {
          errors.push(`${field.label} must be a valid number.`);
          continue;
        }
        if (field.minValue !== undefined && numValue < field.minValue) {
          errors.push(`${field.label} must be at least ${field.minValue}.`);
        }
        if (field.maxValue !== undefined && numValue > field.maxValue) {
          errors.push(`${field.label} must not exceed ${field.maxValue}.`);
        }
      }

      // Pattern validation
      if (field.pattern && typeof value === "string") {
        const regex = new RegExp(field.pattern);
        if (!regex.test(value)) {
          errors.push(`${field.label} format is invalid.`);
        }
      }
    }
  }

  return errors;
}

/**
 * Get the week number for a given date
 */
export function getWeekNumber(date: Date): number {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 4 - (d.getDay() || 7));
  const yearStart = new Date(d.getFullYear(), 0, 1);
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

/**
 * Get a human-readable label for a report period
 */
export function getReportPeriodLabel(
  frequency: ReportFrequency,
  week?: number,
  month?: number,
  quarter?: number,
  year?: number
): string {
  const yearStr = year ? ` ${year}` : "";

  switch (frequency) {
    case "WEEKLY":
      return `Week ${week ?? "?"}${yearStr}`;
    case "MONTHLY": {
      if (month) {
        const monthName = new Date(2024, month - 1, 1).toLocaleString(
          "default",
          { month: "long" }
        );
        return `${monthName}${yearStr}`;
      }
      return `Month ?${yearStr}`;
    }
    case "QUARTERLY":
      return `Q${quarter ?? "?"}${yearStr}`;
    case "YEARLY":
      return `Year${yearStr}`;
    case "AD_HOC":
      return `Ad Hoc${yearStr}`;
    default:
      return `Period${yearStr}`;
  }
}

/**
 * Check if a report submission is overdue
 */
export function isReportOverdue(
  submission: ReportSubmission,
  deadlineDays: number = 7
): boolean {
  if (submission.status !== ReportStatus.DRAFT) return false;

  const createdAt = new Date(submission.createdAt);
  const deadline = new Date(createdAt);
  deadline.setDate(deadline.getDate() + deadlineDays);

  return new Date() > deadline;
}

/**
 * Sort report submissions by priority (most urgent first)
 */
export function sortByPriority(
  submissions: ReportSubmission[]
): ReportSubmission[] {
  const statusPriority: Record<string, number> = {
    REQUIRES_EDITS: 0,
    SUBMITTED: 1,
    DRAFT: 2,
    APPROVED: 3,
    REVIEWED: 4,
    FINALIZED: 5,
  };

  return [...submissions].sort((a, b) => {
    const aPriority = statusPriority[a.status] ?? 99;
    const bPriority = statusPriority[b.status] ?? 99;
    if (aPriority !== bPriority) return aPriority - bPriority;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
}

/**
 * Format a report status for display
 */
export function formatReportStatus(status: ReportStatus): string {
  const labels: Record<ReportStatus, string> = {
    [ReportStatus.DRAFT]: "Draft",
    [ReportStatus.SUBMITTED]: "Submitted",
    [ReportStatus.REQUIRES_EDITS]: "Requires Edits",
    [ReportStatus.APPROVED]: "Approved",
    [ReportStatus.REVIEWED]: "Reviewed",
    [ReportStatus.FINALIZED]: "Finalized",
  };
  return labels[status] ?? status;
}

/**
 * Get allowed next statuses for a report based on current status
 */
export function getNextStatuses(currentStatus: ReportStatus): ReportStatus[] {
  const transitions: Record<ReportStatus, ReportStatus[]> = {
    [ReportStatus.DRAFT]: [ReportStatus.SUBMITTED],
    [ReportStatus.SUBMITTED]: [
      ReportStatus.APPROVED,
      ReportStatus.REQUIRES_EDITS,
    ],
    [ReportStatus.REQUIRES_EDITS]: [ReportStatus.SUBMITTED],
    [ReportStatus.APPROVED]: [ReportStatus.REVIEWED],
    [ReportStatus.REVIEWED]: [ReportStatus.FINALIZED],
    [ReportStatus.FINALIZED]: [],
  };
  return transitions[currentStatus] ?? [];
}
