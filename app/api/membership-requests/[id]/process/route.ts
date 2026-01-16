import { NextRequest } from "next/server";
import { membershipRequestDb, userDb, groupDb } from "@/lib/data/database";
import { getAuthenticatedUser } from "@/lib/utils/middleware";
import { z } from "zod";
import {
  successResponse,
  notFoundResponse,
  forbiddenResponse,
  badRequestResponse,
  handleApiError,
} from "@/lib/utils/api";
import {
  sendMembershipRequestNotification,
  sendNewMemberNotification,
} from "@/lib/utils/notificationHelpers";
import { USER_ROLES } from "@/lib/constants";

const processRequestSchema = z.object({
  action: z.enum(["approve", "reject"]),
  notes: z.string().optional(),
});

// POST /api/membership-requests/[id]/process - Approve or reject membership request
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, error } = await getAuthenticatedUser();
    if (error) return error;

    const { id } = await params;
    const body = await request.json();

    // Validate input
    const validation = processRequestSchema.safeParse(body);
    if (!validation.success) {
      return badRequestResponse("Invalid input data");
    }

    const membershipRequest = membershipRequestDb.findById(id);
    if (!membershipRequest) {
      return notFoundResponse("Membership request not found");
    }

    // Check permissions - only group leader or superadmin can process
    const group = groupDb.findById(membershipRequest.toGroupId);
    const canProcess =
      user?.role === USER_ROLES.SUPERADMIN || group?.leaderId === user?.id;

    if (!canProcess) {
      return forbiddenResponse(
        "You don't have permission to process this request"
      );
    }

    // Can only process pending requests
    if (membershipRequest.status !== "PENDING") {
      return forbiddenResponse("This request has already been processed");
    }

    const { action, notes } = validation.data;
    const newStatus =
      action === "approve"
        ? MembershipRequestStatus.APPROVED
        : MembershipRequestStatus.REJECTED;

    // Update membership request using respond method
    const updatedRequest = membershipRequestDb.respond(
      id,
      {
        status: newStatus,
        responseMessage: notes,
      },
      user?.id ?? ""
    );

    if (!updatedRequest) {
      return notFoundResponse("Membership request not found");
    }

    // If approved, update user's group
    if (action === "approve") {
      const member = userDb.findById(membershipRequest.memberId);
      if (member) {
        userDb.update(member.id, {
          groupId: membershipRequest.toGroupId,
        });

        // Send welcome notification to the new member
        await sendNewMemberNotification(member.id, membershipRequest.toGroupId);
      }
    }

    // Send notification about request status
    await sendMembershipRequestNotification(
      id,
      action === "approve" ? "APPROVED" : "REJECTED",
      user!.id
    );

    return successResponse(
      updatedRequest,
      `Membership request ${action}d successfully`
    );
  } catch (error) {
    return handleApiError(error);
  }
}
