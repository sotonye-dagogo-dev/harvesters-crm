import { NextRequest } from "next/server";
import { reportSubmissionDb, reportNotificationDb } from "@/lib/data/database";
import { requireRole } from "@/lib/utils/middleware";
import {
  successResponse,
  notFoundResponse,
  badRequestResponse,
  handleApiError,
} from "@/lib/utils/api";
import { USER_ROLES } from "@/lib/constants";
import { UserRole, ReportStatus, ReportNotificationKind } from "@/lib/types";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// POST /api/reports/[id]/review — Mark a report as reviewed
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { user, error } = await requireRole([
      USER_ROLES.SUPERADMIN as UserRole,
      USER_ROLES.ZONAL_LEADER as UserRole,
    ]);
    if (error) return error;
    if (!user) return badRequestResponse("Authentication required.");

    const { id } = await params;
    const existing = reportSubmissionDb.findById(id);

    if (!existing) {
      return notFoundResponse("Report submission not found.");
    }

    if (existing.status !== ReportStatus.APPROVED) {
      return badRequestResponse(
        "Only approved reports can be marked as reviewed."
      );
    }

    const body = await request.json().catch(() => ({}));
    const notes = (body as Record<string, unknown>).notes as string | undefined;

    const updated = reportSubmissionDb.review(id, user.id, notes);

    if (!updated) {
      return badRequestResponse("Failed to review report.");
    }

    reportNotificationDb.create({
      userId: existing.submittedById,
      reportSubmissionId: id,
      notificationType: ReportNotificationKind.AVAILABLE_FOR_REVIEW,
      title: "Report Reviewed",
      message: `Your report has been reviewed by ${user.firstName} ${user.lastName}.`,
      isRead: false,
      emailSent: false,
    });

    return successResponse(updated, "Report marked as reviewed.");
  } catch (error) {
    return handleApiError(error);
  }
}
