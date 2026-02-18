import { NextRequest } from "next/server";
import { reportDb, reportVersionDb } from "@/lib/data/database";
import { getAuthenticatedUser } from "@/lib/utils/middleware";
import {
    successResponse,
    notFoundResponse,
    forbiddenResponse,
    handleApiError,
} from "@/lib/utils/api";
import { USER_ROLES } from "@/lib/constants";

const WIDE_VIEW_ROLES: string[] = [
    USER_ROLES.SUPERADMIN,
    USER_ROLES.GROUP_PASTOR,
    USER_ROLES.GROUP_ADMIN,
];

// GET /api/reports/:id/versions — Get version snapshots for a report
export async function GET(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const { user, error } = await getAuthenticatedUser();
        if (error) return error;

        const report = reportDb.findById(id);
        if (!report) return notFoundResponse("Report not found");

        if (!WIDE_VIEW_ROLES.includes(user!.role)) {
            const isCampusScoped = user!.campusId === report.campusId;
            const isOwner = report.submittedById === user!.id;
            if (!isCampusScoped && !isOwner) {
                return forbiddenResponse("You do not have access to report versions.");
            }
        }

        const versions = reportVersionDb.findByReportId(id);
        return successResponse(versions);
    } catch (err) {
        return handleApiError(err);
    }
}
