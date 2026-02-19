import { NextRequest } from "next/server";
import {
  reportSubmissionDb,
  reportTypeDb,
  reportNotificationDb,
} from "@/lib/data/database";
import { getAuthenticatedUser } from "@/lib/utils/middleware";
import {
  successResponse,
  notFoundResponse,
  badRequestResponse,
  forbiddenResponse,
  handleApiError,
} from "@/lib/utils/api";
import { ReportStatus, ReportNotificationKind } from "@/lib/types";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// POST /api/reports/[id]/submit — Submit a draft report for review
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
      return forbiddenResponse("You can only submit your own reports.");
    }

    if (
      ![ReportStatus.DRAFT, ReportStatus.REQUIRES_EDITS].includes(
        existing.status
      )
    ) {
      return badRequestResponse(
        "Only draft or edited reports can be submitted."
      );
    }

    // Validate that required form data is filled
    const reportType = reportTypeDb.findById(existing.reportTypeId);
    if (reportType) {
      const requiredFields = reportType.formDefinition.sections
        .flatMap((s) => s.fields)
        .filter((f) => f.isRequired);

      const formData = existing.formData as Record<string, unknown>;
      const missingFields = requiredFields.filter((f) => {
        const val = formData[f.name];
        return val === undefined || val === null || val === "";
      });

      if (missingFields.length > 0) {
        return badRequestResponse(
          `Please fill in required fields: ${missingFields.map((f) => f.label).join(", ")}`
        );
      }
    }

    const updated = reportSubmissionDb.submit(id);

    if (!updated) {
      return badRequestResponse("Failed to submit report.");
    }

    // Create notification for reviewers
    if (reportType) {
      // Notify reviewers (in a real app, we'd find users with reviewer roles)
      reportNotificationDb.create({
        userId: existing.submittedById, // In real app, would be reviewer
        reportSubmissionId: id,
        notificationType: ReportNotificationKind.REPORT_SUBMITTED,
        title: "Report Submitted",
        message: `A ${reportType.name} report has been submitted for review.`,
        isRead: false,
        emailSent: false,
      });
    }

    return successResponse(updated, "Report submitted for review.");
  } catch (error) {
    return handleApiError(error);
  }
}
