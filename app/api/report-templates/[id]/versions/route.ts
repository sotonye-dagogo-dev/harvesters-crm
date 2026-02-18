import { NextRequest } from "next/server";
import { reportTemplateVersionDb, reportTemplateDb } from "@/lib/data/database";
import { getAuthenticatedUser } from "@/lib/utils/middleware";
import {
    successResponse,
    notFoundResponse,
    handleApiError,
} from "@/lib/utils/api";

// GET /api/report-templates/:id/versions — List all versions of a template
export async function GET(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const { user, error } = await getAuthenticatedUser();
        if (error) return error;

        const template = reportTemplateDb.findById(id);
        if (!template) return notFoundResponse("Report template not found");

        const versions = reportTemplateVersionDb.findByTemplateId(id);

        // Sort by version descending (most recent first)
        const sorted = [...versions].sort((a, b) => b.version - a.version);

        return successResponse(sorted);
    } catch (err) {
        return handleApiError(err);
    }
}
