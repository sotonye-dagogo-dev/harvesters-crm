import { NextRequest } from "next/server";
import { reportSubmissionDb } from "@/lib/data/database";
import { getAuthenticatedUser } from "@/lib/utils/middleware";
import {
  successResponse,
  notFoundResponse,
  badRequestResponse,
  forbiddenResponse,
  handleApiError,
} from "@/lib/utils/api";
import { ReportStatus } from "@/lib/types";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// POST /api/reports/[id]/auto-save — Auto-save form data for a draft report
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { user, error } = await getAuthenticatedUser();
    if (error) return error;
    if (!user) return forbiddenResponse("Authentication required.");

    const { id } = await params;
    const existing = reportSubmissionDb.findById(id);

    if (!existing) {
      return notFoundResponse("Report submission not found.");
    }

    if (existing.submittedById !== user.id) {
      return forbiddenResponse("You can only save your own reports.");
    }

    if (
      ![ReportStatus.DRAFT, ReportStatus.REQUIRES_EDITS].includes(
        existing.status
      )
    ) {
      return badRequestResponse(
        "Only draft or edit-requested reports can be auto-saved."
      );
    }

    const body = await request.json();
    const { formData } = body as { formData?: Record<string, unknown> };

    if (!formData) {
      return badRequestResponse("Form data is required for auto-save.");
    }

    const updated = reportSubmissionDb.update(id, { formData });

    if (!updated) {
      return badRequestResponse("Failed to auto-save report.");
    }

    return successResponse(
      { id: updated.id, lastEditedAt: updated.lastEditedAt },
      "Report auto-saved."
    );
  } catch (error) {
    return handleApiError(error);
  }
}
