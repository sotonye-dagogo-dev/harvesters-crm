import { NextRequest } from "next/server";
import { reportEditDb } from "@/lib/data/database";
import { getAuthenticatedUser } from "@/lib/utils/middleware";
import {
    successResponse,
    notFoundResponse,
    badRequestResponse,
    forbiddenResponse,
    handleApiError,
} from "@/lib/utils/api";
import { USER_ROLES } from "@/lib/constants";
import { ReportEditStatus } from "@/lib/types";
import { sendReportEditApprovedNotification } from "@/lib/utils/notificationHelpers";

const APPROVERS: string[] = [
    USER_ROLES.SUPERADMIN,
    USER_ROLES.GROUP_PASTOR,
    USER_ROLES.GROUP_ADMIN,
    USER_ROLES.CAMPUS_PASTOR,
];

// POST /api/reports/:id/edits/:editId/approve — Approve a report edit
export async function POST(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string; editId: string }> }
) {
    try {
        const { editId } = await params;
        const { user, error } = await getAuthenticatedUser();
        if (error) return error;

        if (!APPROVERS.includes(user!.role)) {
            return forbiddenResponse("You do not have permission to approve edits.");
        }

        const edit = reportEditDb.findById(editId);
        if (!edit) return notFoundResponse("Report edit not found");

        if (edit.status !== ReportEditStatus.SUBMITTED) {
            return badRequestResponse("Only submitted edits can be approved.");
        }

        const updated = reportEditDb.approve(editId, user!.id);
        if (!updated) return badRequestResponse("Failed to approve edit.");

        // Notify edit submitter
        await sendReportEditApprovedNotification(editId, user!.id);

        return successResponse(updated, "Edit approved and applied successfully");
    } catch (err) {
        return handleApiError(err);
    }
}
