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
import { updateReportSchema } from "@/lib/utils/validation";
import { ReportStatus } from "@/lib/types";
import { shouldAutoApprove } from "@/lib/utils/reportFieldUtils";

// Roles that can view any report
const WIDE_VIEW_ROLES: string[] = [
    USER_ROLES.SUPERADMIN,
    USER_ROLES.GROUP_PASTOR,
    USER_ROLES.GROUP_ADMIN,
];

// GET /api/reports/:id — Get report with full details
export async function GET(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const { user, error } = await getAuthenticatedUser();
        if (error) return error;

        // Check for auto-approve before returning (FR29)
        const rawReport = reportDb.findById(id);
        if (rawReport && shouldAutoApprove(rawReport.status, rawReport.deadline)) {
            reportDb.autoApprove(id);
        }

        const report = reportDb.getWithDetails(id);
        if (!report) return notFoundResponse("Report not found");

        // Access control
        if (!WIDE_VIEW_ROLES.includes(user!.role)) {
            const isCampusScoped =
                user!.campusId === report.campusId;
            const isOwner = report.submittedById === user!.id;
            const isDataEntryOwner = report.dataEntryById === user!.id;
            if (!isCampusScoped && !isOwner && !isDataEntryOwner) {
                return forbiddenResponse("You do not have access to this report.");
            }
        }

        return successResponse(report);
    } catch (err) {
        return handleApiError(err);
    }
}

// PUT /api/reports/:id — Update a draft report
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const { user, error } = await getAuthenticatedUser();
        if (error) return error;

        const existing = reportDb.findById(id);
        if (!existing) return notFoundResponse("Report not found");

        // Only allow editing DRAFT or REQUIRES_EDITS reports
        if (
            existing.status !== ReportStatus.DRAFT &&
            existing.status !== ReportStatus.REQUIRES_EDITS
        ) {
            return badRequestResponse(
                "Only draft or requires-edits reports can be edited directly."
            );
        }

        // Only the submitter or superadmin can edit
        if (
            existing.submittedById !== user!.id &&
            user!.role !== USER_ROLES.SUPERADMIN
        ) {
            return forbiddenResponse("You can only edit your own reports.");
        }

        const body = await request.json();
        const parsed = updateReportSchema.safeParse(body);
        if (!parsed.success) {
            return badRequestResponse(
                parsed.error.issues.map((i) => i.message).join(", ")
            );
        }

        const updated = reportDb.update(id, parsed.data);
        if (!updated) return notFoundResponse("Report not found");

        return successResponse(updated, "Report updated successfully");
    } catch (err) {
        return handleApiError(err);
    }
}

// DELETE /api/reports/:id — Delete a draft report
export async function DELETE(
    _request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const { user, error } = await getAuthenticatedUser();
        if (error) return error;

        const existing = reportDb.findById(id);
        if (!existing) return notFoundResponse("Report not found");

        // Only DRAFT reports can be deleted; only submitter or superadmin
        if (existing.status !== ReportStatus.DRAFT) {
            return badRequestResponse("Only draft reports can be deleted.");
        }
        if (
            existing.submittedById !== user!.id &&
            user!.role !== USER_ROLES.SUPERADMIN
        ) {
            return forbiddenResponse("You can only delete your own reports.");
        }

        reportDb.delete(id);
        return successResponse(null, "Report deleted successfully");
    } catch (err) {
        return handleApiError(err);
    }
}
