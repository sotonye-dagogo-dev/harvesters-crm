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

// POST /api/reports/:id/lock — Lock a reviewed report (final state)
export async function POST(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const { user, error } = await getAuthenticatedUser();
        if (error) return error;

        // Only superadmin or group pastor can lock
        if (
            user!.role !== USER_ROLES.SUPERADMIN &&
            user!.role !== USER_ROLES.GROUP_PASTOR
        ) {
            return forbiddenResponse("You do not have permission to lock reports.");
        }

        const report = reportDb.findById(id);
        if (!report) return notFoundResponse("Report not found");

        if (report.status !== ReportStatus.REVIEWED) {
            return badRequestResponse("Only reviewed reports can be locked.");
        }

        const updated = reportDb.lock(id, user!.id);
        if (!updated) return badRequestResponse("Failed to lock report.");

        return successResponse(updated, "Report locked successfully");
    } catch (err) {
        return handleApiError(err);
    }
}
