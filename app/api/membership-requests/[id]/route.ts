import { NextRequest } from "next/server";
import { membershipRequestDb, userDb, groupDb } from "@/lib/data/database";
import { getAuthenticatedUser } from "@/lib/utils/middleware";
import {
  successResponse,
  notFoundResponse,
  forbiddenResponse,
  handleApiError,
} from "@/lib/utils/api";
import { USER_ROLES } from "@/lib/constants";

// GET /api/membership-requests/[id] - Get membership request by ID
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, error } = await getAuthenticatedUser();
    if (error) return error;

    const { id } = await params;
    const membershipRequest = membershipRequestDb.findById(id);

    if (!membershipRequest) {
      return notFoundResponse("Membership request not found");
    }

    // Check permissions
    const group = membershipRequest.toGroupId
      ? groupDb.findById(membershipRequest.toGroupId)
      : undefined;
    const canView =
      user?.role === USER_ROLES.SUPERADMIN ||
      group?.leaderId === user?.id ||
      membershipRequest.memberId === user?.id;

    if (!canView) {
      return forbiddenResponse(
        "You don't have permission to view this membership request"
      );
    }

    // Enrich with user and group details
    const requestedBy = userDb.findById(membershipRequest.memberId);
    const respondedBy = membershipRequest.respondedById
      ? userDb.findById(membershipRequest.respondedById)
      : null;

    return successResponse({
      ...membershipRequest,
      requestedBy: requestedBy
        ? {
            id: requestedBy.id,
            firstName: requestedBy.firstName,
            lastName: requestedBy.lastName,
            email: requestedBy.email,
            currentGroupId: requestedBy.groupId,
          }
        : null,
      group: group
        ? {
            id: group.id,
            name: group.name,
            description: group.description,
          }
        : null,
      respondedBy: respondedBy
        ? {
            id: respondedBy.id,
            firstName: respondedBy.firstName,
            lastName: respondedBy.lastName,
          }
        : null,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

// DELETE /api/membership-requests/[id] - Cancel membership request
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, error } = await getAuthenticatedUser();
    if (error) return error;

    const { id } = await params;
    const membershipRequest = membershipRequestDb.findById(id);

    if (!membershipRequest) {
      return notFoundResponse("Membership request not found");
    }

    // Only the requester or superadmin can cancel
    if (
      user?.id !== membershipRequest.memberId &&
      user?.role !== USER_ROLES.SUPERADMIN
    ) {
      return forbiddenResponse(
        "You don't have permission to cancel this request"
      );
    }

    // Can only cancel pending requests
    if (membershipRequest.status !== "PENDING") {
      return forbiddenResponse("Only pending requests can be cancelled");
    }

    const success = membershipRequestDb.delete(id);
    if (!success) {
      return notFoundResponse("Membership request not found");
    }

    return successResponse(null, "Membership request cancelled successfully");
  } catch (error) {
    return handleApiError(error);
  }
}
