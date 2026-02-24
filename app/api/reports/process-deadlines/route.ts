import { NextRequest } from "next/server";
import { reportDb } from "@/lib/data/database";
import { getAuthenticatedUser } from "@/lib/utils/middleware";
import {
    successResponse,
    forbiddenResponse,
    handleApiError,
} from "@/lib/utils/api";
import { USER_ROLES } from "@/lib/constants";
import { ReportStatus } from "@/lib/types";
import {
    shouldAutoApprove,
    computeDeadlineReminders,
} from "@/lib/utils/reportFieldUtils";
import { sendReportDeadlineReminder } from "@/lib/utils/notificationHelpers";

/**
 * POST /api/reports/process-deadlines
 *
 * Utility endpoint that processes deadline-related logic for all active reports.
 * In production, this would be called by a cron job (e.g., every hour).
 * For the mock implementation, it can be triggered manually.
 *
 * Actions:
 * 1. Auto-approve SUBMITTED reports past deadline (FR29)
 * 2. Send deadline reminders for DRAFT/REQUIRES_EDITS reports approaching deadline
 */
export async function POST(_request: NextRequest) {
    try {
        const { user, error } = await getAuthenticatedUser();
        if (error) return error;

        // Only superadmin can trigger deadline processing
        if (user!.role !== USER_ROLES.SUPERADMIN) {
            return forbiddenResponse(
                "Only superadmins can trigger deadline processing."
            );
        }

        const results = {
            autoApproved: [] as string[],
            reminders: [] as Array<{
                reportId: string;
                type: string;
                success: boolean;
            }>,
            errors: [] as string[],
        };

        // Get all non-finalized reports
        const activeReports = reportDb.findAll().filter(
            (r) =>
                r.status !== ReportStatus.LOCKED &&
                r.status !== ReportStatus.REVIEWED &&
                r.deadline
        );

        for (const report of activeReports) {
            try {
                // 1. Auto-approve submitted reports past deadline
                if (shouldAutoApprove(report.status, report.deadline)) {
                    const approved = reportDb.autoApprove(report.id);
                    if (approved) {
                        results.autoApproved.push(report.id);
                    }
                    continue;
                }

                // 2. Send deadline reminders for draft/requires-edits reports
                if (
                    report.status === ReportStatus.DRAFT ||
                    report.status === ReportStatus.REQUIRES_EDITS
                ) {
                    const reminderTypes = computeDeadlineReminders(
                        report.deadline!
                    );
                    for (const reminderType of reminderTypes) {
                        const isFinal = reminderType === "FINAL_NOTICE";
                        const result = await sendReportDeadlineReminder(
                            report.id,
                            isFinal
                        );
                        results.reminders.push({
                            reportId: report.id,
                            type: reminderType,
                            success: result.success,
                        });
                    }
                }
            } catch (err) {
                results.errors.push(
                    `Error processing report ${report.id}: ${err instanceof Error ? err.message : "Unknown error"}`
                );
            }
        }

        return successResponse(results, "Deadline processing completed");
    } catch (err) {
        return handleApiError(err);
    }
}
