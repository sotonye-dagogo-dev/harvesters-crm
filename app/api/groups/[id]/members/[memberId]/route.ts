import { NextRequest } from "next/server";
import { groupDb, userDb } from "@/lib/data/database";
import { getAuthenticatedUser } from "@/lib/utils/middleware";
import {
  successResponse,
  notFoundResponse,
  forbiddenResponse,
  handleApiError,
} from "@/lib/utils/api";
import { sendMemberRemovedNotification } from "@/lib/utils/notificationHelpers";

// DELETE /api/groups/[id]/members/[memberId] - Remove member from group
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; memberId: string }> }
) {
  try {
    const { user, error } = await getAuthenticatedUser(request);
    if (error) return error;

    const { id, memberId } = await params;

    const group = groupDb.findById(id);
    if (!group) {
      return notFoundResponse("Group not found");
    }

    // Check permissions
    const canRemove =
      user?.role === UserRole.SUPERADMIN || group.leaderId === user?.id;

    if (!canRemove) {
      return forbiddenResponse(
        "You don't have permission to remove members from this group"
      );
    }

    // Check if user exists
    const member = userDb.findById(memberId);
    if (!member) {
      return notFoundResponse("Member not found");
    }

    // Remove user from group
    const updatedUser = userDb.update(memberId, { groupId: undefined });
    if (!updatedUser) {
      return notFoundResponse("Member not found");
    }

    // Send notification to removed member
    await sendMemberRemovedNotification(memberId, group.name, user!.id);

    return successResponse(null, "Member removed from group successfully");
  } catch (error) {
    return handleApiError(error);
  }
}
