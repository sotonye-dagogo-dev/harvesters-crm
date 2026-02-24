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
import { requestEditsSchema } from "@/lib/utils/validation";
import { ReportStatus } from "@/lib/types";
import { sendReportEditsRequestedNotification } from "@/lib/utils/notificationHelpers";

// Roles allowed to request edits
const REVIEWERS: string[] = [
    USER_ROLES.SUPERADMIN,
    USER_ROLES.GROUP_PASTOR,
    USER_ROLES.GROUP_ADMIN,
    USER_ROLES.CAMPUS_PASTOR,
];

// POST /api/reports/:id/request-edits — Request changes to a submitted report
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const { user, error } = await getAuthenticatedUser();
        if (error) return error;

        if (!REVIEWERS.includes(user!.role)) {
            return forbiddenResponse("You do not have permission to request edits.");
        }

        const report = reportDb.findById(id);
        if (!report) return notFoundResponse("Report not found");

        if (report.status !== ReportStatus.SUBMITTED) {
            return badRequestResponse(
                "Only submitted reports can have edits requested."
            );
        }

        const body = await request.json();
        const parsed = requestEditsSchema.safeParse(body);
        if (!parsed.success) {
            return badRequestResponse(
                parsed.error.issues.map((i) => i.message).join(", ")
            );
        }

        const updated = reportDb.requestEdits(id, user!.id, parsed.data.reason);
        if (!updated)
            return badRequestResponse("Failed to request edits on report.");

        // Notify report submitter
        await sendReportEditsRequestedNotification(id, user!.id, parsed.data.reason);

        return successResponse(updated, "Edits requested successfully");
    } catch (err) {
        return handleApiError(err);
    }
}
