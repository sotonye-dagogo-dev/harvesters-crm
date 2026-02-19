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

// POST /api/reports/[id]/request-edits — Request edits on a submitted report
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
      return badRequestResponse(
        "Only submitted reports can be sent back for edits."
      );
    }

    const body = await request.json();
    const notes = (body as Record<string, unknown>).notes as string | undefined;

    if (!notes) {
      return badRequestResponse(
        "Please provide notes explaining what edits are needed."
      );
    }

    const updated = reportSubmissionDb.requestEdits(id, user.id, notes);

    if (!updated) {
      return badRequestResponse("Failed to request edits.");
    }

    // Notify the submitter
    reportNotificationDb.create({
      userId: existing.submittedById,
      reportSubmissionId: id,
      notificationType: ReportNotificationKind.EDITS_REQUESTED,
      title: "Report Edits Required",
      message: `Your report requires edits: ${notes}`,
      isRead: false,
      emailSent: false,
    });

    return successResponse(updated, "Edit request sent to the submitter.");
  } catch (error) {
    return handleApiError(error);
  }
}
