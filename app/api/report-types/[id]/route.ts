import { NextRequest } from "next/server";
import { reportTypeDb } from "@/lib/data/database";
import { getAuthenticatedUser, requireRole } from "@/lib/utils/middleware";
import {
  successResponse,
  notFoundResponse,
  badRequestResponse,
  handleApiError,
} from "@/lib/utils/api";
import { USER_ROLES } from "@/lib/constants";
import { UserRole } from "@/lib/types";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/report-types/[id] - Get single report type
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { user, error } = await getAuthenticatedUser();
    if (error) return error;

    const { id } = await params;
    const reportType = reportTypeDb.findById(id);

    if (!reportType) {
      return notFoundResponse("Report type not found.");
    }

    return successResponse(reportType);
  } catch (error) {
    return handleApiError(error);
  }
}

// PUT /api/report-types/[id] - Update report type (Superadmin only)
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { error } = await requireRole([USER_ROLES.SUPERADMIN as UserRole]);
    if (error) return error;

    const { id } = await params;
    const existing = reportTypeDb.findById(id);
    if (!existing) {
      return notFoundResponse("Report type not found.");
    }

    const body = await request.json();
    const {
      name,
      description,
      formDefinition,
      allowedSubmitterRoles,
      allowedReviewerRoles,
      frequency,
      organizationalLevel,
      isActive,
    } = body;

    // If code is being changed, check uniqueness
    if (body.code && body.code !== existing.code) {
      const codeExists = reportTypeDb.findByCode(body.code);
      if (codeExists) {
        return badRequestResponse(
          `Report type with code "${body.code}" already exists.`
        );
      }
    }

    const updated = reportTypeDb.update(id, {
      ...(name !== undefined && { name }),
      ...(description !== undefined && { description }),
      ...(body.code !== undefined && { code: body.code }),
      ...(formDefinition !== undefined && { formDefinition }),
      ...(allowedSubmitterRoles !== undefined && { allowedSubmitterRoles }),
      ...(allowedReviewerRoles !== undefined && { allowedReviewerRoles }),
      ...(frequency !== undefined && { frequency }),
      ...(organizationalLevel !== undefined && { organizationalLevel }),
      ...(isActive !== undefined && { isActive }),
    });

    if (!updated) {
      return notFoundResponse("Failed to update report type.");
    }

    return successResponse(updated, "Report type updated successfully.");
  } catch (error) {
    return handleApiError(error);
  }
}

// DELETE /api/report-types/[id] - Delete report type (Superadmin only)
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { error } = await requireRole([USER_ROLES.SUPERADMIN as UserRole]);
    if (error) return error;

    const { id } = await params;
    const existing = reportTypeDb.findById(id);
    if (!existing) {
      return notFoundResponse("Report type not found.");
    }

    const deleted = reportTypeDb.delete(id);
    if (!deleted) {
      return badRequestResponse("Failed to delete report type.");
    }

    return successResponse(null, "Report type deleted successfully.");
  } catch (error) {
    return handleApiError(error);
  }
}
