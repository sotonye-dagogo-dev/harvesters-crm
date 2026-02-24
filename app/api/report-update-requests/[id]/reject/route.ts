import { NextRequest } from "next/server";
import { db } from "@/lib/data/database";
import { requireRole } from "@/lib/utils/middleware";
import {
    successResponse,
    notFoundResponse,
    badRequestResponse,
    handleApiError,
} from "@/lib/utils/api";
import { USER_ROLES } from "@/lib/constants";
import { UserRole, ReportUpdateRequestStatus } from "@/lib/types";
import { rejectReasonSchema } from "@/lib/utils/validation";
import { sendReportUpdateRequestRejectedNotification } from "@/lib/utils/notificationHelpers";

// Roles that can reject update requests
const APPROVERS: UserRole[] = [
    USER_ROLES.SUPERADMIN as UserRole,
    USER_ROLES.GROUP_PASTOR as UserRole,
    USER_ROLES.GROUP_ADMIN as UserRole,
];

// POST /api/report-update-requests/:id/reject — Reject an update request
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const { user, error } = await requireRole(APPROVERS);
        if (error) return error;

        const existing = db.reportUpdateRequests.findById(id);
        if (!existing) return notFoundResponse("Update request not found");

        if (existing.status !== ReportUpdateRequestStatus.PENDING) {
            return badRequestResponse(
                `Cannot reject update request with status "${existing.status}". Only pending requests can be rejected.`
            );
        }

        // Parse optional rejection reason
        let reason: string | undefined;
        try {
            const body = await request.json();
            const parsed = rejectReasonSchema.safeParse(body);
            if (parsed.success && parsed.data.reason) {
                reason = parsed.data.reason;
            }
        } catch {
            // No body provided — acceptable, reason is optional
        }

        const rejected = db.reportUpdateRequests.reject(id, user!.id, reason);
        if (!rejected) return notFoundResponse("Update request not found");

        // Notify the requester
        await sendReportUpdateRequestRejectedNotification(id, user!.id, reason);

        return successResponse(rejected, "Update request rejected");
    } catch (err) {
        return handleApiError(err);
    }
}
