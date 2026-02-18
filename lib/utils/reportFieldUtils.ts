/**
 * Report Field Locking & Auto-Calculation Utilities
 *
 * Provides logic for:
 * - Determining which metric fields should be locked based on report status
 * - Auto-computing achievement percentages
 * - Year-over-Year (YoY) growth calculations
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
