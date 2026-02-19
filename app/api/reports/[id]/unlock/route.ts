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

// POST /api/reports/:id/unlock — Superadmin unlock specific fields on a report
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const { user, error } = await getAuthenticatedUser();
        if (error) return error;

        // Only superadmin can unlock fields
        if (user!.role !== USER_ROLES.SUPERADMIN) {
            return forbiddenResponse(
                "Only superadmins can unlock report fields."
            );
        }

        const report = reportDb.findById(id);
        if (!report) return notFoundResponse("Report not found");

        const body = await request.json();
        const { metricIds, reason } = body as {
            metricIds?: string[];
            reason?: string;
        };

        if (!metricIds || !Array.isArray(metricIds) || metricIds.length === 0) {
            return badRequestResponse(
                "metricIds must be a non-empty array of metric template IDs to unlock."
            );
        }

        const updated = reportDb.unlockFields(id, metricIds, user!.id, reason);
        if (!updated)
            return badRequestResponse("Failed to unlock report fields.");

        return successResponse(updated, "Report fields unlocked successfully");
    } catch (err) {
        return handleApiError(err);
    }
}
