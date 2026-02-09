import { NextRequest } from "next/server";
import { UserRole } from "@/lib/types";
import { campusDb } from "@/lib/data/database";
import { getAuthenticatedUser, requireRole } from "@/lib/utils/middleware";
import {
  successResponse,
  notFoundResponse,
  forbiddenResponse,
  handleApiError,
} from "@/lib/utils/api";
import { USER_ROLES } from "@/lib/constants";

// GET /api/campuses/[id] - Get campus by ID
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, error } = await getAuthenticatedUser();
    if (error) return error;

    const { id } = await params;
    const campus = campusDb.findById(id);

    if (!campus) {
      return notFoundResponse("Campus not found");
    }

    // Check permissions
    const canView =
      user?.role === USER_ROLES.SUPERADMIN ||
      (user?.role === USER_ROLES.ZONAL_LEADER &&
        user?.zoneId === campus.zoneId) ||
      (user?.role === USER_ROLES.CAMPUS_ADMIN && user?.campusId === id) ||
      user?.campusId === id;

    if (!canView) {
      return forbiddenResponse("You don't have permission to view this campus");
    }

    return successResponse(campus);
  } catch (error) {
    return handleApiError(error);
  }
}

// PUT /api/campuses/[id] - Update campus (Superadmin, Zonal Leader)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, error } = await requireRole([
      USER_ROLES.SUPERADMIN as UserRole,
      USER_ROLES.ZONAL_LEADER as UserRole,
    ]);
    if (error) return error;

    const { id } = await params;
    const body = await request.json();

    const campus = campusDb.findById(id);
    if (!campus) {
      return notFoundResponse("Campus not found");
    }

    // Check permissions
    const canUpdate =
      user?.role === USER_ROLES.SUPERADMIN ||
      (user?.role === USER_ROLES.ZONAL_LEADER &&
        user?.zoneId === campus.zoneId);

    if (!canUpdate) {
      return forbiddenResponse(
        "You don't have permission to update this campus"
      );
    }

    // Build update data
    const updateData: UpdateCampusInput = {};
    if (body.name !== undefined) updateData.name = body.name;
    if (body.description !== undefined)
      updateData.description = body.description;
    if (body.location !== undefined) updateData.location = body.location;
    if (body.country !== undefined) updateData.country = body.country;
    if (body.zoneId !== undefined) updateData.zoneId = body.zoneId;
    if (body.adminId !== undefined) updateData.adminId = body.adminId;
    if (body.isActive !== undefined) updateData.isActive = body.isActive;

    // Update campus
    const updatedCampus = campusDb.update(id, updateData);
    if (!updatedCampus) {
      return notFoundResponse("Campus not found");
    }

    return successResponse(updatedCampus, "Campus updated successfully");
  } catch (error) {
    return handleApiError(error);
  }
}

// DELETE /api/campuses/[id] - Delete campus (Superadmin only)
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error } = await requireRole([USER_ROLES.SUPERADMIN as UserRole]);
    if (error) return error;

    const { id } = await params;
    const success = campusDb.delete(id);

    if (!success) {
      return notFoundResponse("Campus not found");
    }

    return successResponse(null, "Campus deleted successfully");
  } catch (error) {
    return handleApiError(error);
  }
}
