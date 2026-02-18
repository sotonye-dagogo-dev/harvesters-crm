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
import { sendReportUpdateRequestApprovedNotification } from "@/lib/utils/notificationHelpers";

// Roles that can approve update requests
const APPROVERS: UserRole[] = [
    USER_ROLES.SUPERADMIN as UserRole,
    USER_ROLES.GROUP_PASTOR as UserRole,
    USER_ROLES.GROUP_ADMIN as UserRole,
];

// POST /api/report-update-requests/:id/approve — Approve an update request
export async function POST(
    _request: NextRequest,
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
                `Cannot approve update request with status "${existing.status}". Only pending requests can be approved.`
            );
        }

        const approved = db.reportUpdateRequests.approve(id, user!.id);
        if (!approved) return notFoundResponse("Update request not found");

        // Notify the requester
        await sendReportUpdateRequestApprovedNotification(id, user!.id);

        return successResponse(approved, "Update request approved and changes applied to report");
    } catch (err) {
        return handleApiError(err);
    }
}
