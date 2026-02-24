import { NextRequest } from "next/server";
import { groupDb, userDb } from "@/lib/data/database";
import { getAuthenticatedUser } from "@/lib/utils/middleware";
import { userToAuthUser } from "@/lib/utils/auth";
import {
  successResponse,
  notFoundResponse,
  forbiddenResponse,
  badRequestResponse,
  handleApiError,
} from "@/lib/utils/api";
import { USER_ROLES } from "@/lib/constants";

// GET /api/groups/[id]/members - Get group members
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, error } = await getAuthenticatedUser();
    if (error) return error;

    const { id } = await params;
    const group = groupDb.findById(id);

    if (!group) {
      return notFoundResponse("Group not found");
    }

    // Check permissions
    const canView =
      user?.role === USER_ROLES.SUPERADMIN ||
      group.leaderId === user?.id ||
      user?.groupId === id;

    if (!canView) {
      return forbiddenResponse(
        "You don't have permission to view this group's members"
      );
    }

    // Get members
    const members = userDb.findAll({ groupId: id });
    const authMembers = members.map(userToAuthUser);

    return successResponse(authMembers);
  } catch (error) {
    return handleApiError(error);
  }
}

// POST /api/groups/[id]/members - Add member to group
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, error } = await getAuthenticatedUser();
    if (error) return error;

    const { id } = await params;
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return badRequestResponse("User ID is required");
    }

    const group = groupDb.findById(id);
    if (!group) {
      return notFoundResponse("Group not found");
    }

    // Check permissions
    const canAdd =
      user?.role === USER_ROLES.SUPERADMIN || group.leaderId === user?.id;

    if (!canAdd) {
      return forbiddenResponse(
        "You don't have permission to add members to this group"
      );
    }

    // Check if user exists
    const member = userDb.findById(userId);
    if (!member) {
      return notFoundResponse("User not found");
    }

    // Update user's group
    const updatedUser = userDb.update(userId, { groupId: id });
    if (!updatedUser) {
      return notFoundResponse("User not found");
    }

    return successResponse(
      userToAuthUser(updatedUser),
      "Member added to group successfully"
    );
  } catch (error) {
    return handleApiError(error);
  }
}
