import { NextRequest } from "next/server";
import { reportSubmissionDb, reportNotificationDb } from "@/lib/data/database";
import { getAuthenticatedUser, requireRole } from "@/lib/utils/middleware";
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

// POST /api/reports/[id]/approve — Approve a submitted report
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { user, error } = await requireRole([
      USER_ROLES.SUPERADMIN as UserRole,
      USER_ROLES.ZONAL_LEADER as UserRole,
      USER_ROLES.CAMPUS_ADMIN as UserRole,
    ]);
    if (error) return error;
    if (!user) return badRequestResponse("Authentication required.");

    const { id } = await params;
    const existing = reportSubmissionDb.findById(id);

    if (!existing) {
      return notFoundResponse("Report submission not found.");
    }

    if (existing.status !== ReportStatus.SUBMITTED) {
      return badRequestResponse("Only submitted reports can be approved.");
    }

    const body = await request.json().catch(() => ({}));
    const notes = (body as Record<string, unknown>).notes as string | undefined;

    const updated = reportSubmissionDb.approve(id, user.id, notes);

    if (!updated) {
      return badRequestResponse("Failed to approve report.");
    }

    // Notify the submitter
    reportNotificationDb.create({
      userId: existing.submittedById,
      reportSubmissionId: id,
      notificationType: ReportNotificationKind.REPORT_APPROVED,
      title: "Report Approved",
      message: `Your report has been approved by ${user.firstName} ${user.lastName}.`,
      isRead: false,
      emailSent: false,
    });

    return successResponse(updated, "Report approved successfully.");
  } catch (error) {
    return handleApiError(error);
  }
}
