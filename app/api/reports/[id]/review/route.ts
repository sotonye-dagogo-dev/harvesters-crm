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
import { sendReportReviewedNotification } from "@/lib/utils/notificationHelpers";

// Roles allowed to review (mark approved → reviewed)
const REVIEWERS: string[] = [
    USER_ROLES.SUPERADMIN,
    USER_ROLES.GROUP_PASTOR,
    USER_ROLES.GROUP_ADMIN,
];

// POST /api/reports/:id/review — Mark an approved report as reviewed
export async function POST(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const { user, error } = await getAuthenticatedUser();
        if (error) return error;

        if (!REVIEWERS.includes(user!.role)) {
            return forbiddenResponse("You do not have permission to review reports.");
        }

        const report = reportDb.findById(id);
        if (!report) return notFoundResponse("Report not found");

        if (report.status !== ReportStatus.APPROVED) {
            return badRequestResponse("Only approved reports can be reviewed.");
        }

        const updated = reportDb.review(id, user!.id);
        if (!updated) return badRequestResponse("Failed to review report.");

        // Notify report submitter
        await sendReportReviewedNotification(id, user!.id);

        return successResponse(updated, "Report reviewed successfully");
    } catch (err) {
        return handleApiError(err);
    }
}
