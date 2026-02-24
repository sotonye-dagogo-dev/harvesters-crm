import { NextRequest } from "next/server";
import { reportTemplateDb } from "@/lib/data/database";
import { getAuthenticatedUser, requireRole } from "@/lib/utils/middleware";
import {
    successResponse,
    notFoundResponse,
    badRequestResponse,
    handleApiError,
} from "@/lib/utils/api";
import { USER_ROLES } from "@/lib/constants";
import { updateReportTemplateSchema } from "@/lib/utils/validation";
import { UserRole } from "@/lib/types";

// GET /api/report-templates/:id — Get a single template
export async function GET(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const { error } = await getAuthenticatedUser();
        if (error) return error;

        const template = reportTemplateDb.findById(id);
        if (!template) return notFoundResponse("Report template not found");

        return successResponse(template);
    } catch (err) {
        return handleApiError(err);
    }
}

// PUT /api/report-templates/:id — Update a template (superadmin only)
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const { user, error } = await requireRole([
            USER_ROLES.SUPERADMIN as UserRole,
        ]);
        if (error) return error;

        const existing = reportTemplateDb.findById(id);
        if (!existing) return notFoundResponse("Report template not found");

        const body = await request.json();
        const parsed = updateReportTemplateSchema.safeParse(body);
        if (!parsed.success) {
            return badRequestResponse(
                parsed.error.issues.map((i: { message: string }) => i.message).join(", ")
            );
        }

        const updated = reportTemplateDb.update(id, parsed.data, user!.id);
        if (!updated) return notFoundResponse("Report template not found");

        return successResponse(updated, "Report template updated successfully");
    } catch (err) {
        return handleApiError(err);
    }
}

// DELETE /api/report-templates/:id — Deactivate (soft-delete) a template
export async function DELETE(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const { error } = await requireRole([
            USER_ROLES.SUPERADMIN as UserRole,
        ]);
        if (error) return error;

        const existing = reportTemplateDb.findById(id);
        if (!existing) return notFoundResponse("Report template not found");

        reportTemplateDb.deactivate(id);
        return successResponse(null, "Report template deactivated successfully");
    } catch (err) {
        return handleApiError(err);
    }
}
