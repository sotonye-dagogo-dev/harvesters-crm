import { NextRequest } from "next/server";
import { UserRole, MeetingFrequency } from "@/lib/types";
import { cellDb } from "@/lib/data/database";
import { getAuthenticatedUser, requireRole } from "@/lib/utils/middleware";
import {
  successResponse,
  notFoundResponse,
  forbiddenResponse,
  handleApiError,
} from "@/lib/utils/api";
import { USER_ROLES } from "@/lib/constants";

// GET /api/cells/[id] - Get cell by ID
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, error } = await getAuthenticatedUser();
    if (error) return error;

    const { id } = await params;
    const cell = cellDb.findById(id);

    if (!cell) {
      return notFoundResponse("Cell not found");
    }

    // Check permissions
    const canView =
      user?.role === USER_ROLES.SUPERADMIN ||
      (user?.role === USER_ROLES.ZONAL_LEADER &&
        user?.zoneId === cell.zoneId) ||
      (user?.role === USER_ROLES.CAMPUS_ADMIN &&
        user?.campusId === cell.campusId) ||
      (user?.role === USER_ROLES.HOD && user?.campusId === cell.campusId) ||
      (user?.role === USER_ROLES.SMALL_GROUP_LEADER &&
        user?.groupId === cell.groupId) ||
      (user?.role === USER_ROLES.CELL_LEADER &&
        (cell.leaderId === user?.id || user?.cellId === id)) ||
      user?.cellId === id;

    if (!canView) {
      return forbiddenResponse("You don't have permission to view this cell");
    }

    return successResponse(cell);
  } catch (error) {
    return handleApiError(error);
  }
}

// PUT /api/cells/[id] - Update cell
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, error } = await getAuthenticatedUser();
    if (error) return error;

    const { id } = await params;
    const body = await request.json();

    const cell = cellDb.findById(id);
    if (!cell) {
      return notFoundResponse("Cell not found");
    }

    // Check permissions
    const canUpdate =
      user?.role === USER_ROLES.SUPERADMIN ||
      (user?.role === USER_ROLES.ZONAL_LEADER &&
        user?.zoneId === cell.zoneId) ||
      (user?.role === USER_ROLES.CAMPUS_ADMIN &&
        user?.campusId === cell.campusId) ||
      (user?.role === USER_ROLES.HOD && user?.campusId === cell.campusId) ||
      (user?.role === USER_ROLES.SMALL_GROUP_LEADER &&
        user?.groupId === cell.groupId) ||
      (user?.role === USER_ROLES.CELL_LEADER && cell.leaderId === user?.id);

    if (!canUpdate) {
      return forbiddenResponse("You don't have permission to update this cell");
    }

    // Build update data
    const updateData: Partial<Cell> = {};
    if (body.name !== undefined) updateData.name = body.name;
    if (body.description !== undefined)
      updateData.description = body.description;
    if (body.campusId !== undefined) updateData.campusId = body.campusId;
    if (body.zoneId !== undefined) updateData.zoneId = body.zoneId;
    if (body.departmentId !== undefined)
      updateData.departmentId = body.departmentId;
    if (body.groupId !== undefined) updateData.groupId = body.groupId;
    if (body.leaderId !== undefined) updateData.leaderId = body.leaderId;
    if (body.meetingFrequency !== undefined)
      updateData.meetingFrequency = body.meetingFrequency as MeetingFrequency;
    if (body.memberCount !== undefined)
      updateData.memberCount = body.memberCount;
    if (body.inviteCode !== undefined) updateData.inviteCode = body.inviteCode;
    if (body.isActive !== undefined) updateData.isActive = body.isActive;

    // Update cell
    const updatedCell = cellDb.update(id, updateData);
    if (!updatedCell) {
      return notFoundResponse("Cell not found");
    }

    return successResponse(updatedCell, "Cell updated successfully");
  } catch (error) {
    return handleApiError(error);
  }
}

// DELETE /api/cells/[id] - Delete cell (Superadmin only)
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error } = await requireRole([USER_ROLES.SUPERADMIN as UserRole]);
    if (error) return error;

    const { id } = await params;
    const success = cellDb.delete(id);

    if (!success) {
      return notFoundResponse("Cell not found");
    }

    return successResponse(null, "Cell deleted successfully");
  } catch (error) {
    return handleApiError(error);
  }
}
