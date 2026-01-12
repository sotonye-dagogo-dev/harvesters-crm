import { NextRequest } from "next/server";
import { interactionDb, userDb } from "@/lib/data/database";
import { getAuthenticatedUser } from "@/lib/utils/middleware";
import { createInteractionSchema } from "@/lib/utils/validation";
import {
  successResponse,
  forbiddenResponse,
  badRequestResponse,
  handleApiError,
} from "@/lib/utils/api";
import { USER_ROLES } from "@/lib/constants";

// GET /api/interactions - List interactions
export async function GET(request: NextRequest) {
  try {
    const { user, error } = await getAuthenticatedUser(request);
    if (error) return error;

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") as InteractionType | null;
    const memberId = searchParams.get("memberId");
    const leaderId = searchParams.get("leaderId");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    // Build filter based on user role
    const filter: Record<string, unknown> = {};

    if (user?.role === USER_ROLES.SUPERADMIN) {
      // Superadmin sees all interactions
      if (type) filter.type = type;
      if (memberId) filter.memberId = memberId;
      if (leaderId) filter.leaderId = leaderId;
    } else if (user?.role === USER_ROLES.LEADER) {
      // Leaders see interactions in their group
      filter.leaderId = user.id;
      if (type) filter.type = type;
      if (memberId) {
        // Verify member is in leader's group
        const member = userDb.findById(memberId);
        if (member?.groupId === user.groupId) {
          filter.memberId = memberId;
        }
      }
    } else {
      // Members see only their own interactions
      filter.memberId = user?.id;
      if (type) filter.type = type;
    }

    const allInteractions = interactionDb.findAll(filter);
    const total = allInteractions.length;
    const totalPages = Math.ceil(total / limit);
    const offset = (page - 1) * limit;
    const interactions = allInteractions.slice(offset, offset + limit);

    // Enrich with member and leader details
    const enrichedInteractions = interactions.map((interaction) => {
      const member = userDb.findById(interaction.memberId);
      const leader = userDb.findById(interaction.leaderId);

      return {
        ...interaction,
        member: member
          ? {
              id: member.id,
              firstName: member.firstName,
              lastName: member.lastName,
              email: member.email,
            }
          : null,
        leader: leader
          ? {
              id: leader.id,
              firstName: leader.firstName,
              lastName: leader.lastName,
            }
          : null,
      };
    });

    return successResponse({
      interactions: enrichedInteractions,
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

// POST /api/interactions - Create interaction
export async function POST(request: NextRequest) {
  try {
    const { user, error } = await getAuthenticatedUser(request);
    if (error) return error;

    const body = await request.json();

    // Validate input
    const validation = createInteractionSchema.safeParse(body);
    if (!validation.success) {
      return badRequestResponse("Invalid input data");
    }

    // Only leaders and superadmins can create interactions
    if (user?.role === USER_ROLES.MEMBER) {
      return forbiddenResponse(
        "You don't have permission to create interactions"
      );
    }

    // Verify member exists
    const member = userDb.findById(validation.data.memberId);
    if (!member) {
      return badRequestResponse("Member not found");
    }

    // If leader, verify member is in their group
    if (user.role === USER_ROLES.LEADER) {
      if (member.groupId !== user.groupId) {
        return forbiddenResponse(
          "You can only create interactions for members in your group"
        );
      }
    }

    // Create interaction
    const interaction = interactionDb.create(
      {
        ...validation.data,
        type: validation.data.type as InteractionType,
      },
      user.id
    );

    return successResponse(
      interaction,
      "Interaction created successfully",
      201
    );
  } catch (error) {
    return handleApiError(error);
  }
}
