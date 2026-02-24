import { NextRequest } from "next/server";
import { db } from "@/lib/data/database";
import { getAuthenticatedUser } from "@/lib/utils/middleware";
import {
    successResponse,
    notFoundResponse,
    forbiddenResponse,
    handleApiError,
} from "@/lib/utils/api";
import { USER_ROLES } from "@/lib/constants";
import { UserRole } from "@/lib/types";

// Roles with wide visibility
const WIDE_VIEW_ROLES: UserRole[] = [
    USER_ROLES.SUPERADMIN as UserRole,
    USER_ROLES.GROUP_PASTOR as UserRole,
    USER_ROLES.GROUP_ADMIN as UserRole,
];

// GET /api/report-update-requests/:id — Get a single update request with details
export async function GET(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const { user, error } = await getAuthenticatedUser();
        if (error) return error;

        const requestWithDetails = db.reportUpdateRequests.getWithDetails(id);
        if (!requestWithDetails) {
            return notFoundResponse("Update request not found");
        }

        // Access control: wide-view roles can see all, others only their own
        const role = user!.role as UserRole;
        if (
            !WIDE_VIEW_ROLES.includes(role) &&
            requestWithDetails.requestedById !== user!.id
        ) {
            return forbiddenResponse(
                "You do not have permission to view this update request"
            );
        }

        return successResponse(requestWithDetails);
    } catch (err) {
        return handleApiError(err);
    }
}
