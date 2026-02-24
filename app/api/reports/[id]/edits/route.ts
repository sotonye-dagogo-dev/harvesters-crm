import { NextRequest } from "next/server";
import { reportDb, reportEditDb } from "@/lib/data/database";
import { getAuthenticatedUser } from "@/lib/utils/middleware";
import {
    successResponse,
    paginatedResponse,
    notFoundResponse,
    badRequestResponse,
    forbiddenResponse,
    handleApiError,
} from "@/lib/utils/api";
import { USER_ROLES } from "@/lib/constants";
import { createReportEditSchema } from "@/lib/utils/validation";

// GET /api/reports/:id/edits — List edits for a report
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const { user, error } = await getAuthenticatedUser();
        if (error) return error;

        const report = reportDb.findById(id);
        if (!report) return notFoundResponse("Report not found");

        const sp = request.nextUrl.searchParams;
        const page = parseInt(sp.get("page") || "1");
        const pageSize = parseInt(sp.get("pageSize") || "20");

        let edits = reportEditDb.findByReportId(id);

        // Non-superadmin/group-level: only see own edits
        if (
            user!.role !== USER_ROLES.SUPERADMIN &&
            user!.role !== USER_ROLES.GROUP_PASTOR &&
            user!.role !== USER_ROLES.GROUP_ADMIN &&
            user!.role !== USER_ROLES.CAMPUS_PASTOR
        ) {
            edits = edits.filter((e) => e.submittedById === user!.id);
        }

        const total = edits.length;
        const start = (page - 1) * pageSize;
        const paginated = edits.slice(start, start + pageSize);

        return paginatedResponse(paginated, total, page, pageSize);
    } catch (err) {
        return handleApiError(err);
    }
}

// POST /api/reports/:id/edits — Create a new edit for a report
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const { user, error } = await getAuthenticatedUser();
        if (error) return error;

        const report = reportDb.findById(id);
        if (!report) return notFoundResponse("Report not found");

        // Only the submitter or superadmin can create edits
        if (
            report.submittedById !== user!.id &&
            user!.role !== USER_ROLES.SUPERADMIN
        ) {
            return forbiddenResponse("You can only create edits for your own reports.");
        }

        const body = await request.json();
        const parsed = createReportEditSchema.safeParse(body);
        if (!parsed.success) {
            return badRequestResponse(
                parsed.error.issues.map((i) => i.message).join(", ")
            );
        }

        const edit = reportEditDb.create({
            reportId: id,
            submittedById: user!.id,
            reason: parsed.data.reason,
            sections: parsed.data.sections,
        });

        return successResponse(edit, "Report edit created successfully", 201);
    } catch (err) {
        return handleApiError(err);
    }
}
