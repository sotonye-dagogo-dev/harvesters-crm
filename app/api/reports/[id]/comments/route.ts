import { NextRequest } from "next/server";
import { reportCommentDb, reportSubmissionDb } from "@/lib/data/database";
import { getAuthenticatedUser } from "@/lib/utils/middleware";
import {
  successResponse,
  createdResponse,
  notFoundResponse,
  badRequestResponse,
  forbiddenResponse,
  handleApiError,
} from "@/lib/utils/api";
import { ReportCommentType } from "@/lib/types";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/reports/[id]/comments — List comments for a report
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { user, error } = await getAuthenticatedUser();
    if (error) return error;

    const { id } = await params;
    const submission = reportSubmissionDb.findById(id);

    if (!submission) {
      return notFoundResponse("Report submission not found.");
    }

    const comments = reportCommentDb.findBySubmission(id);

    // Filter internal comments for non-leadership roles
    const filtered =
      user?.role === "SUPERADMIN" || user?.role === "ZONAL_LEADER"
        ? comments
        : comments.filter((c) => !c.isInternal);

    return successResponse(filtered);
  } catch (error) {
    return handleApiError(error);
  }
}

// POST /api/reports/[id]/comments — Add a comment to a report
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { user, error } = await getAuthenticatedUser();
    if (error) return error;
    if (!user) return forbiddenResponse("Authentication required.");

    const { id } = await params;
    const submission = reportSubmissionDb.findById(id);

    if (!submission) {
      return notFoundResponse("Report submission not found.");
    }

    const body = await request.json();
    const { commentType, content, metricEntryId, isInternal } = body as {
      commentType?: string;
      content?: string;
      metricEntryId?: string;
      isInternal?: boolean;
    };

    if (!content) {
      return badRequestResponse("Comment content is required.");
    }

    if (
      !commentType ||
      !Object.values(ReportCommentType).includes(
        commentType as ReportCommentType
      )
    ) {
      return badRequestResponse(
        "Valid comment type is required (FEEDBACK, REQUEST_EDIT, APPROVAL_NOTE, CLARIFICATION)."
      );
    }

    const comment = reportCommentDb.create({
      reportSubmissionId: id,
      userId: user.id,
      userRole: user.role,
      commentType: commentType as ReportCommentType,
      content,
      metricEntryId,
      isInternal: isInternal ?? false,
    });

    return createdResponse(comment, "Comment added successfully.");
  } catch (error) {
    return handleApiError(error);
  }
}
