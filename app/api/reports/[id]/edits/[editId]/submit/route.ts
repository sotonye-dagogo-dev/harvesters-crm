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
import { sendReportEditSubmittedNotification } from "@/lib/utils/notificationHelpers";

// POST /api/reports/:id/edits/:editId/submit — Submit a draft edit for review
export async function POST(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string; editId: string }> }
) {
    try {
        const { id: reportId, editId } = await params;
        const { user, error } = await getAuthenticatedUser();
        if (error) return error;

        const edit = reportEditDb.findById(editId);
        if (!edit) return notFoundResponse("Report edit not found");

        if (
            edit.submittedById !== user!.id &&
            user!.role !== USER_ROLES.SUPERADMIN
        ) {
            return forbiddenResponse("You can only submit your own edits.");
        }

        if (edit.status !== ReportEditStatus.DRAFT) {
            return badRequestResponse("Only draft edits can be submitted.");
        }

        const updated = reportEditDb.submit(editId);
        if (!updated) return badRequestResponse("Failed to submit edit.");

        // Notify approvers
        await sendReportEditSubmittedNotification(editId, reportId, user!.id);

        return successResponse(updated, "Edit submitted for review");
    } catch (err) {
        return handleApiError(err);
    }
}
