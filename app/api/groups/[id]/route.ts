import { NextRequest } from "next/server";
import { groupDb } from "@/lib/data/database";
import { getAuthenticatedUser, requireRole } from "@/lib/utils/middleware";
import { updateGroupSchema } from "@/lib/utils/validation";
import {
  successResponse,
  notFoundResponse,
  forbiddenResponse,
  badRequestResponse,
  handleApiError,
} from "@/lib/utils/api";

// GET /api/groups/[id] - Get group by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, error } = await getAuthenticatedUser(request);
    if (error) return error;

    const { id } = await params;
    const group = groupDb.findById(id);

    if (!group) {
      return notFoundResponse("Group not found");
    }

    // Check permissions
    const canView =
      user?.role === UserRole.SUPERADMIN ||
      group.leaderId === user?.id ||
      user?.groupId === id;

    if (!canView) {
      return forbiddenResponse("You don't have permission to view this group");
    }

    return successResponse(group);
  } catch (error) {
    return handleApiError(error);
  }
}

// PUT /api/groups/[id] - Update group
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, error } = await getAuthenticatedUser(request);
    if (error) return error;

    const { id } = await params;
    const body = await request.json();

    // Validate input
    const validation = updateGroupSchema.safeParse(body);
    if (!validation.success) {
      return badRequestResponse("Invalid input data");
    }

    const group = groupDb.findById(id);
    if (!group) {
      return notFoundResponse("Group not found");
    }

    // Check permissions
    const canUpdate =
      user?.role === UserRole.SUPERADMIN || group.leaderId === user?.id;

    if (!canUpdate) {
      return forbiddenResponse(
        "You don't have permission to update this group"
      );
    }

    // Update group
    const updatedGroup = groupDb.update(id, {
      ...validation.data,
      meetingFrequency: validation.data.meetingFrequency as
        | MeetingFrequency
        | undefined,
    } as UpdateGroupInput);
    if (!updatedGroup) {
      return notFoundResponse("Group not found");
    }

    return successResponse(updatedGroup, "Group updated successfully");
  } catch (error) {
    return handleApiError(error);
  }
}

// DELETE /api/groups/[id] - Delete group (Superadmin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { error } = await requireRole([UserRole.SUPERADMIN], request);
    if (error) return error;

    const { id } = await params;
    const success = groupDb.delete(id);

    if (!success) {
      return notFoundResponse("Group not found");
    }

    return successResponse(null, "Group deleted successfully");
  } catch (error) {
    return handleApiError(error);
  }
}
