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
import { sendReportApprovedNotification } from "@/lib/utils/notificationHelpers";

// Roles allowed to approve reports
const APPROVERS: string[] = [
    USER_ROLES.SUPERADMIN,
    USER_ROLES.GROUP_PASTOR,
    USER_ROLES.GROUP_ADMIN,
    USER_ROLES.CAMPUS_PASTOR,
];

// POST /api/reports/:id/approve — Approve a submitted report
export async function POST(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const { user, error } = await getAuthenticatedUser();
        if (error) return error;

        if (!APPROVERS.includes(user!.role)) {
            return forbiddenResponse("You do not have permission to approve reports.");
        }

        const report = reportDb.findById(id);
        if (!report) return notFoundResponse("Report not found");

        if (report.status !== ReportStatus.SUBMITTED) {
            return badRequestResponse("Only submitted reports can be approved.");
        }

        const updated = reportDb.approve(id, user!.id);
        if (!updated) return badRequestResponse("Failed to approve report.");

        // Notify report submitter
        await sendReportApprovedNotification(id, user!.id);

        return successResponse(updated, "Report approved successfully");
    } catch (err) {
        return handleApiError(err);
    }
}
