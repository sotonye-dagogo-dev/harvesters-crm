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
import { rejectReasonSchema } from "@/lib/utils/validation";
import { ReportEditStatus } from "@/lib/types";
import { sendReportEditRejectedNotification } from "@/lib/utils/notificationHelpers";

const APPROVERS: string[] = [
    USER_ROLES.SUPERADMIN,
    USER_ROLES.GROUP_PASTOR,
    USER_ROLES.GROUP_ADMIN,
    USER_ROLES.CAMPUS_PASTOR,
];

// POST /api/reports/:id/edits/:editId/reject — Reject a report edit
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string; editId: string }> }
) {
    try {
        const { editId } = await params;
        const { user, error } = await getAuthenticatedUser();
        if (error) return error;

        if (!APPROVERS.includes(user!.role)) {
            return forbiddenResponse("You do not have permission to reject edits.");
        }

        const edit = reportEditDb.findById(editId);
        if (!edit) return notFoundResponse("Report edit not found");

        if (edit.status !== ReportEditStatus.SUBMITTED) {
            return badRequestResponse("Only submitted edits can be rejected.");
        }

        let reason: string | undefined;
        try {
            const body = await request.json();
            const parsed = rejectReasonSchema.safeParse(body);
            if (parsed.success) reason = parsed.data.reason;
        } catch {
            // No body is OK for rejection
        }

        const updated = reportEditDb.reject(editId, user!.id, reason);
        if (!updated) return badRequestResponse("Failed to reject edit.");

        // Notify edit submitter
        await sendReportEditRejectedNotification(editId, user!.id, reason);

        return successResponse(updated, "Edit rejected");
    } catch (err) {
        return handleApiError(err);
    }
}
