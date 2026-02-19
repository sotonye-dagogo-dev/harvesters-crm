/**
 * Report Field Locking, Auto-Calculation & Validation Utilities
 *
 * Provides logic for:
 * - Determining which metric fields should be locked based on report status
 * - Auto-computing achievement percentages
 * - Year-over-Year (YoY) growth calculations
 * - Submission validation (required fields, numeric ranges)
 * - Deadline-based logic (auto-approve, reminders)
 */

import { ReportStatus, MetricFieldType } from "@/lib/types";

// ============================================================================
// Field Locking
// ============================================================================

/**
 * Report statuses where ALL fields are locked (read-only)
 */
const FULLY_LOCKED_STATUSES = new Set<ReportStatus>([
    ReportStatus.SUBMITTED,
    ReportStatus.APPROVED,
    ReportStatus.REVIEWED,
    ReportStatus.LOCKED,
]);

/**
 * Report statuses where fields are editable
 */
const EDITABLE_STATUSES = new Set<ReportStatus>([
    ReportStatus.DRAFT,
    ReportStatus.REQUIRES_EDITS,
]);

/**
 * Determine if a report is fully locked (no fields editable)
 */
export function isReportFullyLocked(status: ReportStatus): boolean {
    return FULLY_LOCKED_STATUSES.has(status);
}

/**
 * Determine if a report is in an editable state
 */
export function isReportEditable(status: ReportStatus): boolean {
    return EDITABLE_STATUSES.has(status);
}

/**
 * Compute the set of locked metric IDs for a given report.
 *
 * Rules:
 * - DRAFT: No locked fields
 * - SUBMITTED/APPROVED/REVIEWED/LOCKED: All fields locked
 * - REQUIRES_EDITS: If `editableMetricIds` is provided, only those are unlocked;
 *   otherwise all fields are unlocked for editing
 *
 * @param status - Current report status
 * @param allMetricIds - Array of all template metric IDs in the report
 * @param editableMetricIds - Optional set of metric IDs that are explicitly allowed to be edited (for REQUIRES_EDITS status)
 * @returns Set of metric IDs that should be locked
 */
export function computeLockedMetricIds(
    status: ReportStatus,
    allMetricIds: string[],
    editableMetricIds?: Set<string>
): Set<string> {
    // Fully locked states — lock all metrics
    if (FULLY_LOCKED_STATUSES.has(status)) {
        return new Set(allMetricIds);
    }

    // Draft — nothing locked
    if (status === ReportStatus.DRAFT) {
        return new Set();
    }

    // Requires Edits — only specified metrics are editable, rest are locked
    if (status === ReportStatus.REQUIRES_EDITS) {
        if (!editableMetricIds || editableMetricIds.size === 0) {
            // No specific metrics specified — all editable
            return new Set();
        }
        // Lock everything except the editable ones
        return new Set(allMetricIds.filter((id) => !editableMetricIds.has(id)));
    }

    return new Set();
}

// ============================================================================
// Auto-Calculations
// ============================================================================

/**
 * Compute achievement percentage: (achieved / goal) * 100
 * Returns undefined if goal is 0 or values are missing
 */
export function computeAchievementPercentage(
    monthlyGoal?: number,
    monthlyAchieved?: number
): number | undefined {
    if (!monthlyGoal || monthlyGoal <= 0 || monthlyAchieved === undefined || monthlyAchieved === null) {
        return undefined;
    }
    return (monthlyAchieved / monthlyGoal) * 100;
}

/**
 * Compute Year-over-Year growth percentage.
 * Formula: ((currentValue - previousValue) / previousValue) * 100
 *
 * @param currentValue - Current period achieved value
 * @param previousValue - Previous period value (yoyGoal = last year's achieved)
 * @returns Growth percentage, or undefined if previous is 0/missing
 */
export function computeYoYGrowth(
    currentValue?: number,
    previousValue?: number
): number | undefined {
    if (!previousValue || previousValue <= 0 || currentValue === undefined || currentValue === null) {
        return undefined;
    }
    return ((currentValue - previousValue) / previousValue) * 100;
}

/**
 * Interface for enriched metric data with computed values
 */
interface EnrichedMetricValue {
    templateMetricId: string;
    monthlyGoal?: number;
    monthlyAchieved?: number;
    yoyGoal?: number;
    textValue?: string;
    achievementPercentage?: number;
    yoyGrowth?: number;
    isLocked: boolean;
}

/**
 * Enrich a report's metric values with computed fields and lock state.
 * This is the main function used by report forms to prepare metric data.
 *
 * @param metrics - Raw metric values from the report
 * @param lockedMetricIds - Set of locked metric IDs
 * @returns Array of enriched metric values with computed percentages and lock states
 */
export function enrichMetricValues(
    metrics: Array<{
        templateMetricId: string;
        monthlyGoal?: number;
        monthlyAchieved?: number;
        yoyGoal?: number;
        textValue?: string;
    }>,
    lockedMetricIds: Set<string>
): EnrichedMetricValue[] {
    return metrics.map((m) => ({
        ...m,
        achievementPercentage: computeAchievementPercentage(m.monthlyGoal, m.monthlyAchieved),
        yoyGrowth: computeYoYGrowth(m.monthlyAchieved, m.yoyGoal),
        isLocked: lockedMetricIds.has(m.templateMetricId),
    }));
}

/**
 * Determine if a field type is numeric (can have calculations applied)
 */
export function isNumericFieldType(fieldType: MetricFieldType): boolean {
    return (
        fieldType === MetricFieldType.NUMBER ||
        fieldType === MetricFieldType.PERCENTAGE ||
        fieldType === MetricFieldType.CURRENCY
    );
}

/**
 * Compute aggregate statistics for a section's metrics
 */
export function computeSectionAggregates(
    metrics: Array<{
        monthlyGoal?: number;
        monthlyAchieved?: number;
    }>
): {
    totalGoal: number;
    totalAchieved: number;
    overallPercentage: number | undefined;
} {
    let totalGoal = 0;
    let totalAchieved = 0;

    for (const m of metrics) {
        totalGoal += m.monthlyGoal ?? 0;
        totalAchieved += m.monthlyAchieved ?? 0;
    }

    const overallPercentage =
        totalGoal > 0 ? (totalAchieved / totalGoal) * 100 : undefined;

    return { totalGoal, totalAchieved, overallPercentage };
}

/**
 * Get the display label for a lock state
 */
export function getFieldLockLabel(status: ReportStatus): string {
    if (FULLY_LOCKED_STATUSES.has(status)) {
        const labels: Record<string, string> = {
            [ReportStatus.SUBMITTED]: "Locked — awaiting review",
            [ReportStatus.APPROVED]: "Locked — report approved",
            [ReportStatus.REVIEWED]: "Locked — report reviewed",
            [ReportStatus.LOCKED]: "Locked — report finalized",
        };
        return labels[status] || "Locked";
    }
    return "Editable";
}

// ============================================================================
// Submission Validation
// ============================================================================

/**
 * A single validation error for a report field.
 */
interface ReportValidationError {
    /** The section name where the error occurred */
    sectionName: string;
    /** The metric name where the error occurred (undefined for section-level errors) */
    metricName?: string;
    /** Descriptive error message */
    message: string;
    /** The template metric ID (for programmatic use) */
    templateMetricId?: string;
}

/**
 * Result of a report submission validation check.
 */
export interface ReportValidationResult {
    isValid: boolean;
    errors: ReportValidationError[];
}

/**
 * Validate a report's metric values against its template before submission.
 *
 * Checks:
 * - Required sections have at least one metric filled
 * - Required metrics have values (monthlyGoal, monthlyAchieved, or textValue depending on config)
 * - Numeric fields are within min/max range (from template)
 *
 * @param report - The report with sections and metrics
 * @param template - The report template with section/metric definitions
 * @returns Validation result with list of errors
 */
export function validateReportForSubmission(
    report: {
        sections: Array<{
            templateSectionId: string;
            sectionName: string;
            metrics: Array<{
                templateMetricId: string;
                metricName: string;
                fieldType: MetricFieldType;
                monthlyGoal?: number;
                monthlyAchieved?: number;
                yoyGoal?: number;
                textValue?: string;
            }>;
        }>;
    },
    template: {
        sections: Array<{
            id: string;
            name: string;
            isRequired: boolean;
            metrics: Array<{
                id: string;
                name: string;
                fieldType: MetricFieldType;
                isRequired: boolean;
                minValue?: number;
                maxValue?: number;
                capturesGoal: boolean;
                capturesAchieved: boolean;
                capturesYoY: boolean;
            }>;
        }>;
    }
): ReportValidationResult {
    const errors: ReportValidationError[] = [];

    for (const templateSection of template.sections) {
        const reportSection = report.sections.find(
            (s) => s.templateSectionId === templateSection.id
        );

        // Required section is missing from report entirely
        if (templateSection.isRequired && !reportSection) {
            errors.push({
                sectionName: templateSection.name,
                message: `Required section "${templateSection.name}" is missing from the report.`,
            });
            continue;
        }

        if (!reportSection) continue;

        for (const templateMetric of templateSection.metrics) {
            const reportMetric = reportSection.metrics.find(
                (m) => m.templateMetricId === templateMetric.id
            );

            if (templateMetric.isRequired) {
                if (!reportMetric) {
                    errors.push({
                        sectionName: templateSection.name,
                        metricName: templateMetric.name,
                        templateMetricId: templateMetric.id,
                        message: `Required metric "${templateMetric.name}" in section "${templateSection.name}" is missing.`,
                    });
                    continue;
                }

                // Check for required values based on what the metric captures
                if (isNumericFieldType(templateMetric.fieldType)) {
                    if (
                        templateMetric.capturesGoal &&
                        (reportMetric.monthlyGoal === undefined ||
                            reportMetric.monthlyGoal === null)
                    ) {
                        errors.push({
                            sectionName: templateSection.name,
                            metricName: templateMetric.name,
                            templateMetricId: templateMetric.id,
                            message: `Monthly Goal is required for "${templateMetric.name}" in "${templateSection.name}".`,
                        });
                    }

                    if (
                        templateMetric.capturesAchieved &&
                        (reportMetric.monthlyAchieved === undefined ||
                            reportMetric.monthlyAchieved === null)
                    ) {
                        errors.push({
                            sectionName: templateSection.name,
                            metricName: templateMetric.name,
                            templateMetricId: templateMetric.id,
                            message: `Monthly Achieved is required for "${templateMetric.name}" in "${templateSection.name}".`,
                        });
                    }

                    if (
                        templateMetric.capturesYoY &&
                        (reportMetric.yoyGoal === undefined ||
                            reportMetric.yoyGoal === null)
                    ) {
                        errors.push({
                            sectionName: templateSection.name,
                            metricName: templateMetric.name,
                            templateMetricId: templateMetric.id,
                            message: `Year-on-Year Goal is required for "${templateMetric.name}" in "${templateSection.name}".`,
                        });
                    }
                } else if (templateMetric.fieldType === MetricFieldType.TEXT) {
                    if (!reportMetric.textValue?.trim()) {
                        errors.push({
                            sectionName: templateSection.name,
                            metricName: templateMetric.name,
                            templateMetricId: templateMetric.id,
                            message: `Text value is required for "${templateMetric.name}" in "${templateSection.name}".`,
                        });
                    }
                }
            }

            // Range validation for numeric fields (even if not required, validate if value exists)
            if (reportMetric && isNumericFieldType(templateMetric.fieldType)) {
                const valuesToCheck: Array<{
                    label: string;
                    value?: number;
                }> = [
                    {
                        label: "Monthly Goal",
                        value: reportMetric.monthlyGoal,
                    },
                    {
                        label: "Monthly Achieved",
                        value: reportMetric.monthlyAchieved,
                    },
                    { label: "YoY Goal", value: reportMetric.yoyGoal },
                ];

                for (const { label, value } of valuesToCheck) {
                    if (value === undefined || value === null) continue;

                    if (
                        templateMetric.minValue !== undefined &&
                        value < templateMetric.minValue
                    ) {
                        errors.push({
                            sectionName: templateSection.name,
                            metricName: templateMetric.name,
                            templateMetricId: templateMetric.id,
                            message: `${label} for "${templateMetric.name}" must be at least ${templateMetric.minValue} (got ${value}).`,
                        });
                    }

                    if (
                        templateMetric.maxValue !== undefined &&
                        value > templateMetric.maxValue
                    ) {
                        errors.push({
                            sectionName: templateSection.name,
                            metricName: templateMetric.name,
                            templateMetricId: templateMetric.id,
                            message: `${label} for "${templateMetric.name}" must be at most ${templateMetric.maxValue} (got ${value}).`,
                        });
                    }
                }
            }
        }
    }

    return {
        isValid: errors.length === 0,
        errors,
    };
}

// ============================================================================
// Deadline & Auto-Approve Logic
// ============================================================================

/**
 * Configuration for deadline windows and reminders.
 * In production, these would come from DB config.
 */
const DEADLINE_WINDOW_HOURS = 48;
const REMINDER_START_HOURS = 24;
const REMINDER_INTERVAL_HOURS = 6;

/**
 * Compute the submission deadline for a report based on its period end date.
 *
 * @param periodEndDate - ISO date string of when the reporting period ends
 * @returns ISO date string of the submission deadline
 */
export function computeSubmissionDeadline(periodEndDate: string): string {
    const endDate = new Date(periodEndDate);
    endDate.setHours(endDate.getHours() + DEADLINE_WINDOW_HOURS);
    return endDate.toISOString();
}

/**
 * Determine if a report's deadline has passed.
 */
export function isDeadlinePassed(deadline?: string): boolean {
    if (!deadline) return false;
    return new Date() > new Date(deadline);
}

/**
 * Determine if a report should be auto-approved.
 * A report is auto-approved if:
 * - It's in SUBMITTED status
 * - Its deadline has passed
 *
 * Per FR29: If deadline passes and Campus Pastor hasn't acted, auto-approve.
 */
export function shouldAutoApprove(
    status: ReportStatus,
    deadline?: string
): boolean {
    return status === ReportStatus.SUBMITTED && isDeadlinePassed(deadline);
}

/**
 * Compute which reminder notifications should be sent for a report.
 *
 * Returns an array of reminder types based on how much time remains.
 * - At 24h remaining → first reminder
 * - Every 6h after → escalating reminders
 * - At 0h → final notice
 *
 * @param deadline - ISO date string of the submission deadline
 * @returns Array of reminder labels to send
 */
export function computeDeadlineReminders(deadline: string): string[] {
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const hoursRemaining =
        (deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (hoursRemaining <= 0) {
        return ["FINAL_NOTICE"];
    }

    if (hoursRemaining > REMINDER_START_HOURS) {
        return []; // No reminders yet
    }

    // Within the reminder window (0-24 hours remaining)
    const reminders: string[] = [];

    // Calculate which 6-hour checkpoints we've passed
    const hoursSinceReminderStart = REMINDER_START_HOURS - hoursRemaining;
    const checkpointsPassed = Math.floor(
        hoursSinceReminderStart / REMINDER_INTERVAL_HOURS
    );

    if (checkpointsPassed === 0) {
        reminders.push("FIRST_REMINDER");
    } else {
        reminders.push(`ESCALATING_REMINDER_${checkpointsPassed}`);
    }

    return reminders;
}

/**
 * Get a human-readable time remaining label for a deadline.
 */
export function getDeadlineLabel(deadline: string): string {
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const hoursRemaining =
        (deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (hoursRemaining <= 0) return "Deadline passed";
    if (hoursRemaining < 1) {
        const minutes = Math.round(hoursRemaining * 60);
        return `${minutes} minute${minutes !== 1 ? "s" : ""} remaining`;
    }
    if (hoursRemaining < 24) {
        const hours = Math.round(hoursRemaining);
        return `${hours} hour${hours !== 1 ? "s" : ""} remaining`;
    }
    const days = Math.round(hoursRemaining / 24);
    return `${days} day${days !== 1 ? "s" : ""} remaining`;
}
