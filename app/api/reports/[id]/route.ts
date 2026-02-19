import { NextRequest } from "next/server";
import {
  reportSubmissionDb,
  reportTypeDb,
  metricEntryDb,
  reportCommentDb,
} from "@/lib/data/database";
import { getAuthenticatedUser } from "@/lib/utils/middleware";
import {
  successResponse,
  notFoundResponse,
  badRequestResponse,
  forbiddenResponse,
  handleApiError,
} from "@/lib/utils/api";
import { USER_ROLES } from "@/lib/constants";
import { ReportStatus } from "@/lib/types";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/reports/[id] - Get a single report submission with enriched data
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { user, error } = await getAuthenticatedUser();
    if (error) return error;

    const { id } = await params;
    const submission = reportSubmissionDb.findById(id);

    if (!submission) {
      return notFoundResponse("Report submission not found.");
    }

    // Get report type details
    const reportType = reportTypeDb.findById(submission.reportTypeId);

    // Get associated metric entries
    const metrics = metricEntryDb.findBySubmission(id);

    // Get comments
    const comments = reportCommentDb.findBySubmission(id);

    return successResponse({
      ...submission,
      reportType,
      metricEntries: metrics,
      comments,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

// PUT /api/reports/[id] - Update a report submission (form data, status transitions)
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { user, error } = await getAuthenticatedUser();
    if (error) return error;
    if (!user) return forbiddenResponse("Authentication required.");

    const { id } = await params;
    const existing = reportSubmissionDb.findById(id);

    if (!existing) {
      return notFoundResponse("Report submission not found.");
    }

    // Only the submitter can edit, unless admin
    if (
      existing.submittedById !== user.id &&
      user.role !== USER_ROLES.SUPERADMIN
    ) {
      return forbiddenResponse("You can only edit your own reports.");
    }

    // Can only edit DRAFT or REQUIRES_EDITS status
    if (
      ![ReportStatus.DRAFT, ReportStatus.REQUIRES_EDITS].includes(
        existing.status
      )
    ) {
      return badRequestResponse(
        "Report can only be edited in DRAFT or REQUIRES_EDITS status."
      );
    }

    if (existing.isLocked) {
      return badRequestResponse("Report is locked and cannot be edited.");
    }

    const body = await request.json();
    const { formData, status } = body;

    const updateData: Partial<ReportSubmission> = {};

    if (formData !== undefined) {
      updateData.formData = formData;
    }

    // Allow transitioning back to DRAFT from REQUIRES_EDITS
    if (
      status === ReportStatus.DRAFT &&
      existing.status === ReportStatus.REQUIRES_EDITS
    ) {
      updateData.status = ReportStatus.DRAFT;
    }

    const updated = reportSubmissionDb.update(id, updateData);

    if (!updated) {
      return notFoundResponse("Failed to update report.");
    }

    return successResponse(updated, "Report updated successfully.");
  } catch (error) {
    return handleApiError(error);
  }
}

// DELETE /api/reports/[id] - Delete a report submission
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { user, error } = await getAuthenticatedUser();
    if (error) return error;
    if (!user) return forbiddenResponse("Authentication required.");

    const { id } = await params;
    const existing = reportSubmissionDb.findById(id);

    if (!existing) {
      return notFoundResponse("Report submission not found.");
    }

    // Only submitter or superadmin can delete, and only if DRAFT
    if (
      existing.submittedById !== user.id &&
      user.role !== USER_ROLES.SUPERADMIN
    ) {
      return forbiddenResponse("You can only delete your own reports.");
    }

    if (
      existing.status !== ReportStatus.DRAFT &&
      user.role !== USER_ROLES.SUPERADMIN
    ) {
      return badRequestResponse("Only draft reports can be deleted.");
    }

    // Delete associated metric entries
    metricEntryDb.deleteBySubmission(id);

    // Delete the submission
    const deleted = reportSubmissionDb.delete(id);
    if (!deleted) {
      return badRequestResponse("Failed to delete report.");
    }

    return successResponse(null, "Report deleted successfully.");
  } catch (error) {
    return handleApiError(error);
  }
}
