import { NextRequest } from "next/server";
import { interactionDb, userDb } from "@/lib/data/database";
import { getAuthenticatedUser } from "@/lib/utils/middleware";
import { updateInteractionSchema } from "@/lib/utils/validation";
import {
  successResponse,
  notFoundResponse,
  forbiddenResponse,
  badRequestResponse,
  handleApiError,
} from "@/lib/utils/api";
import { USER_ROLES } from "@/lib/constants";

// GET /api/interactions/[id] - Get interaction by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, error } = await getAuthenticatedUser(request);
    if (error) return error;

    const { id } = await params;
    const interaction = interactionDb.findById(id);

    if (!interaction) {
      return notFoundResponse("Interaction not found");
    }

    // Check permissions
    const canView =
      user?.role === USER_ROLES.SUPERADMIN ||
      interaction.leaderId === user?.id ||
      interaction.memberId === user?.id;

    if (!canView) {
      return forbiddenResponse(
        "You don't have permission to view this interaction"
      );
    }

    // Enrich with member and leader details
    const member = userDb.findById(interaction.memberId);
    const leader = userDb.findById(interaction.leaderId);

    return successResponse({
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
    });
  } catch (error) {
    return handleApiError(error);
  }
}

// PUT /api/interactions/[id] - Update interaction
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
    const validation = updateInteractionSchema.safeParse(body);
    if (!validation.success) {
      return badRequestResponse("Invalid input data");
    }

    const interaction = interactionDb.findById(id);
    if (!interaction) {
      return notFoundResponse("Interaction not found");
    }

    // Check permissions - only the leader who created it or superadmin can update
    const canUpdate =
      user?.role === USER_ROLES.SUPERADMIN || interaction.leaderId === user?.id;

    if (!canUpdate) {
      return forbiddenResponse(
        "You don't have permission to update this interaction"
      );
    }

    // Update interaction
    const updatedInteraction = interactionDb.update(id, {
      ...validation.data,
      type: validation.data.type as InteractionType | undefined,
    } as UpdateInteractionInput);
    if (!updatedInteraction) {
      return notFoundResponse("Interaction not found");
    }

    return successResponse(
      updatedInteraction,
      "Interaction updated successfully"
    );
  } catch (error) {
    return handleApiError(error);
  }
}

// DELETE /api/interactions/[id] - Delete interaction
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, error } = await getAuthenticatedUser(request);
    if (error) return error;

    const { id } = await params;
    const interaction = interactionDb.findById(id);

    if (!interaction) {
      return notFoundResponse("Interaction not found");
    }

    // Check permissions - only the leader who created it or superadmin can delete
    const canDelete =
      user?.role === USER_ROLES.SUPERADMIN || interaction.leaderId === user?.id;

    if (!canDelete) {
      return forbiddenResponse(
        "You don't have permission to delete this interaction"
      );
    }

    const success = interactionDb.delete(id);
    if (!success) {
      return notFoundResponse("Interaction not found");
    }

    return successResponse(null, "Interaction deleted successfully");
  } catch (error) {
    return handleApiError(error);
  }
}
