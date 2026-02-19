import { NextRequest } from "next/server";
import { reportSubmissionDb } from "@/lib/data/database";
import { requireRole } from "@/lib/utils/middleware";
import {
  successResponse,
  notFoundResponse,
  badRequestResponse,
  handleApiError,
} from "@/lib/utils/api";
import { USER_ROLES } from "@/lib/constants";
import { UserRole, ReportStatus } from "@/lib/types";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// POST /api/reports/[id]/finalize — Finalize a reviewed report (CEO/SPO only)
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { user, error } = await requireRole([
      USER_ROLES.SUPERADMIN as UserRole,
    ]);
    if (error) return error;
    if (!user) return badRequestResponse("Authentication required.");

    const { id } = await params;
    const existing = reportSubmissionDb.findById(id);

    if (!existing) {
      return notFoundResponse("Report submission not found.");
    }

    if (existing.status !== ReportStatus.REVIEWED) {
      return badRequestResponse("Only reviewed reports can be finalized.");
    }

    const updated = reportSubmissionDb.finalize(id, user.id, user.role);

    if (!updated) {
      return badRequestResponse("Failed to finalize report.");
    }

    return successResponse(updated, "Report finalized successfully.");
  } catch (error) {
    return handleApiError(error);
  }
}
