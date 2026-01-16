import { NextRequest } from "next/server";
import { membershipRequestDb, userDb, groupDb } from "@/lib/data/database";
import { getAuthenticatedUser } from "@/lib/utils/middleware";
import { z } from "zod";
import {
  successResponse,
  forbiddenResponse,
  badRequestResponse,
  handleApiError,
} from "@/lib/utils/api";
import { sendNewMembershipRequestNotification } from "@/lib/utils/notificationHelpers";
import { USER_ROLES } from "@/lib/constants";

const createRequestSchema = z.object({
  groupId: z.string().min(1, "Group ID is required"),
  reason: z.string().optional(),
});

// GET /api/membership-requests - List membership requests
export async function GET(request: NextRequest) {
  try {
    const { user, error } = await getAuthenticatedUser();
    if (error) return error;

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") as
      | "PENDING"
      | "APPROVED"
      | "REJECTED"
      | null;
    const groupId = searchParams.get("groupId");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    // Build filter based on user role
    const filter: Record<string, unknown> = {};

    if (user?.role === USER_ROLES.SUPERADMIN) {
      // Superadmin sees all requests
      if (status) filter.status = status;
      if (groupId) filter.groupId = groupId;
    } else if (user?.role === USER_ROLES.LEADER) {
      // Leaders see requests for their group
      filter.groupId = user.groupId;
      if (status) filter.status = status;
    } else {
      // Members see only their own requests
      filter.requestedById = user?.id;
      if (status) filter.status = status;
      if (groupId) filter.groupId = groupId;
    }

    const allRequests = membershipRequestDb.findAll(filter);
    const total = allRequests.length;
    const totalPages = Math.ceil(total / limit);
    const offset = (page - 1) * limit;
    const requests = allRequests.slice(offset, offset + limit);

    // Enrich with user and group details
    const enrichedRequests = requests.map((request) => {
      const requestedBy = userDb.findById(request.memberId);
      const group = groupDb.findById(request.toGroupId);
      const processedBy = request.respondedById
        ? userDb.findById(request.respondedById)
        : null;

      return {
        ...request,
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
        processedBy: processedBy
          ? {
              id: processedBy.id,
              firstName: processedBy.firstName,
              lastName: processedBy.lastName,
            }
          : null,
      };
    });

    return successResponse({
      requests: enrichedRequests,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

// POST /api/membership-requests - Create membership request
export async function POST(request: NextRequest) {
  try {
    const { user, error } = await getAuthenticatedUser();
    if (error) return error;

    const body = await request.json();

    // Validate input
    const validation = createRequestSchema.safeParse(body);
    if (!validation.success) {
      return badRequestResponse("Invalid input data");
    }

    // Only members can create membership requests
    if (user?.role !== USER_ROLES.MEMBER) {
      return forbiddenResponse("Only members can create membership requests");
    }

    // Verify group exists
    const group = groupDb.findById(validation.data.groupId);
    if (!group) {
      return badRequestResponse("Group not found");
    }

    // Check if user already has a pending request for this group
    const existingRequest = membershipRequestDb
      .findAll({
        memberId: user.id,
        toGroupId: validation.data.groupId,
        status: "PENDING" as MembershipRequestStatus,
      })
      .find((r) => r.status === ("PENDING" as MembershipRequestStatus));

    if (existingRequest) {
      return badRequestResponse(
        "You already have a pending request for this group"
      );
    }

    // Create membership request
    const membershipRequest = membershipRequestDb.create(
      {
        type: user.groupId
          ? ("TRANSFER" as MembershipRequestType)
          : ("JOIN" as MembershipRequestType),
        toGroupId: validation.data.groupId,
        message: validation.data.reason,
      },
      user.id
    );

    // Send notification to group leader
    await sendNewMembershipRequestNotification(membershipRequest.id);

    return successResponse(
      membershipRequest,
      "Membership request created successfully",
      201
    );
  } catch (error) {
    return handleApiError(error);
  }
}
