import { NextRequest } from "next/server";
import { db } from "@/lib/data/database";
import { getAuthenticatedUser } from "@/lib/utils/middleware";
import {
  successResponse,
  notFoundResponse,
  unauthorizedResponse,
  handleApiError,
} from "@/lib/utils/api";
import { USER_ROLES } from "@/lib/constants";

// Generate a unique invite code
function generateInviteCode(): string {
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  );
}

// GET /api/groups/[id]/invite - Generate or retrieve invite link for group
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, error } = await getAuthenticatedUser();
    if (error) return error;

    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const inviteType = searchParams.get("type") || "member"; // "leader" or "member"

    const group = db.groups.findById(id);
    if (!group) {
      return notFoundResponse("Group not found");
    }

    // Check permissions - only superadmins and group leaders can generate invites
    const isLeader = group.leaderId === user?.id;
    const isSuperadmin = user?.role === USER_ROLES.SUPERADMIN;

    if (!isLeader && !isSuperadmin) {
      return unauthorizedResponse(
        "Only group leaders and superadmins can generate invite links"
      );
    }

    // Generate or retrieve invite code for this group
    let inviteCode = group.inviteCode;
    if (!inviteCode) {
      inviteCode = generateInviteCode();
      db.groups.update(id, { inviteCode });
    }

    // Build invite URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const inviteUrl = `${baseUrl}/register?groupId=${id}&inviteCode=${inviteCode}&type=${inviteType}`;

    return successResponse({
      inviteUrl,
      inviteCode,
      groupId: id,
      groupName: group.name,
      inviteType,
      expiresAt: null, // For future implementation
    });
  } catch (error) {
    return handleApiError(error);
  }
}

// POST /api/groups/[id]/invite - Regenerate invite code
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, error } = await getAuthenticatedUser();
    if (error) return error;

    const { id } = await params;

    const group = db.groups.findById(id);
    if (!group) {
      return notFoundResponse("Group not found");
    }

    // Check permissions
    const isLeader = group.leaderId === user?.id;
    const isSuperadmin = user?.role === USER_ROLES.SUPERADMIN;

    if (!isLeader && !isSuperadmin) {
      return unauthorizedResponse(
        "Only group leaders and superadmins can regenerate invite codes"
      );
    }

    // Generate new invite code
    const newInviteCode = generateInviteCode();
    db.groups.update(id, { inviteCode: newInviteCode });

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const inviteUrl = `${baseUrl}/register?groupId=${id}&inviteCode=${newInviteCode}&type=member`;

    return successResponse({
      inviteUrl,
      inviteCode: newInviteCode,
      groupId: id,
      message: "Invite code regenerated successfully",
    });
  } catch (error) {
    return handleApiError(error);
  }
}
