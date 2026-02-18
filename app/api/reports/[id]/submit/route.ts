import { NextRequest } from "next/server";
import { reportDb } from "@/lib/data/database";
import { getAuthenticatedUser } from "@/lib/utils/middleware";
import {
    successResponse,
    notFoundResponse,
    badRequestResponse,
    forbiddenResponse,
    handleApiError,
} from "@/lib/utils/api";
import { USER_ROLES } from "@/lib/constants";
import { ReportStatus } from "@/lib/types";
import { sendReportSubmittedNotification } from "@/lib/utils/notificationHelpers";

// POST /api/reports/:id/submit — Submit a report for review
export async function POST(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const { user, error } = await getAuthenticatedUser();
        if (error) return error;

        const report = reportDb.findById(id);
        if (!report) return notFoundResponse("Report not found");

        // Only submitter can submit
        if (
            report.submittedById !== user!.id &&
            user!.role !== USER_ROLES.SUPERADMIN
        ) {
            return forbiddenResponse("You can only submit your own reports.");
        }

        if (
            report.status !== ReportStatus.DRAFT &&
            report.status !== ReportStatus.REQUIRES_EDITS
        ) {
            return badRequestResponse(
                "Only draft or requires-edits reports can be submitted."
            );
        }

        const updated = reportDb.submit(id, user!.id);
        if (!updated) return badRequestResponse("Failed to submit report.");

        // Send notifications to approvers
        await sendReportSubmittedNotification(id, user!.id);

        return successResponse(updated, "Report submitted successfully");
    } catch (err) {
        return handleApiError(err);
    }
}
