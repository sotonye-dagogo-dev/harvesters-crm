import { NextRequest } from "next/server";
import { reportEditDb } from "@/lib/data/database";
import { getAuthenticatedUser } from "@/lib/utils/middleware";
import {
    successResponse,
    notFoundResponse,
    forbiddenResponse,
    handleApiError,
} from "@/lib/utils/api";
import { USER_ROLES } from "@/lib/constants";

// GET /api/reports/:id/edits/:editId — Get a single report edit with details
export async function GET(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string; editId: string }> }
) {
    try {
        const { editId } = await params;
        const { user, error } = await getAuthenticatedUser();
        if (error) return error;

        const edit = reportEditDb.getWithDetails(editId);
        if (!edit) return notFoundResponse("Report edit not found");

        // Access control
        if (
            user!.role !== USER_ROLES.SUPERADMIN &&
            user!.role !== USER_ROLES.GROUP_PASTOR &&
            user!.role !== USER_ROLES.GROUP_ADMIN &&
            user!.role !== USER_ROLES.CAMPUS_PASTOR &&
            edit.submittedById !== user!.id
        ) {
            return forbiddenResponse("You do not have access to this edit.");
        }

        return successResponse(edit);
    } catch (err) {
        return handleApiError(err);
    }
}
